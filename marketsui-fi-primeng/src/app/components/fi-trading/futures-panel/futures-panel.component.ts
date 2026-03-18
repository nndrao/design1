import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MarketDataService } from '../../../services/market-data.service';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import { fmtK } from '../../../shared/utils';
import type { TreasuryFutureRow, SOFRFutureRow } from '../../../models/market-data.models';

ModuleRegistry.registerModules([AllEnterpriseModule]);

/* ── 32nds conversion ──────────────────────────────────── */
function priceTo32nds(price: number): string {
  const whole = Math.floor(price);
  const frac = price - whole;
  const t32 = frac * 32;
  const t32Int = Math.floor(t32);
  const remainder = t32 - t32Int;
  const suffix = remainder >= 0.5 ? '+' : '';
  return `${whole}-${String(t32Int).padStart(2, '0')}${suffix}`;
}

@Component({
  selector: 'app-futures-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, HighchartsChartComponent],
  template: `
    <!-- Treasury Futures Grid -->
    <div class="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style="height: 420px">
      <div class="px-3 pt-2 pb-1">
        <h3 class="text-xs font-semibold text-foreground">Treasury Futures</h3>
      </div>
      <div class="flex-1 min-h-0">
        <ag-grid-angular
          class="w-full h-full"
          [theme]="theme"
          [rowData]="tRows()"
          [columnDefs]="tColDefs"
          [headerHeight]="30"
          [rowHeight]="32"
          [suppressCellFocus]="true"
          [animateRows]="false"
        />
      </div>
    </div>

    <!-- SOFR Forward Curve + SOFR Grid row -->
    <div class="grid grid-cols-12 gap-3 mt-3">
      <!-- Forward Curve Chart -->
      <div class="col-span-4 bg-card border border-border rounded-xl overflow-hidden flex flex-col" style="height: 300px">
        <div class="px-3 pt-2 pb-1">
          <h3 class="text-xs font-semibold text-foreground">SOFR Forward Curve</h3>
        </div>
        <div class="flex-1 min-h-0 px-2">
          <highcharts-chart
            [options]="fwdCurveOptions()"
            style="width: 100%; height: 100%; display: block"
          />
        </div>
        <div class="flex items-center justify-between px-3 pb-2 text-[10px] text-muted-foreground">
          <span>Nearest: <span class="text-foreground font-medium">{{ nearest().toFixed(3) }}%</span></span>
          <span>Farthest: <span class="text-foreground font-medium">{{ farthest().toFixed(3) }}%</span></span>
          <span>Steepness: <span class="text-foreground font-medium">{{ steepness().toFixed(1) }} bps</span></span>
        </div>
      </div>

      <!-- SOFR Futures Grid -->
      <div class="col-span-8 bg-card border border-border rounded-xl overflow-hidden flex flex-col" style="height: 300px">
        <div class="px-3 pt-2 pb-1">
          <h3 class="text-xs font-semibold text-foreground">SOFR Futures</h3>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="sofrRows()"
            [columnDefs]="sofrColDefs"
            [headerHeight]="30"
            [rowHeight]="32"
            [suppressCellFocus]="true"
            [animateRows]="false"
          />
        </div>
      </div>
    </div>
  `,
})
export class FuturesPanelComponent {
  private readonly mds = inject(MarketDataService);
  protected readonly theme = marketsUITheme;

  /* ── Augmented row data ─────────────────────────────────── */
  protected readonly tRows = computed<TreasuryFutureRow[]>(() =>
    this.mds.tFutures().map(f => {
      const spread = 0.015625;
      return {
        ...f,
        bid: +(f.lastPrice - spread).toFixed(6),
        ask: +(f.lastPrice + spread).toFixed(6),
        settle: +(f.lastPrice - f.change).toFixed(6),
        high: +(f.lastPrice + Math.abs(f.change) * 0.8).toFixed(6),
        low: +(f.lastPrice - Math.abs(f.change) * 1.2).toFixed(6),
        dv01PerContract: +(f.lastPrice * 0.06 + 2).toFixed(2),
      };
    })
  );

  protected readonly sofrRows = computed<SOFRFutureRow[]>(() =>
    this.mds.sofrFutures().map((f, i) => ({
      ...f,
      contract: f.description || f.symbol,
      openInterest: Math.round(80000 + i * 12000 + Math.random() * 5000),
    }))
  );

  /* ── Curve data ─────────────────────────────────────────── */
  private readonly curveData = computed(() =>
    this.sofrRows().map(r => ({ contract: r.symbol, rate: r.impliedRate }))
  );

  protected readonly nearest = computed(() =>
    this.curveData().length > 0 ? this.curveData()[0].rate : 0
  );
  protected readonly farthest = computed(() => {
    const cd = this.curveData();
    return cd.length > 0 ? cd[cd.length - 1].rate : 0;
  });
  protected readonly steepness = computed(() =>
    Math.abs(this.farthest() - this.nearest()) * 100
  );

  /* ── Treasury column defs ───────────────────────────────── */
  protected readonly tColDefs: ColDef<TreasuryFutureRow>[] = [
    {
      field: 'symbol', headerName: 'Symbol', width: 64,
      cellRenderer: (p: any) => `<span class="font-mono text-primary">${p.value ?? ''}</span>`,
    },
    { field: 'description', headerName: 'Desc', flex: 1, minWidth: 100 },
    {
      field: 'bid', headerName: 'Bid', width: 72, type: 'rightAligned',
      valueFormatter: p => p.value?.toFixed(3) ?? '',
      cellClass: 'text-buy',
    },
    {
      field: 'ask', headerName: 'Ask', width: 72, type: 'rightAligned',
      valueFormatter: p => p.value?.toFixed(3) ?? '',
      cellClass: 'text-sell',
    },
    {
      field: 'lastPrice', headerName: 'Last', width: 72, type: 'rightAligned',
      valueFormatter: p => p.value?.toFixed(3) ?? '',
      cellClass: 'font-semibold',
    },
    {
      headerName: '32nds', width: 72, type: 'rightAligned',
      valueGetter: p => p.data ? priceTo32nds(p.data.lastPrice) : '',
      cellRenderer: (p: any) => `<span class="text-muted-foreground font-mono">${p.value ?? ''}</span>`,
    },
    {
      field: 'change', headerName: 'Chg', width: 68, type: 'rightAligned',
      valueFormatter: p => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(3) : '',
      cellRenderer: (p: any) => {
        const cls = p.value >= 0 ? 'text-buy' : 'text-sell';
        return `<span class="${cls}">${p.valueFormatted ?? ''}</span>`;
      },
    },
    {
      field: 'settle', headerName: 'Settle', width: 72, type: 'rightAligned',
      valueFormatter: p => p.value?.toFixed(3) ?? '',
    },
    {
      field: 'high', headerName: 'High', width: 68, type: 'rightAligned',
      valueFormatter: p => p.value?.toFixed(3) ?? '',
    },
    {
      field: 'low', headerName: 'Low', width: 68, type: 'rightAligned',
      valueFormatter: p => p.value?.toFixed(3) ?? '',
    },
    {
      field: 'dv01PerContract', headerName: 'DV01/ct', width: 72, type: 'rightAligned',
      valueFormatter: p => p.value != null ? '$' + p.value.toFixed(2) : '',
    },
    {
      field: 'openInterest', headerName: 'Open Int', width: 78, type: 'rightAligned',
      valueFormatter: p => p.value != null ? fmtK(p.value) : '',
    },
    {
      field: 'volume', headerName: 'Volume', width: 72, type: 'rightAligned',
      valueFormatter: p => p.value != null ? fmtK(p.value) : '',
    },
  ];

  /* ── SOFR column defs ───────────────────────────────────── */
  protected readonly sofrColDefs: ColDef<SOFRFutureRow>[] = [
    { field: 'contract', headerName: 'Contract', flex: 1, minWidth: 120 },
    { field: 'symbol', headerName: 'Symbol', width: 80 },
    {
      field: 'price', headerName: 'Price', width: 90, type: 'rightAligned',
      valueFormatter: p => p.value?.toFixed(4) ?? '',
      cellClass: 'font-mono',
    },
    {
      field: 'change', headerName: 'Chg', width: 72, type: 'rightAligned',
      valueFormatter: p => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(4) : '',
      cellRenderer: (p: any) => {
        const cls = p.value >= 0 ? 'text-buy' : 'text-sell';
        return `<span class="${cls}">${p.valueFormatted ?? ''}</span>`;
      },
    },
    {
      field: 'impliedRate', headerName: 'Impl Rate', width: 90, type: 'rightAligned',
      cellRenderer: (p: any) => {
        const cls = p.value != null ? (p.value >= 4 ? 'text-sell' : 'text-buy') : '';
        return `<span class="${cls}">${p.value != null ? p.value.toFixed(3) + '%' : ''}</span>`;
      },
    },
    {
      field: 'volume', headerName: 'Volume', width: 80, type: 'rightAligned',
      valueFormatter: p => p.value != null ? fmtK(p.value) : '',
    },
    {
      field: 'openInterest', headerName: 'Open Int', width: 90, type: 'rightAligned',
      valueFormatter: p => p.value != null ? fmtK(p.value) : '',
    },
  ];

  /* ── Forward curve chart options ────────────────────────── */
  protected readonly fwdCurveOptions = computed<Highcharts.Options>(() => {
    const cd = this.curveData();
    return {
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" } },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: cd.map(d => d.contract),
        labels: { style: { color: '#9DA0A5', fontSize: '9px' }, step: Math.max(1, Math.floor(cd.length / 6)) },
        lineColor: '#2C2F33',
        tickLength: 0,
      },
      yAxis: {
        title: { text: undefined },
        labels: { format: '{value:.2f}%', style: { color: '#9DA0A5', fontSize: '9px' } },
        gridLineColor: '#2C2F33',
        gridLineDashStyle: 'ShortDash',
        lineWidth: 0,
      },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: '#2C2F33',
        borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        formatter() {
          return `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>Implied Rate: ${Number(this.y).toFixed(3)}%`;
        },
        useHTML: true,
      },
      plotOptions: { series: { animation: false } },
      series: [{
        name: 'Implied Rate',
        type: 'spline' as const,
        data: cd.map(d => d.rate),
        color: '#60A5FA',
        lineWidth: 2,
        marker: { enabled: true, radius: 3, fillColor: '#60A5FA', lineColor: '#60A5FA', lineWidth: 0, symbol: 'circle' },
      }],
    };
  });
}
