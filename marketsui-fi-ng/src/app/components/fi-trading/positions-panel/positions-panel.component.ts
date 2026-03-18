import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { HlmButtonDirective } from '../../../shared/ui/hlm-button.directive';
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise';
import type { ColDef, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options, AxisLabelsFormatterContextObject } from 'highcharts';
import { MarketDataService } from '../../../services/market-data.service';
import { Position, AssetClass } from '../../../models/market-data.models';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import { fmtPnL, fmtDV01, fmtPrice, fmtYield } from '../../../shared/utils';

ModuleRegistry.registerModules([AllEnterpriseModule]);

type AssetFilter = 'All' | AssetClass;
const ASSET_FILTERS: AssetFilter[] = ['All', 'Treasury', 'Corporate', 'Future', 'CDS'];

const CLASS_COLORS: Record<string, string> = {
  Treasury: 'text-primary', Corporate: 'text-buy', Future: 'text-warning', CDS: 'text-sell',
};

@Component({
  selector: 'app-positions-panel',
  standalone: true,
  imports: [AgGridAngular, HighchartsChartComponent, HlmButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="h-full flex flex-col overflow-hidden p-3 space-y-3">
      <!-- KPI Row -->
      <div class="grid grid-cols-6 gap-2 shrink-0">
        @for (kpi of kpis(); track kpi.label) {
          <div class="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-0.5">
            <span class="text-[10px] text-muted-foreground uppercase tracking-widest">{{ kpi.label }}</span>
            <span class="text-xl font-semibold font-mono leading-tight mt-0.5" [class]="kpi.cls">{{ kpi.value }}</span>
            @if (kpi.sub) {
              <span class="text-[10px] text-muted-foreground mt-0.5">{{ kpi.sub }}</span>
            }
          </div>
        }
      </div>

      <!-- Grid + Sidebar -->
      <div class="flex-1 min-h-0 grid grid-cols-12 gap-3">
        <!-- Positions Grid -->
        <div class="col-span-9 flex flex-col overflow-hidden">
          <!-- Filter buttons -->
          <div class="flex items-center justify-between mb-2 shrink-0">
            <div class="flex items-center gap-1">
              @for (f of assetFilters; track f) {
                <button
                  hlmBtn
                  [variant]="assetFilter() === f ? 'default' : 'ghost'"
                  size="sm"
                  (click)="assetFilter.set(f)"
                  class="rounded-full text-[10px] h-6 px-2"
                >
                  {{ f }}
                </button>
              }
            </div>
            <span class="text-[11px] text-muted-foreground">{{ rowData().length }} positions</span>
          </div>

          <!-- AG Grid -->
          <div class="flex-1 min-h-0">
            <ag-grid-angular
              style="width: 100%; height: 100%;"
              [theme]="theme"
              [rowData]="rowData()"
              [columnDefs]="colDefs"
              [defaultColDef]="defaultColDef"
              [rowHeight]="40"
              [headerHeight]="30"
              [rowSelection]="rowSelection"
              [pinnedBottomRowData]="pinnedBottomRowData()"
              [suppressCellFocus]="true"
              [enableCellTextSelection]="true"
              (rowClicked)="onRowClicked($event)"
              (gridReady)="onGridReady($event)"
            />
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="col-span-3 flex flex-col gap-3 overflow-hidden">
          <!-- DV01 by Class Chart -->
          <div class="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style="height: 220px;">
            <div class="px-4 py-2.5 border-b border-border shrink-0">
              <span class="text-xs font-semibold">DV01 by Class</span>
            </div>
            <div class="flex-1 p-2 min-h-0">
              <highcharts-chart
                [options]="dv01ClassChartOptions"
                style="width:100%;height:100%;display:block;"
              />
            </div>
          </div>

          <!-- Detail / Attribution -->
          @if (selected(); as sel) {
            <div class="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col min-h-0">
              <div class="px-4 py-3 border-b border-border shrink-0">
                <div class="font-semibold text-sm">{{ sel.security }}</div>
                <div class="text-[10px] text-muted-foreground font-mono mt-0.5">{{ sel.cusip }}</div>
              </div>
              <div class="mx-3 mt-3 px-3 py-2.5 rounded-lg shrink-0"
                [class.bg-buy/10]="sel.pnlToday >= 0"
                [class.bg-sell/10]="sel.pnlToday < 0"
              >
                <div class="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">P&L Today</div>
                <div class="text-xl font-semibold font-mono"
                  [class.text-buy]="sel.pnlToday >= 0"
                  [class.text-sell]="sel.pnlToday < 0"
                >{{ formatPnL(sel.pnlToday) }}</div>
              </div>
              <div class="flex-1 overflow-y-auto px-3 py-3">
                <div class="grid grid-cols-2 gap-x-2 gap-y-3 text-[11px]">
                  @for (item of getDetailItems(sel); track item.label) {
                    <div>
                      <div class="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{{ item.label }}</div>
                      <div class="font-mono font-medium">{{ item.value }}</div>
                    </div>
                  }
                </div>
              </div>
            </div>
          } @else {
            <div class="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col min-h-0">
              <div class="px-4 py-2.5 border-b border-border shrink-0">
                <span class="text-xs font-semibold">P&L Attribution</span>
              </div>
              <div class="flex-1 overflow-y-auto divide-y divide-border">
                @for (p of sortedByPnl; track p.id) {
                  <div class="flex items-center justify-between px-4 py-2 text-[11px]">
                    <span class="text-muted-foreground truncate mr-2">{{ p.security }}</span>
                    <div class="flex items-center gap-2 shrink-0">
                      <div class="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full"
                          [class.bg-buy]="p.pnlToday >= 0"
                          [class.bg-sell]="p.pnlToday < 0"
                          [style.width.%]="pnlBarWidth(p.pnlToday)"
                        ></div>
                      </div>
                      <span class="font-mono font-semibold w-16 text-right"
                        [class.text-buy]="p.pnlToday >= 0"
                        [class.text-sell]="p.pnlToday < 0"
                      >{{ formatPnL(p.pnlToday) }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PositionsPanelComponent {
  private readonly marketDataService = inject(MarketDataService);

  readonly theme = marketsUITheme;
  readonly assetFilters = ASSET_FILTERS;
  readonly assetFilter = signal<AssetFilter>('All');
  readonly selected = signal<Position | null>(null);
  readonly formatPnL = fmtPnL;
  readonly formatDV01 = fmtDV01;

  readonly rowSelection: any = { mode: 'singleRow', checkboxes: false, enableClickSelection: true };

  private get allPositions(): readonly Position[] {
    return this.marketDataService.positions;
  }

  readonly totalPnlToday = computed(() => this.allPositions.reduce((s, p) => s + p.pnlToday, 0));
  readonly totalPnlMtd   = computed(() => this.allPositions.reduce((s, p) => s + p.pnlMtd, 0));
  readonly totalPnlYtd   = computed(() => this.allPositions.reduce((s, p) => s + p.pnlYtd, 0));
  readonly totalDV01     = computed(() => this.allPositions.reduce((s, p) => s + p.dv01, 0));
  readonly totalCS01     = computed(() => this.allPositions.reduce((s, p) => s + p.cs01, 0));
  readonly totalMktVal   = computed(() => this.allPositions.filter(p => p.mktVal !== 0).reduce((s, p) => s + p.mktVal, 0));

  readonly kpis = computed(() => {
    const pnlToday = this.totalPnlToday();
    const pnlMtd = this.totalPnlMtd();
    const pnlYtd = this.totalPnlYtd();
    return [
      { label: 'P&L Today',    value: fmtPnL(pnlToday),                           cls: pnlToday >= 0 ? 'text-buy' : 'text-sell', sub: '' },
      { label: 'P&L MTD',      value: fmtPnL(pnlMtd),                              cls: pnlMtd >= 0 ? 'text-buy' : 'text-sell',   sub: '' },
      { label: 'P&L YTD',      value: fmtPnL(pnlYtd),                              cls: pnlYtd >= 0 ? 'text-buy' : 'text-sell',   sub: '' },
      { label: 'Net DV01',     value: fmtDV01(this.totalDV01()),                    cls: '',                                        sub: 'Rate sensitivity' },
      { label: 'Net CS01',     value: fmtDV01(this.totalCS01()),                    cls: '',                                        sub: 'Credit sensitivity' },
      { label: 'Market Value', value: '$' + this.totalMktVal().toFixed(1) + 'MM',   cls: '',                                        sub: 'Long positions' },
    ];
  });

  readonly rowData = computed(() => {
    const filter = this.assetFilter();
    return filter === 'All' ? [...this.allPositions] : this.allPositions.filter(p => p.assetClass === filter);
  });

  readonly pinnedBottomRowData = computed(() => [{
    id: 'total', security: 'TOTAL', cusip: '', assetClass: '' as any, side: '' as any,
    size: 0, avgPx: 0, currPx: 0, currYld: 0,
    dv01: this.totalDV01(), cs01: this.totalCS01(),
    pnlToday: this.totalPnlToday(), pnlMtd: this.totalPnlMtd(), pnlYtd: this.totalPnlYtd(),
    mktVal: 0,
  } as Position]);

  get sortedByPnl(): readonly Position[] {
    return [...this.allPositions].sort((a, b) => Math.abs(b.pnlToday) - Math.abs(a.pnlToday));
  }

  readonly colDefs: ColDef<Position>[] = [
    {
      field: 'security', headerName: 'Security', width: 160, pinned: 'left',
      cellRenderer: (p: any) => `<div class="flex flex-col justify-center h-full leading-none gap-0.5">
        <div class="font-semibold text-[11px]">${p.data?.security ?? ''}</div>
        <div class="text-[10px] text-muted-foreground font-mono">${p.data?.cusip ?? ''}</div>
      </div>`,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'assetClass', headerName: 'Class', width: 82,
      cellRenderer: (p: any) => {
        const cls = CLASS_COLORS[p.value] ?? 'text-muted-foreground';
        return `<span class="text-[10px] font-medium ${cls}">${p.value ?? ''}</span>`;
      },
      filter: 'agSetColumnFilter',
    },
    {
      field: 'side', headerName: 'Side', width: 78,
      cellRenderer: (p: any) => {
        const isLong = p.value === 'LONG';
        return `<span class="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${isLong ? 'bg-buy/15 text-buy' : 'bg-sell/15 text-sell'}">${p.value ?? ''}</span>`;
      },
      filter: 'agSetColumnFilter',
    },
    {
      field: 'size', headerName: 'Size', width: 78, type: 'rightAligned',
      cellClass: 'font-mono font-semibold',
      valueFormatter: p => p.data?.assetClass === 'Future' ? `${p.value} cts` : `$${p.value}MM`,
    },
    {
      field: 'avgPx', headerName: 'Avg Px', width: 72, type: 'rightAligned',
      cellClass: 'font-mono text-muted-foreground',
      valueFormatter: p => fmtPrice(p.value),
    },
    {
      field: 'currPx', headerName: 'Curr Px', width: 72, type: 'rightAligned',
      cellClass: 'font-mono',
      valueFormatter: p => fmtPrice(p.value),
    },
    {
      field: 'currYld', headerName: 'Curr Yld', width: 76, type: 'rightAligned',
      cellClass: 'font-mono text-muted-foreground',
      valueFormatter: p => p.value > 0 ? fmtYield(p.value) : '\u2014',
    },
    {
      field: 'dv01', headerName: 'DV01', width: 76, type: 'rightAligned',
      cellClass: 'font-mono',
      valueFormatter: p => fmtDV01(p.value),
      cellStyle: p => ({ color: (p.value ?? 0) >= 0 ? 'inherit' : 'var(--sell)' }),
    },
    {
      field: 'cs01', headerName: 'CS01', width: 72, type: 'rightAligned',
      cellClass: 'font-mono text-muted-foreground',
      valueFormatter: p => p.value > 0 ? fmtDV01(p.value) : '\u2014',
    },
    {
      field: 'pnlToday', headerName: 'P&L Today', width: 90, type: 'rightAligned',
      cellRenderer: (p: any) => `<span class="font-mono font-semibold ${(p.value ?? 0) >= 0 ? 'text-buy' : 'text-sell'}">${fmtPnL(p.value ?? 0)}</span>`,
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'pnlMtd', headerName: 'P&L MTD', width: 88, type: 'rightAligned',
      cellRenderer: (p: any) => `<span class="font-mono ${(p.value ?? 0) >= 0 ? 'text-buy' : 'text-sell'}">${fmtPnL(p.value ?? 0)}</span>`,
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'pnlYtd', headerName: 'P&L YTD', width: 88, type: 'rightAligned',
      cellRenderer: (p: any) => `<span class="font-mono ${(p.value ?? 0) >= 0 ? 'text-buy' : 'text-sell'}">${fmtPnL(p.value ?? 0)}</span>`,
      filter: 'agNumberColumnFilter',
    },
  ];

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    minWidth: 50,
  };

  pnlBarWidth(pnl: number): number {
    return Math.min(Math.abs(pnl) / 45000 * 100, 100);
  }

  getDetailItems(sel: Position): { label: string; value: string }[] {
    return [
      { label: 'Side',    value: sel.side },
      { label: 'Class',   value: sel.assetClass },
      { label: 'Size',    value: sel.assetClass === 'Future' ? `${sel.size} cts` : `$${sel.size}MM` },
      { label: 'Avg Px',  value: fmtPrice(sel.avgPx) },
      { label: 'Curr Px', value: fmtPrice(sel.currPx) },
      { label: 'Yield',   value: sel.currYld > 0 ? fmtYield(sel.currYld) : '\u2014' },
      { label: 'DV01',    value: fmtDV01(sel.dv01) },
      { label: 'CS01',    value: sel.cs01 > 0 ? fmtDV01(sel.cs01) : '\u2014' },
      { label: 'MTD',     value: fmtPnL(sel.pnlMtd) },
      { label: 'YTD',     value: fmtPnL(sel.pnlYtd) },
    ];
  }

  onRowClicked(e: RowClickedEvent<Position>): void {
    const curr = this.selected();
    if (curr?.id === e.data?.id) {
      this.selected.set(null);
    } else {
      this.selected.set(e.data ?? null);
    }
  }

  onGridReady(e: GridReadyEvent): void {
    e.api.sizeColumnsToFit();
  }

  /* ── Highcharts DV01 by Class (horizontal bar) ──────────── */
  readonly dv01ClassChartOptions: Options = (() => {
    const positions = this.marketDataService.positions;
    const dv01ByClass = [
      { label: 'Treasury',  dv01: positions.filter(p => p.assetClass === 'Treasury').reduce((s, p) => s + p.dv01, 0) },
      { label: 'Corporate', dv01: positions.filter(p => p.assetClass === 'Corporate').reduce((s, p) => s + p.dv01, 0) },
      { label: 'Futures',   dv01: positions.filter(p => p.assetClass === 'Future').reduce((s, p) => s + p.dv01, 0) },
      { label: 'CDS',       dv01: positions.filter(p => p.assetClass === 'CDS').reduce((s, p) => s + p.dv01, 0) },
    ];

    const classColors = ['#60A5FA', '#0D9488', '#5B93D5', '#E11D63'];
    const borderColor = '#2C2F33';
    const mutedFg = '#9DA0A5';

    return {
      chart: { type: 'bar', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" } },
      credits: { enabled: false },
      title: { text: undefined },
      legend: { enabled: false },
      xAxis: {
        categories: dv01ByClass.map((d) => d.label),
        lineColor: borderColor,
        tickColor: borderColor,
        labels: { style: { color: mutedFg, fontSize: '10px' } },
        gridLineWidth: 0,
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: borderColor + '66',
        gridLineWidth: 0.5,
        labels: {
          style: { color: mutedFg, fontSize: '9px' },
          formatter(this: AxisLabelsFormatterContextObject): string {
            return typeof this.value === 'number' ? '$' + (this.value / 1000).toFixed(0) + 'K' : String(this.value);
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 33, 0.95)',
        borderColor: borderColor,
        style: { color: '#FFFFFF', fontSize: '10px' },
        formatter(this: any): string {
          return `<b>${this.x}</b><br/>DV01: $${Math.abs(this.y ?? 0).toLocaleString()}`;
        },
      },
      plotOptions: {
        bar: {
          pointPadding: 0.15,
          groupPadding: 0.1,
          borderWidth: 0,
          borderRadius: 3,
        },
        series: { animation: false },
      },
      series: [{
        type: 'bar' as const,
        name: 'DV01',
        data: dv01ByClass.map((d, i) => ({
          y: d.dv01,
          color: classColors[i] + 'B3',
        })),
      }],
    };
  })();
}
