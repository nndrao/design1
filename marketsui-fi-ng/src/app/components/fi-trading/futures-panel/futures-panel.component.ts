import {
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { AllEnterpriseModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';
import type { ColDef, GridOptions } from 'ag-grid-enterprise';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options, AxisLabelsFormatterContextObject } from 'highcharts';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import { fmtChgBps, fmtPrice, fmtK } from '../../../shared/utils';
import { MarketDataService } from '../../../services/market-data.service';
import type {
  TreasuryFuture,
  TreasuryFutureRow,
  SOFRFuture,
  SOFRFutureRow,
} from '../../../models/market-data.models';

ModuleRegistry.registerModules([AllEnterpriseModule]);

/* ── Price to 32nds conversion ──────────────────────────── */
function priceTo32nds(price: number): string {
  const handle = Math.floor(price);
  const remainder = price - handle;
  const ticks32 = remainder * 32;
  const wholeTicks = Math.floor(ticks32);
  const fraction = ticks32 - wholeTicks;
  let suffix = '';
  if (Math.abs(fraction - 0.25) < 0.01) suffix = '+';
  else if (Math.abs(fraction - 0.5) < 0.01) suffix = '+';
  else if (Math.abs(fraction - 0.75) < 0.01) suffix = '¾';
  const tickStr = wholeTicks.toString().padStart(2, '0');
  return `${handle}-${tickStr}${suffix}`;
}

/* ── No local data — uses MarketDataService signals ──── */

function augmentTFuture(f: TreasuryFuture): TreasuryFutureRow {
  const spread = 0.03125;
  return {
    ...f,
    bid: f.lastPrice - spread,
    ask: f.lastPrice + spread,
    settle: f.lastPrice - f.change,
    high: f.lastPrice + Math.abs(f.change) * 1.5,
    low: f.lastPrice - Math.abs(f.change) * 2,
    dv01PerContract: f.description.includes('2Y') ? 38.5
      : f.description.includes('5Y') ? 47.2
      : f.description.includes('10Y') ? 65.8
      : f.description.includes('Ultra') ? 172.5
      : 125.0,
  };
}

function augmentSOFR(s: SOFRFuture): SOFRFutureRow {
  return {
    ...s,
    contract: s.description,
    openInterest: Math.round(s.volume * (2.5 + Math.random() * 2)),
  };
}

/* ── Treasury Futures column defs ───────────────────────── */
const tFutureCols: ColDef<TreasuryFutureRow>[] = [
  { field: 'symbol', headerName: 'Symbol', width: 64, cellClass: 'text-primary' },
  { field: 'description', headerName: 'Desc', flex: 1 },
  { field: 'bid', headerName: 'Bid', width: 72, type: 'rightAligned', cellClass: 'text-buy', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  { field: 'ask', headerName: 'Ask', width: 72, type: 'rightAligned', cellClass: 'text-sell', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  { field: 'lastPrice', headerName: 'Last', width: 72, type: 'rightAligned', cellClass: 'font-semibold', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  {
    headerName: '32nds',
    width: 72,
    type: 'rightAligned',
    valueGetter: (params: any) => params.data?.lastPrice,
    valueFormatter: (p: any) => p.value != null ? priceTo32nds(p.value) : '',
    cellClass: 'font-mono text-[10px]',
  },
  {
    field: 'change',
    headerName: 'Chg',
    width: 68,
    type: 'rightAligned',
    valueFormatter: (p: any) => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(4) : '',
    cellStyle: (params: any) => {
      if (params.value == null) return null;
      return { color: params.value >= 0 ? 'var(--buy)' : 'var(--sell)' };
    },
  },
  { field: 'settle', headerName: 'Settle', width: 72, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  { field: 'high', headerName: 'High', width: 68, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  { field: 'low', headerName: 'Low', width: 68, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  { field: 'dv01PerContract', headerName: 'DV01/ct', width: 72, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? '$' + p.value.toFixed(1) : '' },
  { field: 'openInterest', headerName: 'Open Int', width: 78, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? fmtK(p.value) : '' },
  { field: 'volume', headerName: 'Volume', width: 72, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? fmtK(p.value) : '' },
];

/* ── SOFR Futures column defs ───────────────────────────── */
const sofrCols: ColDef<SOFRFutureRow>[] = [
  { field: 'contract', headerName: 'Contract', flex: 1 },
  { field: 'symbol', headerName: 'Symbol', width: 80 },
  { field: 'price', headerName: 'Price', width: 90, type: 'rightAligned', valueFormatter: (p: any) => p.value?.toFixed(3) ?? '' },
  {
    field: 'change',
    headerName: 'Chg',
    width: 72,
    type: 'rightAligned',
    valueFormatter: (p: any) => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(3) : '',
    cellStyle: (params: any) => {
      if (params.value == null) return null;
      return { color: params.value >= 0 ? 'var(--buy)' : 'var(--sell)' };
    },
  },
  {
    field: 'impliedRate',
    headerName: 'Impl Rate',
    width: 90,
    type: 'rightAligned',
    valueFormatter: (p: any) => p.value != null ? p.value.toFixed(3) + '%' : '',
    cellStyle: (params: any) => {
      if (params.value == null) return null;
      return params.value >= 4 ? { color: 'var(--sell)' } : null;
    },
  },
  { field: 'volume', headerName: 'Volume', width: 80, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? fmtK(p.value) : '' },
  { field: 'openInterest', headerName: 'Open Int', width: 90, type: 'rightAligned', valueFormatter: (p: any) => p.value != null ? fmtK(p.value) : '' },
];

@Component({
  selector: 'app-futures-panel',
  standalone: true,
  imports: [AgGridAngular, HighchartsChartComponent],
  template: `
    <div class="grid h-full p-2 gap-2" style="grid-template-columns: 9fr 3fr; grid-template-rows: 12fr 7fr;">
      <!-- Treasury Futures (top-left) -->
      <div class="bg-card rounded-lg border border-border flex flex-col overflow-hidden" style="grid-column: 1; grid-row: 1;">
        <div class="flex items-center px-3 py-1.5 border-b border-border shrink-0">
          <span class="text-xs font-semibold text-foreground">Treasury Futures</span>
          <span class="text-[10px] text-muted-foreground font-mono ml-2">{{ tFutures().length }}</span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="tFutures()"
            [columnDefs]="tFutureColDefs"
            [defaultColDef]="defaultColDef"
            [animateRows]="false"
            [suppressCellFocus]="true"
            [rowSelection]="rowSelection"
          />
        </div>
      </div>

      <!-- SOFR Forward Curve (top-right) -->
      <div class="bg-card rounded-lg border border-border flex flex-col overflow-hidden" style="grid-column: 2; grid-row: 1;">
        <div class="flex items-center px-3 py-1.5 border-b border-border shrink-0">
          <span class="text-xs font-semibold text-foreground">SOFR Forward Curve</span>
        </div>
        <div class="flex-1 min-h-0 p-2">
          <highcharts-chart
            [options]="sofrChartOptions()"
            style="width:100%;height:100%;display:block;"
          />
        </div>
        <!-- Stats row -->
        <div class="flex items-center justify-around px-3 py-1.5 border-t border-border text-[10px] font-mono shrink-0">
          <div class="flex flex-col items-center">
            <span class="text-muted-foreground">Nearest</span>
            <span class="text-foreground font-medium">{{ nearestRate() }}%</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-muted-foreground">Farthest</span>
            <span class="text-foreground font-medium">{{ farthestRate() }}%</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-muted-foreground">Steepness</span>
            <span class="font-medium" [class.text-buy]="steepnessBps() < 0" [class.text-sell]="steepnessBps() >= 0">{{ steepnessBps() }} bps</span>
          </div>
        </div>
      </div>

      <!-- SOFR Futures (bottom, full width) -->
      <div class="bg-card rounded-lg border border-border flex flex-col overflow-hidden" style="grid-column: 1 / -1; grid-row: 2;">
        <div class="flex items-center px-3 py-1.5 border-b border-border shrink-0">
          <span class="text-xs font-semibold text-foreground">SOFR Futures</span>
          <span class="text-[10px] text-muted-foreground font-mono ml-2">{{ sofrFutures().length }}</span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="sofrFutures()"
            [columnDefs]="sofrColDefs"
            [defaultColDef]="defaultColDef"
            [animateRows]="false"
            [suppressCellFocus]="true"
            [rowSelection]="rowSelection"
          />
        </div>
      </div>
    </div>
  `,
})
export class FuturesPanelComponent {
  private readonly mds = inject(MarketDataService);

  readonly theme = marketsUITheme;

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    suppressMovable: true,
  };

  readonly rowSelection: GridOptions['rowSelection'] = { mode: 'singleRow', enableClickSelection: true };

  /* ── Data from service ─────────────────────────────────── */
  readonly tFutures = computed(() => this.mds.tFutures().map(augmentTFuture));
  readonly sofrFutures = computed(() => this.mds.sofrFutures().map(augmentSOFR));

  /* ── Column defs ──────────────────────────────────────── */
  readonly tFutureColDefs = tFutureCols;
  readonly sofrColDefs = sofrCols;

  /* ── Computed stats ───────────────────────────────────── */
  readonly nearestRate = computed(() => {
    const sofr = this.mds.sofrFutures();
    return sofr.length > 0 ? sofr[0].impliedRate.toFixed(3) : '—';
  });
  readonly farthestRate = computed(() => {
    const sofr = this.mds.sofrFutures();
    return sofr.length > 0 ? sofr[sofr.length - 1].impliedRate.toFixed(3) : '—';
  });
  readonly steepnessBps = computed(() => {
    const sofr = this.mds.sofrFutures();
    if (sofr.length < 2) return 0;
    return Math.round((sofr[sofr.length - 1].impliedRate - sofr[0].impliedRate) * 1000) / 10;
  });

  /* ── Highcharts SOFR Forward Curve options (reactive) ──── */
  readonly sofrChartOptions = computed(() => {
    const sofrData = this.mds.sofrFutures();
    const categories = sofrData.map((f) => f.symbol);
    const data = sofrData.map((f) => f.impliedRate);

    const primaryColor = '#60A5FA';
    const gridColor = '#2C2F33';
    const textColor = '#9DA0A5';

    return {
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" } },
      credits: { enabled: false },
      title: { text: undefined },
      legend: { enabled: false },
      xAxis: {
        categories,
        lineColor: gridColor,
        tickColor: gridColor,
        labels: {
          style: { color: textColor, fontSize: '9px' },
          rotation: -45,
        },
        gridLineColor: gridColor,
        gridLineWidth: 0.5,
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: gridColor,
        gridLineWidth: 0.5,
        labels: {
          style: { color: textColor, fontSize: '9px', fontFamily: "'JetBrains Mono Variable', monospace" },
          formatter(this: AxisLabelsFormatterContextObject): string {
            return typeof this.value === 'number' ? this.value.toFixed(2) + '%' : String(this.value);
          },
        },
      },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: gridColor,
        style: { color: '#FFFFFF', fontSize: '11px' },
        formatter(this: any): string {
          return `<b>${this.x}</b><br/>Rate: ${(this.y ?? 0).toFixed(3)}%`;
        },
      },
      plotOptions: {
        area: {
          marker: { radius: 3, lineWidth: 0 },
        },
        series: { animation: false },
      },
      series: [{
        type: 'area' as const,
        name: 'Implied Rate',
        data,
        color: primaryColor,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, primaryColor + '2A'],
            [1, primaryColor + '05'],
          ] as Array<[number, string]>,
        },
        lineWidth: 2,
        marker: { fillColor: primaryColor, lineColor: primaryColor },
      }],
    } as Options;
  });
}
