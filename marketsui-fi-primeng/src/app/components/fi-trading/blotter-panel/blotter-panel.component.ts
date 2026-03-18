import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise';
import { ButtonModule } from 'primeng/button';
import { MarketDataService } from '../../../services/market-data.service';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import { OrderTicketComponent } from '../order-ticket/order-ticket.component';
import type { Order, OrderStatus } from '../../../models/market-data.models';

ModuleRegistry.registerModules([AllEnterpriseModule]);

/* ── Constants ────────────────────────────────────────────── */

type FilterStatus = 'All' | OrderStatus;
const STATUS_FILTERS: FilterStatus[] = ['All', 'Working', 'Partial', 'Filled', 'Cancelled'];

const STATUS_STYLE: Record<OrderStatus, string> = {
  Filled: 'bg-buy/10 text-buy',
  Working: 'bg-primary/10 text-primary',
  Partial: 'bg-warning/10 text-warning',
  Cancelled: 'bg-muted text-muted-foreground',
};

@Component({
  selector: 'app-blotter-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AgGridAngular, ButtonModule, OrderTicketComponent],
  template: `
    <div class="grid grid-cols-12 gap-3">
      <!-- Blotter Grid -->
      <div class="col-span-9 bg-card border border-border rounded-xl flex flex-col overflow-hidden" style="height: 620px">
        <div class="flex items-center justify-between px-3 py-2 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-foreground">Order Blotter</span>
            <div class="flex items-center gap-1">
              @for (s of statusFilters; track s) {
                <p-button
                  [label]="s + ' ' + (statusCounts()[s] ?? 0)"
                  [severity]="statusFilter() === s ? 'primary' : 'secondary'"
                  [rounded]="true"
                  size="small"
                  (click)="statusFilter.set(s)"
                />
              }
            </div>
          </div>
          <p-button
            label="New Order"
            icon="pi pi-plus"
            [rounded]="true"
            size="small"
            (click)="ticketOpen.set(true)"
          />
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="filteredOrders()"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [getRowId]="getRowId"
            (rowClicked)="onRowClicked($event)"
            [rowSelection]="'single'"
            [suppressCellFocus]="true"
            [animateRows]="false"
          />
        </div>
      </div>

      <!-- Detail Sidebar -->
      <div class="col-span-3 bg-card border border-border rounded-xl flex flex-col overflow-hidden" style="height: 620px">
        @if (selectedOrder(); as order) {
          <!-- Colored header -->
          <div class="px-4 py-3 border-b border-border" [class]="order.side === 'BUY' ? 'bg-buy/5' : 'bg-sell/5'">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-semibold text-foreground">{{ order.security }}</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                [class]="order.side === 'BUY' ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'"
              >{{ order.side }}</span>
            </div>
            <span class="text-[10px] text-muted-foreground font-mono">{{ order.orderId }}</span>
          </div>

          <div class="p-4 flex flex-col gap-4 overflow-auto flex-1">
            <!-- Order Details -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Order Details</span>
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">CUSIP</span>
                  <span class="text-foreground font-mono">{{ order.cusip }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Side</span>
                  <span [class]="order.side === 'BUY' ? 'text-buy' : 'text-sell'">{{ order.side }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Time</span>
                  <span class="text-foreground font-mono">{{ order.time }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Account</span>
                  <span class="text-foreground font-mono">{{ order.account }}</span>
                </div>
              </div>
            </div>

            <!-- Execution -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Execution</span>
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Limit Yield</span>
                  <span class="text-foreground font-mono">{{ order.lmtYield.toFixed(3) }}%</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Limit Price</span>
                  <span class="text-foreground font-mono">{{ order.lmtPrice.toFixed(3) }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Filled</span>
                  <span class="text-foreground font-mono">{{ order.filled }} / {{ order.sizeMM }} MM</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Avg Yield</span>
                  <span class="text-foreground font-mono">{{ order.avgYield > 0 ? order.avgYield.toFixed(3) + '%' : '\u2014' }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Avg Price</span>
                  <span class="text-foreground font-mono">{{ order.avgPrice > 0 ? order.avgPrice.toFixed(3) : '\u2014' }}</span>
                </div>
                <!-- Fill Progress bar -->
                <div class="mt-1">
                  <div class="flex items-center justify-between text-[10px] mb-1">
                    <span class="text-muted-foreground">Fill Progress</span>
                    <span class="font-mono text-foreground">{{ fillPct() }}%</span>
                  </div>
                  <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      [class]="fillPct() >= 100 ? 'bg-buy' : fillPct() > 0 ? 'bg-warning' : 'bg-muted-foreground/20'"
                      [style.width.%]="fillPct()"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Settlement -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Settlement</span>
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Counterparty</span>
                  <span class="text-foreground">{{ order.counterparty || '\u2014' }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Venue</span>
                  <span class="text-foreground">{{ order.venue }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Trader</span>
                  <span class="text-foreground">{{ order.trader }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Settle Date</span>
                  <span class="text-foreground font-mono">{{ order.settleDate }}</span>
                </div>
              </div>
            </div>

            <!-- Status badge -->
            <div class="flex items-center justify-center pt-1">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold"
                [class]="statusStyle[order.status]"
              >{{ order.status }}</span>
            </div>
          </div>
        } @else {
          <div class="flex-1 flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
            Select an order to view details
          </div>
        }
      </div>
    </div>

    <app-order-ticket [open]="ticketOpen()" (closed)="ticketOpen.set(false)" />
  `,
})
export class BlotterPanelComponent {
  private readonly mds = inject(MarketDataService);
  protected readonly theme = marketsUITheme;
  protected readonly statusFilters = STATUS_FILTERS;
  protected readonly statusStyle = STATUS_STYLE;

  /* ── State ──────────────────────────────────────────────── */
  protected readonly statusFilter = signal<FilterStatus>('All');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly ticketOpen = signal(false);

  /* ── Computed ───────────────────────────────────────────── */
  protected readonly statusCounts = computed(() => {
    const orders = this.mds.orders;
    const counts: Record<string, number> = { All: orders.length };
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  });

  protected readonly filteredOrders = computed(() => {
    const f = this.statusFilter();
    return f === 'All' ? [...this.mds.orders] : this.mds.orders.filter(o => o.status === f);
  });

  protected readonly selectedOrder = computed(() =>
    this.mds.orders.find(o => o.orderId === this.selectedId()) ?? null
  );

  protected readonly fillPct = computed(() => {
    const order = this.selectedOrder();
    if (!order || order.sizeMM === 0) return 0;
    return Math.round((order.filled / order.sizeMM) * 100);
  });

  /* ── AG Grid config ─────────────────────────────────────── */
  protected readonly defaultColDef: ColDef = { sortable: true, resizable: true, suppressHeaderMenuButton: true };
  protected readonly getRowId = (p: any) => p.data.orderId;

  protected onRowClicked(e: any): void {
    if (e.data) this.selectedId.set(e.data.orderId);
  }

  protected readonly columnDefs: ColDef<Order>[] = [
    {
      headerName: 'Order ID', field: 'orderId', width: 90,
      cellClass: 'font-mono text-muted-foreground text-[10px]',
      valueFormatter: p => p.value ? (p.value as string).replace('FI-20260317-', '#') : '',
    },
    { headerName: 'Time', field: 'time', width: 68, cellClass: 'font-mono' },
    {
      headerName: 'Security', field: 'security', width: 160,
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        return `<div class="flex flex-col leading-tight py-1">
          <span class="text-[11px] font-medium text-foreground truncate">${p.data.security}</span>
          <span class="text-[9px] text-muted-foreground font-mono">${p.data.cusip}</span>
        </div>`;
      },
    },
    {
      headerName: 'Side', field: 'side', width: 82,
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const isBuy = p.data.side === 'BUY';
        const cls = isBuy ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell';
        return `<div class="flex items-center h-full">
          <span class="inline-flex items-center justify-center min-w-[3.25rem] px-3.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide leading-none ${cls}" style="height:20px">${p.data.side}</span>
        </div>`;
      },
    },
    {
      headerName: 'Size $MM', field: 'sizeMM', width: 80, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value != null ? '$' + p.value : '',
    },
    {
      headerName: 'Lmt Yield', field: 'lmtYield', width: 80, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value ? (p.value as number).toFixed(3) + '%' : '',
    },
    {
      headerName: 'Lmt Price', field: 'lmtPrice', width: 78, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value ? (p.value as number).toFixed(3) : '',
    },
    {
      headerName: 'Filled', field: 'filled', width: 66, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.data ? `${p.data.filled}/${p.data.sizeMM}` : '',
    },
    {
      headerName: 'Fill %', colId: 'fillPct', width: 100, type: 'rightAligned',
      cellRenderer: (p: any) => {
        if (!p.data || p.data.sizeMM === 0) return '';
        const pct = Math.round((p.data.filled / p.data.sizeMM) * 100);
        const barCls = pct >= 100 ? 'bg-buy' : pct > 0 ? 'bg-warning' : 'bg-muted-foreground/20';
        return `<div class="flex items-center gap-2 w-full">
          <div class="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all ${barCls}" style="width:${pct}%"></div>
          </div>
          <span class="text-[10px] font-mono text-muted-foreground w-8 text-right">${pct}%</span>
        </div>`;
      },
    },
    {
      headerName: 'Avg Yield', field: 'avgYield', width: 82, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => { const v = p.value as number; return v > 0 ? v.toFixed(3) + '%' : '\u2014'; },
    },
    { headerName: 'Venue', field: 'venue', width: 100 },
    {
      headerName: 'Cpty', field: 'counterparty', width: 110,
      valueFormatter: p => (p.value as string) || '\u2014',
    },
    {
      headerName: 'Account', field: 'account', width: 88,
      cellClass: 'font-mono text-[10px]',
    },
    {
      headerName: 'Status', field: 'status', width: 90,
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const style = STATUS_STYLE[p.data.status as OrderStatus] || '';
        return `<div class="flex items-center h-full">
          <span class="inline-flex items-center justify-center px-3 rounded-full text-[10px] font-semibold leading-none ${style}" style="height:20px">${p.data.status}</span>
        </div>`;
      },
    },
  ];
}
