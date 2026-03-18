import {
  Component,
  inject,
  computed,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options, AxisLabelsFormatterContextObject } from 'highcharts';
import { MarketDataService } from '../../../services/market-data.service';
import { fmtYield, fmtBps, fmtPnL, fmtDV01 } from '../../../shared/utils';

interface KpiCard {
  label: string;
  value: string;
  color: 'pnl' | 'neutral';
  raw: number;
}

@Component({
  selector: 'app-dashboard-panel',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  template: `
    <!-- ── Dashboard Grid ────────────────────────────────── -->
    <div class="grid grid-cols-12 gap-3 p-4 h-full overflow-y-auto">

      <!-- ── KPI Row ─────────────────────────────────────── -->
      <div class="col-span-12 grid grid-cols-5 gap-3">
        @for (kpi of kpis; track kpi.label) {
          <div class="bg-card rounded-lg border border-border px-4 py-3 flex flex-col gap-0.5">
            <span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {{ kpi.label }}
            </span>
            <span
              class="text-lg font-semibold font-mono tabular-nums"
              [class.text-buy]="kpi.color === 'pnl' && kpi.raw >= 0"
              [class.text-sell]="kpi.color === 'pnl' && kpi.raw < 0"
              [class.text-foreground]="kpi.color === 'neutral'"
            >
              {{ kpi.value }}
            </span>
          </div>
        }
      </div>

      <!-- ── Yield Curve Chart ───────────────────────────── -->
      <div class="col-span-5 bg-card rounded-lg border border-border p-4 flex flex-col">
        <h3 class="text-xs font-semibold text-foreground mb-1">UST Yield Curve</h3>
        <div class="flex items-center gap-3 mb-2">
          <span class="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span class="inline-block w-3 h-0.5 rounded-full bg-primary"></span> Today
          </span>
          <span class="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span class="inline-block w-3 h-0.5 rounded-full bg-muted-foreground opacity-50 border-dashed"></span> Prev Close
          </span>
        </div>
        <div class="flex-1 min-h-0 relative">
          <highcharts-chart
            [options]="yieldCurveOptions()"
            style="width:100%;height:100%;display:block;"
          />
        </div>
      </div>

      <!-- ── Key Benchmarks ──────────────────────────────── -->
      <div class="col-span-3 bg-card rounded-lg border border-border p-4 flex flex-col">
        <h3 class="text-xs font-semibold text-foreground mb-3">Key Benchmarks</h3>
        <div class="flex flex-col gap-2 flex-1">
          @for (bm of mds.benchmarks(); track bm.label) {
            <div class="flex items-center justify-between py-1 border-b border-border last:border-b-0">
              <span class="text-[11px] text-muted-foreground font-medium">{{ bm.label }}</span>
              <div class="flex items-center gap-2">
                <span
                  class="text-[11px] font-mono font-semibold text-foreground tabular-nums"
                  [ngClass]="benchmarkFlash()[bm.label] || ''"
                >
                  {{ formatBenchmarkValue(bm) }}
                </span>
                <span
                  class="text-[10px] font-mono tabular-nums"
                  [class.text-buy]="bm.change < 0"
                  [class.text-sell]="bm.change > 0"
                  [class.text-muted-foreground]="bm.change === 0"
                >
                  {{ formatBps(bm.change) }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ── Position Summary ────────────────────────────── -->
      <div class="col-span-4 bg-card rounded-lg border border-border p-4 flex flex-col">
        <h3 class="text-xs font-semibold text-foreground mb-3">Position Summary</h3>
        <div class="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          @for (pos of mds.dashboardPositions(); track pos.security) {
            <div class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors">
              <span
                class="text-xs"
                [class.text-buy]="pos.side === 'LONG'"
                [class.text-sell]="pos.side === 'SHORT'"
              >
                {{ pos.side === 'LONG' ? '\u25B2' : '\u25BC' }}
              </span>
              <span class="text-[11px] font-medium text-foreground flex-1 truncate">
                {{ pos.security }}
              </span>
              <span
                class="text-[11px] font-mono tabular-nums min-w-[68px] text-right"
                [class.text-buy]="pos.pnlToday >= 0"
                [class.text-sell]="pos.pnlToday < 0"
              >
                {{ formatPnL(pos.pnlToday) }}
              </span>
              <span class="text-[10px] font-mono tabular-nums text-muted-foreground min-w-[58px] text-right">
                {{ formatDV01(pos.dv01) }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- ── Recent Orders ───────────────────────────────── -->
      <div class="col-span-12 bg-card rounded-lg border border-border p-4 flex flex-col">
        <h3 class="text-xs font-semibold text-foreground mb-3">Recent Orders</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-[11px]">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                <th class="text-left py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Security</th>
                <th class="text-left py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Side</th>
                <th class="text-right py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Size (MM)</th>
                <th class="text-right py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Yield</th>
                <th class="text-right py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                <th class="text-center py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (order of mds.recentOrders(); track order.orderId) {
                <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td class="py-2 px-2 font-mono tabular-nums text-muted-foreground">{{ order.time }}</td>
                  <td class="py-2 px-2 font-medium text-foreground">{{ order.security }}</td>
                  <td class="py-2 px-2">
                    <span
                      class="font-semibold"
                      [class.text-buy]="order.side === 'BUY'"
                      [class.text-sell]="order.side === 'SELL'"
                    >
                      {{ order.side }}
                    </span>
                  </td>
                  <td class="py-2 px-2 text-right font-mono tabular-nums text-foreground">{{ order.sizeMM }}</td>
                  <td class="py-2 px-2 text-right font-mono tabular-nums text-foreground">
                    {{ order.status === 'Filled' || order.status === 'Partial'
                        ? formatYield(order.avgYield)
                        : formatYield(order.lmtYield) }}
                  </td>
                  <td class="py-2 px-2 text-right font-mono tabular-nums text-foreground">
                    {{ order.status === 'Filled' || order.status === 'Partial'
                        ? order.avgPrice.toFixed(3)
                        : order.lmtPrice.toFixed(3) }}
                  </td>
                  <td class="py-2 px-2 text-center">
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                      [ngClass]="statusClass(order.status)"
                    >
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
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
export class DashboardPanelComponent {
  protected readonly mds = inject(MarketDataService);

  /* ── Flash map for benchmark value changes ─────────────── */
  readonly benchmarkFlash = signal<Record<string, string>>({});
  private prevBenchmarkMids: Record<string, number> = {};
  private benchmarkFlashTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  constructor() {
    effect(() => {
      const bms = this.mds.benchmarks();
      const newFlash: Record<string, string> = {};
      for (const bm of bms) {
        const prev = this.prevBenchmarkMids[bm.label];
        if (prev != null && prev !== bm.value) {
          newFlash[bm.label] = bm.value > prev
            ? 'flash-positive tick-update'
            : 'flash-negative tick-update';
          if (this.benchmarkFlashTimers[bm.label]) clearTimeout(this.benchmarkFlashTimers[bm.label]);
          this.benchmarkFlashTimers[bm.label] = setTimeout(() => {
            this.benchmarkFlash.update((m) => {
              const copy = { ...m };
              delete copy[bm.label];
              return copy;
            });
          }, 600);
        }
        this.prevBenchmarkMids[bm.label] = bm.value;
      }
      if (Object.keys(newFlash).length > 0) {
        this.benchmarkFlash.update((m) => ({ ...m, ...newFlash }));
      }
    });
  }

  /* ── KPI Data ──────────────────────────────────────────── */
  readonly kpis: KpiCard[] = [
    { label: 'P&L Today', value: fmtPnL(93170), color: 'pnl', raw: 93170 },
    { label: 'P&L MTD', value: fmtPnL(243135), color: 'pnl', raw: 243135 },
    { label: 'P&L YTD', value: fmtPnL(590320), color: 'pnl', raw: 590320 },
    { label: 'Net DV01', value: fmtDV01(420945), color: 'neutral', raw: 420945 },
    { label: 'Net CS01', value: fmtDV01(57182), color: 'neutral', raw: 57182 },
  ];

  /* ── Format helpers ────────────────────────────────────── */
  formatYield = fmtYield;
  formatBps = fmtBps;
  formatPnL = fmtPnL;
  formatDV01 = fmtDV01;

  formatBenchmarkValue(bm: { value: number; unit: string }): string {
    if (bm.unit === 'yield') return fmtYield(bm.value);
    return bm.value.toFixed(1);
  }

  statusClass(status: string): Record<string, boolean> {
    return {
      'bg-buy/15 text-buy': status === 'Filled',
      'bg-primary/15 text-primary': status === 'Working',
      'bg-warning/15 text-warning': status === 'Partial',
      'bg-muted text-muted-foreground': status === 'Cancelled',
    };
  }

  /* ── Highcharts yield curve options (reactive) ──────────── */
  readonly yieldCurveOptions = computed((): Options => {
    const data = this.mds.yieldCurve();
    const categories = data.map((p) => p.tenor);
    const todayValues = data.map((p) => p.yield);
    const prevValues = data.map((p) => p.prevClose);

    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--primary').trim() || '#60A5FA';
    const mutedFg = style.getPropertyValue('--muted-foreground').trim() || '#9DA0A5';
    const borderColor = style.getPropertyValue('--border').trim() || '#2C2F33';

    return {
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" } },
      credits: { enabled: false },
      title: { text: undefined },
      legend: { enabled: false },
      xAxis: {
        categories,
        lineColor: borderColor,
        tickColor: borderColor,
        labels: { style: { color: mutedFg, fontSize: '10px' } },
        gridLineColor: borderColor,
        gridLineWidth: 0.5,
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: borderColor,
        gridLineWidth: 0.5,
        labels: {
          style: { color: mutedFg, fontSize: '10px' },
          formatter(this: AxisLabelsFormatterContextObject): string {
            return (typeof this.value === 'number' ? this.value.toFixed(1) + '%' : String(this.value));
          },
        },
      },
      tooltip: {
        shared: true,
        backgroundColor: 'rgba(26, 29, 33, 0.95)',
        borderColor: borderColor,
        style: { color: '#FFFFFF', fontSize: '11px' },
        formatter(): string {
          const self = this as any;
          let s = `<b>${self.x}</b><br/>`;
          (self.points ?? []).forEach((p: any) => {
            s += `<span style="color:${p.color}">\u25CF</span> ${p.series.name}: ${fmtYield(p.y ?? 0)}<br/>`;
          });
          return s;
        },
      },
      plotOptions: {
        area: {
          marker: { radius: 3, lineWidth: 0 },
        },
        series: {
          animation: false,
        },
      },
      series: [
        {
          type: 'area',
          name: 'Today',
          data: todayValues,
          color: primaryColor,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(96, 165, 250, 0.25)'],
              [1, 'rgba(96, 165, 250, 0.02)'],
            ],
          },
          lineWidth: 2,
          marker: { fillColor: primaryColor, lineColor: primaryColor },
        },
        {
          type: 'line',
          name: 'Prev Close',
          data: prevValues,
          color: mutedFg,
          dashStyle: 'ShortDash',
          lineWidth: 1.5,
          marker: { enabled: false },
        },
      ],
    };
  });
}
