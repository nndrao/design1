import { useState, useMemo, useCallback } from 'react'
import type { Treasury, YieldCurvePoint, KeyRateDuration } from './marketData'
import type { ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import { marketsUITheme } from './agGridTheme'
import { useMarketData } from './MarketDataContext'
import { PanelGrid, DragHandle, type LayoutItem } from './PanelGrid'
import { Button } from '@/components/ui/button'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'

/* ─── KRD sample data (used when no tenor is selected) ── */

const krdData: KeyRateDuration[] = [
  { tenor: '2Y', value: 0.04 },
  { tenor: '3Y', value: 0.12 },
  { tenor: '5Y', value: 0.38 },
  { tenor: '7Y', value: 0.55 },
  { tenor: '10Y', value: -0.72 },
  { tenor: '20Y', value: -0.18 },
  { tenor: '30Y', value: -0.45 },
]

/* ─── Layouts ────────────────────────────────────────────── */

const layouts: Record<string, LayoutItem[]> = {
  lg: [
    { i: 'grid', x: 0, y: 0, w: 9, h: 19 },
    { i: 'yieldCurve', x: 9, y: 0, w: 3, h: 6 },
    { i: 'curveSpreads', x: 9, y: 6, w: 3, h: 5 },
    { i: 'detail', x: 9, y: 11, w: 3, h: 8 },
  ],
  md: [
    { i: 'grid', x: 0, y: 0, w: 12, h: 14 },
    { i: 'yieldCurve', x: 0, y: 14, w: 6, h: 6 },
    { i: 'curveSpreads', x: 6, y: 14, w: 6, h: 5 },
    { i: 'detail', x: 0, y: 20, w: 12, h: 6 },
  ],
  sm: [
    { i: 'grid', x: 0, y: 0, w: 6, h: 12 },
    { i: 'yieldCurve', x: 0, y: 12, w: 6, h: 6 },
    { i: 'curveSpreads', x: 0, y: 18, w: 6, h: 5 },
    { i: 'detail', x: 0, y: 23, w: 6, h: 6 },
  ],
}

/* ─── Helpers ────────────────────────────────────────────── */

function findYield(treasuries: Treasury[], tenor: string): number | undefined {
  return treasuries.find((t) => t.tenor === tenor)?.bidYield
}

function calcSpread(y1: number | undefined, y2: number | undefined): number | null {
  if (y1 == null || y2 == null) return null
  return Math.round((y2 - y1) * 100 * 10) / 10
}

function calcButterfly(
  y1: number | undefined,
  y2: number | undefined,
  y3: number | undefined,
): number | null {
  if (y1 == null || y2 == null || y3 == null) return null
  return Math.round((-y1 + 2 * y2 - y3) * 100 * 10) / 10
}

/* ─── Column Definitions ─────────────────────────────────── */

const columnDefs: ColDef<Treasury>[] = [
  {
    field: 'tenor',
    headerName: 'Tenor',
    width: 60,
    cellClass: 'font-semibold',
    suppressMovable: true,
  },
  {
    field: 'security',
    headerName: 'Security',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'coupon',
    headerName: 'Cpn',
    width: 72,
    type: 'rightAligned',
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(3) + '%' : ''),
  },
  {
    field: 'maturity',
    headerName: 'Maturity',
    width: 88,
  },
  {
    field: 'bidYield',
    headerName: 'Bid Yld',
    width: 80,
    type: 'rightAligned',
    cellClass: 'font-mono font-semibold text-buy',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(3) : ''),
  },
  {
    field: 'askYield',
    headerName: 'Ask Yld',
    width: 78,
    type: 'rightAligned',
    cellClass: 'font-mono text-sell',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(3) : ''),
  },
  {
    field: 'bidPrice',
    headerName: 'Bid Px',
    width: 76,
    type: 'rightAligned',
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(3) : ''),
  },
  {
    field: 'askPrice',
    headerName: 'Ask Px',
    width: 76,
    type: 'rightAligned',
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(3) : ''),
  },
  {
    field: 'changeBps',
    headerName: 'Chg bps',
    width: 82,
    type: 'rightAligned',
    cellClass: 'font-mono',
    valueFormatter: (p) =>
      p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(1) : '',
    cellStyle: (p) => {
      if (p.value == null) return undefined
      if (p.value > 0) return { color: 'var(--sell)' }
      if (p.value < 0) return { color: 'var(--buy)' }
      return undefined
    },
  },
  {
    field: 'modDuration',
    headerName: 'Mod Dur',
    width: 76,
    type: 'rightAligned',
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(2) : ''),
  },
  {
    field: 'dv01PerMM',
    headerName: 'DV01/MM',
    width: 84,
    type: 'rightAligned',
    cellClass: 'font-mono',
    valueFormatter: (p) =>
      p.value != null ? '$' + Math.round(p.value).toLocaleString() : '',
  },
]

/* ─── Yield Curve Chart ──────────────────────────────────── */

function YieldCurveChart({ data }: { data: YieldCurvePoint[] }) {
  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: data.map((d) => d.tenor),
        labels: { style: { color: '#9DA0A5', fontSize: '9px' } },
        lineColor: '#2C2F33',
        tickLength: 0,
        gridLineColor: '#2C2F33',
        gridLineWidth: 0,
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
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const pts = this.points ?? [this]
          let s = `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>`
          for (const p of pts) {
            const label = p.series.name === 'yield' ? 'Today' : 'Prior'
            s += `<span>${label}: ${Number(p.y).toFixed(3)}%</span><br/>`
          }
          return s
        },
        useHTML: true,
      },
      plotOptions: {
        series: { animation: false, marker: { enabled: false } },
      },
      series: [
        {
          name: 'priorYield',
          type: 'spline',
          data: data.map((d) => d.priorYield),
          color: '#9DA0A5',
          lineWidth: 1.5,
          dashStyle: 'ShortDash',
        },
        {
          name: 'yield',
          type: 'areaspline',
          data: data.map((d) => d.yield),
          color: '#60A5FA',
          lineWidth: 2,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'oklch(0.55 0.2 260 / 30%)'], [1, 'oklch(0.55 0.2 260 / 0%)']],
          },
          marker: { enabled: false, states: { hover: { enabled: true, radius: 3, fillColor: '#60A5FA', lineWidth: 0 } } },
        },
      ],
    }),
    [data]
  )

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { width: '100%', height: '100%' } }} />
    </div>
  )
}

/* ─── Curve Spreads Panel ────────────────────────────────── */

interface SpreadItem {
  label: string
  value: number | null
  isButterfly?: boolean
}

function CurveSpreadsPanel({ treasuries }: { treasuries: Treasury[] }) {
  const spreads = useMemo<SpreadItem[]>(() => {
    const y2 = findYield(treasuries, '2Y')
    const y5 = findYield(treasuries, '5Y')
    const y10 = findYield(treasuries, '10Y')
    const y30 = findYield(treasuries, '30Y')

    return [
      { label: '2s5s', value: calcSpread(y2, y5) },
      { label: '5s10s', value: calcSpread(y5, y10) },
      { label: '2s10s', value: calcSpread(y2, y10) },
      { label: '5s30s', value: calcSpread(y5, y30) },
      { label: '2s5s10s', value: calcButterfly(y2, y5, y10), isButterfly: true },
      { label: '5s10s30s', value: calcButterfly(y5, y10, y30), isButterfly: true },
    ]
  }, [treasuries])

  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full p-2">
      {spreads.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 px-2 py-1.5"
        >
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
            {s.label}
            {s.isButterfly ? ' fly' : ''}
          </span>
          <span
            className="font-mono text-sm font-semibold"
            style={{
              color:
                s.value == null
                  ? undefined
                  : s.value > 0
                    ? 'var(--buy)'
                    : s.value < 0
                      ? 'var(--sell)'
                      : undefined,
            }}
          >
            {s.value != null ? (s.value >= 0 ? '+' : '') + s.value.toFixed(1) : '--'}
          </span>
          <span className="text-[8px] text-muted-foreground">bps</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Detail Panel ───────────────────────────────────────── */

function CUSIPDetail({ treasury }: { treasury: Treasury }) {
  const rows = [
    { label: 'CUSIP', value: treasury.cusip },
    { label: 'Coupon', value: treasury.coupon.toFixed(3) + '%' },
    { label: 'Maturity', value: treasury.maturity },
    {
      label: 'Mid Yield',
      value: ((treasury.bidYield + treasury.askYield) / 2).toFixed(3) + '%',
    },
    {
      label: 'Bid / Ask',
      value: treasury.bidYield.toFixed(3) + ' / ' + treasury.askYield.toFixed(3),
    },
    { label: 'Mod Dur', value: treasury.modDuration.toFixed(2) },
    { label: 'DV01/MM', value: '$' + Math.round(treasury.dv01PerMM).toLocaleString() },
    { label: 'Settle', value: 'T+1' },
  ]

  return (
    <div className="space-y-1 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold">{treasury.tenor}</span>
        <span className="text-xs text-muted-foreground">{treasury.security}</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between text-[11px] py-0.5">
          <span className="text-muted-foreground">{r.label}</span>
          <span className="font-mono font-medium">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function KRDChart() {
  const filtered = krdData.filter((d) => {
    const years = parseFloat(d.tenor)
    return years >= 2
  })

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'column', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: filtered.map((d) => d.tenor),
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
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          return `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>KRD: ${Number(this.y).toFixed(3)}`
        },
        useHTML: true,
      },
      plotOptions: {
        column: {
          borderRadius: 3,
          borderWidth: 0,
          animation: false,
        },
      },
      series: [
        {
          name: 'KRD',
          type: 'column',
          data: filtered.map((d) => ({
            y: d.value,
            color: d.value >= 0 ? '#0D9488' : '#E11D63',
          })),
        },
      ],
    }),
    [filtered]
  )

  return (
    <div className="h-full p-2 flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1 mb-1">
        Key Rate Duration
      </span>
      <div className="flex-1">
        <div style={{ width: '100%', height: '100%' }}>
          <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { width: '100%', height: '100%' } }} />
        </div>
      </div>
    </div>
  )
}

function DetailPanel({ selected }: { selected: Treasury | null }) {
  if (selected) {
    return <CUSIPDetail treasury={selected} />
  }
  return <KRDChart />
}

/* ─── Main Component ─────────────────────────────────────── */

export function RatesPanel() {
  const { treasuries, yieldCurve } = useMarketData()
  const [selectedTenor, setSelectedTenor] = useState<string | null>(null)

  const selectedTreasury = useMemo(
    () => treasuries.find((t) => t.tenor === selectedTenor) ?? null,
    [treasuries, selectedTenor],
  )

  const onRowClicked = useCallback(
    (event: { data: Treasury | undefined }) => {
      if (event.data) {
        setSelectedTenor((prev) => (prev === event.data!.tenor ? null : event.data!.tenor))
      }
    },
    [],
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      suppressHeaderMenuButton: true,
    }),
    [],
  )

  return (
    <PanelGrid layouts={layouts}>
      {/* Treasury Grid */}
      <div key="grid" className="bg-card rounded-xl border border-border overflow-hidden relative">
        <DragHandle />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold">Treasury Rates</span>
          <span className="text-[10px] text-muted-foreground">
            {treasuries.length} securities
          </span>
        </div>
        <div className="h-[calc(100%-36px)]">
          <AgGridReact<Treasury>
            theme={marketsUITheme}
            modules={[AllEnterpriseModule]}
            rowData={treasuries}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection="single"
            onRowClicked={onRowClicked}
            getRowId={(params) => params.data.tenor}
            animateRows={false}
            suppressCellFocus
          />
        </div>
      </div>

      {/* Yield Curve Chart */}
      <div key="yieldCurve" className="bg-card rounded-xl border border-border overflow-hidden relative">
        <DragHandle />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold">Yield Curve</span>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1">
              <span className="w-3 h-[2px] bg-primary rounded" />
              <span className="text-[9px] text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-[2px] bg-muted-foreground rounded opacity-60" style={{ borderTop: '1px dashed' }} />
              <span className="text-[9px] text-muted-foreground">Prior</span>
            </div>
          </div>
        </div>
        <div className="h-[calc(100%-36px)] p-1">
          <YieldCurveChart data={yieldCurve} />
        </div>
      </div>

      {/* Curve Spreads */}
      <div key="curveSpreads" className="bg-card rounded-xl border border-border overflow-hidden relative">
        <DragHandle />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold">Curve Spreads</span>
        </div>
        <div className="h-[calc(100%-36px)]">
          <CurveSpreadsPanel treasuries={treasuries} />
        </div>
      </div>

      {/* Detail Panel */}
      <div key="detail" className="bg-card rounded-xl border border-border overflow-hidden relative">
        <DragHandle />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold">
            {selectedTreasury ? 'Security Detail' : 'Key Rate Duration'}
          </span>
          {selectedTreasury && (
            <Button
              onClick={() => setSelectedTenor(null)}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="h-[calc(100%-36px)]">
          <DetailPanel selected={selectedTreasury} />
        </div>
      </div>
    </PanelGrid>
  )
}
