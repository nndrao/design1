import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, RowClassParams } from 'ag-grid-community';
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise';
import { HighchartsChartComponent } from 'highcharts-angular';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MarketDataService } from '../../../services/market-data.service';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import { fmtPnL, fmtK } from '../../../shared/utils';
import type { Position, AssetClass } from '../../../models/market-data.models';

ModuleRegistry.registerModules([AllEnterpriseModule]);

/* ── Constants ────────────────────────────────────────────── */

type FilterType = 'All' | AssetClass;

const CLASS_COLOR: Record<AssetClass, string> = {
  Treasury: 'text-primary',
  Corporate: 'text-buy',
  Future: 'text-warning',
  CDS: 'text-sell',
};

const BAR_COLORS: Record<string, string> = {
  Treasury: 'var(--primary)',
  Corporate: 'var(--buy)',
  Future: 'var(--warning)',
  CDS: 'var(--sell)',
};

/* ── Helpers ──────────────────────────────────────────────── */

function fmtPosSize(pos: Position): string {
  if (pos.assetClass === 'Future') return `${pos.size} cts`;
  return '$' + pos.size + 'MM';
}

function fmtMktVal(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  return (n / 1_000).toFixed(0) + 'K';
}

@Component({
  selector: 'app-positions-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AgGridAngular, HighchartsChartComponent, SelectButtonModule],
  template: `
    <!-- KPI Row -->
    <div class="grid grid-cols-6 gap-2 mb-3">
      @for (kpi of kpiCards(); track kpi.label) {
        <div class="bg-card border border-border rounded-xl p-3 flex flex-col gap-0.5">
          <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{{ kpi.label }}</span>
          <span class="text-base font-semibold font-mono" [class]="kpi.className">{{ kpi.value }}</span>
        </div>
      }
    </div>

    <div class="grid grid-cols-12 gap-3">
      <!-- Positions Grid -->
      <div class="col-span-9 bg-card border border-border rounded-xl flex flex-col overflow-hidden" style="height: 520px">
        <div class="flex items-center justify-between px-3 py-2 border-b border-border">
          <span class="text-xs font-semibold text-foreground">Positions</span>
          <p-selectbutton
            [options]="filterOptions"
            [(ngModel)]="filter"
            [allowEmpty]="false"
            size="small"
          />
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="filteredPositions()"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [pinnedBottomRowData]="pinnedBottom()"
            [getRowId]="getRowId"
            (rowClicked)="onRowClicked($event)"
            [getRowClass]="getRowClass"
            [rowSelection]="'single'"
            [suppressCellFocus]="true"
            [animateRows]="false"
          />
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="col-span-3 flex flex-col gap-3">
        <!-- DV01 by Class Chart -->
        <div class="bg-card border border-border rounded-xl flex flex-col overflow-hidden" style="height: 200px">
          <div class="px-3 py-2 border-b border-border">
            <span class="text-xs font-semibold text-foreground">DV01 by Class</span>
          </div>
          <div class="flex-1 min-h-0 p-2">
            <highcharts-chart
              [options]="dv01ChartOptions()"
              style="width: 100%; height: 100%; display: block"
            />
          </div>
        </div>

        <!-- Detail / Attribution Panel -->
        <div class="bg-card border border-border rounded-xl flex flex-col overflow-hidden" style="height: 310px">
          <div class="px-3 py-2 border-b border-border">
            <span class="text-xs font-semibold text-foreground">
              {{ selectedPosition() ? selectedPosition()!.security : 'P&L Attribution' }}
            </span>
          </div>
          <div class="flex-1 min-h-0 overflow-auto p-3">
            @if (selectedPosition(); as pos) {
              <!-- Position Detail -->
              <div class="flex flex-col gap-3">
                <div class="rounded-lg p-3 text-center" [class]="pos.pnlToday >= 0 ? 'bg-buy/10' : 'bg-sell/10'">
                  <div class="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">P&amp;L Today</div>
                  <div class="text-xl font-bold font-mono" [class]="pos.pnlToday >= 0 ? 'text-buy' : 'text-sell'">
                    {{ fmtPnLFn(pos.pnlToday) }}
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-x-3 gap-y-2">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">Side</span>
                    <span class="text-[11px]" [class]="pos.side === 'LONG' ? 'text-buy' : 'text-sell'">{{ pos.side }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">Class</span>
                    <span class="text-[11px]" [class]="classColor[pos.assetClass]">{{ pos.assetClass }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">Size</span>
                    <span class="text-[11px] font-mono text-foreground">{{ fmtPosSizeFn(pos) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">Avg Px</span>
                    <span class="text-[11px] font-mono text-foreground">{{ pos.avgPx.toFixed(3) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">Curr Px</span>
                    <span class="text-[11px] font-mono text-foreground">{{ pos.currPx.toFixed(3) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">Yield</span>
                    <span class="text-[11px] font-mono text-foreground">{{ pos.currYld ? pos.currYld.toFixed(3) + '%' : '\u2014' }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">DV01</span>
                    <span class="text-[11px] font-mono text-foreground">\${{ fmtKFn(pos.dv01) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">CS01</span>
                    <span class="text-[11px] font-mono text-foreground">\${{ fmtKFn(pos.cs01) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">MTD</span>
                    <span class="text-[11px] font-mono" [class]="pos.pnlMtd >= 0 ? 'text-buy' : 'text-sell'">{{ fmtPnLFn(pos.pnlMtd) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] text-muted-foreground uppercase tracking-wider">YTD</span>
                    <span class="text-[11px] font-mono" [class]="pos.pnlYtd >= 0 ? 'text-buy' : 'text-sell'">{{ fmtPnLFn(pos.pnlYtd) }}</span>
                  </div>
                </div>
              </div>
            } @else {
              <!-- P&L Attribution -->
              <div class="flex flex-col gap-1.5">
                <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">P&amp;L Attribution (Today)</span>
                @for (p of sortedPositions(); track p.id) {
                  <div class="flex flex-col gap-0.5">
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="text-foreground truncate font-medium">{{ p.security }}</span>
                      <span class="font-mono" [class]="p.pnlToday >= 0 ? 'text-buy' : 'text-sell'">{{ fmtPnLFn(p.pnlToday) }}</span>
                    </div>
                    <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        [class]="p.pnlToday >= 0 ? 'bg-buy' : 'bg-sell'"
                        [style.width.%]="(Math.abs(p.pnlToday) / maxPnl()) * 100"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PositionsPanelComponent {
  private readonly mds = inject(MarketDataService);
  protected readonly theme = marketsUITheme;
  protected readonly Math = Math;
  protected readonly classColor = CLASS_COLOR;
  protected readonly fmtPnLFn = fmtPnL;
  protected readonly fmtKFn = fmtK;
  protected readonly fmtPosSizeFn = fmtPosSize;

  /* ── State ──────────────────────────────────────────────── */
  protected readonly filter = signal<FilterType>('All');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Treasury', value: 'Treasury' },
    { label: 'Corporate', value: 'Corporate' },
    { label: 'Future', value: 'Future' },
    { label: 'CDS', value: 'CDS' },
  ];

  /* ── Computed data ──────────────────────────────────────── */
  private readonly positions = computed(() => this.mds.positions);

  protected readonly filteredPositions = computed(() => {
    const f = this.filter();
    return f === 'All' ? [...this.positions()] : this.positions().filter(p => p.assetClass === f);
  });

  protected readonly totals = computed(() => {
    const all = this.positions();
    let totalPnlToday = 0, totalPnlMtd = 0, totalPnlYtd = 0, totalDV01 = 0, totalCS01 = 0, totalMktVal = 0;
    for (const p of all) {
      totalPnlToday += p.pnlToday; totalPnlMtd += p.pnlMtd; totalPnlYtd += p.pnlYtd;
      totalDV01 += p.dv01; totalCS01 += p.cs01; totalMktVal += p.mktVal;
    }
    return { totalPnlToday, totalPnlMtd, totalPnlYtd, totalDV01, totalCS01, totalMktVal };
  });

  protected readonly kpiCards = computed(() => {
    const t = this.totals();
    return [
      { label: 'P&L Today', value: fmtPnL(t.totalPnlToday), className: t.totalPnlToday >= 0 ? 'text-buy' : 'text-sell' },
      { label: 'P&L MTD', value: fmtPnL(t.totalPnlMtd), className: t.totalPnlMtd >= 0 ? 'text-buy' : 'text-sell' },
      { label: 'P&L YTD', value: fmtPnL(t.totalPnlYtd), className: t.totalPnlYtd >= 0 ? 'text-buy' : 'text-sell' },
      { label: 'Net DV01', value: '$' + fmtK(t.totalDV01), className: 'text-foreground' },
      { label: 'Net CS01', value: '$' + fmtK(t.totalCS01), className: 'text-foreground' },
      { label: 'Market Value', value: '$' + fmtMktVal(t.totalMktVal), className: 'text-foreground' },
    ];
  });

  protected readonly dv01ByClass = computed(() => {
    const map: Record<string, number> = {};
    for (const p of this.positions()) map[p.assetClass] = (map[p.assetClass] ?? 0) + p.dv01;
    return Object.entries(map).map(([name, dv01]) => ({ name, dv01 }));
  });

  protected readonly pinnedBottom = computed<Position[]>(() => {
    const t = this.totals();
    return [{
      id: 'TOTAL', security: 'TOTAL', cusip: '', assetClass: '' as AssetClass,
      side: '' as 'LONG', size: 0, avgPx: 0, currPx: 0, currYld: 0,
      dv01: t.totalDV01, cs01: t.totalCS01, pnlToday: t.totalPnlToday,
      pnlMtd: t.totalPnlMtd, pnlYtd: t.totalPnlYtd, mktVal: t.totalMktVal,
    }];
  });

  protected readonly selectedPosition = computed(() =>
    this.positions().find(p => p.id === this.selectedId()) ?? null
  );

  protected readonly sortedPositions = computed(() =>
    [...this.positions()].sort((a, b) => Math.abs(b.pnlToday) - Math.abs(a.pnlToday))
  );

  protected readonly maxPnl = computed(() =>
    Math.max(...this.sortedPositions().map(p => Math.abs(p.pnlToday)), 1)
  );

  /* ── DV01 Chart ─────────────────────────────────────────── */
  protected readonly dv01ChartOptions = computed<Highcharts.Options>(() => {
    const data = this.dv01ByClass();
    return {
      chart: { type: 'bar', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" } },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: data.map(d => d.name),
        labels: { style: { color: '#FFFFFF', fontSize: '10px' } },
        lineWidth: 0, tickLength: 0,
      },
      yAxis: { title: { text: undefined }, labels: { enabled: false }, gridLineWidth: 0, lineWidth: 0 },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#1A1D21', borderColor: '#2C2F33', borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        formatter() { return '<span style="color:#9DA0A5;font-size:10px">' + this.x + '</span><br/>DV01: $' + fmtK(Number(this.y)); },
        useHTML: true,
      },
      plotOptions: { bar: { borderRadius: 4, borderWidth: 0, pointWidth: 16, animation: false } },
      series: [{
        name: 'DV01', type: 'bar' as const,
        data: data.map(d => ({ y: d.dv01, color: BAR_COLORS[d.name] ?? '#60A5FA' })),
      }],
    };
  });

  /* ── AG Grid config ─────────────────────────────────────── */
  protected readonly defaultColDef: ColDef = { sortable: true, resizable: true, suppressHeaderMenuButton: true };

  protected readonly getRowId = (p: any) => p.data.id;

  protected readonly getRowClass = (params: RowClassParams<Position>) =>
    params.data?.id === 'TOTAL' ? 'font-semibold' : undefined;

  protected onRowClicked(e: any): void {
    if (e.data && e.data.id !== 'TOTAL') this.selectedId.set(e.data.id);
  }

  protected readonly columnDefs: ColDef<Position>[] = [
    {
      headerName: 'Security', field: 'security', width: 160, pinned: 'left', suppressMovable: true,
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        return `<div class="flex flex-col leading-tight py-1">
          <span class="text-[11px] font-medium text-foreground truncate">${p.data.security}</span>
          <span class="text-[9px] text-muted-foreground font-mono">${p.data.cusip}</span>
        </div>`;
      },
    },
    {
      headerName: 'Class', field: 'assetClass', width: 82,
      cellRenderer: (p: any) => {
        if (!p.data || !p.data.assetClass) return '';
        const cls = CLASS_COLOR[p.data.assetClass as AssetClass] || '';
        return `<span class="text-[10px] font-semibold uppercase ${cls}">${p.data.assetClass}</span>`;
      },
    },
    {
      headerName: 'Side', field: 'side', width: 78,
      cellRenderer: (p: any) => {
        if (!p.data || !p.data.side) return '';
        const isLong = p.data.side === 'LONG';
        const cls = isLong ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell';
        return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}">${p.data.side}</span>`;
      },
    },
    {
      headerName: 'Size', field: 'size', width: 78, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.data ? fmtPosSize(p.data) : '',
    },
    {
      headerName: 'Avg Px', field: 'avgPx', width: 72, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value ? (p.value as number).toFixed(3) : '',
    },
    {
      headerName: 'Curr Px', field: 'currPx', width: 72, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value ? (p.value as number).toFixed(3) : '',
    },
    {
      headerName: 'Curr Yld', field: 'currYld', width: 76, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value ? (p.value as number).toFixed(3) + '%' : '',
    },
    {
      headerName: 'DV01', field: 'dv01', width: 76, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value != null ? '$' + Math.abs(p.value as number).toLocaleString() : '',
    },
    {
      headerName: 'CS01', field: 'cs01', width: 72, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value != null ? '$' + Math.abs(p.value as number).toLocaleString() : '',
    },
    {
      headerName: 'P&L Today', field: 'pnlToday', width: 90, type: 'rightAligned',
      cellRenderer: (p: any) => {
        if (p.value == null) return '';
        const cls = p.value >= 0 ? 'text-buy' : 'text-sell';
        return `<span class="font-mono text-[11px] ${cls}">${fmtPnL(p.value)}</span>`;
      },
    },
    {
      headerName: 'P&L MTD', field: 'pnlMtd', width: 88, type: 'rightAligned',
      cellRenderer: (p: any) => {
        if (p.value == null) return '';
        const cls = p.value >= 0 ? 'text-buy' : 'text-sell';
        return `<span class="font-mono text-[11px] ${cls}">${fmtPnL(p.value)}</span>`;
      },
    },
    {
      headerName: 'P&L YTD', field: 'pnlYtd', width: 88, type: 'rightAligned',
      cellRenderer: (p: any) => {
        if (p.value == null) return '';
        const cls = p.value >= 0 ? 'text-buy' : 'text-sell';
        return `<span class="font-mono text-[11px] ${cls}">${fmtPnL(p.value)}</span>`;
      },
    },
  ];
}
