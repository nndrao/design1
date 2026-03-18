import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options, AxisLabelsFormatterContextObject } from 'highcharts';
import { MarketDataService } from '../../../services/market-data.service';
import { fmtPnL, fmtDV01, fmtBps } from '../../../shared/utils';

/* ── Tenor bucket boundaries ──────────────────────────────── */
const TENOR_BUCKETS = [
  { label: '0-1Y', min: 0, max: 1 },
  { label: '1-2Y', min: 1, max: 2 },
  { label: '2-5Y', min: 2, max: 5 },
  { label: '5-10Y', min: 5, max: 10 },
  { label: '10-20Y', min: 10, max: 20 },
  { label: '20-30Y', min: 20, max: 30 },
] as const;

/* ── Rating mapping ───────────────────────────────────────── */
const RATING_SCORES: Record<string, number> = {
  Aaa: 1, Aa1: 2, Aa2: 3, Aa3: 4,
  A1: 5, A2: 6, A3: 7,
  Baa1: 8, Baa2: 9, Baa3: 10,
  Ba1: 11, Ba2: 12, Ba3: 13,
  B1: 14, B2: 15, B3: 16,
};
const SCORE_TO_RATING = Object.fromEntries(
  Object.entries(RATING_SCORES).map(([k, v]) => [v, k])
);
function averageRating(scores: number[]): string {
  if (scores.length === 0) return '—';
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  return SCORE_TO_RATING[avg] ?? 'NR';
}

function parseTenor(tenor: string): number {
  const match = tenor.match(/(\d+)/);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  if (tenor.includes('M') || tenor.includes('m')) return n / 12;
  return n;
}

/* ── Sector colors ────────────────────────────────────────── */
const SECTOR_COLORS = [
  'var(--primary)',
  'var(--buy)',
  'var(--warning)',
  'var(--sell)',
  '#5B93D5',
  '#7ABECC',
  '#FF9800',
  '#8BA87A',
];

const SECTOR_HEX = [
  '#60A5FA',
  '#60A5FA',
  '#FF9800',
  '#FF5252',
  '#5B93D5',
  '#7ABECC',
  '#FF9800',
  '#8BA87A',
];

/* ── VaR table rows ───────────────────────────────────────── */
const VAR_TABLE = [
  { confidence: '95%', day1: '$285K', day10: '$901K' },
  { confidence: '99%', day1: '$412K', day10: '$1.30M' },
  { confidence: '99.9%', day1: '$587K', day10: '$1.86M' },
];

/* ── Stress scenarios ─────────────────────────────────────── */
const STRESS_SCENARIOS = [
  { name: '+25bp Parallel', multiplier: -1 },
  { name: '+50bp Parallel', multiplier: -2 },
  { name: '+100bp Parallel', multiplier: -4 },
  { name: '-25bp Parallel', multiplier: 1 },
  { name: 'Steepen +25bp', multiplier: -0.6 },
  { name: 'Flatten +25bp', multiplier: 0.4 },
  { name: 'Credit +50bp', multiplier: -0.27 },
  { name: 'Credit +100bp', multiplier: -0.54 },
  { name: '2008 Shock', multiplier: -8.5 },
];

@Component({
  selector: 'app-risk-panel',
  standalone: true,
  imports: [HighchartsChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="h-full flex flex-col p-3 gap-2 overflow-hidden">
      <!-- KPI Row -->
      <div class="grid grid-cols-4 gap-2 shrink-0">
        @for (kpi of kpis(); track kpi.label) {
          <div class="bg-card border border-border rounded-lg px-3 py-2 flex flex-col gap-0.5">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider">{{ kpi.label }}</span>
            <span class="text-sm font-semibold font-mono" [class]="kpi.cls">{{ kpi.value }}</span>
          </div>
        }
      </div>

      <!-- Middle row: DV01 chart | Sector donut | Credit metrics + VaR -->
      <div class="grid grid-cols-12 gap-2 flex-1 min-h-0">
        <!-- DV01 by Tenor Bucket -->
        <div class="col-span-4 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div class="px-3 pt-2 pb-1">
            <h3 class="text-xs font-semibold text-foreground">DV01 by Tenor Bucket</h3>
          </div>
          <div class="flex-1 min-h-0 px-1">
            <highcharts-chart
              [options]="dv01ChartOptions()"
              style="width:100%;height:100%;display:block;"
            />
          </div>
        </div>

        <!-- Sector Allocation Donut -->
        <div class="col-span-4 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div class="px-3 pt-2 pb-1">
            <h3 class="text-xs font-semibold text-foreground">Sector Allocation</h3>
            <p class="text-[9px] text-muted-foreground">Corp bond distribution by sector</p>
          </div>
          <div class="flex-1 min-h-0 flex flex-col">
            <div class="flex-1 min-h-0 flex items-center justify-center">
              <highcharts-chart
                [options]="sectorChartOptions()"
                style="width:100%;height:100%;display:block;"
              />
            </div>
            <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 pb-2 text-[10px]">
              @for (s of sectorData(); track s.name; let i = $index) {
                <div class="flex items-center gap-1">
                  <span class="inline-block w-2 h-2 rounded-full shrink-0" [style.background]="sectorColors[i]"></span>
                  <span class="text-muted-foreground">{{ s.name }}</span>
                  <span class="font-mono text-foreground">{{ s.value }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Credit Risk Metrics + VaR -->
        <div class="col-span-4 flex flex-col gap-2 min-h-0">
          <!-- Credit Risk Metrics -->
          <div class="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div class="px-3 pt-2 pb-1">
              <h3 class="text-xs font-semibold text-foreground">Credit Risk Metrics</h3>
            </div>
            <div class="flex-1 overflow-auto px-3 pb-2">
              <!-- Credit summary cards -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="bg-muted/50 rounded-lg px-2.5 py-1.5">
                  <span class="text-[9px] text-muted-foreground uppercase tracking-wider block">Avg Rating</span>
                  <span class="text-sm font-mono font-semibold text-foreground">{{ creditMetrics().avgRating }}</span>
                </div>
                <div class="bg-muted/50 rounded-lg px-2.5 py-1.5">
                  <span class="text-[9px] text-muted-foreground uppercase tracking-wider block">Spread Duration</span>
                  <span class="text-sm font-mono font-semibold text-foreground">{{ creditMetrics().avgSpreadDur }}</span>
                </div>
                <div class="bg-muted/50 rounded-lg px-2.5 py-1.5">
                  <span class="text-[9px] text-muted-foreground uppercase tracking-wider block">CS01</span>
                  <span class="text-sm font-mono font-semibold text-foreground">{{'$' + fmtDV01(creditMetrics().totalCS01)}}</span>
                </div>
                <div class="bg-muted/50 rounded-lg px-2.5 py-1.5">
                  <span class="text-[9px] text-muted-foreground uppercase tracking-wider block">Avg OAS</span>
                  <span class="text-sm font-mono font-semibold text-foreground">{{ fmtBps(creditMetrics().avgOAS) }}</span>
                </div>
              </div>
              <!-- Risk limits -->
              <div class="space-y-2">
                @for (l of limits(); track l.name) {
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="text-muted-foreground">{{ l.name }}</span>
                      <span class="font-mono text-foreground">{{'$' + fmtDV01(l.current) + ' / $' + fmtDV01(l.limit)}}</span>
                    </div>
                    <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        [class.bg-buy]="limitPct(l) < 70"
                        [class.bg-warning]="limitPct(l) >= 70 && limitPct(l) < 90"
                        [class.bg-sell]="limitPct(l) >= 90"
                        [style.width.%]="Math.min(limitPct(l), 100)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Value at Risk -->
          <div class="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div class="px-3 pt-2 pb-1">
              <h3 class="text-xs font-semibold text-foreground">Value at Risk</h3>
            </div>
            <div class="px-3 pb-2 flex-1 overflow-auto">
              <table class="w-full text-[10px]">
                <thead>
                  <tr class="text-muted-foreground uppercase tracking-wider">
                    <th class="text-left py-1 font-medium">Confidence</th>
                    <th class="text-right py-1 font-medium">1-Day</th>
                    <th class="text-right py-1 font-medium">10-Day</th>
                  </tr>
                </thead>
                <tbody class="font-mono">
                  @for (v of varData; track v.confidence) {
                    <tr class="border-t border-border">
                      <td class="py-1 text-foreground">{{ v.confidence }}</td>
                      <td class="py-1 text-right text-foreground">{{ v.day1 }}</td>
                      <td class="py-1 text-right text-foreground">{{ v.day10 }}</td>
                    </tr>
                  }
                </tbody>
              </table>
              <div class="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground border-t border-border pt-1.5">
                <div class="flex justify-between">
                  <span>Expected Shortfall (99%)</span>
                  <span class="font-mono text-foreground">$523K</span>
                </div>
                <div class="flex justify-between">
                  <span>Max Drawdown (30d)</span>
                  <span class="font-mono text-sell">-$187K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stress Scenarios -->
      <div class="bg-card border border-border rounded-xl overflow-hidden p-2 shrink-0">
        <div class="mb-1">
          <h3 class="text-xs font-semibold text-foreground">Stress Scenarios</h3>
        </div>
        <div class="grid grid-cols-9 gap-2">
          @for (s of stressResults(); track s.name) {
            <div class="bg-muted/50 rounded-lg px-2 py-1.5 flex flex-col items-center gap-0.5">
              <span class="text-[9px] text-muted-foreground text-center leading-tight">{{ s.name }}</span>
              <span
                class="text-[11px] font-mono font-semibold"
                [class.text-buy]="s.pnl >= 0"
                [class.text-sell]="s.pnl < 0"
              >{{ formatPnL(s.pnl) }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class RiskPanelComponent {
  private readonly mds = inject(MarketDataService);

  readonly Math = Math;
  readonly formatPnL = fmtPnL;
  readonly fmtDV01 = fmtDV01;
  readonly fmtBps = fmtBps;

  readonly varData = VAR_TABLE;
  readonly sectorColors = SECTOR_COLORS;

  /* ── DV01 by tenor bucket from corp bonds + treasuries ── */
  readonly dv01Buckets = computed(() => {
    const buckets = TENOR_BUCKETS.map((b) => ({ tenor: b.label, value: 0 }));

    for (const bond of this.mds.corpBonds()) {
      const dur = bond.duration;
      const dv01 = bond.dv01PerMM;
      const sign = bond.changeBps >= 0 ? -1 : 1;
      const exposure = dv01 * sign * 10;

      for (let bi = 0; bi < TENOR_BUCKETS.length; bi++) {
        if (dur >= TENOR_BUCKETS[bi].min && dur < TENOR_BUCKETS[bi].max) {
          buckets[bi].value += exposure;
          break;
        }
        if (bi === TENOR_BUCKETS.length - 1) {
          buckets[bi].value += exposure;
        }
      }
    }

    for (const t of this.mds.treasuries()) {
      const tenorYears = parseTenor(t.tenor);
      const dv01Approx = tenorYears * 95;
      const sign = t.chg >= 0 ? 1 : -1;
      for (let bi = 0; bi < TENOR_BUCKETS.length; bi++) {
        if (tenorYears >= TENOR_BUCKETS[bi].min && tenorYears < TENOR_BUCKETS[bi].max) {
          buckets[bi].value += dv01Approx * sign;
          break;
        }
        if (bi === TENOR_BUCKETS.length - 1) {
          buckets[bi].value += dv01Approx * sign;
        }
      }
    }

    return buckets.map((b) => ({
      ...b,
      value: Math.round(b.value),
    }));
  });

  /* ── Sector allocation from corp bonds ─────────────────── */
  readonly sectorData = computed(() => {
    const map = new Map<string, number>();
    for (const bond of this.mds.corpBonds()) {
      const sector = bond.sector || 'Other';
      map.set(sector, (map.get(sector) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value);
  });

  /* ── Credit risk metrics ───────────────────────────────── */
  readonly creditMetrics = computed(() => {
    const ratingScores: number[] = [];
    let totalSpreadDur = 0;
    let totalCS01 = 0;
    let totalOAS = 0;
    let count = 0;

    for (const bond of this.mds.corpBonds()) {
      const score = RATING_SCORES[bond.ratingMoody];
      if (score) ratingScores.push(score);

      const spreadDur = bond.duration * 0.95;
      totalSpreadDur += spreadDur;
      totalCS01 += bond.dv01PerMM * 0.85;
      totalOAS += bond.oas;
      count++;
    }

    return {
      avgRating: averageRating(ratingScores),
      avgSpreadDur: count > 0 ? (totalSpreadDur / count).toFixed(2) : '0.00',
      totalCS01: Math.round(totalCS01),
      avgOAS: count > 0 ? Math.round(totalOAS / count) : 0,
      bondCount: count,
    };
  });

  /* ── Summary KPIs ──────────────────────────────────────── */
  readonly kpis = computed(() => {
    const buckets = this.dv01Buckets();
    const netDV01 = buckets.reduce((s, b) => s + b.value, 0);
    const grossDV01 = buckets.reduce((s, b) => s + Math.abs(b.value), 0);

    let pnlToday = 0;
    for (const bond of this.mds.corpBonds()) {
      pnlToday += bond.changeBps * bond.dv01PerMM * -10;
    }
    for (const t of this.mds.treasuries()) {
      pnlToday += t.chg * parseTenor(t.tenor) * -950;
    }

    const var99 = Math.round(grossDV01 * 0.35);

    return [
      { label: 'Net DV01',        value: '$' + fmtDV01(netDV01),   cls: '' },
      { label: 'Gross DV01',      value: '$' + fmtDV01(grossDV01), cls: '' },
      { label: 'P&L Today',       value: fmtPnL(Math.round(pnlToday)), cls: pnlToday >= 0 ? 'text-buy' : 'text-sell' },
      { label: '1-Day VaR 99%',   value: '$' + fmtDV01(var99),     cls: 'text-warning' },
    ];
  });

  /* ── Risk limits ───────────────────────────────────────── */
  readonly limits = computed(() => {
    const buckets = this.dv01Buckets();
    const netDV01 = buckets.reduce((s, b) => s + b.value, 0);
    const grossDV01 = buckets.reduce((s, b) => s + Math.abs(b.value), 0);
    const cm = this.creditMetrics();
    const var99 = Math.round(grossDV01 * 0.35);

    return [
      { name: 'Net DV01',          current: Math.abs(netDV01), limit: 600_000 },
      { name: 'Gross DV01',        current: grossDV01,         limit: 1_500_000 },
      { name: 'Net CS01',          current: cm.totalCS01,      limit: 100_000 },
      { name: 'IG Credit',         current: Math.round(cm.totalCS01 * 0.82), limit: 300_000 },
      { name: 'HY Credit',         current: Math.round(cm.totalCS01 * 0.18), limit: 75_000 },
      { name: 'Max Single Tenor',  current: Math.max(...buckets.map(b => Math.abs(b.value))), limit: 400_000 },
      { name: 'VaR 99%',           current: var99,             limit: 500_000 },
    ];
  });

  /* ── Stress scenarios ──────────────────────────────────── */
  readonly stressResults = computed(() => {
    const buckets = this.dv01Buckets();
    const netDV01 = buckets.reduce((s, b) => s + b.value, 0);
    return STRESS_SCENARIOS.map((s) => ({
      name: s.name,
      pnl: Math.round(Math.abs(netDV01) * 0.25 * s.multiplier),
    }));
  });

  limitPct(l: { current: number; limit: number }): number {
    return l.limit > 0 ? (l.current / l.limit) * 100 : 0;
  }

  /* ── Highcharts DV01 Bar Chart ──────────────────────────── */
  readonly dv01ChartOptions = computed<Options>(() => {
    const buckets = this.dv01Buckets();
    return {
      chart: { type: 'column', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: buckets.map((b) => b.tenor),
        labels: { style: { color: '#9DA0A5', fontSize: '9px' } },
        lineColor: '#2C2F33',
        tickLength: 0,
      },
      yAxis: {
        title: { text: undefined },
        labels: {
          style: { color: '#9DA0A5', fontSize: '9px' },
          formatter(this: AxisLabelsFormatterContextObject): string {
            const v = Number(this.value);
            if (Math.abs(v) >= 1000) return (v / 1000).toFixed(0) + 'K';
            return String(v);
          },
        },
        gridLineColor: '#2C2F33',
        gridLineDashStyle: 'ShortDash' as any,
        plotLines: [{ value: 0, color: '#9DA0A5', width: 1, dashStyle: 'ShortDash' as any, zIndex: 3 }],
        lineWidth: 0,
      },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: '#2C2F33',
        borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        formatter(this: any): string {
          return `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>DV01: $${Number(this.y).toLocaleString()}`;
        },
        useHTML: true,
      },
      plotOptions: {
        column: { borderRadius: 3, borderWidth: 0, animation: false },
      },
      series: [{
        name: 'DV01',
        type: 'column' as const,
        data: buckets.map((b) => ({
          y: b.value,
          color: b.value >= 0 ? '#14B8A6' : '#FF5252',
        })),
      }],
    };
  });

  /* ── Highcharts Sector Donut Chart ──────────────────────── */
  readonly sectorChartOptions = computed<Options>(() => {
    const data = this.sectorData();
    return {
      chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: '#2C2F33',
        borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        pointFormat: '{point.name}: <b>{point.y} bonds</b>',
        useHTML: true,
      },
      plotOptions: {
        pie: {
          innerSize: '55%',
          borderWidth: 0,
          animation: false,
          dataLabels: { enabled: false },
          slicedOffset: 0,
        },
      },
      series: [{
        name: 'Sector',
        type: 'pie' as const,
        data: data.map((s, i) => ({
          name: s.name,
          y: s.value,
          color: SECTOR_HEX[i % SECTOR_HEX.length],
        })),
      }],
    };
  });
}
