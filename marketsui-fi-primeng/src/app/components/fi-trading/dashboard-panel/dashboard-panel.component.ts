import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MarketDataService } from '../../../services/market-data.service';
import { fmtYield, fmtBps, fmtPnL, fmtDV01 } from '../../../shared/utils';

interface KpiItem {
  label: string;
  value: number;
  subtitle: string;
  format: 'pnl' | 'dv01';
}

interface DashboardOrder {
  time: string;
  security: string;
  side: 'Buy' | 'Sell';
  size: string;
  yieldPrice: string;
  status: 'Filled' | 'Working' | 'Partial' | 'Cancelled';
}

interface DashboardPosition {
  security: string;
  direction: 'Long' | 'Short';
  notional: number;
  pnl: number;
  dv01: number;
}

const KPI_DATA: KpiItem[] = [
  { label: 'P&L Today', value: 93_170, subtitle: 'Realized + Unrealized', format: 'pnl' },
  { label: 'P&L MTD', value: 243_135, subtitle: 'Month to date', format: 'pnl' },
  { label: 'P&L YTD', value: 590_320, subtitle: 'Year to date', format: 'pnl' },
  { label: 'Net DV01', value: 420_945, subtitle: 'Rate sensitivity', format: 'dv01' },
  { label: 'Net CS01', value: 57_182, subtitle: 'Credit sensitivity', format: 'dv01' },
];

const DASHBOARD_ORDERS: DashboardOrder[] = [
  { time: '08:32:15', security: 'UST 4.250 02/36', side: 'Buy', size: '25MM', yieldPrice: '4.392% / 98.841', status: 'Filled' },
  { time: '08:45:02', security: 'UST 4.500 03/28', side: 'Buy', size: '50MM', yieldPrice: '4.725% / 99.569', status: 'Filled' },
  { time: '09:15:30', security: 'ZNM6 10Y Fut', side: 'Sell', size: '100MM', yieldPrice: '110.469', status: 'Filled' },
  { time: '09:42:18', security: 'JPM 5.250 01/31', side: 'Buy', size: '10MM', yieldPrice: '5.130% / 100.531', status: 'Filled' },
  { time: '10:05:44', security: 'UST 4.625 02/56', side: 'Sell', size: '25MM', yieldPrice: '4.598% / 100.438', status: 'Filled' },
  { time: '10:30:12', security: 'F 6.100 08/32', side: 'Buy', size: '5MM', yieldPrice: '6.575% / 97.406', status: 'Filled' },
];

const DASHBOARD_POSITIONS: DashboardPosition[] = [
  { security: 'UST 4.500 03/28', direction: 'Long', notional: 50_000_000, pnl: 12800, dv01: 9600 },
  { security: 'UST 4.250 02/36', direction: 'Long', notional: 100_000_000, pnl: 34000, dv01: 82500 },
  { security: 'UST 4.625 02/56', direction: 'Short', notional: 25_000_000, pnl: 15625, dv01: -42000 },
  { security: 'JPM 5.250 01/31', direction: 'Long', notional: 10_000_000, pnl: -2500, dv01: 4200 },
  { security: 'F 6.100 08/32', direction: 'Long', notional: 5_000_000, pnl: -6250, dv01: 2550 },
  { security: 'ZNM6 10Y Fut', direction: 'Short', notional: 200_000_000, pnl: -39000, dv01: -131000 },
  { security: 'ZTM6 2Y Fut', direction: 'Long', notional: 150_000_000, pnl: 21750, dv01: 56700 },
  { security: 'CDX NA IG S43', direction: 'Short', notional: 50_000_000, pnl: 12125, dv01: 0 },
];

@Component({
  selector: 'app-dashboard-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, TagModule, HighchartsChartComponent],
  template: `
    <div class="h-full overflow-auto p-4 space-y-4">
      <!-- KPI Cards Row -->
      <div class="grid grid-cols-5 gap-3">
        @for (kpi of kpiData; track kpi.label) {
          <div class="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {{ kpi.label }}
            </span>
            <span
              class="text-xl font-mono font-semibold mt-1"
              [class.text-buy]="kpi.format === 'pnl' && kpi.value >= 0"
              [class.text-sell]="kpi.format === 'pnl' && kpi.value < 0"
              [class.text-foreground]="kpi.format !== 'pnl'"
            >
              {{ formatKpi(kpi.value, kpi.format) }}
            </span>
            <span class="text-[10px] text-muted-foreground mt-0.5">{{ kpi.subtitle }}</span>
          </div>
        }
      </div>

      <!-- Second Row: Yield Curve + Benchmarks + Positions -->
      <div class="grid grid-cols-12 gap-3">
        <!-- Yield Curve Chart -->
        <div class="col-span-5 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div class="px-4 pt-3 pb-2">
            <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Yield Curve</h3>
          </div>
          <div class="flex-1 min-h-0 px-4 pb-3" style="height: 280px;">
            <highcharts-chart
              [options]="yieldCurveOptions()"
              style="width: 100%; height: 100%; display: block;"
            />
          </div>
        </div>

        <!-- Key Benchmarks -->
        <div class="col-span-3 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div class="px-4 pt-3 pb-2">
            <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key Benchmarks</h3>
          </div>
          <div class="flex-1 min-h-0 overflow-auto px-4 pb-3">
            @for (b of benchmarks(); track b.label) {
              <div class="flex items-center justify-between py-2 border-b border-border last:border-b-0" style="border-opacity: 0.5;">
                <span class="text-xs text-muted-foreground">{{ b.label }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono text-foreground">
                    {{ formatBenchmarkValue(b) }}
                  </span>
                  @if (b.change !== 0 && b.unit !== 'slope') {
                    <span class="text-[10px] font-mono" [class.text-sell]="b.change >= 0" [class.text-buy]="b.change < 0">
                      {{ fmtBps(b.change) }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Position Summary -->
        <div class="col-span-4 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div class="px-4 pt-3 pb-2">
            <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Position Summary</h3>
          </div>
          <div class="flex-1 min-h-0 overflow-auto px-4 pb-3">
            @for (pos of positions; track pos.security) {
              <div class="flex items-center justify-between py-1.5 border-b border-border last:border-b-0" style="border-opacity: 0.5;">
                <div class="flex items-center gap-2 min-w-0">
                  <span
                    class="text-[10px] font-mono w-4 text-center"
                    [class.text-buy]="pos.direction === 'Long'"
                    [class.text-sell]="pos.direction === 'Short'"
                  >
                    {{ pos.direction === 'Long' ? '\u2191' : '\u2193' }}
                  </span>
                  <span class="text-xs text-foreground truncate">{{ pos.security }}</span>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span class="text-xs font-mono" [class.text-buy]="pos.pnl >= 0" [class.text-sell]="pos.pnl < 0">
                    {{ fmtPnL(pos.pnl) }}
                  </span>
                  <span class="text-[10px] font-mono text-muted-foreground">
                    {{ fmtDV01(pos.dv01) }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-card border border-border rounded-xl overflow-hidden">
        <div class="px-4 pt-3 pb-2">
          <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Orders</h3>
        </div>
        <div class="px-4 pb-3">
          <p-table [value]="orders" [tableStyle]="{ 'min-width': '100%' }" styleClass="p-datatable-sm">
            <ng-template #header>
              <tr>
                <th class="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                <th class="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Security</th>
                <th class="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Side</th>
                <th class="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Size</th>
                <th class="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Yield / Price</th>
                <th class="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </ng-template>
            <ng-template #body let-order>
              <tr class="hover:bg-secondary transition-colors" style="opacity: 0.4;">
                <td class="font-mono text-muted-foreground text-xs">{{ order.time }}</td>
                <td class="text-foreground text-xs">{{ order.security }}</td>
                <td class="text-xs">
                  <span [class.text-buy]="order.side === 'Buy'" [class.text-sell]="order.side === 'Sell'">
                    {{ order.side }}
                  </span>
                </td>
                <td class="text-right font-mono text-foreground text-xs">{{ order.size }}</td>
                <td class="text-right font-mono text-foreground text-xs">{{ order.yieldPrice }}</td>
                <td class="text-right text-xs">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                    [ngClass]="getStatusClass(order.status)"
                  >
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPanelComponent {
  private mds = inject(MarketDataService);

  readonly kpiData = KPI_DATA;
  readonly orders = DASHBOARD_ORDERS;
  readonly positions = DASHBOARD_POSITIONS;

  readonly fmtPnL = fmtPnL;
  readonly fmtDV01 = fmtDV01;
  readonly fmtBps = fmtBps;

  readonly benchmarks = this.mds.benchmarks;

  readonly yieldCurveOptions = computed<Highcharts.Options>(() => {
    const yieldCurve = this.mds.yieldCurve();
    return {
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: 260 },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: yieldCurve.map(pt => pt.tenor),
        labels: { style: { color: '#9DA0A5', fontSize: '10px' } },
        lineColor: '#2C2F33',
        tickLength: 0,
      },
      yAxis: {
        title: { text: undefined },
        labels: { format: '{value:.1f}%', style: { color: '#9DA0A5', fontSize: '10px' } },
        gridLineColor: '#2C2F33',
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
          name: 'today',
          type: 'areaspline',
          data: yieldCurve.map(pt => pt.yield),
          color: '#60A5FA',
          lineWidth: 2,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'rgba(96, 165, 250, 0.3)'], [1, 'rgba(96, 165, 250, 0)']],
          },
        } as any,
        {
          name: 'prevClose',
          type: 'spline',
          data: yieldCurve.map(pt => pt.prevClose),
          color: '#9DA0A5',
          lineWidth: 1.5,
          dashStyle: 'ShortDash',
        } as any,
      ],
    };
  });

  formatKpi(value: number, format: string): string {
    if (format === 'pnl') return fmtPnL(value);
    return fmtDV01(value);
  }

  formatBenchmarkValue(b: { label: string; value: number; unit: string }): string {
    if (b.unit === 'yield') return fmtYield(b.value);
    if (b.label === '2s10s Slope') return b.value.toFixed(1) + ' bps';
    return b.value.toFixed(1);
  }

  getStatusClass(status: string): Record<string, boolean> {
    return {
      'bg-buy': status === 'Filled',
      'text-buy-foreground': status === 'Filled',
      'bg-primary': status === 'Working',
      'text-white': status === 'Working',
      'bg-warning': status === 'Partial',
      'text-warning-foreground': status === 'Partial',
      'bg-muted': status === 'Cancelled',
      'text-muted-foreground': status === 'Cancelled',
    };
  }
}
