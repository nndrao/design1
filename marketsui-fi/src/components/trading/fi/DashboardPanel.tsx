import { useMemo, useRef, useState, useEffect } from 'react'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import type { LayoutItem } from 'react-grid-layout'
import { useMarketData } from './MarketDataContext'
import { PanelGrid, DragHandle } from './PanelGrid'
import { DASHBOARD_ORDERS, DASHBOARD_POSITIONS } from './marketData'
import { cn, fmtYield, fmtBps, fmtPnL, fmtDV01 } from '@/lib/utils'

/* ── Flash hook for tick updates ──────────────────────────── */
function useTickFlash(value: number | undefined) {
  const prevRef = useRef(value)
  const [flash, setFlash] = useState('')
  useEffect(() => {
    if (value != null && prevRef.current != null && prevRef.current !== value) {
      setFlash(value > prevRef.current ? 'flash-positive tick-update' : 'flash-negative tick-update')
      const timer = setTimeout(() => setFlash(''), 600)
      prevRef.current = value
      return () => clearTimeout(timer)
    }
    prevRef.current = value
  }, [value])
  return flash
}

/* ── KPI data ─────────────────────────────────────────────── */
const KPI_DATA = [
  { label: 'P&L Today', value: 93_170, subtitle: 'Realized + Unrealized', format: 'pnl' },
  { label: 'P&L MTD', value: 243_135, subtitle: 'Month to date', format: 'pnl' },
  { label: 'P&L YTD', value: 590_320, subtitle: 'Year to date', format: 'pnl' },
  { label: 'Net DV01', value: 420_945, subtitle: 'Rate sensitivity', format: 'dv01' },
  { label: 'Net CS01', value: 57_182, subtitle: 'Credit sensitivity', format: 'dv01' },
] as const

function formatKpi(value: number, format: string) {
  if (format === 'pnl') return fmtPnL(value)
  return fmtDV01(value)
}

/* ── Panel card wrapper ───────────────────────────────────── */
function PanelCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative bg-card border border-border rounded-xl h-full flex flex-col overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <DragHandle />
      </div>
      <div className="flex-1 min-h-0 overflow-auto px-4 pb-3">{children}</div>
    </div>
  )
}

/* ── KPI Card ─────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  subtitle,
  format,
}: {
  label: string
  value: number
  subtitle: string
  format: string
}) {
  const isPnl = format === 'pnl'
  const isPositive = value >= 0

  return (
    <div className="relative bg-card border border-border rounded-xl p-4 flex flex-col justify-between h-full overflow-hidden">
      <DragHandle />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'text-xl font-mono font-semibold mt-1',
          isPnl && isPositive && 'text-buy',
          isPnl && !isPositive && 'text-sell',
          !isPnl && 'text-foreground'
        )}
      >
        {formatKpi(value, format)}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</span>
    </div>
  )
}


/* ── Benchmark row with flash ────────────────────────────── */
function BenchmarkRow({ b }: { b: { name: string; value?: number; chg?: number; isYield: boolean } }) {
  const flash = useTickFlash(b.value)
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
      <span className="text-xs text-muted-foreground">{b.name}</span>
      <div className="flex items-center gap-2">
        <span className={cn('text-xs font-mono text-foreground', flash)}>
          {b.value != null
            ? b.isYield
              ? fmtYield(b.value)
              : b.name === '2s10s Slope'
                ? b.value.toFixed(1) + ' bps'
                : b.value.toFixed(1)
            : '—'}
        </span>
        {b.chg != null && (
          <span className={cn('text-[10px] font-mono', b.chg >= 0 ? 'text-sell' : 'text-buy')}>
            {fmtBps(b.chg)}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Filled: 'bg-buy/15 text-buy',
    Working: 'bg-primary/15 text-primary',
    Partial: 'bg-warning/15 text-warning',
    Cancelled: 'bg-muted text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
        styles[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {status}
    </span>
  )
}

/* ── Layouts ──────────────────────────────────────────────── */
const LAYOUTS: Record<string, LayoutItem[]> = {
  lg: [
    // KPI row – 5 cards across 12 cols
    { i: 'kpi-0', x: 0, y: 0, w: 2, h: 4 },
    { i: 'kpi-1', x: 2, y: 0, w: 3, h: 4 },
    { i: 'kpi-2', x: 5, y: 0, w: 2, h: 4 },
    { i: 'kpi-3', x: 7, y: 0, w: 3, h: 4 },
    { i: 'kpi-4', x: 10, y: 0, w: 2, h: 4 },
    // Second row
    { i: 'yield-curve', x: 0, y: 4, w: 5, h: 10 },
    { i: 'benchmarks', x: 5, y: 4, w: 3, h: 10 },
    { i: 'positions', x: 8, y: 4, w: 4, h: 10 },
    // Third row
    { i: 'recent-orders', x: 0, y: 14, w: 12, h: 9 },
  ],
  md: [
    { i: 'kpi-0', x: 0, y: 0, w: 2, h: 4 },
    { i: 'kpi-1', x: 2, y: 0, w: 3, h: 4 },
    { i: 'kpi-2', x: 5, y: 0, w: 2, h: 4 },
    { i: 'kpi-3', x: 7, y: 0, w: 3, h: 4 },
    { i: 'kpi-4', x: 10, y: 0, w: 2, h: 4 },
    { i: 'yield-curve', x: 0, y: 4, w: 6, h: 10 },
    { i: 'benchmarks', x: 6, y: 4, w: 6, h: 10 },
    { i: 'positions', x: 0, y: 14, w: 6, h: 10 },
    { i: 'recent-orders', x: 6, y: 14, w: 6, h: 10 },
  ],
  sm: [
    { i: 'kpi-0', x: 0, y: 0, w: 3, h: 4 },
    { i: 'kpi-1', x: 3, y: 0, w: 3, h: 4 },
    { i: 'kpi-2', x: 0, y: 4, w: 3, h: 4 },
    { i: 'kpi-3', x: 3, y: 4, w: 3, h: 4 },
    { i: 'kpi-4', x: 0, y: 8, w: 6, h: 4 },
    { i: 'yield-curve', x: 0, y: 12, w: 6, h: 10 },
    { i: 'benchmarks', x: 0, y: 22, w: 6, h: 10 },
    { i: 'positions', x: 0, y: 32, w: 6, h: 10 },
    { i: 'recent-orders', x: 0, y: 42, w: 6, h: 10 },
  ],
}

/* ── Main Dashboard Panel ─────────────────────────────────── */
export function DashboardPanel() {
  const marketData = useMarketData()
  const { treasuries, yieldCurve, cdxIndices } = marketData

  /* Key benchmarks */
  const ust2 = treasuries.find((t) => t.tenor === '2Y')
  const ust10 = treasuries.find((t) => t.tenor === '10Y')
  const ust30 = treasuries.find((t) => t.tenor === '30Y')
  const cdxIG = cdxIndices.find((c) => c.name.includes('IG'))
  const cdxHY = cdxIndices.find((c) => c.name.includes('HY'))
  const slope2s10s = ust10 && ust2 ? (ust10.mid - ust2.mid) * 100 : 0

  const benchmarks = useMemo(
    () => [
      { name: '2Y UST', value: ust2?.mid, chg: ust2?.chg, isYield: true },
      { name: '10Y UST', value: ust10?.mid, chg: ust10?.chg, isYield: true },
      { name: '30Y UST', value: ust30?.mid, chg: ust30?.chg, isYield: true },
      { name: 'CDX IG', value: cdxIG?.mid, chg: cdxIG?.chg, isYield: false },
      { name: 'CDX HY', value: cdxHY?.mid, chg: cdxHY?.chg, isYield: false },
      { name: '2s10s Slope', value: slope2s10s, chg: undefined, isYield: false },
    ],
    [ust2, ust10, ust30, cdxIG, cdxHY, slope2s10s]
  )

  /* Yield curve Highcharts options */
  const yieldCurveOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: yieldCurve.map((pt) => pt.tenor),
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
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const pts = this.points ?? [this]
          let s = `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>`
          for (const p of pts) {
            const label = p.series.name === 'today' ? 'Today' : 'Prev Close'
            s += `<span>${label}: ${Number(p.y).toFixed(3)}%</span><br/>`
          }
          return s
        },
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
          data: yieldCurve.map((pt) => pt.yield),
          color: '#60A5FA',
          lineWidth: 2,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'rgba(45,212,191,0.15)'], [1, 'rgba(45,212,191,0)']],
          },
        },
        {
          name: 'prevClose',
          type: 'spline',
          data: yieldCurve.map((pt) => pt.prevClose),
          color: '#9DA0A5',
          lineWidth: 1.5,
          dashStyle: 'ShortDash',
        },
      ],
    }),
    [yieldCurve]
  )

  const recentOrders = DASHBOARD_ORDERS.slice(0, 6)
  const positions = DASHBOARD_POSITIONS.slice(0, 8)

  return (
    <PanelGrid layouts={LAYOUTS} rowHeight={30}>
      {/* ── KPI Cards ──────────────────────────────────────── */}
      {KPI_DATA.map((kpi, i) => (
        <div key={`kpi-${i}`}>
          <KpiCard
            label={kpi.label}
            value={kpi.value}
            subtitle={kpi.subtitle}
            format={kpi.format}
          />
        </div>
      ))}

      {/* ── Yield Curve ────────────────────────────────────── */}
      <div key="yield-curve">
        <PanelCard title="Yield Curve">
          <div style={{ width: '100%', height: '100%' }}>
            <HighchartsReact highcharts={Highcharts} options={yieldCurveOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </PanelCard>
      </div>

      {/* ── Key Benchmarks ─────────────────────────────────── */}
      <div key="benchmarks">
        <PanelCard title="Key Benchmarks">
          <div className="flex flex-col gap-1">
            {benchmarks.map((b) => (
              <BenchmarkRow key={b.name} b={b} />
            ))}
          </div>
        </PanelCard>
      </div>

      {/* ── Position Summary ───────────────────────────────── */}
      <div key="positions">
        <PanelCard title="Position Summary">
          <div className="flex flex-col gap-0.5">
            {positions.map((pos, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'text-[10px] font-mono w-4 text-center',
                      pos.direction === 'Long' ? 'text-buy' : 'text-sell'
                    )}
                  >
                    {pos.direction === 'Long' ? '\u2191' : '\u2193'}
                  </span>
                  <span className="text-xs text-foreground truncate">{pos.security}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      'text-xs font-mono',
                      pos.pnl >= 0 ? 'text-buy' : 'text-sell'
                    )}
                  >
                    {fmtPnL(pos.pnl)}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {fmtDV01(pos.dv01)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* ── Recent Orders ──────────────────────────────────── */}
      <div key="recent-orders">
        <PanelCard title="Recent Orders">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Time
                </th>
                <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Security
                </th>
                <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Side
                </th>
                <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Size
                </th>
                <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Yield / Price
                </th>
                <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-b-0 hover:bg-secondary/40 transition-colors"
                >
                  <td className="py-2 font-mono text-muted-foreground">{order.time}</td>
                  <td className="py-2 text-foreground">{order.security}</td>
                  <td className="py-2">
                    <span className={cn(order.side === 'Buy' ? 'text-buy' : 'text-sell')}>
                      {order.side}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-foreground">{order.size}</td>
                  <td className="py-2 text-right font-mono text-foreground">{order.yieldPrice}</td>
                  <td className="py-2 text-right">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>
      </div>
    </PanelGrid>
  )
}

export default DashboardPanel
