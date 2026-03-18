import { useMemo } from 'react'
import type { ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import { marketsUITheme } from './agGridTheme'
import { PanelGrid, DragHandle } from './PanelGrid'
import { useMarketData } from './MarketDataContext'
import { fmtK } from '@/lib/utils'
import type { TreasuryFuture, SOFRFuture } from './marketData'

/* ── 32nds conversion ──────────────────────────────────────── */
function priceTo32nds(price: number): string {
  const whole = Math.floor(price)
  const frac = price - whole
  const t32 = frac * 32
  const t32Int = Math.floor(t32)
  const remainder = t32 - t32Int
  const suffix = remainder >= 0.5 ? '+' : ''
  return `${whole}-${String(t32Int).padStart(2, '0')}${suffix}`
}

/* ── Extended row types (augmented for display) ────────────── */
interface TreasuryFutureRow extends TreasuryFuture {
  bid: number
  ask: number
  settle: number
  high: number
  low: number
  dv01PerContract: number
}

interface SOFRFutureRow extends SOFRFuture {
  contract: string
  openInterest: number
}

/* ── Seed extended data from base types ────────────────────── */
function augmentTreasuryFutures(futures: TreasuryFuture[]): TreasuryFutureRow[] {
  return futures.map((f) => {
    const spread = 0.015625 // 1/2 tick
    return {
      ...f,
      bid: +(f.lastPrice - spread).toFixed(6),
      ask: +(f.lastPrice + spread).toFixed(6),
      settle: +(f.lastPrice - f.change).toFixed(6),
      high: +(f.lastPrice + Math.abs(f.change) * 0.8).toFixed(6),
      low: +(f.lastPrice - Math.abs(f.change) * 1.2).toFixed(6),
      dv01PerContract: +(f.lastPrice * 0.06 + 2).toFixed(2),
    }
  })
}

function augmentSOFRFutures(futures: SOFRFuture[]): SOFRFutureRow[] {
  return futures.map((f, i) => ({
    ...f,
    contract: f.description || f.symbol,
    openInterest: Math.round(80000 + i * 12000 + Math.random() * 5000),
  }))
}

/* ── Layouts ───────────────────────────────────────────────── */
const layouts = {
  lg: [
    { i: 'tGrid', x: 0, y: 0, w: 9, h: 12 },
    { i: 'fwdCurve', x: 9, y: 0, w: 3, h: 12 },
    { i: 'sofrGrid', x: 0, y: 12, w: 12, h: 7 },
  ],
  md: [
    { i: 'tGrid', x: 0, y: 0, w: 9, h: 12 },
    { i: 'fwdCurve', x: 9, y: 0, w: 3, h: 12 },
    { i: 'sofrGrid', x: 0, y: 12, w: 12, h: 7 },
  ],
  sm: [
    { i: 'tGrid', x: 0, y: 0, w: 6, h: 12 },
    { i: 'fwdCurve', x: 0, y: 12, w: 6, h: 10 },
    { i: 'sofrGrid', x: 0, y: 22, w: 6, h: 7 },
  ],
}

/* ── Column definitions ────────────────────────────────────── */
function useTreasuryColDefs(): ColDef<TreasuryFutureRow>[] {
  return useMemo(
    () => [
      {
        field: 'symbol',
        headerName: 'Symbol',
        width: 64,
        cellRenderer: (p: { value: string }) => (
          <span className="font-mono text-primary">{p.value}</span>
        ),
      },
      { field: 'description', headerName: 'Desc', flex: 1, minWidth: 100 },
      {
        field: 'bid',
        headerName: 'Bid',
        width: 72,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) => p.value?.toFixed(3) ?? '',
        cellClass: 'text-buy',
      },
      {
        field: 'ask',
        headerName: 'Ask',
        width: 72,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) => p.value?.toFixed(3) ?? '',
        cellClass: 'text-sell',
      },
      {
        field: 'lastPrice',
        headerName: 'Last',
        width: 72,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) => p.value?.toFixed(3) ?? '',
        cellClass: 'font-semibold',
      },
      {
        headerName: '32nds',
        width: 72,
        type: 'rightAligned',
        valueGetter: (p: { data: TreasuryFutureRow | undefined }) =>
          p.data ? priceTo32nds(p.data.lastPrice) : '',
        cellRenderer: (p: { value: string }) => (
          <span className="text-muted-foreground font-mono">{p.value}</span>
        ),
      },
      {
        field: 'change',
        headerName: 'Chg',
        width: 68,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) =>
          p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(3) : '',
        cellRenderer: (p: { value: number; valueFormatted: string }) => (
          <span className={p.value >= 0 ? 'text-buy' : 'text-sell'}>
            {p.valueFormatted}
          </span>
        ),
      },
      {
        field: 'settle',
        headerName: 'Settle',
        width: 72,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) => p.value?.toFixed(3) ?? '',
      },
      {
        field: 'high',
        headerName: 'High',
        width: 68,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) => p.value?.toFixed(3) ?? '',
      },
      {
        field: 'low',
        headerName: 'Low',
        width: 68,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) => p.value?.toFixed(3) ?? '',
      },
      {
        field: 'dv01PerContract',
        headerName: 'DV01/ct',
        width: 72,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) =>
          p.value != null ? '$' + p.value.toFixed(2) : '',
      },
      {
        field: 'openInterest',
        headerName: 'Open Int',
        width: 78,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) =>
          p.value != null ? fmtK(p.value) : '',
      },
      {
        field: 'volume',
        headerName: 'Volume',
        width: 72,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) =>
          p.value != null ? fmtK(p.value) : '',
      },
    ],
    []
  )
}

function useSOFRColDefs(): ColDef<SOFRFutureRow>[] {
  return useMemo(
    () => [
      { field: 'contract', headerName: 'Contract', flex: 1, minWidth: 120 },
      {
        field: 'symbol',
        headerName: 'Symbol',
        width: 80,
      },
      {
        field: 'price',
        headerName: 'Price',
        width: 90,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) => p.value?.toFixed(4) ?? '',
        cellClass: 'font-mono',
      },
      {
        field: 'change',
        headerName: 'Chg',
        width: 72,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) =>
          p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(4) : '',
        cellRenderer: (p: { value: number; valueFormatted: string }) => (
          <span className={p.value >= 0 ? 'text-buy' : 'text-sell'}>
            {p.valueFormatted}
          </span>
        ),
      },
      {
        field: 'impliedRate',
        headerName: 'Impl Rate',
        width: 90,
        type: 'rightAligned',
        cellRenderer: (p: { value: number }) => (
          <span className={p.value != null ? (p.value >= 4 ? 'text-sell' : 'text-buy') : ''}>
            {p.value != null ? p.value.toFixed(3) + '%' : ''}
          </span>
        ),
      },
      {
        field: 'volume',
        headerName: 'Volume',
        width: 80,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) =>
          p.value != null ? fmtK(p.value) : '',
      },
      {
        field: 'openInterest',
        headerName: 'Open Int',
        width: 90,
        type: 'rightAligned',
        valueFormatter: (p: { value: number }) =>
          p.value != null ? fmtK(p.value) : '',
      },
    ],
    []
  )
}

/* ── Component ─────────────────────────────────────────────── */
export function FuturesPanel() {
  const data = useMarketData()

  const tRows = useMemo(() => augmentTreasuryFutures(data.tFutures), [data.tFutures])
  const sofrRows = useMemo(() => augmentSOFRFutures(data.sofrFutures), [data.sofrFutures])

  const tColDefs = useTreasuryColDefs()
  const sofrColDefs = useSOFRColDefs()

  /* Forward curve chart data */
  const curveData = useMemo(
    () =>
      sofrRows.map((r) => ({
        contract: r.symbol,
        rate: r.impliedRate,
      })),
    [sofrRows]
  )

  const nearest = curveData.length > 0 ? curveData[0].rate : 0
  const farthest = curveData.length > 0 ? curveData[curveData.length - 1].rate : 0
  const steepness = Math.abs(farthest - nearest) * 100 // bps

  const fwdCurveOptions = useMemo<Highcharts.Options>(
    () => ({
      chart: { backgroundColor: 'transparent', style: { fontFamily: "'Inter', sans-serif" }, height: null as unknown as number },
      credits: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: curveData.map((d) => d.contract),
        labels: { style: { color: '#9DA0A5', fontSize: '9px' }, step: Math.max(1, Math.floor(curveData.length / 6)) },
        lineColor: '#2C2F33',
        tickLength: 0,
      },
      yAxis: {
        title: { text: undefined },
        labels: { format: '{value:.2f}%', style: { color: '#9DA0A5', fontSize: '9px' } },
        gridLineColor: '#2C2F33',
        gridLineDashStyle: 'ShortDash',
        lineColor: '#2C2F33',
        lineWidth: 0,
      },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#1A1D21',
        borderColor: '#2C2F33',
        borderRadius: 8,
        style: { color: '#FFFFFF', fontSize: '11px', fontFamily: "'Inter', sans-serif" },
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          return `<span style="color:#9DA0A5;font-size:10px">${this.x}</span><br/>Implied Rate: ${Number(this.y).toFixed(3)}%`
        },
        useHTML: true,
      },
      plotOptions: {
        series: { animation: false },
      },
      series: [
        {
          name: 'Implied Rate',
          type: 'spline',
          data: curveData.map((d) => d.rate),
          color: '#60A5FA',
          lineWidth: 2,
          marker: { enabled: true, radius: 3, fillColor: '#60A5FA', lineColor: '#60A5FA', lineWidth: 0, symbol: 'circle' },
        },
      ],
    }),
    [curveData]
  )

  return (
    <PanelGrid layouts={layouts}>
      {/* ── Treasury Futures Grid ────────────────────────────── */}
      <div key="tGrid" className="bg-card border border-border rounded-xl overflow-hidden relative">
        <DragHandle />
        <div className="px-3 pt-2 pb-1">
          <h3 className="text-xs font-semibold text-foreground">Treasury Futures</h3>
        </div>
        <div className="h-[calc(100%-32px)]">
          <AgGridReact<TreasuryFutureRow>
            theme={marketsUITheme}
            modules={[AllEnterpriseModule]}
            rowData={tRows}
            columnDefs={tColDefs}
            headerHeight={30}
            rowHeight={32}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </div>

      {/* ── SOFR Forward Curve Chart ─────────────────────────── */}
      <div key="fwdCurve" className="bg-card border border-border rounded-xl overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="px-3 pt-2 pb-1">
          <h3 className="text-xs font-semibold text-foreground">SOFR Forward Curve</h3>
        </div>
        <div className="flex-1 min-h-0 px-2">
          <div style={{ width: '100%', height: '100%' }}>
            <HighchartsReact highcharts={Highcharts} options={fwdCurveOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>
        {/* Stats row */}
        <div className="flex items-center justify-between px-3 pb-2 text-[10px] text-muted-foreground">
          <span>
            Nearest: <span className="text-foreground font-medium">{nearest.toFixed(3)}%</span>
          </span>
          <span>
            Farthest: <span className="text-foreground font-medium">{farthest.toFixed(3)}%</span>
          </span>
          <span>
            Steepness: <span className="text-foreground font-medium">{steepness.toFixed(1)} bps</span>
          </span>
        </div>
      </div>

      {/* ── SOFR Futures Grid ────────────────────────────────── */}
      <div key="sofrGrid" className="bg-card border border-border rounded-xl overflow-hidden relative">
        <DragHandle />
        <div className="px-3 pt-2 pb-1">
          <h3 className="text-xs font-semibold text-foreground">SOFR Futures</h3>
        </div>
        <div className="h-[calc(100%-32px)]">
          <AgGridReact<SOFRFutureRow>
            theme={marketsUITheme}
            modules={[AllEnterpriseModule]}
            rowData={sofrRows}
            columnDefs={sofrColDefs}
            headerHeight={30}
            rowHeight={32}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </div>
    </PanelGrid>
  )
}

export default FuturesPanel
