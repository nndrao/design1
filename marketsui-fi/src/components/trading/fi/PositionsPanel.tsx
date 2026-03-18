import { useState, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { ColDef, ICellRendererParams, RowClassParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { marketsUITheme } from './agGridTheme'
import { PanelGrid, DragHandle } from './PanelGrid'
import { BASE_POSITIONS, fmtPnL, fmtK } from './marketData'
import type { Position, AssetClass } from './marketData'

/* ── Constants ──────────────────────────────────────────── */

type FilterType = 'All' | AssetClass
const FILTERS: FilterType[] = ['All', 'Treasury', 'Corporate', 'Future', 'CDS']

const CLASS_COLOR: Record<AssetClass, string> = {
  Treasury: 'text-primary',
  Corporate: 'text-buy',
  Future: 'text-warning',
  CDS: 'text-sell',
}

const BAR_COLORS: Record<string, string> = {
  Treasury: 'var(--primary)',
  Corporate: 'var(--buy)',
  Future: 'var(--warning)',
  CDS: 'var(--sell)',
}

/* ── Helpers ────────────────────────────────────────────── */

function fmtPosSize(pos: Position) {
  if (pos.assetClass === 'Future') return `${pos.size} cts`
  return `$${pos.size}MM`
}

function fmtMktVal(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  return (n / 1_000).toFixed(0) + 'K'
}

/* ── Cell Renderers ─────────────────────────────────────── */

function SecurityRenderer(params: ICellRendererParams<Position>) {
  const d = params.data
  if (!d) return null
  return (
    <div className="flex flex-col leading-tight py-1">
      <span className="text-[11px] font-medium text-foreground truncate">{d.security}</span>
      <span className="text-[9px] text-muted-foreground font-mono">{d.cusip}</span>
    </div>
  )
}

function ClassRenderer(params: ICellRendererParams<Position>) {
  const d = params.data
  if (!d) return null
  return (
    <span className={cn('text-[10px] font-semibold uppercase', CLASS_COLOR[d.assetClass])}>
      {d.assetClass}
    </span>
  )
}

function PosSideRenderer(params: ICellRendererParams<Position>) {
  const d = params.data
  if (!d) return null
  const isLong = d.side === 'LONG'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
        isLong ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'
      )}
    >
      {d.side}
    </span>
  )
}

function PnlCellRenderer(params: ICellRendererParams<Position>) {
  const val = params.value as number | undefined
  if (val == null) return null
  return (
    <span className={cn('font-mono text-[11px]', val >= 0 ? 'text-buy' : 'text-sell')}>
      {fmtPnL(val)}
    </span>
  )
}

/* ── KPI Card ───────────────────────────────────────────── */

function KpiCard({ label, value, colored }: { label: string; value: string; colored?: boolean }) {
  const isNeg = value.startsWith('-')
  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <span
        className={cn(
          'text-base font-semibold font-mono',
          colored ? (isNeg ? 'text-sell' : 'text-buy') : 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  )
}

/* ── P&L Attribution List ───────────────────────────────── */

function PnlAttribution({ positions }: { positions: Position[] }) {
  const sorted = useMemo(
    () => [...positions].sort((a, b) => Math.abs(b.pnlToday) - Math.abs(a.pnlToday)),
    [positions]
  )
  const maxPnl = useMemo(
    () => Math.max(...sorted.map((p) => Math.abs(p.pnlToday)), 1),
    [sorted]
  )
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
        P&amp;L Attribution (Today)
      </span>
      {sorted.map((p) => {
        const pct = (Math.abs(p.pnlToday) / maxPnl) * 100
        const pos = p.pnlToday >= 0
        return (
          <div key={p.id} className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-foreground truncate font-medium">{p.security}</span>
              <span className={cn('font-mono', pos ? 'text-buy' : 'text-sell')}>
                {fmtPnL(p.pnlToday)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', pos ? 'bg-buy' : 'bg-sell')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Position Detail ────────────────────────────────────── */

function PositionDetail({ position }: { position: Position }) {
  const isProfit = position.pnlToday >= 0

  const rows: [string, ReactNode][] = [
    ['Side', <span key="s" className={position.side === 'LONG' ? 'text-buy' : 'text-sell'}>{position.side}</span>],
    ['Class', <span key="c" className={CLASS_COLOR[position.assetClass]}>{position.assetClass}</span>],
    ['Size', <span key="sz" className="font-mono">{fmtPosSize(position)}</span>],
    ['Avg Px', <span key="ap" className="font-mono">{position.avgPx.toFixed(3)}</span>],
    ['Curr Px', <span key="cp" className="font-mono">{position.currPx.toFixed(3)}</span>],
    ['Yield', <span key="y" className="font-mono">{position.currYld ? position.currYld.toFixed(3) + '%' : '\u2014'}</span>],
    ['DV01', <span key="d" className="font-mono">${fmtK(position.dv01)}</span>],
    ['CS01', <span key="cs" className="font-mono">${fmtK(position.cs01)}</span>],
    ['MTD', <span key="mtd" className={cn('font-mono', position.pnlMtd >= 0 ? 'text-buy' : 'text-sell')}>{fmtPnL(position.pnlMtd)}</span>],
    ['YTD', <span key="ytd" className={cn('font-mono', position.pnlYtd >= 0 ? 'text-buy' : 'text-sell')}>{fmtPnL(position.pnlYtd)}</span>],
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className={cn('rounded-lg p-3 text-center', isProfit ? 'bg-buy/10' : 'bg-sell/10')}>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">P&amp;L Today</div>
        <div className={cn('text-xl font-bold font-mono', isProfit ? 'text-buy' : 'text-sell')}>
          {fmtPnL(position.pnlToday)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label as string} className="flex flex-col gap-0.5">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="text-[11px] text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Layouts ────────────────────────────────────────────── */

const GRID_LAYOUTS = {
  lg: [
    { i: 'kpi', x: 0, y: 0, w: 12, h: 3 },
    { i: 'grid', x: 0, y: 3, w: 9, h: 16 },
    { i: 'dv01Chart', x: 9, y: 3, w: 3, h: 6 },
    { i: 'detail', x: 9, y: 9, w: 3, h: 10 },
  ],
  md: [
    { i: 'kpi', x: 0, y: 0, w: 12, h: 3 },
    { i: 'grid', x: 0, y: 3, w: 9, h: 16 },
    { i: 'dv01Chart', x: 9, y: 3, w: 3, h: 6 },
    { i: 'detail', x: 9, y: 9, w: 3, h: 10 },
  ],
  sm: [
    { i: 'kpi', x: 0, y: 0, w: 6, h: 4 },
    { i: 'grid', x: 0, y: 4, w: 6, h: 14 },
    { i: 'dv01Chart', x: 0, y: 18, w: 6, h: 6 },
    { i: 'detail', x: 0, y: 24, w: 6, h: 8 },
  ],
}

/* ── Main Component ─────────────────────────────────────── */

export function PositionsPanel() {
  const [filter, setFilter] = useState<FilterType>('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredPositions = useMemo(
    () => (filter === 'All' ? BASE_POSITIONS : BASE_POSITIONS.filter((p) => p.assetClass === filter)),
    [filter]
  )

  const totals = useMemo(() => {
    let totalPnlToday = 0
    let totalPnlMtd = 0
    let totalPnlYtd = 0
    let totalDV01 = 0
    let totalCS01 = 0
    let totalMktVal = 0
    for (const p of BASE_POSITIONS) {
      totalPnlToday += p.pnlToday
      totalPnlMtd += p.pnlMtd
      totalPnlYtd += p.pnlYtd
      totalDV01 += p.dv01
      totalCS01 += p.cs01
      totalMktVal += p.mktVal
    }
    return { totalPnlToday, totalPnlMtd, totalPnlYtd, totalDV01, totalCS01, totalMktVal }
  }, [])

  const dv01ByClass = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of BASE_POSITIONS) {
      map[p.assetClass] = (map[p.assetClass] ?? 0) + p.dv01
    }
    return Object.entries(map).map(([name, dv01]) => ({ name, dv01 }))
  }, [])

  const dv01ChartOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'bar', backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: dv01ByClass.map((d) => d.name),
        labels: { style: { color: '#FFFFFF', fontSize: '10px' } },
        lineWidth: 0,
        tickLength: 0,
      },
      yAxis: {
        title: { text: undefined },
        labels: { enabled: false },
        gridLineWidth: 0,
        lineWidth: 0,
      },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: '#2C2F33',
        borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          return `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>DV01: $${fmtK(Number(this.y))}`
        },
        useHTML: true,
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderWidth: 0,
          pointWidth: 16,
          animation: false,
        },
      },
      series: [
        {
          name: 'DV01',
          type: 'bar',
          data: dv01ByClass.map((d) => ({
            y: d.dv01,
            color: BAR_COLORS[d.name] ?? '#60A5FA',
          })),
        },
      ],
    }),
    [dv01ByClass]
  )

  const selectedPosition = useMemo(
    () => BASE_POSITIONS.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  )

  const pinnedBottom = useMemo<Position[]>(
    () => [
      {
        id: 'TOTAL',
        security: 'TOTAL',
        cusip: '',
        assetClass: '' as AssetClass,
        side: '' as 'LONG',
        size: 0,
        avgPx: 0,
        currPx: 0,
        currYld: 0,
        dv01: totals.totalDV01,
        cs01: totals.totalCS01,
        pnlToday: totals.totalPnlToday,
        pnlMtd: totals.totalPnlMtd,
        pnlYtd: totals.totalPnlYtd,
        mktVal: totals.totalMktVal,
      },
    ],
    [totals]
  )

  const columnDefs = useMemo<ColDef<Position>[]>(
    () => [
      {
        headerName: 'Security',
        field: 'security',
        width: 160,
        pinned: 'left' as const,
        cellRenderer: SecurityRenderer,
        suppressMovable: true,
      },
      {
        headerName: 'Class',
        field: 'assetClass',
        width: 82,
        cellRenderer: ClassRenderer,
      },
      {
        headerName: 'Side',
        field: 'side',
        width: 78,
        cellRenderer: PosSideRenderer,
      },
      {
        headerName: 'Size',
        field: 'size',
        width: 78,
        type: 'rightAligned',
        cellClass: 'font-mono',
        valueFormatter: (p) => (p.data ? fmtPosSize(p.data) : ''),
      },
      {
        headerName: 'Avg Px',
        field: 'avgPx',
        width: 72,
        type: 'rightAligned',
        cellClass: 'font-mono',
        valueFormatter: (p) => (p.value ? (p.value as number).toFixed(3) : ''),
      },
      {
        headerName: 'Curr Px',
        field: 'currPx',
        width: 72,
        type: 'rightAligned',
        cellClass: 'font-mono',
        valueFormatter: (p) => (p.value ? (p.value as number).toFixed(3) : ''),
      },
      {
        headerName: 'Curr Yld',
        field: 'currYld',
        width: 76,
        type: 'rightAligned',
        cellClass: 'font-mono',
        valueFormatter: (p) => (p.value ? (p.value as number).toFixed(3) + '%' : ''),
      },
      {
        headerName: 'DV01',
        field: 'dv01',
        width: 76,
        type: 'rightAligned',
        cellClass: 'font-mono',
        valueFormatter: (p) => (p.value != null ? '$' + Math.abs(p.value as number).toLocaleString() : ''),
      },
      {
        headerName: 'CS01',
        field: 'cs01',
        width: 72,
        type: 'rightAligned',
        cellClass: 'font-mono',
        valueFormatter: (p) => (p.value != null ? '$' + Math.abs(p.value as number).toLocaleString() : ''),
      },
      {
        headerName: 'P&L Today',
        field: 'pnlToday',
        width: 90,
        type: 'rightAligned',
        cellRenderer: PnlCellRenderer,
      },
      {
        headerName: 'P&L MTD',
        field: 'pnlMtd',
        width: 88,
        type: 'rightAligned',
        cellRenderer: PnlCellRenderer,
      },
      {
        headerName: 'P&L YTD',
        field: 'pnlYtd',
        width: 88,
        type: 'rightAligned',
        cellRenderer: PnlCellRenderer,
      },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({ sortable: true, resizable: true, suppressHeaderMenuButton: true }),
    []
  )

  const onRowClicked = useCallback(
    (e: { data: Position | undefined }) => {
      if (e.data && e.data.id !== 'TOTAL') setSelectedId(e.data.id)
    },
    []
  )

  const getRowClass = useCallback(
    (params: RowClassParams<Position>) =>
      params.data?.id === 'TOTAL' ? 'font-semibold' : undefined,
    []
  )

  return (
    <PanelGrid layouts={GRID_LAYOUTS}>
      {/* KPI Row */}
      <div key="kpi" className="relative">
        <DragHandle />
        <div className="grid grid-cols-6 gap-2 h-full">
          <KpiCard label="P&L Today" value={fmtPnL(totals.totalPnlToday)} colored />
          <KpiCard label="P&L MTD" value={fmtPnL(totals.totalPnlMtd)} colored />
          <KpiCard label="P&L YTD" value={fmtPnL(totals.totalPnlYtd)} colored />
          <KpiCard label="Net DV01" value={'$' + fmtK(totals.totalDV01)} />
          <KpiCard label="Net CS01" value={'$' + fmtK(totals.totalCS01)} />
          <KpiCard label="Market Value" value={'$' + fmtMktVal(totals.totalMktVal)} />
        </div>
      </div>

      {/* Positions Grid */}
      <div key="grid" className="bg-card border border-border rounded-xl flex flex-col overflow-hidden relative">
        <DragHandle />
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">Positions</span>
          <div className="flex items-center gap-1">
            {FILTERS.map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? 'default' : 'secondary'}
                size="sm"
                className="rounded-full"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <AgGridReact<Position>
            theme={marketsUITheme}
            modules={[AllEnterpriseModule]}
            rowData={filteredPositions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pinnedBottomRowData={pinnedBottom}
            getRowId={(p) => p.data.id}
            onRowClicked={onRowClicked}
            getRowClass={getRowClass}
            rowSelection="single"
            suppressCellFocus
            animateRows={false}
            statusBar={{
              statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
              ],
            }}
          />
        </div>
      </div>

      {/* DV01 by Class Chart */}
      <div key="dv01Chart" className="bg-card border border-border rounded-xl flex flex-col overflow-hidden relative">
        <DragHandle />
        <div className="px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">DV01 by Class</span>
        </div>
        <div className="flex-1 min-h-0 p-2">
          <div style={{ width: '100%', height: '100%' }}>
            <HighchartsReact highcharts={Highcharts} options={dv01ChartOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>
      </div>

      {/* Detail / Attribution Panel */}
      <div key="detail" className="bg-card border border-border rounded-xl flex flex-col overflow-hidden relative">
        <DragHandle />
        <div className="px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">
            {selectedPosition ? selectedPosition.security : 'P&L Attribution'}
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-3">
          {selectedPosition ? (
            <PositionDetail position={selectedPosition} />
          ) : (
            <PnlAttribution positions={BASE_POSITIONS} />
          )}
        </div>
      </div>
    </PanelGrid>
  )
}

export default PositionsPanel
