import {
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type {
  ColDef,
  GridReadyEvent,
  SelectionChangedEvent,
  GridApi,
  Module,
  ValueFormatterParams,
  CellClassParams,
} from 'ag-grid-enterprise';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options, AxisLabelsFormatterContextObject } from 'highcharts';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import { MarketDataService } from '../../../services/market-data.service';
import { fmtYield, fmtBps, fmtPrice } from '../../../shared/utils';
import type { Treasury, KeyRateDuration } from '../../../models/market-data.models';

@Component({
  selector: 'app-rates-panel',
  standalone: true,
  imports: [CommonModule, AgGridAngular, HighchartsChartComponent],
  template: `
    <!-- ── Rates Panel Grid Layout ───────────────────────── -->
    <div class="grid grid-cols-12 gap-3 p-4 h-full overflow-hidden">

      <!-- ── Left: AG Grid ───────────────────────────────── -->
      <div class="col-span-9 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
        <div class="px-4 pt-3 pb-2 flex items-center justify-between">
          <h3 class="text-xs font-semibold text-foreground">Treasury Securities</h3>
          <span class="text-[10px] text-muted-foreground font-mono tabular-nums">
            {{ mds.treasuries().length }} instruments
          </span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="gridTheme"
            [modules]="gridModules"
            [rowData]="mds.treasuries()"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowSelection]="rowSelection"
            [suppressCellFocus]="true"
            [animateRows]="true"
            (gridReady)="onGridReady($event)"
            (selectionChanged)="onSelectionChanged($event)"
          />
        </div>
      </div>

      <!-- ── Right Sidebar ───────────────────────────────── -->
      <div class="col-span-3 flex flex-col gap-3 overflow-hidden">

        <!-- ── Yield Curve Chart ─────────────────────────── -->
        <div class="bg-card rounded-lg border border-border p-4 flex flex-col" style="height: calc(6 * var(--spacing, 0.25rem) * 10 + 8rem);">
          <h3 class="text-xs font-semibold text-foreground mb-1">Yield Curve</h3>
          <div class="flex items-center gap-3 mb-2">
            <span class="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span class="inline-block w-3 h-0.5 rounded-full bg-primary"></span> Today
            </span>
            <span class="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span class="inline-block w-3 h-0.5 rounded-full bg-muted-foreground opacity-50"></span> Prev Close
            </span>
          </div>
          <div class="flex-1 min-h-0 relative">
            <highcharts-chart
              [options]="yieldCurveOptions()"
              style="width:100%;height:100%;display:block;"
            />
          </div>
        </div>

        <!-- ── Curve Spreads ─────────────────────────────── -->
        <div class="bg-card rounded-lg border border-border p-4 flex flex-col" style="height: calc(5 * var(--spacing, 0.25rem) * 10 + 4rem);">
          <h3 class="text-xs font-semibold text-foreground mb-3">Curve Spreads</h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
            @for (spread of mds.curveSpreads(); track spread.label) {
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-muted-foreground font-medium">{{ spread.label }}</span>
                <span
                  class="text-[11px] font-mono font-semibold tabular-nums"
                  [class.text-buy]="spread.value > 0"
                  [class.text-sell]="spread.value < 0"
                  [class.text-foreground]="spread.value === 0"
                >
                  {{ formatBps(spread.value) }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- ── Detail Panel ──────────────────────────────── -->
        <div class="bg-card rounded-lg border border-border p-4 flex flex-col flex-1 min-h-0 overflow-y-auto">
          @if (selectedTreasury()) {
            <h3 class="text-xs font-semibold text-foreground mb-3">
              {{ selectedTreasury()!.security }}
              <span class="text-muted-foreground font-normal ml-1">({{ selectedTreasury()!.tenor }})</span>
            </h3>
            <div class="flex flex-col gap-2">
              @for (item of detailItems(); track item.label) {
                <div class="flex items-center justify-between py-1 border-b border-border last:border-b-0">
                  <span class="text-[10px] text-muted-foreground font-medium">{{ item.label }}</span>
                  <span class="text-[11px] font-mono font-semibold tabular-nums text-foreground">{{ item.value }}</span>
                </div>
              }
            </div>
          } @else {
            <h3 class="text-xs font-semibold text-foreground mb-3">Key Rate Durations</h3>
            <div class="flex-1 min-h-0 relative">
              <highcharts-chart
                [options]="krdChartOptions()"
                style="width:100%;height:100%;display:block;"
              />
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }
  `],
})
export class RatesPanelComponent {
  protected readonly mds = inject(MarketDataService);

  private gridApi: GridApi | null = null;

  /* ── AG Grid config ────────────────────────────────────── */
  readonly gridTheme = marketsUITheme;
  readonly gridModules: Module[] = [AllEnterpriseModule];

  readonly rowSelection: any = {
    mode: 'singleRow',
    checkboxes: false,
    enableClickSelection: true,
  };

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
  };

  readonly columnDefs: ColDef<Treasury>[] = [
    {
      headerName: 'Tenor',
      field: 'tenor',
      width: 60,
      cellClass: 'font-semibold',
    },
    {
      headerName: 'Security',
      field: 'security',
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: 'Cpn',
      field: 'coupon',
      width: 72,
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? p.value.toFixed(3) : '',
    },
    {
      headerName: 'Maturity',
      field: 'maturity',
      width: 88,
    },
    {
      headerName: 'Bid Yld',
      field: 'bidYield',
      width: 80,
      cellClass: 'text-buy',
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? fmtYield(p.value) : '',
    },
    {
      headerName: 'Ask Yld',
      field: 'askYield',
      width: 78,
      cellClass: 'text-sell',
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? fmtYield(p.value) : '',
    },
    {
      headerName: 'Bid Px',
      field: 'bidPrice',
      width: 76,
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? fmtPrice(p.value) : '',
    },
    {
      headerName: 'Ask Px',
      field: 'askPrice',
      width: 76,
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? fmtPrice(p.value) : '',
    },
    {
      headerName: 'Chg bps',
      field: 'changeBps',
      width: 82,
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(1) : '',
      cellClassRules: {
        'text-buy': (p: CellClassParams<Treasury>) => (p.value ?? 0) < 0,
        'text-sell': (p: CellClassParams<Treasury>) => (p.value ?? 0) > 0,
      },
    },
    {
      headerName: 'Mod Dur',
      field: 'modDuration',
      width: 76,
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? p.value.toFixed(2) : '',
    },
    {
      headerName: 'DV01/MM',
      field: 'dv01PerMM',
      width: 84,
      valueFormatter: (p: ValueFormatterParams<Treasury>) =>
        p.value != null ? '$' + Math.round(p.value).toLocaleString() : '',
    },
  ];

  /* ── Selection state ───────────────────────────────────── */
  readonly selectedTreasury = signal<Treasury | null>(null);

  readonly detailItems = signal<{ label: string; value: string }[]>([]);

  /* ── Format helpers ────────────────────────────────────── */
  formatBps = fmtBps;

  /* ── AG Grid events ────────────────────────────────────── */
  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    event.api.sizeColumnsToFit();
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    const rows = event.api.getSelectedRows() as Treasury[];
    const sel = rows.length > 0 ? rows[0] : null;
    this.selectedTreasury.set(sel);

    if (sel) {
      this.detailItems.set([
        { label: 'CUSIP', value: sel.cusip },
        { label: 'Coupon', value: sel.coupon.toFixed(3) + '%' },
        { label: 'Maturity', value: sel.maturity },
        { label: 'Mid Yield', value: fmtYield(sel.mid) },
        { label: 'Bid Yield', value: fmtYield(sel.bidYield) },
        { label: 'Ask Yield', value: fmtYield(sel.askYield) },
        { label: 'Bid Price', value: fmtPrice(sel.bidPrice) },
        { label: 'Ask Price', value: fmtPrice(sel.askPrice) },
        { label: 'Chg (bps)', value: fmtBps(sel.changeBps) },
        { label: 'Mod Duration', value: sel.modDuration.toFixed(2) },
        { label: 'DV01/MM', value: '$' + Math.round(sel.dv01PerMM).toLocaleString() },
        { label: 'Settle', value: 'T+1' },
      ]);
    } else {
      this.detailItems.set([]);
    }
  }

  /* ── Highcharts Yield Curve options (reactive) ──────────── */
  readonly yieldCurveOptions = computed(() => {
    const data = this.mds.yieldCurve();
    const categories = data.map((p) => p.tenor);
    const todayValues = data.map((p) => p.yield);
    const prevValues = data.map((p) => p.prevClose);

    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--primary').trim() || '#60A5FA';
    const mutedFg = style.getPropertyValue('--muted-foreground').trim() || '#9DA0A5';
    const borderClr = style.getPropertyValue('--border').trim() || '#2C2F33';

    return {
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" } },
      credits: { enabled: false },
      title: { text: undefined },
      legend: { enabled: false },
      xAxis: {
        categories,
        lineColor: borderClr,
        tickColor: borderClr,
        labels: { style: { color: mutedFg, fontSize: '9px' } },
        gridLineColor: borderClr,
        gridLineWidth: 0.5,
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: borderClr,
        gridLineWidth: 0.5,
        labels: {
          style: { color: mutedFg, fontSize: '9px' },
          formatter(this: AxisLabelsFormatterContextObject): string {
            return typeof this.value === 'number' ? this.value.toFixed(1) + '%' : String(this.value);
          },
        },
      },
      tooltip: {
        shared: true,
        backgroundColor: 'rgba(26, 29, 33, 0.95)',
        borderColor: borderClr,
        style: { color: '#FFFFFF', fontSize: '10px' },
        formatter(this: any): string {
          let s = `<b>${this.x}</b><br/>`;
          this.points?.forEach((p: any) => {
            s += `<span style="color:${p.color}">\u25CF</span> ${p.series.name}: ${fmtYield(p.y ?? 0)}<br/>`;
          });
          return s;
        },
      },
      plotOptions: {
        area: { marker: { radius: 2, lineWidth: 0 } },
        series: { animation: false },
      },
      series: [
        {
          type: 'area' as const,
          name: 'Today',
          data: todayValues,
          color: primaryColor,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(96, 165, 250, 0.30)'],
              [1, 'rgba(96, 165, 250, 0.02)'],
            ] as Array<[number, string]>,
          },
          lineWidth: 2,
          marker: { fillColor: primaryColor, lineColor: primaryColor },
        },
        {
          type: 'line' as const,
          name: 'Prev Close',
          data: prevValues,
          color: mutedFg,
          dashStyle: 'ShortDash' as const,
          lineWidth: 1.5,
          marker: { enabled: false },
        },
      ],
    } as Options;
  });

  /* ── Highcharts KRD Bar Chart options (reactive) ────────── */
  readonly krdChartOptions = computed(() => {
    const krdData = this.mds.keyRateDurations();
    const categories = krdData.map((d) => d.tenor);
    const values = krdData.map((d) => d.value);

    const style = getComputedStyle(document.documentElement);
    const buyColor = style.getPropertyValue('--buy').trim() || '#14B8A6';
    const sellColor = style.getPropertyValue('--sell').trim() || '#FF5252';
    const mutedFg = style.getPropertyValue('--muted-foreground').trim() || '#9DA0A5';
    const borderClr = style.getPropertyValue('--border').trim() || '#2C2F33';

    const dataPoints = values.map((v) => ({
      y: v,
      color: v >= 0 ? buyColor + '66' : sellColor + '66',
      borderColor: v >= 0 ? buyColor : sellColor,
    }));

    return {
      chart: { type: 'column', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" } },
      credits: { enabled: false },
      title: { text: undefined },
      legend: { enabled: false },
      xAxis: {
        categories,
        lineColor: borderClr,
        tickColor: borderClr,
        labels: { style: { color: mutedFg, fontSize: '9px' } },
        gridLineWidth: 0,
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: borderClr,
        gridLineWidth: 0.5,
        labels: {
          style: { color: mutedFg, fontSize: '9px' },
          formatter(this: AxisLabelsFormatterContextObject): string {
            return typeof this.value === 'number' ? this.value.toFixed(1) : String(this.value);
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 33, 0.95)',
        borderColor: borderClr,
        style: { color: '#FFFFFF', fontSize: '10px' },
        formatter(this: any): string {
          return `<b>${this.x}</b><br/>KRD: ${(this.y ?? 0).toFixed(2)}`;
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.15,
          groupPadding: 0.1,
          borderWidth: 1,
          borderRadius: 3,
        },
        series: { animation: false },
      },
      series: [{
        type: 'column' as const,
        name: 'KRD',
        data: dataPoints,
      }],
    } as Options;
  });
}
