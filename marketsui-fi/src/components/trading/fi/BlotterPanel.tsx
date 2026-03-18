import { useState, useMemo, useCallback } from 'react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { marketsUITheme } from './agGridTheme'
import { PanelGrid, DragHandle } from './PanelGrid'
import { OrderTicket } from './OrderTicket'
import { BASE_ORDERS } from './marketData'
import type { Order, OrderStatus } from './marketData'

/* ── Constants ──────────────────────────────────────────── */

type FilterStatus = 'All' | OrderStatus
const STATUS_FILTERS: FilterStatus[] = ['All', 'Working', 'Partial', 'Filled', 'Cancelled']

const STATUS_STYLE: Record<OrderStatus, string> = {
  Filled: 'bg-buy/10 text-buy',
  Working: 'bg-primary/10 text-primary',
  Partial: 'bg-warning/10 text-warning',
  Cancelled: 'bg-muted text-muted-foreground',
}

/* ── Cell Renderers ─────────────────────────────────────── */

function BlotterSecurityRenderer(params: ICellRendererParams<Order>) {
  const d = params.data
  if (!d) return null
  return (
    <div className="flex flex-col leading-tight py-1">
      <span className="text-[11px] font-medium text-foreground truncate">{d.security}</span>
      <span className="text-[9px] text-muted-foreground font-mono">{d.cusip}</span>
    </div>
  )
}

function BlotterSideRenderer(params: ICellRendererParams<Order>) {
  const d = params.data
  if (!d) return null
  const isBuy = d.side === 'BUY'
  return (
    <div className="flex items-center h-full">
      <span
        className={cn(
          'inline-flex items-center justify-center min-w-[3.25rem] px-3.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide leading-none',
          isBuy ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'
        )}
        style={{ height: '20px' }}
      >
        {d.side}
      </span>
    </div>
  )
}

function BlotterStatusRenderer(params: ICellRendererParams<Order>) {
  const d = params.data
  if (!d) return null
  return (
    <div className="flex items-center h-full">
      <span
        className={cn(
          'inline-flex items-center justify-center px-3 rounded-full text-[10px] font-semibold leading-none',
          STATUS_STYLE[d.status]
        )}
        style={{ height: '20px' }}
      >
        {d.status}
      </span>
    </div>
  )
}

function BlotterFillBarRenderer(params: ICellRendererParams<Order>) {
  const d = params.data
  if (!d || d.sizeMM === 0) return null
  const pct = Math.round((d.filled / d.sizeMM) * 100)
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct >= 100 ? 'bg-buy' : pct > 0 ? 'bg-warning' : 'bg-muted-foreground/20'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  )
}

/* ── Grid Layouts ───────────────────────────────────────── */

const GRID_LAYOUTS = {
  lg: [
    { i: 'blotter', x: 0, y: 0, w: 9, h: 19 },
    { i: 'detail', x: 9, y: 0, w: 3, h: 19 },
  ],
  md: [
    { i: 'blotter', x: 0, y: 0, w: 9, h: 19 },
    { i: 'detail', x: 9, y: 0, w: 3, h: 19 },
  ],
  sm: [
    { i: 'blotter', x: 0, y: 0, w: 6, h: 14 },
    { i: 'detail', x: 0, y: 14, w: 6, h: 8 },
  ],
}

/* ── Detail helpers ─────────────────────────────────────── */

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        {title}
      </span>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono,
  className,
}: {
  label: string
  value: string
  mono?: boolean
  className?: string
}) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('text-foreground', mono && 'font-mono', className)}>{value}</span>
    </div>
  )
}

/* ── Order Detail ───────────────────────────────────────── */

function OrderDetail({ order }: { order: Order }) {
  const isBuy = order.side === 'BUY'
  const fillPct = order.sizeMM > 0 ? Math.round((order.filled / order.sizeMM) * 100) : 0

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Colored header */}
      <div
        className={cn(
          'px-4 py-3 border-b border-border',
          isBuy ? 'bg-buy/5' : 'bg-sell/5'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground">{order.security}</span>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
              isBuy ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'
            )}
          >
            {order.side}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{order.orderId}</span>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <DetailSection title="Order Details">
          <DetailRow label="CUSIP" value={order.cusip} mono />
          <DetailRow
            label="Side"
            value={order.side}
            className={isBuy ? 'text-buy' : 'text-sell'}
          />
          <DetailRow label="Time" value={order.time} mono />
          <DetailRow label="Account" value={order.account} mono />
        </DetailSection>

        <DetailSection title="Execution">
          <DetailRow label="Limit Yield" value={order.lmtYield.toFixed(3) + '%'} mono />
          <DetailRow label="Limit Price" value={order.lmtPrice.toFixed(3)} mono />
          <DetailRow label="Filled" value={`${order.filled} / ${order.sizeMM} MM`} mono />
          <DetailRow
            label="Avg Yield"
            value={order.avgYield > 0 ? order.avgYield.toFixed(3) + '%' : '\u2014'}
            mono
          />
          <DetailRow
            label="Avg Price"
            value={order.avgPrice > 0 ? order.avgPrice.toFixed(3) : '\u2014'}
            mono
          />
          <div className="mt-1">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Fill Progress</span>
              <span className="font-mono text-foreground">{fillPct}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  fillPct >= 100 ? 'bg-buy' : fillPct > 0 ? 'bg-warning' : 'bg-muted-foreground/20'
                )}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Settlement">
          <DetailRow label="Counterparty" value={order.counterparty || '\u2014'} />
          <DetailRow label="Venue" value={order.venue} />
          <DetailRow label="Trader" value={order.trader} />
          <DetailRow label="Settle Date" value={order.settleDate} mono />
        </DetailSection>

        <div className="flex items-center justify-center pt-1">
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold',
              STATUS_STYLE[order.status]
            )}
          >
            {order.status}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────── */

export function BlotterPanel() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [ticketOpen, setTicketOpen] = useState(false)

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: BASE_ORDERS.length }
    for (const o of BASE_ORDERS) {
      counts[o.status] = (counts[o.status] ?? 0) + 1
    }
    return counts
  }, [])

  const filteredOrders = useMemo(
    () =>
      statusFilter === 'All'
        ? BASE_ORDERS
        : BASE_ORDERS.filter((o) => o.status === statusFilter),
    [statusFilter]
  )

  const selectedOrder = useMemo(
    () => BASE_ORDERS.find((o) => o.orderId === selectedId) ?? null,
    [selectedId]
  )

  const columnDefs = useMemo<ColDef<Order>[]>(
    () => [
      {
        headerName: 'Order ID',
        field: 'orderId',
        width: 90,
        cellClass: 'font-mono text-muted-foreground text-[10px]',
        valueFormatter: (p) => p.value ? (p.value as string).replace('FI-20260317-', '#') : '',
      },
      {
        headerName: 'Time',
        field: 'time',
        width: 68,
        cellClass: 'font-mono',
      },
      {
        headerName: 'Security',
        field: 'security',
        width: 160,
        cellRenderer: BlotterSecurityRenderer,
      },
      {
        headerName: 'Side',
        field: 'side',
        width: 82,
        cellRenderer: BlotterSideRenderer,
      },
      {
        headerName: 'Size $MM',
        field: 'sizeMM',
        width: 80,
        cellClass: 'font-mono',
        valueFormatter: (p) => p.value != null ? `$${p.value}` : '',
      },
      {
        headerName: 'Lmt Yield',
        field: 'lmtYield',
        width: 80,
        cellClass: 'font-mono',
        valueFormatter: (p) => p.value ? (p.value as number).toFixed(3) + '%' : '',
      },
      {
        headerName: 'Lmt Price',
        field: 'lmtPrice',
        width: 78,
        cellClass: 'font-mono',
        valueFormatter: (p) => p.value ? (p.value as number).toFixed(3) : '',
      },
      {
        headerName: 'Filled',
        field: 'filled',
        width: 66,
        cellClass: 'font-mono',
        valueFormatter: (p) => {
          const d = p.data
          if (!d) return ''
          return `${d.filled}/${d.sizeMM}`
        },
      },
      {
        headerName: 'Fill %',
        colId: 'fillPct',
        width: 100,
        cellRenderer: BlotterFillBarRenderer,
      },
      {
        headerName: 'Avg Yield',
        field: 'avgYield',
        width: 82,
        cellClass: 'font-mono',
        valueFormatter: (p) => {
          const v = p.value as number
          return v > 0 ? v.toFixed(3) + '%' : '\u2014'
        },
      },
      {
        headerName: 'Venue',
        field: 'venue',
        width: 100,
      },
      {
        headerName: 'Cpty',
        field: 'counterparty',
        width: 110,
        valueFormatter: (p) => (p.value as string) || '\u2014',
      },
      {
        headerName: 'Account',
        field: 'account',
        width: 88,
        cellClass: 'font-mono text-[10px]',
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 90,
        cellRenderer: BlotterStatusRenderer,
      },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({ sortable: true, resizable: true, suppressHeaderMenuButton: true }),
    []
  )

  const onRowClicked = useCallback(
    (e: { data: Order | undefined }) => {
      if (e.data) setSelectedId(e.data.orderId)
    },
    []
  )

  return (
    <>
      <PanelGrid layouts={GRID_LAYOUTS}>
        {/* Blotter Grid */}
        <div key="blotter" className="bg-card border border-border rounded-xl flex flex-col overflow-hidden relative">
          <DragHandle />
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Order Blotter</span>
              <div className="flex items-center gap-1">
                {STATUS_FILTERS.map((s) => (
                  <Button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    variant={statusFilter === s ? 'default' : 'secondary'}
                    size="sm"
                    className="rounded-full"
                  >
                    {s} {statusCounts[s] ?? 0}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setTicketOpen(true)}
              size="sm"
              className="rounded-full"
            >
              <Plus className="w-3 h-3" />
              New Order
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <AgGridReact<Order>
              theme={marketsUITheme}
              modules={[AllEnterpriseModule]}
              rowData={filteredOrders}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowId={(p) => p.data.orderId}
              onRowClicked={onRowClicked}
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

        {/* Detail Sidebar */}
        <div key="detail" className="bg-card border border-border rounded-xl flex flex-col overflow-hidden relative">
          <DragHandle />
          {selectedOrder ? (
            <OrderDetail order={selectedOrder} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
              Select an order to view details
            </div>
          )}
        </div>
      </PanelGrid>

      <OrderTicket open={ticketOpen} onClose={() => setTicketOpen(false)} />
    </>
  )
}

export default BlotterPanel
