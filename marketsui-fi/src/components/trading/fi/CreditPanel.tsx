import { useMemo } from 'react'
import type { CorpBond, CDXIndex, CDS } from './marketData'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import { marketsUITheme } from './agGridTheme'
import { PanelGrid, DragHandle } from './PanelGrid'
import type { LayoutItem } from 'react-grid-layout'
import { useMarketData } from './MarketDataContext'
import { cn } from '@/lib/utils'

/* ─── Layouts ────────────────────────────────────────────── */

const layouts: Record<string, LayoutItem[]> = {
  lg: [
    { i: 'corpBonds', x: 0, y: 0, w: 9, h: 19 },
    { i: 'cdxIndices', x: 9, y: 0, w: 3, h: 10 },
    { i: 'cds', x: 0, y: 19, w: 12, h: 9 },
  ],
  md: [
    { i: 'corpBonds', x: 0, y: 0, w: 8, h: 16 },
    { i: 'cdxIndices', x: 8, y: 0, w: 4, h: 10 },
    { i: 'cds', x: 0, y: 16, w: 12, h: 8 },
  ],
  sm: [
    { i: 'corpBonds', x: 0, y: 0, w: 6, h: 14 },
    { i: 'cdxIndices', x: 0, y: 14, w: 6, h: 8 },
    { i: 'cds', x: 0, y: 22, w: 6, h: 8 },
  ],
}

/* ─── Rating Color Helpers ───────────────────────────────── */

type RatingBucket = 'investment-high' | 'investment' | 'investment-low' | 'speculative'

function getRatingBucket(moody: string): RatingBucket {
  if (moody.startsWith('Aaa') || moody.startsWith('Aa')) return 'investment-high'
  if (moody.startsWith('A')) return 'investment'
  if (moody.startsWith('Baa')) return 'investment-low'
  return 'speculative'
}

function getRatingColor(bucket: RatingBucket): string {
  switch (bucket) {
    case 'investment-high':
      return 'var(--buy)'
    case 'investment':
      return 'var(--buy)'
    case 'investment-low':
      return 'var(--warning)'
    case 'speculative':
      return 'var(--sell)'
  }
}

/* ─── Cell Renderers ─────────────────────────────────────── */

function RatingRenderer(params: ICellRendererParams<CorpBond>) {
  if (!params.data) return null
  const bucket = getRatingBucket(params.data.ratingMoody)
  const color = getRatingColor(bucket)
  return (
    <span className="font-mono text-[10px] font-medium" style={{ color }}>
      {params.data.ratingMoody}/{params.data.ratingSP}
    </span>
  )
}

function CdsRatingRenderer(params: ICellRendererParams<CDS>) {
  if (!params.data) return null
  const bucket = getRatingBucket(params.data.ratingMoody)
  const color = getRatingColor(bucket)
  return (
    <span className="font-mono text-[10px] font-medium" style={{ color }}>
      {params.data.ratingMoody}/{params.data.ratingSP}
    </span>
  )
}

function CdsEntityRenderer(params: ICellRendererParams<CDS>) {
  if (!params.data) return null
  return (
    <div className="flex flex-col leading-tight py-0.5">
      <span className="text-[11px] font-medium">{params.data.referenceEntity}</span>
      <span className="text-[9px] text-muted-foreground font-mono">{params.data.ticker}</span>
    </div>
  )
}

/* ─── Bond Column Definitions ────────────────────────────── */

const bondColumnDefs: ColDef<CorpBond>[] = [
  {
    field: 'issuer',
    headerName: 'Issuer',
    width: 130,
    filter: 'agTextColumnFilter',
    cellClass: 'font-medium',
    pinned: 'left',
  },
  {
    field: 'security',
    headerName: 'Security',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'cusip',
    headerName: 'CUSIP',
    width: 88,
    cellClass: 'font-mono text-[10px]',
  },
  {
    field: 'ratingMoody',
    headerName: 'Rating',
    width: 80,
    cellRenderer: RatingRenderer,
  },
  {
    field: 'sector',
    headerName: 'Sector',
    width: 88,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'coupon',
    headerName: 'Cpn',
    width: 68,
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
    width: 78,
    cellClass: 'font-mono font-semibold text-buy',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(3) : ''),
  },
  {
    field: 'askYield',
    headerName: 'Ask Yld',
    width: 78,
    cellClass: 'font-mono text-sell',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(3) : ''),
  },
  {
    field: 'bidPrice',
    headerName: 'Bid Px',
    width: 72,
    cellClass: 'font-mono text-buy',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(2) : ''),
  },
  {
    field: 'askPrice',
    headerName: 'Ask Px',
    width: 72,
    cellClass: 'font-mono text-sell',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(2) : ''),
  },
  {
    field: 'zSpread',
    headerName: 'Z-Spd',
    width: 72,
    cellClass: 'font-mono text-primary',
    valueFormatter: (p) => (p.value != null ? Math.round(p.value).toString() : ''),
  },
  {
    field: 'oas',
    headerName: 'OAS',
    width: 72,
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? Math.round(p.value).toString() : ''),
  },
  {
    field: 'changeBps',
    headerName: 'Chg bps',
    width: 76,
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
    field: 'duration',
    headerName: 'Dur',
    width: 62,
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(2) : ''),
  },
  {
    field: 'dv01PerMM',
    headerName: 'DV01/MM',
    width: 80,
    cellClass: 'font-mono',
    valueFormatter: (p) =>
      p.value != null ? '$' + Math.round(p.value).toLocaleString() : '',
  },
]

/* ─── CDX Column Definitions ─────────────────────────────── */

const cdxColumnDefs: ColDef<CDXIndex>[] = [
  {
    field: 'name',
    headerName: 'Index',
    width: 120,
    cellClass: 'font-medium',
  },
  {
    field: 'series',
    headerName: 'Ser',
    width: 56,
    cellClass: 'font-mono',
  },
  {
    field: 'tenor',
    headerName: 'Tenor',
    width: 60,
  },
  {
    field: 'bidSpread',
    headerName: 'Bid',
    width: 68,
    cellClass: 'font-mono font-semibold text-buy',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(1) : ''),
  },
  {
    field: 'askSpread',
    headerName: 'Ask',
    width: 68,
    cellClass: 'font-mono text-sell',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(1) : ''),
  },
  {
    field: 'midSpread',
    headerName: 'Mid',
    width: 68,
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(1) : ''),
  },
  {
    field: 'changeBps',
    headerName: 'Chg',
    width: 60,
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
    field: 'spreadDuration',
    headerName: 'Spd Dur',
    width: 74,
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(2) : ''),
  },
]

/* ─── CDS Column Definitions ─────────────────────────────── */

const cdsColumnDefs: ColDef<CDS>[] = [
  {
    field: 'referenceEntity',
    headerName: 'Reference Entity',
    width: 170,
    cellRenderer: CdsEntityRenderer,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'ratingMoody',
    headerName: 'Rating',
    width: 80,
    cellRenderer: CdsRatingRenderer,
  },
  {
    field: 'sector',
    headerName: 'Sector',
    width: 88,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'bidSpread',
    headerName: 'Bid',
    width: 72,
    cellClass: 'font-mono font-semibold text-buy',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(1) : ''),
  },
  {
    field: 'askSpread',
    headerName: 'Ask',
    width: 72,
    cellClass: 'font-mono text-sell',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(1) : ''),
  },
  {
    field: 'midSpread',
    headerName: 'Mid',
    width: 72,
    cellClass: 'font-mono',
    valueFormatter: (p) => (p.value != null ? p.value.toFixed(1) : ''),
  },
  {
    field: 'changeBps',
    headerName: 'Chg bps',
    width: 72,
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
]

/* ─── Main Component ─────────────────────────────────────── */

export function CreditPanel() {
  const { corpBonds, cdxIndices, cdsNames } = useMarketData()

  const igBonds = useMemo(() => corpBonds.filter((b) => !b.isHY), [corpBonds])
  const hyBonds = useMemo(() => corpBonds.filter((b) => b.isHY), [corpBonds])

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
      {/* Corporate Bonds Grid */}
      <div key="corpBonds" className="bg-card rounded-xl border border-border overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold">Corporate Bonds</span>
          <span className="text-[10px] text-muted-foreground">
            {corpBonds.length} bonds
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <span
              className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                'bg-secondary text-muted-foreground',
              )}
            >
              IG {igBonds.length}
            </span>
            <span
              className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                'bg-secondary text-muted-foreground',
              )}
            >
              HY {hyBonds.length}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <AgGridReact<CorpBond>
            theme={marketsUITheme}
            modules={[AllEnterpriseModule]}
            rowData={corpBonds}
            columnDefs={bondColumnDefs}
            defaultColDef={defaultColDef}
            getRowId={(params) => params.data.cusip}
            animateRows={false}
            suppressCellFocus
            rowClassRules={{
              'bg-sell/5': (params) => params.data?.isHY === true,
            }}
          />
        </div>
      </div>

      {/* CDX Indices */}
      <div key="cdxIndices" className="bg-card rounded-xl border border-border overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold">CDX Indices</span>
          <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
            {cdxIndices.length}
          </span>
        </div>
        <div className="flex-1">
          <AgGridReact<CDXIndex>
            theme={marketsUITheme}
            modules={[AllEnterpriseModule]}
            rowData={cdxIndices}
            columnDefs={cdxColumnDefs}
            defaultColDef={defaultColDef}
            getRowId={(params) => `${params.data.name}-${params.data.series}-${params.data.tenor}`}
            animateRows={false}
            suppressCellFocus
          />
        </div>
      </div>

      {/* Single-Name CDS */}
      <div key="cds" className="bg-card rounded-xl border border-border overflow-hidden relative flex flex-col">
        <DragHandle />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold">Single-Name CDS</span>
          <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
            {cdsNames.length}
          </span>
        </div>
        <div className="flex-1">
          <AgGridReact<CDS>
            theme={marketsUITheme}
            modules={[AllEnterpriseModule]}
            rowData={cdsNames}
            columnDefs={cdsColumnDefs}
            defaultColDef={defaultColDef}
            getRowId={(params) => params.data.ticker}
            animateRows={false}
            suppressCellFocus
          />
        </div>
      </div>
    </PanelGrid>
  )
}
