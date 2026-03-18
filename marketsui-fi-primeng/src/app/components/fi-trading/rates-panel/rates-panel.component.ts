import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AgGridAngular } from 'ag-grid-angular';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MarketDataService } from '../../../services/market-data.service';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import type { Treasury, YieldCurvePoint, KeyRateDuration } from '../../../models/market-data.models';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const krdData: KeyRateDuration[] = [
  { tenor: '2Y', value: 0.04 },
  { tenor: '3Y', value: 0.12 },
  { tenor: '5Y', value: 0.38 },
  { tenor: '7Y', value: 0.55 },
  { tenor: '10Y', value: -0.72 },
  { tenor: '20Y', value: -0.18 },
  { tenor: '30Y', value: -0.45 },
];

@Component({
  selector: 'app-rates-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, AgGridAngular, HighchartsChartComponent],
  template: `
    <div class="h-full grid grid-cols-12 gap-3 p-4">
      <!-- Treasury Grid (left 9 cols) -->
      <div class="col-span-9 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span class="text-xs font-semibold">Treasury Rates</span>
          <span class="text-[10px] text-muted-foreground">{{ mds.treasuries().length }} securities</span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            style="width: 100%; height: 100%;"
            [theme]="agTheme"
            [rowData]="mds.treasuries()"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [getRowId]="getRowId"
            [animateRows]="false"
            [suppressCellFocus]="true"
            (rowClicked)="onRowClicked($event)"
          />
        </div>
      </div>

      <!-- Right sidebar (3 cols) -->
      <div class="col-span-3 flex flex-col gap-3">
        <!-- Yield Curve Chart -->
        <div class="bg-card rounded-xl border border-border overflow-hidden flex flex-col" style="height: 200px;">
          <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
            <span class="text-xs font-semibold">Yield Curve</span>
            <div class="flex items-center gap-3 ml-auto">
              <div class="flex items-center gap-1">
                <span class="w-3 h-[2px] bg-primary rounded"></span>
                <span class="text-[9px] text-muted-foreground">Today</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-3 h-[2px] bg-muted-foreground rounded opacity-60"></span>
                <span class="text-[9px] text-muted-foreground">Prior</span>
              </div>
            </div>
          </div>
          <div class="flex-1 min-h-0 p-1">
            <highcharts-chart
              [options]="yieldCurveOptions()"
              style="width: 100%; height: 100%; display: block;"
            />
          </div>
        </div>

        <!-- Curve Spreads -->
        <div class="bg-card rounded-xl border border-border overflow-hidden flex flex-col" style="height: 160px;">
          <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
            <span class="text-xs font-semibold">Curve Spreads</span>
          </div>
          <div class="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 p-2">
            @for (s of curveSpreads(); track s.label) {
              <div class="flex flex-col items-center justify-center rounded-lg bg-secondary px-2 py-1.5" style="opacity: 0.5;">
                <span class="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{{ s.label }}</span>
                <span
                  class="font-mono text-sm font-semibold"
                  [class.text-buy]="s.value > 0"
                  [class.text-sell]="s.value < 0"
                >
                  {{ s.value >= 0 ? '+' : '' }}{{ s.value.toFixed(1) }}
                </span>
                <span class="text-[8px] text-muted-foreground">bps</span>
              </div>
            }
          </div>
        </div>

        <!-- Detail / KRD Panel -->
        <div class="bg-card rounded-xl border border-border overflow-hidden flex flex-col flex-1">
          <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
            <span class="text-xs font-semibold">
              {{ selectedTreasury() ? 'Security Detail' : 'Key Rate Duration' }}
            </span>
            @if (selectedTreasury()) {
              <p-button
                label="Clear"
                [text]="true"
                size="small"
                (onClick)="selectedTenor.set(null)"
                styleClass="ml-auto text-xs"
              />
            }
          </div>
          <div class="flex-1 min-h-0 overflow-auto">
            @if (selectedTreasury(); as t) {
              <div class="space-y-1 p-3">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold">{{ t.tenor }}</span>
                  <span class="text-xs text-muted-foreground">{{ t.security }}</span>
                </div>
                @for (r of getDetailRows(t); track r.label) {
                  <div class="flex justify-between text-[11px] py-0.5">
                    <span class="text-muted-foreground">{{ r.label }}</span>
                    <span class="font-mono font-medium">{{ r.value }}</span>
                  </div>
                }
              </div>
            } @else {
              <!-- KRD Bar Chart -->
              <div class="h-full p-2 flex flex-col">
                <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1 mb-1">Key Rate Duration</span>
                <div class="flex-1">
                  <highcharts-chart
                    [options]="krdChartOptions"
                    style="width: 100%; height: 100%; display: block;"
                  />
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RatesPanelComponent {
  readonly mds = inject(MarketDataService);
  readonly agTheme = marketsUITheme;

  readonly selectedTenor = signal<string | null>(null);

  readonly selectedTreasury = computed(() => {
    const tenor = this.selectedTenor();
    if (!tenor) return null;
    return this.mds.treasuries().find(t => t.tenor === tenor) ?? null;
  });

  readonly curveSpreads = this.mds.curveSpreads;

  readonly columnDefs: ColDef<Treasury>[] = [
    { field: 'tenor', headerName: 'Tenor', width: 60, cellClass: 'font-semibold', suppressMovable: true },
    { field: 'security', headerName: 'Security', flex: 1, minWidth: 100 },
    { field: 'coupon', headerName: 'Cpn', width: 72, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(3) + '%' : '' },
    { field: 'maturity', headerName: 'Maturity', width: 88 },
    { field: 'bidYield', headerName: 'Bid Yld', width: 80, type: 'rightAligned', cellClass: 'font-mono font-semibold text-buy', valueFormatter: p => p.value != null ? p.value.toFixed(3) : '' },
    { field: 'askYield', headerName: 'Ask Yld', width: 78, type: 'rightAligned', cellClass: 'font-mono text-sell', valueFormatter: p => p.value != null ? p.value.toFixed(3) : '' },
    { field: 'bidPrice', headerName: 'Bid Px', width: 76, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(3) : '' },
    { field: 'askPrice', headerName: 'Ask Px', width: 76, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(3) : '' },
    {
      field: 'changeBps', headerName: 'Chg bps', width: 82, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(1) : '',
      cellStyle: p => {
        if (p.value == null) return undefined;
        if (p.value > 0) return { color: 'var(--sell)' };
        if (p.value < 0) return { color: 'var(--buy)' };
        return undefined;
      },
    },
    { field: 'modDuration', headerName: 'Mod Dur', width: 76, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(2) : '' },
    { field: 'dv01PerMM', headerName: 'DV01/MM', width: 84, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? '$' + Math.round(p.value).toLocaleString() : '' },
  ];

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
  };

  readonly getRowId = (params: { data: Treasury }) => params.data.tenor;

  readonly yieldCurveOptions = computed<Highcharts.Options>(() => {
    const data = this.mds.yieldCurve();
    return {
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: 140 },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: data.map(d => d.tenor),
        labels: { style: { color: '#9DA0A5', fontSize: '9px' } },
        lineColor: '#2C2F33',
        tickLength: 0,
      },
      yAxis: {
        title: { text: undefined },
        labels: { format: '{value:.1f}%', style: { color: '#9DA0A5', fontSize: '9px' } },
        gridLineColor: 'rgba(44,47,51,0.5)',
        gridLineDashStyle: 'ShortDash',
        lineWidth: 0,
      },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: '#2C2F33',
        borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        series: { animation: false, marker: { enabled: false } },
      },
      series: [
        {
          name: 'priorYield',
          type: 'spline',
          data: data.map(d => d.priorYield),
          color: '#9DA0A5',
          lineWidth: 1.5,
          dashStyle: 'ShortDash',
        } as any,
        {
          name: 'yield',
          type: 'areaspline',
          data: data.map(d => d.yield),
          color: '#60A5FA',
          lineWidth: 2,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'rgba(96, 165, 250, 0.3)'], [1, 'rgba(96, 165, 250, 0)']],
          },
        } as any,
      ],
    };
  });

  readonly krdChartOptions: Highcharts.Options = {
    chart: { type: 'column', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: 160 },
    credits: { enabled: false },
    title: { text: undefined },
    xAxis: {
      categories: krdData.map(d => d.tenor),
      labels: { style: { color: '#9DA0A5', fontSize: '9px' } },
      lineColor: '#2C2F33',
      tickLength: 0,
    },
    yAxis: {
      title: { text: undefined },
      labels: { style: { color: '#9DA0A5', fontSize: '9px' } },
      gridLineColor: 'rgba(44,47,51,0.5)',
      gridLineDashStyle: 'ShortDash',
      plotLines: [{ value: 0, color: '#2C2F33', width: 1, zIndex: 3 }],
      lineWidth: 0,
    },
    legend: { enabled: false },
    tooltip: {
      backgroundColor: '#1A1D21',
      borderColor: '#2C2F33',
      borderRadius: 8,
      style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
      useHTML: true,
    },
    plotOptions: {
      column: { borderRadius: 3, borderWidth: 0, animation: false },
    },
    series: [{
      name: 'KRD',
      type: 'column',
      data: krdData.map(d => ({
        y: d.value,
        color: d.value >= 0 ? '#0D9488' : '#E11D63',
      })),
    }],
  };

  onRowClicked(event: RowClickedEvent<Treasury>): void {
    if (event.data) {
      const tenor = event.data.tenor;
      this.selectedTenor.update(prev => prev === tenor ? null : tenor);
    }
  }

  getDetailRows(t: Treasury): { label: string; value: string }[] {
    return [
      { label: 'CUSIP', value: t.cusip },
      { label: 'Coupon', value: t.coupon.toFixed(3) + '%' },
      { label: 'Maturity', value: t.maturity },
      { label: 'Mid Yield', value: ((t.bidYield + t.askYield) / 2).toFixed(3) + '%' },
      { label: 'Bid / Ask', value: t.bidYield.toFixed(3) + ' / ' + t.askYield.toFixed(3) },
      { label: 'Mod Dur', value: t.modDuration.toFixed(2) },
      { label: 'DV01/MM', value: '$' + Math.round(t.dv01PerMM).toLocaleString() },
      { label: 'Settle', value: 'T+1' },
    ];
  }
}
