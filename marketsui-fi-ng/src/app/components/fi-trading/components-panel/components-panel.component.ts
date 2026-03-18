import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButtonDirective } from '../../../shared/ui/hlm-button.directive';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';
import { HlmBadgeComponent } from '../../../shared/ui/hlm-badge.component';
import {
  HlmCardComponent,
  HlmCardHeaderComponent,
  HlmCardTitleComponent,
  HlmCardContentComponent,
  HlmCardFooterComponent,
} from '../../../shared/ui/hlm-card.component';
import { HlmSeparatorComponent } from '../../../shared/ui/hlm-separator.component';
import { HlmProgressComponent } from '../../../shared/ui/hlm-progress.component';
import { HlmDialogComponent } from '../../../shared/ui/hlm-dialog.component';
import {
  HlmAlertComponent,
  HlmAlertTitleComponent,
  HlmAlertDescriptionComponent,
} from '../../../shared/ui/hlm-alert.component';
import { HlmAlertDialogComponent } from '../../../shared/ui/hlm-alert-dialog.component';
import { HlmSkeletonComponent } from '../../../shared/ui/hlm-skeleton.component';
import { HlmSliderComponent } from '../../../shared/ui/hlm-slider.component';
import {
  HlmRadioGroupComponent,
  HlmRadioItemComponent,
} from '../../../shared/ui/hlm-radio-group.component';
import { HlmTextareaDirective } from '../../../shared/ui/hlm-textarea.directive';
import {
  HlmAccordionComponent,
  HlmAccordionItemComponent,
} from '../../../shared/ui/hlm-accordion.component';
import { HlmScrollAreaComponent } from '../../../shared/ui/hlm-scroll-area.component';
import {
  HlmTableComponent,
  HlmTableHeaderComponent,
  HlmTableBodyComponent,
  HlmTableRowComponent,
  HlmTableHeadComponent,
  HlmTableCellComponent,
} from '../../../shared/ui/hlm-table.component';
import { HlmPopoverComponent } from '../../../shared/ui/hlm-popover.component';
import {
  HlmDropdownMenuComponent,
  HlmDropdownItemComponent,
} from '../../../shared/ui/hlm-dropdown-menu.component';
import { HlmHoverCardComponent } from '../../../shared/ui/hlm-hover-card.component';
import { HlmCalendarComponent } from '../../../shared/ui/hlm-calendar.component';
import {
  HlmToasterComponent,
  HlmToastService,
} from '../../../shared/ui/hlm-toast.component';
import { HlmSheetComponent } from '../../../shared/ui/hlm-sheet.component';
import { HlmAspectRatioComponent } from '../../../shared/ui/hlm-aspect-ratio.component';

@Component({
  selector: 'app-components-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    HlmButtonDirective,
    HlmInputDirective,
    HlmBadgeComponent,
    HlmCardComponent,
    HlmCardHeaderComponent,
    HlmCardTitleComponent,
    HlmCardContentComponent,
    HlmCardFooterComponent,
    HlmSeparatorComponent,
    HlmProgressComponent,
    HlmDialogComponent,
    HlmAlertComponent,
    HlmAlertTitleComponent,
    HlmAlertDescriptionComponent,
    HlmAlertDialogComponent,
    HlmSkeletonComponent,
    HlmSliderComponent,
    HlmRadioGroupComponent,
    HlmRadioItemComponent,
    HlmTextareaDirective,
    HlmAccordionComponent,
    HlmAccordionItemComponent,
    HlmScrollAreaComponent,
    HlmTableComponent,
    HlmTableHeaderComponent,
    HlmTableBodyComponent,
    HlmTableRowComponent,
    HlmTableHeadComponent,
    HlmTableCellComponent,
    HlmPopoverComponent,
    HlmDropdownMenuComponent,
    HlmDropdownItemComponent,
    HlmHoverCardComponent,
    HlmCalendarComponent,
    HlmToasterComponent,
    HlmSheetComponent,
    HlmAspectRatioComponent,
  ],
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-4 bg-background">
      <h1 class="text-lg font-bold text-foreground tracking-tight">Component Showcase</h1>
      <p class="text-xs text-muted-foreground -mt-2">All shadcn/ui components available in this project</p>

      <!-- 1. BUTTON -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Button</h2>
        <div class="space-y-3">
          @for (v of buttonVariants; track v) {
            <div class="space-y-1">
              <span class="text-xs font-medium text-muted-foreground capitalize">{{ v }}</span>
              <div class="flex items-center gap-2 flex-wrap">
                <button hlmBtn [variant]="v" size="sm">{{ v }} sm</button>
                <button hlmBtn [variant]="v">{{ v }}</button>
                <button hlmBtn [variant]="v" size="lg">{{ v }} lg</button>
                <button hlmBtn [variant]="v" size="icon">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            </div>
          }
          <div class="space-y-1">
            <span class="text-xs font-medium text-muted-foreground">Icon buttons</span>
            <div class="flex items-center gap-2">
              <button hlmBtn size="icon">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              </button>
              <button hlmBtn size="icon" variant="outline">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button hlmBtn size="icon" variant="destructive">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. INPUT -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Input</h2>
        <div class="grid grid-cols-2 gap-3 max-w-lg">
          <div class="space-y-1">
            <label class="text-xs font-medium text-foreground">Text</label>
            <input hlmInput placeholder="Enter symbol..." />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-foreground">Number</label>
            <input hlmInput type="number" placeholder="0.00" step="0.01" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-foreground">Disabled</label>
            <input hlmInput disabled placeholder="Disabled" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-foreground">With value</label>
            <input hlmInput value="USD/JPY" />
          </div>
        </div>
      </div>

      <!-- 3. SELECT -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Select</h2>
        <div class="max-w-xs space-y-1">
          <label class="text-xs font-medium text-foreground">Currency Pair</label>
          <select
            hlmInput
            [ngModel]="selectedCurrency()"
            (ngModelChange)="selectedCurrency.set($event)"
          >
            <option value="USD/JPY">USD/JPY</option>
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="AUD/USD">AUD/USD</option>
          </select>
          <p class="text-xs text-muted-foreground">Selected: {{ selectedCurrency() }}</p>
        </div>
      </div>

      <!-- 4. DIALOG -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Dialog</h2>
        <button hlmBtn (click)="dialogOpen.set(true)">Open Dialog</button>
        <hlm-dialog [open]="dialogOpen()" (openChange)="dialogOpen.set($event)">
          <div class="p-4 space-y-3">
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-foreground">Confirm Trade</h3>
              <p class="text-xs text-muted-foreground">Are you sure you want to execute this order?</p>
            </div>
            <p class="text-xs text-foreground">Buy 10,000 USD/JPY at market price. This action cannot be undone.</p>
            <div class="flex justify-end gap-2">
              <button hlmBtn variant="outline" (click)="dialogOpen.set(false)">Cancel</button>
              <button hlmBtn (click)="dialogOpen.set(false)">Confirm</button>
            </div>
          </div>
        </hlm-dialog>
        <p class="text-xs text-muted-foreground">Dialog is {{ dialogOpen() ? 'open' : 'closed' }}</p>
      </div>

      <!-- 5. BADGE -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Badge</h2>
        <div class="flex flex-wrap gap-2">
          <hlm-badge>Default</hlm-badge>
          <hlm-badge variant="secondary">Secondary</hlm-badge>
          <hlm-badge variant="destructive">Destructive</hlm-badge>
          <hlm-badge variant="outline">Outline</hlm-badge>
          <hlm-badge variant="buy">Buy</hlm-badge>
          <hlm-badge variant="sell">Sell</hlm-badge>
          <hlm-badge variant="warning">Warning</hlm-badge>
        </div>
      </div>

      <!-- 6. TABS -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Tabs</h2>
        <div class="max-w-md">
          <div class="inline-flex h-8 items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground">
            @for (tab of tabItems; track tab.value) {
              <button
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none"
                [class.bg-background]="activeTab() === tab.value"
                [class.text-foreground]="activeTab() === tab.value"
                [class.shadow-sm]="activeTab() === tab.value"
                (click)="activeTab.set(tab.value)"
              >{{ tab.label }}</button>
            }
          </div>
          @switch (activeTab()) {
            @case ('overview') {
              <p class="text-xs text-muted-foreground py-2">Portfolio summary and recent activity.</p>
            }
            @case ('analytics') {
              <p class="text-xs text-muted-foreground py-2">Performance metrics and P&amp;L charts.</p>
            }
            @case ('settings') {
              <p class="text-xs text-muted-foreground py-2">Notification and display preferences.</p>
            }
          }
        </div>
      </div>

      <!-- 7. SWITCH -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Switch</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <button
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              [class.bg-primary]="switchA()"
              [class.bg-input]="!switchA()"
              (click)="toggleSwitchA()"
              role="switch"
              [attr.aria-checked]="switchA()"
            >
              <span
                class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
                [class.translate-x-4]="switchA()"
                [class.translate-x-0]="!switchA()"
              ></span>
            </button>
            <span class="text-xs text-foreground">Dark mode: {{ switchA() ? 'On' : 'Off' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              [class.bg-primary]="switchB()"
              [class.bg-input]="!switchB()"
              (click)="toggleSwitchB()"
              role="switch"
              [attr.aria-checked]="switchB()"
            >
              <span
                class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
                [class.translate-x-4]="switchB()"
                [class.translate-x-0]="!switchB()"
              ></span>
            </button>
            <span class="text-xs text-foreground">Notifications: {{ switchB() ? 'On' : 'Off' }}</span>
          </div>
        </div>
      </div>

      <!-- 8. CHECKBOX -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Checkbox</h2>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <button
              class="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center"
              [class.bg-primary]="checkbox1()"
              [class.text-primary-foreground]="checkbox1()"
              (click)="toggleCheckbox1()"
              role="checkbox"
              [attr.aria-checked]="checkbox1()"
            >
              @if (checkbox1()) {
                <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
              }
            </button>
            <span class="text-xs text-foreground">Unchecked by default</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <button
              class="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center"
              [class.bg-primary]="checkbox2()"
              [class.text-primary-foreground]="checkbox2()"
              (click)="toggleCheckbox2()"
              role="checkbox"
              [attr.aria-checked]="checkbox2()"
            >
              @if (checkbox2()) {
                <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
              }
            </button>
            <span class="text-xs text-foreground">Checked by default</span>
          </label>
        </div>
      </div>

      <!-- 9. PROGRESS -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Progress</h2>
        <div class="space-y-3 max-w-md">
          @for (v of progressValues; track v) {
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{{ v }}%</span>
              </div>
              <hlm-progress [value]="v" />
            </div>
          }
        </div>
      </div>

      <!-- 10. TOOLTIP -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Tooltip</h2>
        <div class="flex gap-3">
          <div class="relative group">
            <button hlmBtn variant="secondary" size="sm">Hover me</button>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div class="rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">Top tooltip</div>
            </div>
          </div>
          <div class="relative group">
            <button hlmBtn variant="outline" size="sm">Bottom</button>
            <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-50">
              <div class="rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">Bottom tooltip</div>
            </div>
          </div>
          <div class="relative group">
            <button hlmBtn variant="ghost" size="sm">Right</button>
            <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-50">
              <div class="rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">Right tooltip</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 11. AVATAR -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Avatar</h2>
        <div class="flex gap-3">
          @for (initials of avatarInitials; track initials) {
            <div class="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted items-center justify-center">
              <span class="text-xs font-medium text-foreground">{{ initials }}</span>
            </div>
          }
        </div>
      </div>

      <!-- 12. CARD -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Card</h2>
        <hlm-card>
          <hlm-card-header>
            <hlm-card-title>Order Summary</hlm-card-title>
            <p class="text-xs text-muted-foreground">Review your trade details</p>
          </hlm-card-header>
          <hlm-card-content>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-muted-foreground">Instrument</span>
                <span class="text-foreground font-medium">US 10Y T-Note</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-muted-foreground">Quantity</span>
                <span class="text-foreground font-medium">5,000,000</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-muted-foreground">Price</span>
                <span class="text-foreground font-medium">99.215</span>
              </div>
            </div>
          </hlm-card-content>
          <hlm-card-footer>
            <div class="flex justify-end gap-2 w-full">
              <button hlmBtn variant="outline" size="sm">Cancel</button>
              <button hlmBtn size="sm">Confirm</button>
            </div>
          </hlm-card-footer>
        </hlm-card>
      </div>

      <!-- 13. TOGGLE -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Toggle</h2>
        <div class="flex gap-2">
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 w-9 hover:bg-muted hover:text-muted-foreground"
            [class.bg-accent]="toggleBold()"
            [class.text-accent-foreground]="toggleBold()"
            (click)="toggleBoldFn()"
            aria-label="Toggle bold"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
          </button>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 w-9 hover:bg-muted hover:text-muted-foreground"
            [class.bg-accent]="toggleItalic()"
            [class.text-accent-foreground]="toggleItalic()"
            (click)="toggleItalicFn()"
            aria-label="Toggle italic"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
          </button>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 w-9 border border-input hover:bg-muted hover:text-muted-foreground"
            [class.bg-accent]="toggleUnderline()"
            [class.text-accent-foreground]="toggleUnderline()"
            (click)="toggleUnderlineFn()"
            aria-label="Toggle underline"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>
          </button>
        </div>
      </div>

      <!-- 14. TOGGLEGROUP -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">ToggleGroup</h2>
        <div class="space-y-3">
          <div class="space-y-1">
            <span class="text-xs text-muted-foreground">Single select</span>
            <div class="inline-flex items-center rounded-md">
              @for (opt of toggleGroupSingleOptions; track opt) {
                <button
                  class="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-8 px-3 hover:bg-muted hover:text-muted-foreground"
                  [class.bg-accent]="toggleGroupSingle() === opt"
                  [class.text-accent-foreground]="toggleGroupSingle() === opt"
                  (click)="toggleGroupSingle.set(opt)"
                >{{ opt }}</button>
              }
            </div>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-muted-foreground">Multiple select</span>
            <div class="inline-flex items-center rounded-md">
              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-9 hover:bg-muted hover:text-muted-foreground"
                [class.bg-accent]="toggleGroupMulti().includes('bold')"
                [class.text-accent-foreground]="toggleGroupMulti().includes('bold')"
                (click)="toggleMulti('bold')"
              >
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
              </button>
              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-9 hover:bg-muted hover:text-muted-foreground"
                [class.bg-accent]="toggleGroupMulti().includes('italic')"
                [class.text-accent-foreground]="toggleGroupMulti().includes('italic')"
                (click)="toggleMulti('italic')"
              >
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
              </button>
              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 w-9 hover:bg-muted hover:text-muted-foreground"
                [class.bg-accent]="toggleGroupMulti().includes('underline')"
                [class.text-accent-foreground]="toggleGroupMulti().includes('underline')"
                (click)="toggleMulti('underline')"
              >
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 15. SEPARATOR -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Separator</h2>
        <div class="space-y-3">
          <p class="text-xs text-foreground">Content above</p>
          <hlm-separator />
          <p class="text-xs text-foreground">Content below</p>
          <div class="flex items-center gap-3 h-5">
            <span class="text-xs text-foreground">Left</span>
            <hlm-separator orientation="vertical" />
            <span class="text-xs text-foreground">Center</span>
            <hlm-separator orientation="vertical" />
            <span class="text-xs text-foreground">Right</span>
          </div>
        </div>
      </div>

      <!-- 16. LABEL -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Label</h2>
        <div class="space-y-2 max-w-xs">
          <div class="space-y-1">
            <label class="text-xs font-medium text-foreground" for="label-demo-1">Symbol</label>
            <input hlmInput id="label-demo-1" placeholder="e.g. AAPL" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-foreground" for="label-demo-2">Quantity</label>
            <input hlmInput id="label-demo-2" type="number" placeholder="0" />
          </div>
        </div>
      </div>

      <!-- 17. ALERT -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Alert</h2>
        <div class="space-y-3 max-w-lg">
          <hlm-alert class="flex items-start gap-2">
            <svg class="h-3.5 w-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div><hlm-alert-title>Information</hlm-alert-title><hlm-alert-description>Market data is delayed by 15 minutes.</hlm-alert-description></div>
          </hlm-alert>
          <hlm-alert variant="destructive" class="flex items-start gap-2">
            <svg class="h-3.5 w-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <div><hlm-alert-title>Error</hlm-alert-title><hlm-alert-description>Connection to exchange lost. Retrying...</hlm-alert-description></div>
          </hlm-alert>
          <hlm-alert variant="success" class="flex items-start gap-2">
            <svg class="h-3.5 w-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <div><hlm-alert-title>Success</hlm-alert-title><hlm-alert-description>Order filled at 99.215.</hlm-alert-description></div>
          </hlm-alert>
          <hlm-alert variant="warning" class="flex items-start gap-2">
            <svg class="h-3.5 w-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div><hlm-alert-title>Warning</hlm-alert-title><hlm-alert-description>Margin utilization above 80%.</hlm-alert-description></div>
          </hlm-alert>
        </div>
      </div>

      <!-- 18. ALERTDIALOG -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">AlertDialog</h2>
        <button hlmBtn variant="destructive" (click)="alertDialogOpen.set(true)">Cancel All Orders</button>
        <hlm-alert-dialog [open]="alertDialogOpen()" (openChange)="alertDialogOpen.set($event)">
          <div class="p-4 space-y-3">
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-foreground">Cancel all open orders?</h3>
              <p class="text-xs text-muted-foreground">This will cancel 12 open orders across all instruments. This action cannot be undone.</p>
            </div>
            <div class="flex justify-end gap-2">
              <button hlmBtn variant="outline" (click)="alertDialogOpen.set(false)">Keep Orders</button>
              <button hlmBtn (click)="alertDialogOpen.set(false)">Cancel All</button>
            </div>
          </div>
        </hlm-alert-dialog>
      </div>

      <!-- 19. POPOVER -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Popover</h2>
        <hlm-popover>
          <button hlmBtn variant="outline" hlmPopoverTrigger>Open Popover</button>
          <div hlmPopoverContent class="space-y-2">
            <h4 class="text-xs font-medium">Quick Settings</h4>
            <div class="space-y-1">
              <label class="text-[11px] font-medium text-foreground">Default Lot Size</label>
              <input hlmInput type="number" value="1000000" class="h-6 text-[11px]" />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-medium text-foreground">Slippage Tolerance</label>
              <input hlmInput type="number" value="0.5" step="0.1" class="h-6 text-[11px]" />
            </div>
          </div>
        </hlm-popover>
      </div>

      <!-- 20. DROPDOWNMENU -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">DropdownMenu</h2>
        <hlm-dropdown-menu>
          <button hlmBtn variant="outline" hlmDropdownTrigger>
            <svg class="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Options
          </button>
          <div hlmDropdownContent class="w-44">
            <div class="px-2 py-1.5 text-xs font-semibold text-foreground">Account</div>
            <hlm-dropdown-item>
              <svg class="h-3.5 w-3.5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </hlm-dropdown-item>
            <hlm-dropdown-item>
              <svg class="h-3.5 w-3.5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Messages
            </hlm-dropdown-item>
            <div class="h-px bg-border my-1"></div>
            <hlm-dropdown-item>
              <label class="flex items-center gap-2 cursor-pointer w-full">
                <input type="checkbox" class="accent-primary h-3 w-3" [checked]="showGrid()" (change)="toggleShowGrid()" />
                Show Grid
              </label>
            </hlm-dropdown-item>
            <hlm-dropdown-item>
              <label class="flex items-center gap-2 cursor-pointer w-full">
                <input type="checkbox" class="accent-primary h-3 w-3" [checked]="showPnl()" (change)="toggleShowPnl()" />
                Show P&amp;L
              </label>
            </hlm-dropdown-item>
            <div class="h-px bg-border my-1"></div>
            <hlm-dropdown-item>
              <span class="text-destructive flex items-center">
                <svg class="h-3.5 w-3.5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Logout
              </span>
            </hlm-dropdown-item>
          </div>
        </hlm-dropdown-menu>
      </div>

      <!-- 21. SLIDER -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Slider</h2>
        <div class="max-w-xs space-y-3">
          <div class="space-y-2">
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Volume</span>
              <span>{{ sliderValue() }}%</span>
            </div>
            <hlm-slider [value]="sliderValue()" (valueChange)="sliderValue.set($event)" [max]="100" [step]="1" />
          </div>
        </div>
      </div>

      <!-- 22. SCROLLAREA -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">ScrollArea</h2>
        <hlm-scroll-area class="h-32 w-48 rounded-md border border-border">
          <div class="p-2">
            @for (inst of instruments; track inst) {
              <div class="text-xs py-1.5 border-b border-border last:border-0 text-foreground">{{ inst }}</div>
            }
          </div>
        </hlm-scroll-area>
      </div>

      <!-- 23. SKELETON -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Skeleton</h2>
        <div class="flex items-center space-x-3">
          <hlm-skeleton class="h-8 w-8 rounded-full" />
          <div class="space-y-1.5">
            <hlm-skeleton class="h-3 w-[180px]" />
            <hlm-skeleton class="h-3 w-[120px]" />
          </div>
        </div>
      </div>

      <!-- 24. RADIOGROUP -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">RadioGroup</h2>
        <hlm-radio-group [value]="radioValue()" (valueChange)="radioValue.set($event)">
          <hlm-radio-item value="market">Market Order</hlm-radio-item>
          <hlm-radio-item value="limit">Limit Order</hlm-radio-item>
          <hlm-radio-item value="stop">Stop Order</hlm-radio-item>
        </hlm-radio-group>
        <p class="text-xs text-muted-foreground">Selected: {{ radioValue() }}</p>
      </div>

      <!-- 25. TEXTAREA -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Textarea</h2>
        <div class="max-w-sm space-y-1">
          <label class="text-xs font-medium text-foreground">Trade Notes</label>
          <textarea hlmTextarea placeholder="Enter notes for this trade..."></textarea>
        </div>
      </div>

      <!-- 26. ACCORDION -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Accordion</h2>
        <hlm-accordion class="max-w-sm">
          <hlm-accordion-item title="Market Overview">
            <p class="text-xs text-muted-foreground">Treasury yields moved higher across the curve with the 10Y up 3bps.</p>
          </hlm-accordion-item>
          <hlm-accordion-item title="Position Summary">
            <p class="text-xs text-muted-foreground">Net DV01: $12,500. Long duration bias with curve flattener.</p>
          </hlm-accordion-item>
          <hlm-accordion-item title="Risk Limits">
            <p class="text-xs text-muted-foreground">Current utilization: 62%. Daily VaR: $45,000.</p>
          </hlm-accordion-item>
        </hlm-accordion>
      </div>

      <!-- 27. HOVERCARD -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">HoverCard</h2>
        <hlm-hover-card>
          <button hlmBtn variant="link" class="text-xs p-0 h-auto" hlmHoverTrigger>US 10Y T-Note</button>
          <div hlmHoverContent class="space-y-1.5">
            <h4 class="text-xs font-semibold">US 10Y Treasury Note</h4>
            <div class="text-[11px] text-muted-foreground space-y-0.5">
              <p>CUSIP: 91282CJL6</p>
              <p>Coupon: 4.000%</p>
              <p>Maturity: 11/15/2033</p>
              <p>Last: 99.215 | Yield: 4.125%</p>
            </div>
          </div>
        </hlm-hover-card>
        <p class="text-xs text-muted-foreground mt-1">Hover over the link above</p>
      </div>

      <!-- 28. CALENDAR -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Calendar</h2>
        <div class="max-w-[280px]">
          <hlm-calendar
            [selected]="calendarDate()"
            (selectedChange)="calendarDate.set($event)"
          />
        </div>
        <p class="text-xs text-muted-foreground">Selected: {{ calendarDate() ? calendarDate()!.toLocaleDateString() : 'None' }}</p>
      </div>

      <!-- 29. TOAST (SONNER) -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Toast (Sonner)</h2>
        <div class="flex flex-wrap gap-2">
          <button hlmBtn size="sm" (click)="showToast('Order submitted')">Default Toast</button>
          <button hlmBtn size="sm" variant="outline" (click)="showToastSuccess('Order filled at 99.215')">Success</button>
          <button hlmBtn size="sm" variant="destructive" (click)="showToastError('Order rejected: insufficient margin')">Error</button>
        </div>
        <hlm-toaster />
      </div>

      <!-- 30. TABLE -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Table</h2>
        <hlm-table>
          <hlm-table-header>
            <hlm-table-row>
              <hlm-table-head>Bond</hlm-table-head>
              <hlm-table-head>Coupon</hlm-table-head>
              <hlm-table-head>Yield</hlm-table-head>
              <hlm-table-head>Price</hlm-table-head>
              <hlm-table-head class="text-right">Chg (bps)</hlm-table-head>
            </hlm-table-row>
          </hlm-table-header>
          <hlm-table-body>
            @for (b of bonds; track b.name) {
              <hlm-table-row>
                <hlm-table-cell class="font-medium">{{ b.name }}</hlm-table-cell>
                <hlm-table-cell>{{ b.coupon }}</hlm-table-cell>
                <hlm-table-cell>{{ b.yield }}</hlm-table-cell>
                <hlm-table-cell>{{ b.price }}</hlm-table-cell>
                <hlm-table-cell [class]="'text-right ' + (b.chg.startsWith('+') ? 'text-sell' : 'text-buy')">{{ b.chg }}</hlm-table-cell>
              </hlm-table-row>
            }
          </hlm-table-body>
        </hlm-table>
        <p class="text-xs text-muted-foreground text-center mt-1">US Treasury benchmark yields</p>
      </div>

      <!-- 31. SHEET -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">Sheet</h2>
        <button hlmBtn variant="outline" (click)="sheetOpen.set(true)">Open Side Panel</button>
        <hlm-sheet [open]="sheetOpen()" (openChange)="sheetOpen.set($event)" side="right">
          <div class="p-4 space-y-3">
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-foreground">Trade Details</h3>
              <p class="text-xs text-muted-foreground">View and edit your order parameters.</p>
            </div>
            <div class="space-y-3 py-4">
              <div class="space-y-1">
                <label class="text-xs font-medium text-foreground">Instrument</label>
                <input hlmInput value="US 10Y T-Note" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-foreground">Quantity</label>
                <input hlmInput type="number" value="5000000" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-foreground">Price</label>
                <input hlmInput type="number" value="99.215" step="0.001" />
              </div>
            </div>
          </div>
        </hlm-sheet>
      </div>

      <!-- 32. ASPECTRATIO -->
      <div class="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 class="text-sm font-semibold text-foreground tracking-wide uppercase">AspectRatio</h2>
        <div class="w-64">
          <hlm-aspect-ratio [ratio]="16 / 9">
            <div class="bg-muted rounded-md flex items-center justify-center h-full w-full">
              <span class="text-xs text-muted-foreground">16:9 Container</span>
            </div>
          </hlm-aspect-ratio>
        </div>
      </div>

    </div>
  `,
})
export class ComponentsPanelComponent {
  private readonly toastService = inject(HlmToastService);

  // 1. Button
  readonly buttonVariants = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'buy', 'sell'] as const;

  // 3. Select
  readonly selectedCurrency = signal('USD/JPY');

  // 4. Dialog
  readonly dialogOpen = signal(false);

  // 6. Tabs
  readonly tabItems = [
    { value: 'overview', label: 'Overview' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'settings', label: 'Settings' },
  ];
  readonly activeTab = signal('overview');

  // 7. Switch
  readonly switchA = signal(false);
  readonly switchB = signal(true);

  // 8. Checkbox
  readonly checkbox1 = signal(false);
  readonly checkbox2 = signal(true);

  // 9. Progress
  readonly progressValues = [15, 45, 70, 100];

  // 11. Avatar
  readonly avatarInitials = ['JD', 'AS', 'MK', 'RL', 'TC'];

  // 13. Toggle
  readonly toggleBold = signal(false);
  readonly toggleItalic = signal(false);
  readonly toggleUnderline = signal(false);

  // 14. ToggleGroup
  readonly toggleGroupSingleOptions = ['Left', 'Center', 'Right'];
  readonly toggleGroupSingle = signal('Center');
  readonly toggleGroupMulti = signal<string[]>(['bold']);

  toggleMulti(value: string): void {
    this.toggleGroupMulti.update((arr) =>
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    );
  }

  // Toggle helpers (arrow fns not allowed in Angular templates)
  toggleSwitchA(): void { this.switchA.update((v) => !v); }
  toggleSwitchB(): void { this.switchB.update((v) => !v); }
  toggleCheckbox1(): void { this.checkbox1.update((v) => !v); }
  toggleCheckbox2(): void { this.checkbox2.update((v) => !v); }
  toggleBoldFn(): void { this.toggleBold.update((v) => !v); }
  toggleItalicFn(): void { this.toggleItalic.update((v) => !v); }
  toggleUnderlineFn(): void { this.toggleUnderline.update((v) => !v); }
  toggleShowGrid(): void { this.showGrid.update((v) => !v); }
  toggleShowPnl(): void { this.showPnl.update((v) => !v); }

  // 18. AlertDialog
  readonly alertDialogOpen = signal(false);

  // 20. DropdownMenu
  readonly showGrid = signal(true);
  readonly showPnl = signal(false);

  // 21. Slider
  readonly sliderValue = signal(50);

  // 22. ScrollArea
  readonly instruments = [
    'US 2Y T-Note', 'US 5Y T-Note', 'US 10Y T-Note', 'US 30Y T-Bond',
    'DE 10Y Bund', 'UK 10Y Gilt', 'JP 10Y JGB', 'AU 10Y Bond',
    'CA 10Y Bond', 'FR 10Y OAT', 'IT 10Y BTP', 'ES 10Y Bono',
  ];

  // 24. RadioGroup
  readonly radioValue = signal('market');

  // 28. Calendar
  readonly calendarDate = signal<Date | null>(new Date());

  // 29. Toast
  showToast(msg: string): void {
    this.toastService.show(msg);
  }
  showToastSuccess(msg: string): void {
    this.toastService.show(msg, { variant: 'success' });
  }
  showToastError(msg: string): void {
    this.toastService.show(msg, { variant: 'destructive' });
  }

  // 30. Table
  readonly bonds = [
    { name: 'US 2Y', coupon: '4.625%', yield: '4.312%', price: '99.875', chg: '+2.1' },
    { name: 'US 5Y', coupon: '4.250%', yield: '4.085%', price: '100.125', chg: '-1.3' },
    { name: 'US 10Y', coupon: '4.000%', yield: '4.125%', price: '99.215', chg: '+3.0' },
    { name: 'US 30Y', coupon: '4.375%', yield: '4.285%', price: '98.500', chg: '+4.2' },
  ];

  // 31. Sheet
  readonly sheetOpen = signal(false);
}
