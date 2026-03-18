import { Component, ChangeDetectionStrategy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { AccordionModule } from 'primeng/accordion';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import type { MenuItem } from 'primeng/api';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-components-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ToggleSwitchModule,
    DialogModule,
    TabsModule,
    CardModule,
    TagModule,
    BadgeModule,
    MessageModule,
    TooltipModule,
    ProgressBarModule,
    AvatarModule,
    SelectButtonModule,
    TextareaModule,
    SliderModule,
    DatePickerModule,
    DrawerModule,
    AccordionModule,
    MenuModule,
    PopoverModule,
  ],
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-4 bg-[var(--background)]">
      <h1 class="text-lg font-bold text-[var(--foreground)] tracking-tight">Component Showcase</h1>
      <p class="text-xs text-[var(--muted-foreground)] -mt-2">All PrimeNG components available in this project</p>

      <!-- 1. Button -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Button</h2>
        <div class="space-y-3">
          @for (sev of buttonSeverities; track sev) {
            <div class="space-y-1">
              <span class="text-xs font-medium text-[var(--muted-foreground)] capitalize">{{ sev || 'primary' }}</span>
              <div class="flex items-center gap-2 flex-wrap">
                <p-button [label]="(sev || 'primary') + ' sm'" [severity]="sev" size="small" />
                <p-button [label]="sev || 'primary'" [severity]="sev" />
                <p-button [label]="(sev || 'primary') + ' lg'" [severity]="sev" size="large" />
                <p-button [label]="(sev || 'primary') + ' outlined'" [severity]="sev" [outlined]="true" />
                <p-button [label]="(sev || 'primary') + ' text'" [severity]="sev" [text]="true" />
                <p-button [severity]="sev" [rounded]="true" icon="pi pi-plus" />
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 2. Input -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Input</h2>
        <div class="grid grid-cols-2 gap-3 max-w-lg">
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">Text</label>
            <input pInputText placeholder="Enter symbol..." class="w-full" />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">Number</label>
            <input pInputText type="number" placeholder="0.00" class="w-full" />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">Disabled</label>
            <input pInputText disabled placeholder="Disabled" class="w-full" />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">With value</label>
            <input pInputText value="USD/JPY" class="w-full" />
          </div>
        </div>
      </section>

      <!-- 3. Select -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Select</h2>
        <div class="max-w-xs space-y-1">
          <label class="text-xs text-[var(--muted-foreground)]">Currency Pair</label>
          <p-select [options]="currencyPairs" [(ngModel)]="selectedPair" placeholder="Select pair" styleClass="w-full" />
          <p class="text-xs text-[var(--muted-foreground)]">Selected: {{ selectedPair() }}</p>
        </div>
      </section>

      <!-- 4. Dialog -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Dialog</h2>
        <p-button label="Open Dialog" (click)="dialogVisible.set(true)" />
        <p class="text-xs text-[var(--muted-foreground)]">Dialog is {{ dialogVisible() ? 'open' : 'closed' }}</p>
        <p-dialog header="Confirm Trade" [(visible)]="dialogVisible" [modal]="true" [style]="{width: '400px'}">
          <p class="text-xs text-[var(--foreground)]">Buy 10,000 USD/JPY at market price. This action cannot be undone.</p>
          <ng-template pTemplate="footer">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (click)="dialogVisible.set(false)" />
            <p-button label="Confirm" (click)="dialogVisible.set(false)" />
          </ng-template>
        </p-dialog>
      </section>

      <!-- 5. Tag -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Tag</h2>
        <div class="flex flex-wrap gap-2">
          <p-tag value="Primary" />
          <p-tag value="Success" severity="success" />
          <p-tag value="Info" severity="info" />
          <p-tag value="Warning" severity="warn" />
          <p-tag value="Danger" severity="danger" />
          <p-tag value="Secondary" severity="secondary" />
          <p-tag value="Contrast" severity="contrast" />
        </div>
      </section>

      <!-- 6. Badge -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Badge</h2>
        <div class="flex flex-wrap gap-4">
          <p-badge value="4" />
          <p-badge value="2" severity="success" />
          <p-badge value="8" severity="info" />
          <p-badge value="1" severity="warn" />
          <p-badge value="5" severity="danger" />
          <p-badge value="3" severity="secondary" />
          <p-badge value="7" severity="contrast" />
        </div>
      </section>

      <!-- 7. Tabs -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Tabs</h2>
        <p-tabs value="0">
          <p-tablist>
            <p-tab value="0">Overview</p-tab>
            <p-tab value="1">Analytics</p-tab>
            <p-tab value="2">Settings</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="0">
              <p class="text-xs text-[var(--muted-foreground)] py-2">Portfolio summary and recent activity.</p>
            </p-tabpanel>
            <p-tabpanel value="1">
              <p class="text-xs text-[var(--muted-foreground)] py-2">Performance metrics and P&amp;L charts.</p>
            </p-tabpanel>
            <p-tabpanel value="2">
              <p class="text-xs text-[var(--muted-foreground)] py-2">Notification and display preferences.</p>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </section>

      <!-- 8. ToggleSwitch -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">ToggleSwitch</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <p-toggleswitch [(ngModel)]="switchA" />
            <span class="text-xs text-[var(--foreground)]">Dark mode: {{ switchA() ? 'On' : 'Off' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <p-toggleswitch [(ngModel)]="switchB" />
            <span class="text-xs text-[var(--foreground)]">Notifications: {{ switchB() ? 'On' : 'Off' }}</span>
          </div>
        </div>
      </section>

      <!-- 9. Checkbox -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Checkbox</h2>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="checkA" [binary]="true" inputId="chk1" />
            <label for="chk1" class="text-xs text-[var(--foreground)] cursor-pointer">Unchecked by default</label>
          </div>
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="checkB" [binary]="true" inputId="chk2" />
            <label for="chk2" class="text-xs text-[var(--foreground)] cursor-pointer">Checked by default</label>
          </div>
        </div>
      </section>

      <!-- 10. ProgressBar -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">ProgressBar</h2>
        <div class="space-y-3 max-w-md">
          @for (v of progressValues; track v) {
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>Progress</span>
                <span>{{ v }}%</span>
              </div>
              <p-progressbar [value]="v" />
            </div>
          }
        </div>
      </section>

      <!-- 11. Tooltip -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Tooltip</h2>
        <div class="flex gap-3">
          <p-button label="Hover me" severity="secondary" size="small" pTooltip="Top tooltip" tooltipPosition="top" />
          <p-button label="Bottom" [outlined]="true" size="small" pTooltip="Bottom tooltip" tooltipPosition="bottom" />
          <p-button label="Right" [text]="true" size="small" pTooltip="Right tooltip" tooltipPosition="right" />
        </div>
      </section>

      <!-- 12. Avatar -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Avatar</h2>
        <div class="flex gap-3">
          @for (initials of avatarInitials; track initials) {
            <p-avatar [label]="initials" shape="circle" />
          }
        </div>
      </section>

      <!-- 13. Card -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Card</h2>
        <p-card header="Order Summary" subheader="Review your trade details">
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-[var(--muted-foreground)]">Instrument</span>
              <span class="text-[var(--foreground)] font-medium">US 10Y T-Note</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-[var(--muted-foreground)]">Quantity</span>
              <span class="text-[var(--foreground)] font-medium">5,000,000</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-[var(--muted-foreground)]">Price</span>
              <span class="text-[var(--foreground)] font-medium">99.215</span>
            </div>
          </div>
          <ng-template pTemplate="footer">
            <div class="flex justify-end gap-2">
              <p-button label="Cancel" severity="secondary" [outlined]="true" size="small" />
              <p-button label="Confirm" size="small" />
            </div>
          </ng-template>
        </p-card>
      </section>

      <!-- 14. SelectButton -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">SelectButton</h2>
        <div class="space-y-3">
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)]">Single select</span>
            <p-selectbutton [options]="alignOptions" [(ngModel)]="selectedAlign" />
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)]">Multiple select</span>
            <p-selectbutton [options]="formatOptions" [(ngModel)]="selectedFormats" [multiple]="true" />
          </div>
        </div>
      </section>

      <!-- 15. InputNumber -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">InputNumber</h2>
        <div class="grid grid-cols-2 gap-3 max-w-lg">
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">Integer</label>
            <p-inputnumber [(ngModel)]="inputNumInt" [useGrouping]="true" styleClass="w-full" />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">Decimal</label>
            <p-inputnumber [(ngModel)]="inputNumDec" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="4" styleClass="w-full" />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">Currency</label>
            <p-inputnumber [(ngModel)]="inputNumCur" mode="currency" currency="USD" locale="en-US" styleClass="w-full" />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-[var(--muted-foreground)]">Percentage</label>
            <p-inputnumber [(ngModel)]="inputNumPct" suffix="%" [min]="0" [max]="100" styleClass="w-full" />
          </div>
        </div>
      </section>

      <!-- 16. Textarea -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Textarea</h2>
        <div class="max-w-sm space-y-1">
          <label class="text-xs text-[var(--muted-foreground)]">Trade Notes</label>
          <textarea pTextarea rows="3" placeholder="Enter notes for this trade..." class="w-full"></textarea>
        </div>
      </section>

      <!-- 17. Message -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Message</h2>
        <div class="space-y-2 max-w-lg">
          <p-message severity="info">Market data is delayed by 15 minutes.</p-message>
          <p-message severity="success">Order filled at 99.215.</p-message>
          <p-message severity="warn">Margin utilization above 80%.</p-message>
          <p-message severity="error">Connection to exchange lost. Retrying...</p-message>
        </div>
      </section>

      <!-- 18. Table -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Table</h2>
        <p-table [value]="bonds" styleClass="p-datatable-sm p-datatable-gridlines">
          <ng-template pTemplate="header">
            <tr>
              <th>Bond</th>
              <th>Coupon</th>
              <th>Yield</th>
              <th>Price</th>
              <th class="text-right">Chg (bps)</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-b>
            <tr>
              <td class="font-medium">{{ b.name }}</td>
              <td>{{ b.coupon }}</td>
              <td>{{ b.yield }}</td>
              <td>{{ b.price }}</td>
              <td class="text-right" [ngClass]="b.chg.startsWith('+') ? 'text-[var(--negative)]' : 'text-[var(--positive)]'">{{ b.chg }}</td>
            </tr>
          </ng-template>
        </p-table>
      </section>

      <!-- 19. Slider -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Slider</h2>
        <div class="max-w-xs space-y-2">
          <div class="flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>Volume</span>
            <span>{{ sliderValue() }}%</span>
          </div>
          <p-slider [(ngModel)]="sliderValue" [max]="100" />
        </div>
      </section>

      <!-- 20. DatePicker -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">DatePicker</h2>
        <div class="max-w-xs space-y-1">
          <label class="text-xs text-[var(--muted-foreground)]">Settlement Date</label>
          <p-datepicker [(ngModel)]="dateValue" [showIcon]="true" styleClass="w-full" />
          <p class="text-xs text-[var(--muted-foreground)]">Selected: {{ dateValue() ? dateValue()!.toLocaleDateString() : 'None' }}</p>
        </div>
      </section>

      <!-- 21. Drawer -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Drawer</h2>
        <p-button label="Open Side Panel" [outlined]="true" (click)="drawerVisible.set(true)" />
        <p-drawer header="Trade Details" [(visible)]="drawerVisible" position="right">
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-xs text-[var(--muted-foreground)]">Instrument</label>
              <input pInputText value="US 10Y T-Note" class="w-full" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-[var(--muted-foreground)]">Quantity</label>
              <input pInputText type="number" value="5000000" class="w-full" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-[var(--muted-foreground)]">Price</label>
              <input pInputText type="number" value="99.215" class="w-full" />
            </div>
          </div>
        </p-drawer>
      </section>

      <!-- 22. Accordion -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Accordion</h2>
        <p-accordion [multiple]="false" class="max-w-sm block">
          <p-accordion-panel value="0">
            <p-accordion-header>Market Overview</p-accordion-header>
            <p-accordion-content>
              <p class="text-xs text-[var(--muted-foreground)]">Treasury yields moved higher across the curve with the 10Y up 3bps.</p>
            </p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="1">
            <p-accordion-header>Position Summary</p-accordion-header>
            <p-accordion-content>
              <p class="text-xs text-[var(--muted-foreground)]">Net DV01: $12,500. Long duration bias with curve flattener.</p>
            </p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="2">
            <p-accordion-header>Risk Limits</p-accordion-header>
            <p-accordion-content>
              <p class="text-xs text-[var(--muted-foreground)]">Current utilization: 62%. Daily VaR: $45,000.</p>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </section>

      <!-- 23. Menu -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Menu</h2>
        <p-menu [model]="menuItems" />
      </section>

      <!-- 24. Popover -->
      <section class="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h2 class="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase">Popover</h2>
        <p-button label="Open Popover" [outlined]="true" (click)="popover.toggle($event)" />
        <p-popover #popover>
          <div class="space-y-2 p-2" style="width: 240px">
            <h4 class="text-xs font-medium text-[var(--foreground)]">Quick Settings</h4>
            <div class="space-y-1">
              <label class="text-[11px] text-[var(--muted-foreground)]">Default Lot Size</label>
              <input pInputText type="number" value="1000000" class="w-full text-xs" />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] text-[var(--muted-foreground)]">Slippage Tolerance</label>
              <input pInputText type="number" value="0.5" step="0.1" class="w-full text-xs" />
            </div>
          </div>
        </p-popover>
      </section>
    </div>
  `,
})
export class ComponentsPanelComponent {
  /* ── Button ──────────────────────────────────────────── */
  readonly buttonSeverities: (
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
  )[] = ['primary', 'secondary', 'success', 'info', 'warn', 'danger', 'contrast'];

  /* ── Select ──────────────────────────────────────────── */
  readonly currencyPairs = [
    { label: 'USD/JPY', value: 'USD/JPY' },
    { label: 'EUR/USD', value: 'EUR/USD' },
    { label: 'GBP/USD', value: 'GBP/USD' },
    { label: 'AUD/USD', value: 'AUD/USD' },
  ];
  readonly selectedPair = signal('USD/JPY');

  /* ── Dialog ──────────────────────────────────────────── */
  readonly dialogVisible = signal(false);

  /* ── ToggleSwitch ───────────────────────────────────── */
  readonly switchA = signal(false);
  readonly switchB = signal(true);

  /* ── Checkbox ────────────────────────────────────────── */
  readonly checkA = signal(false);
  readonly checkB = signal(true);

  /* ── ProgressBar ─────────────────────────────────────── */
  readonly progressValues = [15, 45, 70, 100];

  /* ── Avatar ──────────────────────────────────────────── */
  readonly avatarInitials = ['JD', 'AS', 'MK', 'RL', 'TC'];

  /* ── SelectButton ────────────────────────────────────── */
  readonly alignOptions = ['Left', 'Center', 'Right'];
  readonly selectedAlign = signal('Center');
  readonly formatOptions = ['Bold', 'Italic', 'Underline'];
  readonly selectedFormats = signal(['Bold']);

  /* ── InputNumber ─────────────────────────────────────── */
  readonly inputNumInt = signal(42000);
  readonly inputNumDec = signal(149.3250);
  readonly inputNumCur = signal(1500.50);
  readonly inputNumPct = signal(75);

  /* ── Table ───────────────────────────────────────────── */
  readonly bonds = [
    { name: 'US 2Y', coupon: '4.625%', yield: '4.312%', price: '99.875', chg: '+2.1' },
    { name: 'US 5Y', coupon: '4.250%', yield: '4.085%', price: '100.125', chg: '-1.3' },
    { name: 'US 10Y', coupon: '4.000%', yield: '4.125%', price: '99.215', chg: '+3.0' },
    { name: 'US 30Y', coupon: '4.375%', yield: '4.285%', price: '98.500', chg: '+4.2' },
  ];

  /* ── Slider ──────────────────────────────────────────── */
  readonly sliderValue = signal(50);

  /* ── DatePicker ──────────────────────────────────────── */
  readonly dateValue = signal<Date | null>(new Date());

  /* ── Drawer ──────────────────────────────────────────── */
  readonly drawerVisible = signal(false);

  /* ── Menu ────────────────────────────────────────────── */
  readonly menuItems: MenuItem[] = [
    {
      label: 'Account',
      items: [
        { label: 'Profile', icon: 'pi pi-user' },
        { label: 'Messages', icon: 'pi pi-envelope' },
      ],
    },
    {
      label: 'Settings',
      items: [
        { label: 'Preferences', icon: 'pi pi-cog' },
        { label: 'Logout', icon: 'pi pi-sign-out' },
      ],
    },
  ];

  /* ── Popover ref ────────────────────────────────────── */
  @ViewChild('popover') popover!: Popover;
}
