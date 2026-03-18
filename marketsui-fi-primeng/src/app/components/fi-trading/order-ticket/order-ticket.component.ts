import {
  Component, ChangeDetectionStrategy, inject, signal, computed,
  input, output, effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MarketDataService } from '../../../services/market-data.service';
import type { Treasury, CorpBond } from '../../../models/market-data.models';

/* ── Types ──────────────────────────────────────────────── */
type Side = 'BUY' | 'SELL';
type LimitMode = 'yield' | 'price';
type Settlement = 'T+1' | 'T+2' | 'T+3' | 'T+5';

interface SearchResult {
  security: string;
  cusip: string;
  type: 'Treasury' | 'Corporate';
  source: Treasury | CorpBond;
}

/* ── Constants ──────────────────────────────────────────── */
const ACCOUNTS = [
  { label: 'MAIN-FI', value: 'MAIN-FI' },
  { label: 'CORP-IG', value: 'CORP-IG' },
  { label: 'CORP-HY', value: 'CORP-HY' },
  { label: 'GOV-BOND', value: 'GOV-BOND' },
];
const COUNTERPARTIES = [
  { label: 'Goldman Sachs', value: 'Goldman Sachs' },
  { label: 'Morgan Stanley', value: 'Morgan Stanley' },
  { label: 'JPMorgan', value: 'JPMorgan' },
  { label: 'Barclays', value: 'Barclays' },
  { label: 'Citi', value: 'Citi' },
  { label: 'BofA', value: 'BofA' },
  { label: 'HSBC', value: 'HSBC' },
  { label: 'Deutsche Bank', value: 'Deutsche Bank' },
];
const VENUES = [
  { label: 'TradeWeb', value: 'TradeWeb' },
  { label: 'Bloomberg', value: 'Bloomberg' },
  { label: 'MarketAxess', value: 'MarketAxess' },
  { label: 'DirectEx', value: 'DirectEx' },
];
const TIF_OPTIONS = [
  { label: 'Day', value: 'Day' },
  { label: 'GTC', value: 'GTC' },
  { label: 'IOC', value: 'IOC' },
  { label: 'FOK', value: 'FOK' },
];

@Component({
  selector: 'app-order-ticket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    Dialog, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, SelectButtonModule,
  ],
  template: `
    <p-dialog
      [(visible)]="dialogVisible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="true"
      [style]="{ width: '28rem', maxHeight: '80vh' }"
      [contentStyle]="{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }"
      (onHide)="onDialogHide()"
      header="New Order"
    >
      @if (!submitted()) {
        <!-- Fixed header: BUY/SELL toggle -->
        <div class="px-4 pt-2 pb-3 border-b border-border">
          <p-selectbutton
            [options]="sideOptions"
            [(ngModel)]="side"
            [allowEmpty]="false"
            styleClass="w-full"
            [style]="{ width: '100%' }"
          >
            <ng-template #item let-item>
              <span
                class="text-xs font-semibold"
                [class.text-buy-foreground]="item.value === 'BUY' && side() === 'BUY'"
                [class.text-sell-foreground]="item.value === 'SELL' && side() === 'SELL'"
              >{{ item.label }}</span>
            </ng-template>
          </p-selectbutton>
        </div>
      }

      <!-- Scrollable content -->
      <div class="flex-1 overflow-auto px-4 py-3">
        @if (submitted()) {
          <!-- Success state -->
          <div class="flex flex-col items-center justify-center py-8 gap-4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-xl"
              [class]="side() === 'BUY' ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'"
            >&#10003;</div>
            <span class="text-sm font-semibold text-foreground">Order Submitted</span>
            <div class="bg-muted rounded-lg p-3 w-full max-w-xs flex flex-col gap-1.5">
              <div class="grid grid-cols-2 gap-1 text-[11px]">
                <span class="text-muted-foreground">Side</span>
                <span [class]="side() === 'BUY' ? 'text-buy font-medium' : 'text-sell font-medium'">{{ side() }}</span>
                <span class="text-muted-foreground">Size</span>
                <span class="text-foreground font-mono">{{ faceValue() ? '$' + faceValue() + 'MM' : '\u2014' }}</span>
                <span class="text-muted-foreground">Security</span>
                <span class="text-foreground truncate">{{ selectedSecurity()?.security ?? '\u2014' }}</span>
                <span class="text-muted-foreground">Limit</span>
                <span class="text-foreground font-mono">{{ limitValue() != null ? limitValue()! + (limitMode() === 'yield' ? '%' : '') : '\u2014' }}</span>
                <span class="text-muted-foreground">Settle</span>
                <span class="text-foreground">{{ settlement() }}</span>
                <span class="text-muted-foreground">Venue</span>
                <span class="text-foreground">{{ venue() }}</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="flex flex-col gap-4">
            <!-- Security Search -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Security</label>
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"></i>
                <input
                  pInputText
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                  (focus)="showDropdown.set(true)"
                  placeholder="Search bonds..."
                  class="w-full pl-9"
                />
                @if (showDropdown() && filteredSecurities().length > 0) {
                  <div class="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                    @for (item of filteredSecurities(); track item.cusip) {
                      <button
                        (click)="selectSecurity(item)"
                        class="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted transition-colors"
                      >
                        <div class="flex flex-col">
                          <span class="text-[11px] text-foreground font-medium">{{ item.security }}</span>
                          <span class="text-[9px] text-muted-foreground font-mono">{{ item.cusip }}</span>
                        </div>
                        <span
                          class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          [class]="item.type === 'Treasury' ? 'bg-primary/10 text-primary' : 'bg-buy/10 text-buy'"
                        >{{ item.type }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Face Value -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Face Value ($MM)</label>
              <p-inputnumber
                [(ngModel)]="faceValue"
                [minFractionDigits]="0"
                [min]="0"
                placeholder="e.g. 25"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              />
              @if (notional()) {
                <span class="text-[10px] text-muted-foreground font-mono">Notional: {{ '$' + notional()!.toLocaleString() }}</span>
              }
            </div>

            <!-- Limit Yield / Price -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {{ limitMode() === 'yield' ? 'Limit Yield' : 'Limit Price' }}
                </label>
                <p-selectbutton
                  [options]="limitModeOptions"
                  [(ngModel)]="limitMode"
                  [allowEmpty]="false"
                  size="small"
                />
              </div>
              <p-inputnumber
                [(ngModel)]="limitValue"
                [minFractionDigits]="3"
                [maxFractionDigits]="3"
                [step]="0.001"
                [placeholder]="limitMode() === 'yield' ? 'e.g. 4.425' : 'e.g. 100.500'"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              />
            </div>

            <!-- Execution Details -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Account</label>
                <p-select
                  [options]="accountOptions"
                  [(ngModel)]="account"
                  [style]="{ width: '100%' }"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Counterparty</label>
                <p-select
                  [options]="counterpartyOptions"
                  [(ngModel)]="counterparty"
                  [style]="{ width: '100%' }"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Venue</label>
                <p-select
                  [options]="venueOptions"
                  [(ngModel)]="venue"
                  [style]="{ width: '100%' }"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Time-in-Force</label>
                <p-select
                  [options]="tifOptions"
                  [(ngModel)]="tif"
                  [style]="{ width: '100%' }"
                />
              </div>
            </div>

            <!-- Settlement -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Settlement</label>
              <p-selectbutton
                [options]="settleOptions"
                [(ngModel)]="settlement"
                [allowEmpty]="false"
                size="small"
              />
            </div>
          </div>
        }
      </div>

      <!-- Fixed footer -->
      @if (!submitted()) {
        <div class="px-4 pb-4 pt-2 border-t border-border flex gap-2">
          <p-button
            label="Cancel"
            [outlined]="true"
            (click)="onDialogHide()"
            styleClass="flex-1"
          />
          <p-button
            [label]="'Submit ' + side() + ' Order'"
            [severity]="side() === 'BUY' ? 'success' : 'danger'"
            (click)="handleSubmit()"
            [disabled]="!selectedSecurity() || !faceValue()"
            styleClass="flex-1"
          />
        </div>
      }
    </p-dialog>
  `,
})
export class OrderTicketComponent {
  private readonly mds = inject(MarketDataService);

  /* ── Inputs / Outputs ───────────────────────────────────── */
  readonly open = input<boolean>(false);
  readonly closed = output<void>();

  protected dialogVisible = false;

  /* ── Form state ─────────────────────────────────────────── */
  protected readonly side = signal<Side>('BUY');
  protected readonly searchQuery = signal('');
  protected readonly selectedSecurity = signal<SearchResult | null>(null);
  protected readonly showDropdown = signal(false);
  protected readonly faceValue = signal<number | null>(null);
  protected readonly limitMode = signal<LimitMode>('yield');
  protected readonly limitValue = signal<number | null>(null);
  protected readonly account = signal('MAIN-FI');
  protected readonly counterparty = signal('Goldman Sachs');
  protected readonly venue = signal('TradeWeb');
  protected readonly tif = signal('Day');
  protected readonly settlement = signal<Settlement>('T+1');
  protected readonly submitted = signal(false);

  /* ── Options ────────────────────────────────────────────── */
  protected readonly sideOptions = [
    { label: 'BUY', value: 'BUY' },
    { label: 'SELL', value: 'SELL' },
  ];
  protected readonly limitModeOptions = [
    { label: 'Yield', value: 'yield' },
    { label: 'Price', value: 'price' },
  ];
  protected readonly settleOptions = [
    { label: 'T+1', value: 'T+1' },
    { label: 'T+2', value: 'T+2' },
    { label: 'T+3', value: 'T+3' },
    { label: 'T+5', value: 'T+5' },
  ];
  protected readonly accountOptions = ACCOUNTS;
  protected readonly counterpartyOptions = COUNTERPARTIES;
  protected readonly venueOptions = VENUES;
  protected readonly tifOptions = TIF_OPTIONS;

  /* ── Computed ────────────────────────────────────────────── */
  protected readonly notional = computed(() => {
    const fv = this.faceValue();
    return fv != null && fv > 0 ? fv * 1_000_000 : null;
  });

  /* ── Search list ────────────────────────────────────────── */
  private readonly allSecurities: SearchResult[] = (() => {
    const results: SearchResult[] = [];
    const treasuries = this.mds.treasuries();
    const corps = this.mds.corpBonds();
    for (const t of treasuries) {
      results.push({ security: t.security, cusip: t.cusip, type: 'Treasury', source: t });
    }
    for (const c of corps) {
      results.push({ security: c.security, cusip: c.cusip, type: 'Corporate', source: c });
    }
    return results;
  })();

  protected readonly filteredSecurities = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.allSecurities.slice(0, 8);
    return this.allSecurities.filter(
      s => s.security.toLowerCase().includes(q) || s.cusip.toLowerCase().includes(q)
    );
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.dialogVisible = isOpen;
      if (isOpen) {
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    this.side.set('BUY');
    this.searchQuery.set('');
    this.selectedSecurity.set(null);
    this.faceValue.set(null);
    this.limitMode.set('yield');
    this.limitValue.set(null);
    this.account.set('MAIN-FI');
    this.counterparty.set('Goldman Sachs');
    this.venue.set('TradeWeb');
    this.tif.set('Day');
    this.settlement.set('T+1');
    this.submitted.set(false);
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.showDropdown.set(true);
    if (!value) this.selectedSecurity.set(null);
  }

  protected selectSecurity(item: SearchResult): void {
    this.selectedSecurity.set(item);
    this.searchQuery.set(item.security);
    this.showDropdown.set(false);
  }

  protected handleSubmit(): void {
    this.submitted.set(true);
    setTimeout(() => this.onDialogHide(), 1200);
  }

  protected onDialogHide(): void {
    this.dialogVisible = false;
    this.closed.emit();
  }
}
