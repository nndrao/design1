import { useMemo } from 'react'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import type { LayoutItem } from 'react-grid-layout'
import { useMarketData } from './MarketDataContext'
import { PanelGrid, DragHandle } from './PanelGrid'
import { cn, fmtDV01, fmtPnL, fmtBps } from '@/lib/utils'

/* ── Tenor bucket boundaries (years) ────────────────────── */
const TENOR_BUCKETS = [
  { label: '0-1Y', min: 0, max: 1 },
  { label: '1-2Y', min: 1, max: 2 },
  { label: '2-5Y', min: 2, max: 5 },
  { label: '5-10Y', min: 5, max: 10 },
  { label: '10-20Y', min: 10, max: 20 },
  { label: '20-30Y', min: 20, max: 30 },
] as const

/* ── Rating numeric mapping for averaging ───────────────── */
const RATING_SCORES: Record<string, number> = {
  Aaa: 1, Aa1: 2, Aa2: 3, Aa3: 4,
  A1: 5, A2: 6, A3: 7,
  Baa1: 8, Baa2: 9, Baa3: 10,
  Ba1: 11, Ba2: 12, Ba3: 13,
  B1: 14, B2: 15, B3: 16,
}

const SCORE_TO_RATING = Object.fromEntries(
  Object.entries(RATING_SCORES).map(([k, v]) => [v, k])
)

function averageRating(scores: number[]): string {
  if (scores.length === 0) return '—'
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return SCORE_TO_RATING[avg] ?? 'NR'
}

/* ── Sector colors for pie chart ────────────────────────── */
const SECTOR_COLORS = [
  'var(--primary)',
  'var(--buy)',
  'var(--warning)',
  'var(--sell)',
  '#5B93D5',
  '#7ABECC',
  '#FF9800',
  '#8BA87A',
]

/* ── VaR table rows ─────────────────────────────────────── */
const VAR_TABLE = [
  { confidence: '95%', day1: '$285K', day10: '$901K' },
  { confidence: '99%', day1: '$412K', day10: '$1.30M' },
  { confidence: '99.9%', day1: '$587K', day10: '$1.86M' },
]

/* ── Stress scenarios ───────────────────────────────────── */
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
]

/* ── Layouts ─────────────────────────────────────────────── */
const layouts: Record<string, LayoutItem[]> = {
  lg: [
    { i: 'kpi', x: 0, y: 0, w: 12, h: 3 },
    { i: 'dv01', x: 0, y: 3, w: 4, h: 10 },
    { i: 'sectors', x: 4, y: 3, w: 4, h: 10 },
    { i: 'credit', x: 8, y: 3, w: 4, h: 6 },
    { i: 'var', x: 8, y: 9, w: 4, h: 4 },
    { i: 'stress', x: 0, y: 13, w: 12, h: 3 },
  ],
  md: [
    { i: 'kpi', x: 0, y: 0, w: 12, h: 3 },
    { i: 'dv01', x: 0, y: 3, w: 6, h: 10 },
    { i: 'sectors', x: 6, y: 3, w: 6, h: 10 },
    { i: 'credit', x: 0, y: 13, w: 6, h: 6 },
    { i: 'var', x: 6, y: 13, w: 6, h: 6 },
    { i: 'stress', x: 0, y: 19, w: 12, h: 3 },
  ],
  sm: [
    { i: 'kpi', x: 0, y: 0, w: 6, h: 4 },
    { i: 'dv01', x: 0, y: 4, w: 6, h: 10 },
    { i: 'sectors', x: 0, y: 14, w: 6, h: 10 },
    { i: 'credit', x: 0, y: 24, w: 6, h: 8 },
    { i: 'var', x: 0, y: 32, w: 6, h: 5 },
    { i: 'stress', x: 0, y: 37, w: 6, h: 5 },
  ],
}

/* ── LimitBar sub-component ──────────────────────────────── */
function LimitBar({ name, current, limit }: { name: string; current: number; limit: number }) {
  const pct = limit > 0 ? (current / limit) * 100 : 0
  const color = pct >= 90 ? 'bg-sell' : pct >= 70 ? 'bg-warning' : 'bg-buy'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-mono text-foreground">
          ${fmtDV01(current)} / ${fmtDV01(limit)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ── KPI Card sub-component ──────────────────────────────── */
function KpiCard({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={cn('text-sm font-semibold font-mono', className)}>{value}</span>
    </div>
  )
}

/* ── Component ───────────────────────────────────────────── */
export function RiskPanel() {
  const { corpBonds, treasuries } = useMarketData()

  /* ── Compute DV01 by tenor bucket from corp bonds + treasuries ── */
  const dv01Buckets = useMemo(() => {
    const buckets = TENOR_BUCKETS.map((b) => ({ tenor: b.label, value: 0 }))

    for (const bond of corpBonds) {
      const dur = bond.duration
      const dv01 = bond.dv01PerMM
      const sign = bond.changeBps >= 0 ? -1 : 1
      const exposure = dv01 * sign * 10

      for (let bi = 0; bi < TENOR_BUCKETS.length; bi++) {
        if (dur >= TENOR_BUCKETS[bi].min && dur < TENOR_BUCKETS[bi].max) {
          buckets[bi].value += exposure
          break
        }
        if (bi === TENOR_BUCKETS.length - 1) {
          buckets[bi].value += exposure
        }
      }
    }

    for (const t of treasuries) {
      const tenorYears = parseTenor(t.tenor)
      const dv01Approx = tenorYears * 95
      const sign = t.chg >= 0 ? 1 : -1
      for (let bi = 0; bi < TENOR_BUCKETS.length; bi++) {
        if (tenorYears >= TENOR_BUCKETS[bi].min && tenorYears < TENOR_BUCKETS[bi].max) {
          buckets[bi].value += dv01Approx * sign
          break
        }
        if (bi === TENOR_BUCKETS.length - 1) {
          buckets[bi].value += dv01Approx * sign
        }
      }
    }

    return buckets.map((b) => ({
      ...b,
      value: Math.round(b.value),
      fill: b.value >= 0 ? 'var(--buy)' : 'var(--sell)',
    }))
  }, [corpBonds, treasuries])

  /* ── Sector allocation from corp bonds ─────────────────── */
  const sectorData = useMemo(() => {
    const map = new Map<string, number>()
    for (const bond of corpBonds) {
      const sector = bond.sector || 'Other'
      map.set(sector, (map.get(sector) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
  }, [corpBonds])

  /* ── Credit risk metrics ───────────────────────────────── */
  const creditMetrics = useMemo(() => {
    const ratingScores: number[] = []
    let totalSpreadDur = 0
    let totalCS01 = 0
    let totalOAS = 0
    let count = 0

    for (const bond of corpBonds) {
      const score = RATING_SCORES[bond.ratingMoody]
      if (score) ratingScores.push(score)

      const spreadDur = bond.duration * 0.95
      totalSpreadDur += spreadDur
      totalCS01 += bond.dv01PerMM * 0.85
      totalOAS += bond.oas
      count++
    }

    return {
      avgRating: averageRating(ratingScores),
      avgSpreadDur: count > 0 ? (totalSpreadDur / count).toFixed(2) : '0.00',
      totalCS01: Math.round(totalCS01),
      avgOAS: count > 0 ? Math.round(totalOAS / count) : 0,
      bondCount: count,
    }
  }, [corpBonds])

  /* ── Summary KPIs derived from market data ─────────────── */
  const kpis = useMemo(() => {
    const netDV01 = dv01Buckets.reduce((sum, b) => sum + b.value, 0)
    const grossDV01 = dv01Buckets.reduce((sum, b) => sum + Math.abs(b.value), 0)

    let pnlToday = 0
    for (const bond of corpBonds) {
      pnlToday += bond.changeBps * bond.dv01PerMM * -10
    }
    for (const t of treasuries) {
      pnlToday += t.chg * parseTenor(t.tenor) * -950
    }

    const var99 = Math.round(grossDV01 * 0.35)

    return { netDV01, grossDV01, pnlToday: Math.round(pnlToday), var99 }
  }, [dv01Buckets, corpBonds, treasuries])

  /* ── DV01 bar chart options ───────────────────────────── */
  const dv01ChartOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'column', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: dv01Buckets.map((b) => b.tenor),
        labels: { style: { color: '#9DA0A5', fontSize: '9px' } },
        lineColor: '#2C2F33',
        tickLength: 0,
      },
      yAxis: {
        title: { text: undefined },
        labels: {
          style: { color: '#9DA0A5', fontSize: '9px' },
          formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
            const v = Number(this.value)
            if (Math.abs(v) >= 1000) return (v / 1000).toFixed(0) + 'K'
            return String(v)
          },
        },
        gridLineColor: '#2C2F33',
        gridLineDashStyle: 'ShortDash',
        plotLines: [{ value: 0, color: '#9DA0A5', width: 1, dashStyle: 'ShortDash', zIndex: 3 }],
        lineWidth: 0,
      },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: '#2C2F33',
        borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          return `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>DV01: $${Number(this.y).toLocaleString()}`
        },
        useHTML: true,
      },
      plotOptions: {
        column: { borderRadius: 3, borderWidth: 0, animation: false },
      },
      series: [
        {
          name: 'DV01',
          type: 'column',
          data: dv01Buckets.map((b) => ({
            y: b.value,
            color: b.value >= 0 ? '#14B8A6' : '#FF5252',
          })),
        },
      ],
    }),
    [dv01Buckets]
  )

  /* ── Sector pie chart options ────────────────────────── */
  const sectorChartOptions = useMemo<Highcharts.Options>(
    () => ({
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
      series: [
        {
          name: 'Sector',
          type: 'pie',
          data: sectorData.map((s, i) => ({
            name: s.name,
            y: s.value,
            color: SECTOR_COLORS[i % SECTOR_COLORS.length],
          })),
        },
      ],
    }),
    [sectorData]
  )

  /* ── Risk limits computed from KPIs ────────────────────── */
  const limits = useMemo(
    () => [
      { name: 'Net DV01', current: Math.abs(kpis.netDV01), limit: 600000 },
      { name: 'Gross DV01', current: kpis.grossDV01, limit: 1500000 },
      { name: 'Net CS01', current: creditMetrics.totalCS01, limit: 100000 },
      { name: 'IG Credit', current: Math.round(creditMetrics.totalCS01 * 0.82), limit: 300000 },
      { name: 'HY Credit', current: Math.round(creditMetrics.totalCS01 * 0.18), limit: 75000 },
      { name: 'Max Single Tenor', current: Math.max(...dv01Buckets.map((b) => Math.abs(b.value))), limit: 400000 },
      { name: 'VaR 99%', current: kpis.var99, limit: 500000 },
    ],
    [kpis, creditMetrics, dv01Buckets]
  )

  /* ── Stress scenario P&L ───────────────────────────────── */
  const stressResults = useMemo(
    () =>
      STRESS_SCENARIOS.map((s) => ({
        name: s.name,
        pnl: Math.round(Math.abs(kpis.netDV01) * 0.25 * s.multiplier),
      })),
    [kpis.netDV01]
  )

  return (
    <PanelGrid layouts={layouts}>
      {/* ── KPI Row ──────────────────────────────────────────── */}
      <div key="kpi" className="bg-card border border-border rounded-xl overflow-hidden relative p-3">
        <DragHandle />
        <div className="grid grid-cols-4 gap-3 h-full">
          <KpiCard
            label="Net DV01"
            value={'$' + fmtDV01(kpis.netDV01)}
          />
          <KpiCard
            label="Gross DV01"
            value={'$' + fmtDV01(kpis.grossDV01)}
          />
          <KpiCard
            label="P&L Today"
            value={fmtPnL(kpis.pnlToday)}
            className={kpis.pnlToday >= 0 ? 'text-buy' : 'text-sell'}
          />
          <KpiCard
            label="1-Day VaR 99%"
            value={'$' + fmtDV01(kpis.var99)}
            className="text-warning"
          />
        </div>
      </div>

      {/* ── DV01 by Tenor Bucket ─────────────────────────────── */}
      <div key="dv01" className="bg-card border border-border rounded-xl overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="px-3 pt-2 pb-1">
          <h3 className="text-xs font-semibold text-foreground">DV01 by Tenor Bucket</h3>
        </div>
        <div className="flex-1 min-h-0 px-1">
          <div style={{ width: '100%', height: '100%' }}>
            <HighchartsReact highcharts={Highcharts} options={dv01ChartOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>
      </div>

      {/* ── Sector Allocation (Donut) + Risk Limits ──────────── */}
      <div key="sectors" className="bg-card border border-border rounded-xl overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="px-3 pt-2 pb-1">
          <h3 className="text-xs font-semibold text-foreground">Sector Allocation</h3>
          <p className="text-[9px] text-muted-foreground">Corp bond distribution by sector</p>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div style={{ width: '100%', height: '100%' }}>
              <HighchartsReact highcharts={Highcharts} options={sectorChartOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 pb-2 text-[10px]">
            {sectorData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
                />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-mono text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Credit Risk Metrics + Limits ─────────────────────── */}
      <div key="credit" className="bg-card border border-border rounded-xl overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="px-3 pt-2 pb-1">
          <h3 className="text-xs font-semibold text-foreground">Credit Risk Metrics</h3>
        </div>
        <div className="flex-1 overflow-auto px-3 pb-2">
          {/* Credit summary cards */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Avg Rating</span>
              <span className="text-sm font-mono font-semibold text-foreground">{creditMetrics.avgRating}</span>
            </div>
            <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Spread Duration</span>
              <span className="text-sm font-mono font-semibold text-foreground">{creditMetrics.avgSpreadDur}</span>
            </div>
            <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">CS01</span>
              <span className="text-sm font-mono font-semibold text-foreground">${fmtDV01(creditMetrics.totalCS01)}</span>
            </div>
            <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Avg OAS</span>
              <span className="text-sm font-mono font-semibold text-foreground">{fmtBps(creditMetrics.avgOAS)}</span>
            </div>
          </div>
          {/* Risk limits */}
          <div className="space-y-2">
            {limits.map((l) => (
              <LimitBar key={l.name} name={l.name} current={l.current} limit={l.limit} />
            ))}
          </div>
        </div>
      </div>

      {/* ── VaR Table ────────────────────────────────────────── */}
      <div key="var" className="bg-card border border-border rounded-xl overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="px-3 pt-2 pb-1">
          <h3 className="text-xs font-semibold text-foreground">Value at Risk</h3>
        </div>
        <div className="px-3 pb-2 flex-1 overflow-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-muted-foreground uppercase tracking-wider">
                <th className="text-left py-1 font-medium">Confidence</th>
                <th className="text-right py-1 font-medium">1-Day</th>
                <th className="text-right py-1 font-medium">10-Day</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {VAR_TABLE.map((row) => (
                <tr key={row.confidence} className="border-t border-border">
                  <td className="py-1 text-foreground">{row.confidence}</td>
                  <td className="py-1 text-right text-foreground">{row.day1}</td>
                  <td className="py-1 text-right text-foreground">{row.day10}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground border-t border-border pt-1.5">
            <div className="flex justify-between">
              <span>Expected Shortfall (99%)</span>
              <span className="font-mono text-foreground">$523K</span>
            </div>
            <div className="flex justify-between">
              <span>Max Drawdown (30d)</span>
              <span className="font-mono text-sell">-$187K</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stress Scenarios ─────────────────────────────────── */}
      <div key="stress" className="bg-card border border-border rounded-xl overflow-hidden relative p-3">
        <DragHandle />
        <div className="mb-1.5">
          <h3 className="text-xs font-semibold text-foreground">Stress Scenarios</h3>
        </div>
        <div className="grid grid-cols-9 gap-2">
          {stressResults.map((s) => (
            <div
              key={s.name}
              className="bg-muted/50 rounded-lg px-2 py-1.5 flex flex-col items-center gap-0.5"
            >
              <span className="text-[9px] text-muted-foreground text-center leading-tight">
                {s.name}
              </span>
              <span
                className={cn(
                  'text-[11px] font-mono font-semibold',
                  s.pnl >= 0 ? 'text-buy' : 'text-sell'
                )}
              >
                {fmtPnL(s.pnl)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PanelGrid>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */
function parseTenor(tenor: string): number {
  const match = tenor.match(/(\d+)/)
  if (!match) return 0
  const n = parseInt(match[1], 10)
  if (tenor.includes('M') || tenor.includes('m')) return n / 12
  return n
}

export default RiskPanel
