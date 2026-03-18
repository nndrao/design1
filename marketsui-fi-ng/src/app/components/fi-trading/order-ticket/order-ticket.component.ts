import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButtonDirective } from '../../../shared/ui/hlm-button.directive';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';
import { HlmDialogComponent } from '../../../shared/ui/hlm-dialog.component';
import { MarketDataService } from '../../../services/market-data.service';

interface SecurityItem {
  security: string;
  cusip: string;
  type: 'Treasury' | 'Corporate';
}

const ACCOUNTS = ['MAIN-FI', 'CORP-IG', 'CORP-HY', 'GOV-BOND'];
const COUNTERPARTIES = ['Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'Barclays', 'Citi', 'BofA', 'HSBC', 'Deutsche Bank'];
const VENUES = ['TradeWeb', 'Bloomberg', 'MarketAxess', 'DirectEx'];
const TIF_OPTIONS = ['Day', 'GTC', 'IOC', 'FOK'];
const SETTLE_OPTIONS: ('T+1' | 'T+2' | 'T+3' | 'T+5')[] = ['T+1', 'T+2', 'T+3', 'T+5'];

@Component({
  selector: 'app-order-ticket',
  standalone: true,
  imports: [FormsModule, HlmButtonDirective, HlmInputDirective, HlmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <hlm-dialog
      [open]="open()"
      (openChange)="onDialogVisibleChange($event)"
      maxWidth="28rem"
      maxHeight="80vh"
      [dismissableMask]="true"
    >
      <!-- Header -->
      <div class="px-5 pt-4 pb-3 border-b border-border shrink-0">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold">New Order</span>
            <button
              class="p-1 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              (click)="close.emit()"
            >&times;</button>
          </div>
          @if (!submitted()) {
            <div class="grid grid-cols-2 gap-0 bg-muted rounded-full p-0.5">
              @for (s of sides; track s) {
                <button
                  hlmBtn
                  [variant]="side() === s ? (s === 'BUY' ? 'buy' : 'sell') : 'ghost'"
                  size="sm"
                  (click)="side.set(s)"
                  class="rounded-full w-full text-xs font-semibold"
                >{{ s }}</button>
              }
            </div>
          }
        </div>
      </div>

      @if (submitted()) {
        <div class="flex flex-col items-center justify-center py-8 gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            [class.bg-buy/10]="side() === 'BUY'"
            [class.text-buy]="side() === 'BUY'"
            [class.bg-sell/10]="side() === 'SELL'"
            [class.text-sell]="side() === 'SELL'"
          >&#10003;</div>
          <span class="text-sm font-semibold text-foreground">Order Submitted</span>
          <div class="bg-muted rounded-lg p-3 w-full max-w-xs flex flex-col gap-1.5">
            <div class="grid grid-cols-2 gap-1 text-[11px]">
              <span class="text-muted-foreground">Side</span>
              <span class="font-medium" [class.text-buy]="side() === 'BUY'" [class.text-sell]="side() === 'SELL'">{{ side() }}</span>
              <span class="text-muted-foreground">Size</span>
              <span class="text-foreground font-mono">{{ faceValue() ? '$' + faceValue() + 'MM' : '\u2014' }}</span>
              <span class="text-muted-foreground">Security</span>
              <span class="text-foreground truncate">{{ selectedSecurity()?.security ?? '\u2014' }}</span>
              <span class="text-muted-foreground">Limit</span>
              <span class="text-foreground font-mono">{{ limitValue() ? limitValue() + (limitMode() === 'yield' ? '%' : '') : '\u2014' }}</span>
              <span class="text-muted-foreground">Settle</span>
              <span class="text-foreground">{{ settlement() }}</span>
              <span class="text-muted-foreground">Venue</span>
              <span class="text-foreground">{{ venue() }}</span>
            </div>
          </div>
        </div>
      } @else {
        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div class="flex flex-col gap-4">

            <!-- Security Search -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Security</label>
              <div class="relative">
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    hlmInput
                    type="text"
                    [value]="searchQuery()"
                    (input)="onSearchInput($event)"
                    (focus)="showDropdown.set(true)"
                    placeholder="Search bonds..."
                    class="w-full pl-9 text-xs"
                  />
                </div>
                @if (showDropdown() && filteredSecurities().length > 0) {
                  <div class="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                    @for (item of filteredSecurities(); track item.cusip) {
                      <div
                        (click)="selectSecurity(item)"
                        class="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                      >
                        <div class="flex flex-col">
                          <span class="text-[11px] text-foreground font-medium">{{ item.security }}</span>
                          <span class="text-[9px] text-muted-foreground font-mono">{{ item.cusip }}</span>
                        </div>
                        <span
                          class="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                          [class.bg-primary/10]="item.type === 'Treasury'"
                          [class.text-primary]="item.type === 'Treasury'"
                          [class.bg-buy/10]="item.type === 'Corporate'"
                          [class.text-buy]="item.type === 'Corporate'"
                        >{{ item.type }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Face Value -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Face Value ($MM)</label>
              <input
                hlmInput
                type="number"
                [value]="faceValue()"
                (input)="onFaceValueInput($event)"
                placeholder="e.g. 25"
                class="w-full text-xs font-mono"
              />
              @if (notional()) {
                <span class="text-[10px] text-muted-foreground font-mono">{{'Notional: $' + notional()}}</span>
              }
            </div>

            <!-- Limit Yield / Price -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {{ limitMode() === 'yield' ? 'Limit Yield' : 'Limit Price' }}
                </label>
                <div class="flex items-center gap-0 bg-muted rounded-full p-0.5">
                  <button
                    hlmBtn
                    [variant]="limitMode() === 'yield' ? 'default' : 'ghost'"
                    size="sm"
                    (click)="limitMode.set('yield')"
                    class="rounded-full text-[10px] h-6 px-2.5"
                  >Yield</button>
                  <button
                    hlmBtn
                    [variant]="limitMode() === 'price' ? 'default' : 'ghost'"
                    size="sm"
                    (click)="limitMode.set('price')"
                    class="rounded-full text-[10px] h-6 px-2.5"
                  >Price</button>
                </div>
              </div>
              <input
                hlmInput
                type="number"
                step="0.001"
                [value]="limitValue()"
                (input)="onLimitValueInput($event)"
                [placeholder]="limitMode() === 'yield' ? 'e.g. 4.425' : 'e.g. 100.500'"
                class="w-full text-xs font-mono"
              />
            </div>

            <!-- Execution Details 2x2 -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Account</label>
                <select
                  [ngModel]="account()"
                  (ngModelChange)="account.set($event)"
                  class="w-full h-9 px-3 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground cursor-pointer"
                >
                  @for (a of accounts; track a) {
                    <option [value]="a">{{ a }}</option>
                  }
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Counterparty</label>
                <select
                  [ngModel]="counterparty()"
                  (ngModelChange)="counterparty.set($event)"
                  class="w-full h-9 px-3 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground cursor-pointer"
                >
                  @for (c of counterparties; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Venue</label>
                <select
                  [ngModel]="venue()"
                  (ngModelChange)="venue.set($event)"
                  class="w-full h-9 px-3 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground cursor-pointer"
                >
                  @for (v of venues; track v) {
                    <option [value]="v">{{ v }}</option>
                  }
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Time-in-Force</label>
                <select
                  [ngModel]="tif()"
                  (ngModelChange)="tif.set($event)"
                  class="w-full h-9 px-3 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground cursor-pointer"
                >
                  @for (t of tifOptions; track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Settlement -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Settlement</label>
              <div class="flex items-center gap-1">
                @for (s of settlementOptions; track s) {
                  <button
                    hlmBtn
                    [variant]="settlement() === s ? 'default' : 'outline'"
                    size="sm"
                    (click)="settlement.set(s)"
                    class="flex-1 text-[10px]"
                  >{{ s }}</button>
                }
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-border shrink-0">
          <div class="flex items-center gap-3">
            <button
              hlmBtn
              variant="outline"
              (click)="close.emit()"
              class="flex-1 text-xs"
            >Cancel</button>
            <button
              hlmBtn
              [variant]="side() === 'BUY' ? 'buy' : 'sell'"
              [disabled]="!selectedSecurity() || !faceValue()"
              (click)="handleSubmit()"
              class="flex-1 text-xs font-semibold"
            >{{ 'Submit ' + side() + ' Order' }}</button>
          </div>
        </div>
      }
    </hlm-dialog>
  `,
})
export class OrderTicketComponent {
  private readonly marketDataService = inject(MarketDataService);

  /* ── Inputs / Outputs ─────────────────────────────────── */
  readonly open = input<boolean>(false);
  readonly close = output<void>();

  /* ── Constants exposed to template ────────────────────── */
  readonly sides: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
  readonly accounts = ACCOUNTS;
  readonly counterparties = COUNTERPARTIES;
  readonly venues = VENUES;
  readonly tifOptions = TIF_OPTIONS;
  readonly settlementOptions = SETTLE_OPTIONS;

  /* ── State signals ────────────────────────────────────── */
  readonly side = signal<'BUY' | 'SELL'>('BUY');
  readonly searchQuery = signal('');
  readonly selectedSecurity = signal<SecurityItem | null>(null);
  readonly showDropdown = signal(false);
  readonly faceValue = signal('');
  readonly limitMode = signal<'yield' | 'price'>('yield');
  readonly limitValue = signal('');
  readonly account = signal(ACCOUNTS[0]);
  readonly counterparty = signal(COUNTERPARTIES[0]);
  readonly venue = signal(VENUES[0]);
  readonly tif = signal(TIF_OPTIONS[0]);
  readonly settlement = signal<'T+1' | 'T+2' | 'T+3' | 'T+5'>('T+1');
  readonly submitted = signal(false);

  private submitTimer: ReturnType<typeof setTimeout> | null = null;

  /* ── Security list built from service ─────────────────── */
  private readonly securityList = computed<SecurityItem[]>(() => {
    const treasuries = this.marketDataService.treasuries();
    const treasuryItems: SecurityItem[] = treasuries.map(t => ({
      security: t.security,
      cusip: t.cusip,
      type: 'Treasury' as const,
    }));
    const corpItems: SecurityItem[] = this.marketDataService.corpBonds().map(b => ({
      security: b.security,
      cusip: b.cusip,
      type: 'Corporate' as const,
    }));
    return [...treasuryItems, ...corpItems];
  });

  readonly filteredSecurities = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.securityList().slice(0, 8);
    return this.securityList()
      .filter(
        s =>
          s.security.toLowerCase().includes(query) ||
          s.cusip.toLowerCase().includes(query)
      );
  });

  readonly notional = computed(() => {
    const val = parseFloat(this.faceValue());
    if (isNaN(val) || val <= 0) return null;
    return (val * 1_000_000).toLocaleString();
  });

  /* ── Reset fields when open changes to true ───────────── */
  constructor() {
    effect(() => {
      if (this.open()) {
        this.resetForm();
      }
    });
  }

  /* ── Template event handlers ──────────────────────────── */
  onDialogVisibleChange(visible: boolean): void {
    if (!visible) {
      this.close.emit();
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.showDropdown.set(true);
    if (!value) this.selectedSecurity.set(null);
  }

  onFaceValueInput(event: Event): void {
    this.faceValue.set((event.target as HTMLInputElement).value);
  }

  onLimitValueInput(event: Event): void {
    this.limitValue.set((event.target as HTMLInputElement).value);
  }

  selectSecurity(item: SecurityItem): void {
    this.selectedSecurity.set(item);
    this.searchQuery.set(item.security);
    this.showDropdown.set(false);
  }

  handleSubmit(): void {
    this.submitted.set(true);
    this.submitTimer = setTimeout(() => {
      this.submitted.set(false);
      this.close.emit();
    }, 1200);
  }

  private resetForm(): void {
    this.side.set('BUY');
    this.searchQuery.set('');
    this.selectedSecurity.set(null);
    this.showDropdown.set(false);
    this.faceValue.set('');
    this.limitMode.set('yield');
    this.limitValue.set('');
    this.account.set(ACCOUNTS[0]);
    this.counterparty.set(COUNTERPARTIES[0]);
    this.venue.set(VENUES[0]);
    this.tif.set(TIF_OPTIONS[0]);
    this.settlement.set('T+1');
    this.submitted.set(false);
    if (this.submitTimer) {
      clearTimeout(this.submitTimer);
      this.submitTimer = null;
    }
  }
}
