import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { HlmButtonDirective } from '../../../shared/ui/hlm-button.directive';
import { OrderTicketComponent } from '../order-ticket/order-ticket.component';
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise';
import type { ColDef, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { MarketDataService } from '../../../services/market-data.service';
import { Order, OrderStatus } from '../../../models/market-data.models';
import { marketsUITheme } from '../../../shared/ag-grid-theme';

ModuleRegistry.registerModules([AllEnterpriseModule]);

type StatusFilter = 'All' | OrderStatus;
const STATUS_FILTERS: StatusFilter[] = ['All', 'Working', 'Partial', 'Filled', 'Cancelled'];

const STATUS_BADGE_CLS: Record<string, string> = {
  Filled:    'bg-buy/15 text-buy border border-buy/20',
  Working:   'bg-primary/15 text-primary border border-primary/20',
  Partial:   'bg-warning/15 text-warning border border-warning/20',
  Cancelled: 'bg-muted text-muted-foreground border border-border',
};

@Component({
  selector: 'app-blotter-panel',
  standalone: true,
  imports: [AgGridAngular, OrderTicketComponent, HlmButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="h-full flex flex-col overflow-hidden p-3">
      <div class="flex-1 min-h-0 grid grid-cols-12 gap-3">
        <!-- Blotter Grid -->
        <div class="col-span-9 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          <!-- Toolbar -->
          <div class="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-foreground">Order Blotter</span>
              <div class="flex items-center gap-1">
                @for (s of statusFilters; track s) {
                  <button
                    hlmBtn
                    [variant]="statusFilter() === s ? 'default' : 'ghost'"
                    size="sm"
                    (click)="statusFilter.set(s)"
                    class="rounded-full text-[10px] h-6 px-2"
                  >
                    {{ s }}
                    <span class="ml-1 opacity-70">{{ statusCounts()[s] }}</span>
                  </button>
                }
              </div>
            </div>
            <button
              hlmBtn
              size="sm"
              (click)="ticketOpen.set(true)"
              class="rounded-full text-[10px] font-semibold gap-1"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              New Order
            </button>
          </div>

          <!-- AG Grid -->
          <div class="flex-1 min-h-0">
            <ag-grid-angular
              style="width: 100%; height: 100%;"
              [theme]="theme"
              [rowData]="rowData()"
              [columnDefs]="colDefs"
              [defaultColDef]="defaultColDef"
              [rowHeight]="40"
              [headerHeight]="30"
              [rowSelection]="rowSelection"
              [suppressCellFocus]="true"
              [enableCellTextSelection]="true"
              (rowClicked)="onRowClicked($event)"
              (gridReady)="onGridReady($event)"
            />
          </div>
        </div>

        <!-- Detail Sidebar -->
        <div class="col-span-3 overflow-hidden">
          @if (selected(); as sel) {
            <div class="h-full bg-card border border-border rounded-xl overflow-y-auto flex flex-col">
              <!-- Header -->
              <div class="px-4 pt-4 pb-3 border-b border-border shrink-0">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-semibold text-sm leading-tight">{{ sel.security }}</div>
                    <div class="text-[10px] text-muted-foreground font-mono mt-0.5">{{ sel.cusip }}</div>
                  </div>
                  <button class="p-1 text-muted-foreground hover:text-foreground transition-colors" (click)="selected.set(null)">&times;</button>
                </div>
              </div>

              <div class="flex-1 px-3 py-3 space-y-3 text-[11px] overflow-y-auto">
                <!-- Side badge -->
                <div class="px-3 py-2.5 rounded-lg"
                  [class.bg-buy/10]="sel.side === 'BUY'"
                  [class.bg-sell/10]="sel.side === 'SELL'"
                >
                  <div class="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">
                    {{ sel.side === 'BUY' ? 'Buy Order' : 'Sell Order' }}
                  </div>
                  <div class="text-xl font-semibold font-mono"
                    [class.text-buy]="sel.side === 'BUY'"
                    [class.text-sell]="sel.side === 'SELL'"
                  >{{'$' + sel.sizeMM + 'MM'}}</div>
                </div>

                <!-- Order details -->
                <div class="grid grid-cols-2 gap-x-2 gap-y-3">
                  @for (item of getOrderDetails(sel); track item.label) {
                    <div>
                      <div class="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{{ item.label }}</div>
                      <div class="font-mono font-medium" [class]="item.cls ?? ''">{{ item.value }}</div>
                    </div>
                  }
                </div>

                <!-- Execution -->
                <div class="border-t border-border pt-3 space-y-2">
                  <div class="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Execution</div>
                  @for (item of getExecutionDetails(sel); track item.label) {
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">{{ item.label }}</span>
                      <span class="font-mono">{{ item.value }}</span>
                    </div>
                  }
                  <!-- Fill bar -->
                  <div class="pt-1 flex items-center gap-2">
                    <div class="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        [class.bg-buy]="fillPct(sel) >= 100"
                        [class.bg-warning]="fillPct(sel) > 0 && fillPct(sel) < 100"
                        [class.bg-muted-foreground/20]="fillPct(sel) === 0"
                        [style.width.%]="fillPct(sel)"
                      ></div>
                    </div>
                    <span class="text-[10px] font-mono text-muted-foreground w-8">{{ fillPct(sel).toFixed(0) }}%</span>
                  </div>
                </div>

                <!-- Settlement -->
                <div class="border-t border-border pt-3 space-y-2">
                  <div class="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Settlement</div>
                  @for (item of getSettlementDetails(sel); track item.label) {
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">{{ item.label }}</span>
                      <span class="font-mono">{{ item.value }}</span>
                    </div>
                  }
                </div>

                <!-- Status badge -->
                <div class="border-t border-border pt-3">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" [class]="statusBadgeCls(sel.status)">
                    {{ sel.status }}
                  </span>
                </div>
              </div>
            </div>
          } @else {
            <div class="h-full bg-card border border-border rounded-xl flex items-center justify-center">
              <span class="text-xs text-muted-foreground">Select an order to view details</span>
            </div>
          }
        </div>
      </div>
    </div>

    <app-order-ticket
      [open]="ticketOpen()"
      (close)="ticketOpen.set(false)"
    />
  `,
})
export class BlotterPanelComponent {
  private readonly marketDataService = inject(MarketDataService);

  readonly theme = marketsUITheme;
  readonly statusFilters = STATUS_FILTERS;
  readonly statusFilter = signal<StatusFilter>('All');
  readonly selected = signal<Order | null>(null);
  readonly ticketOpen = signal(false);

  readonly rowSelection: any = { mode: 'singleRow', checkboxes: false, enableClickSelection: true };

  readonly allOrders = computed(() => [...this.marketDataService.orders]);

  readonly statusCounts = computed(() => {
    const orders = this.allOrders();
    const counts: Record<StatusFilter, number> = {
      All: orders.length,
      Working: 0,
      Partial: 0,
      Filled: 0,
      Cancelled: 0,
    };

    STATUS_FILTERS.slice(1).forEach(s => {
      counts[s] = orders.filter(o => o.status === s).length;
    });

    return counts;
  });

  readonly rowData = computed(() => {
    const filter = this.statusFilter();
    const orders = this.allOrders();
    return filter === 'All' ? orders : orders.filter(o => o.status === filter);
  });

  readonly colDefs: ColDef<Order>[] = [
    {
      field: 'orderId', headerName: 'Order ID', width: 90,
      cellClass: 'font-mono text-muted-foreground text-[10px]',
      valueFormatter: (p: any) => p.value ? (p.value as string).replace(/FI-\d+-/, '#').replace('ORD-', '#') : '',
    },
    {
      field: 'time', headerName: 'Time', width: 68,
      cellClass: 'font-mono',
    },
    {
      field: 'security', headerName: 'Security', width: 160,
      cellRenderer: (p: any) => `<div class="flex flex-col justify-center h-full leading-none gap-0.5 py-1">
        <div class="font-medium text-[11px] text-foreground truncate">${p.data?.security ?? ''}</div>
        <div class="text-[9px] text-muted-foreground font-mono">${p.data?.cusip ?? ''}</div>
      </div>`,
    },
    {
      field: 'side', headerName: 'Side', width: 82,
      cellRenderer: (p: any) => {
        const isBuy = p.value === 'BUY';
        return `<div class="flex items-center h-full"><span class="inline-flex items-center justify-center min-w-[3.25rem] px-3.5 rounded-full text-[10px] font-semibold tracking-wide leading-none ${isBuy ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'}" style="height:20px">${p.value ?? ''}</span></div>`;
      },
    },
    {
      field: 'sizeMM', headerName: 'Size $MM', width: 80,
      cellClass: 'font-mono',
      valueFormatter: (p: any) => p.value != null ? `$${p.value}` : '',
    },
    {
      field: 'lmtYield', headerName: 'Lmt Yield', width: 80,
      cellClass: 'font-mono',
      valueFormatter: (p: any) => p.value ? p.value.toFixed(3) + '%' : '',
    },
    {
      field: 'lmtPrice', headerName: 'Lmt Price', width: 78,
      cellClass: 'font-mono',
      valueFormatter: (p: any) => p.value ? p.value.toFixed(3) : '',
    },
    {
      field: 'filled', headerName: 'Filled', width: 66,
      cellClass: 'font-mono',
      valueFormatter: (p: any) => `${p.value ?? 0}/${p.data?.sizeMM ?? 0}`,
    },
    {
      colId: 'fillPct', headerName: 'Fill %', width: 100,
      cellRenderer: (p: any) => {
        const total = p.data?.sizeMM ?? 0;
        const filled = p.data?.filled ?? 0;
        const pct = total > 0 ? (filled / total) * 100 : 0;
        const barCls = pct >= 100 ? 'bg-buy' : pct > 0 ? 'bg-warning' : 'bg-muted-foreground/20';
        return `<div class="flex items-center gap-2 h-full w-full">
          <div class="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div class="h-full rounded-full ${barCls}" style="width: ${pct}%"></div>
          </div>
          <span class="text-[10px] font-mono text-muted-foreground w-8 text-right">${pct.toFixed(0)}%</span>
        </div>`;
      },
      sortable: false,
    },
    {
      field: 'avgYield', headerName: 'Avg Yield', width: 82,
      cellClass: 'font-mono',
      valueFormatter: (p: any) => p.value ? p.value.toFixed(3) + '%' : '\u2014',
    },
    {
      field: 'venue', headerName: 'Venue', width: 100,
    },
    {
      field: 'counterparty', headerName: 'Cpty', width: 110,
      valueFormatter: (p: any) => (p.value as string) || '\u2014',
    },
    {
      field: 'account', headerName: 'Account', width: 88,
      cellClass: 'font-mono text-[10px]',
    },
    {
      field: 'status', headerName: 'Status', width: 90,
      cellRenderer: (p: any) => {
        const cls = STATUS_BADGE_CLS[p.value] ?? 'bg-muted text-muted-foreground';
        return `<div class="flex items-center h-full"><span class="inline-flex items-center justify-center px-3 rounded-full text-[10px] font-semibold leading-none ${cls}" style="height:20px">${p.value ?? ''}</span></div>`;
      },
    },
  ];

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
  };

  fillPct(order: Order): number {
    return order.sizeMM > 0 ? (order.filled / order.sizeMM) * 100 : 0;
  }

  statusBadgeCls(status: string): string {
    return STATUS_BADGE_CLS[status] ?? 'bg-muted text-muted-foreground';
  }

  getOrderDetails(sel: Order): { label: string; value: string; cls?: string }[] {
    return [
      { label: 'CUSIP', value: sel.cusip },
      { label: 'Side', value: sel.side, cls: sel.side === 'BUY' ? 'text-buy' : 'text-sell' },
      { label: 'Time', value: sel.time },
      { label: 'Account', value: sel.account },
    ];
  }

  getExecutionDetails(sel: Order): { label: string; value: string }[] {
    return [
      { label: 'Limit Yield', value: sel.lmtYield ? sel.lmtYield.toFixed(3) + '%' : '\u2014' },
      { label: 'Limit Price', value: sel.lmtPrice ? sel.lmtPrice.toFixed(3) : '\u2014' },
      { label: 'Filled', value: sel.filled + 'MM' },
      { label: 'Avg Yield', value: sel.avgYield ? sel.avgYield.toFixed(3) + '%' : '\u2014' },
      { label: 'Avg Price', value: sel.avgPrice ? sel.avgPrice.toFixed(3) : '\u2014' },
    ];
  }

  getSettlementDetails(sel: Order): { label: string; value: string }[] {
    return [
      { label: 'Counterparty', value: sel.counterparty },
      { label: 'Venue', value: sel.venue },
      { label: 'Trader', value: sel.trader },
      { label: 'Settle', value: sel.cusip.startsWith('CME') ? 'T+1' : 'T+3' },
    ];
  }

  onRowClicked(e: RowClickedEvent<Order>): void {
    const curr = this.selected();
    if (curr?.orderId === e.data?.orderId) {
      this.selected.set(null);
    } else {
      this.selected.set(e.data ?? null);
    }
  }

  onGridReady(e: GridReadyEvent): void {
    e.api.sizeColumnsToFit();
  }
}
