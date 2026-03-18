import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

interface ColorToken {
  name: string;
  tailwind: string;
  description: string;
}

@Component({
  selector: 'app-design-system-panel',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto p-6 space-y-10">

      <!-- ── Header ──────────────────────────────────────────── -->
      <div>
        <h1 class="text-2xl font-bold text-foreground">Design System</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Tokens, typography, spacing, and visual foundations for the trading UI.
        </p>
      </div>

      <!-- ══════════════════════════════════════════════════════ -->
      <!-- 1. COLOR PALETTE                                      -->
      <!-- ══════════════════════════════════════════════════════ -->
      <section>
        <h2 class="text-lg font-semibold text-foreground mb-4">Color Palette</h2>

        @for (group of colorGroups; track group.label) {
          <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-2">
            {{ group.label }}
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="border-b border-border text-left text-muted-foreground">
                  <th class="py-2 pr-3 w-12">Swatch</th>
                  <th class="py-2 pr-3">Token</th>
                  <th class="py-2 pr-3">CSS Variable</th>
                  <th class="py-2 pr-3">Tailwind</th>
                  <th class="py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                @for (token of group.tokens; track token.name) {
                  <tr class="border-b border-border/50 hover:bg-muted/30">
                    <td class="py-2 pr-3">
                      <div
                        class="w-8 h-8 rounded-md border border-border"
                        [style.background]="'var(--' + token.name + ')'"
                      ></div>
                    </td>
                    <td class="py-2 pr-3 font-mono text-foreground">--{{ token.name }}</td>
                    <td class="py-2 pr-3 font-mono text-muted-foreground">var(--{{ token.name }})</td>
                    <td class="py-2 pr-3 font-mono text-muted-foreground">{{ token.tailwind }}</td>
                    <td class="py-2 text-muted-foreground">{{ token.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <!-- ══════════════════════════════════════════════════════ -->
      <!-- 2. TYPOGRAPHY                                         -->
      <!-- ══════════════════════════════════════════════════════ -->
      <section>
        <h2 class="text-lg font-semibold text-foreground mb-4">Typography</h2>

        <div class="bg-card rounded-xl border border-border p-6 space-y-6">
          <!-- Inter -->
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Inter &mdash; Primary Font
            </h3>
            <div class="space-y-3">
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-2xl / font-bold (24px / 700)</span>
                <p class="text-2xl font-bold text-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-xl / font-semibold (20px / 600)</span>
                <p class="text-xl font-semibold text-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-lg / font-medium (18px / 500)</span>
                <p class="text-lg font-medium text-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-base / font-normal (16px / 400)</span>
                <p class="text-base font-normal text-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-sm / font-normal (14px / 400)</span>
                <p class="text-sm font-normal text-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-xs / font-normal (12px / 400)</span>
                <p class="text-xs font-normal text-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-[11px] / font-medium (11px / 500)</span>
                <p class="text-[11px] font-medium text-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-[10px] / font-medium (10px / 500)</span>
                <p class="text-[10px] font-medium text-foreground">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
              </div>
            </div>
          </div>

          <div class="h-px bg-border"></div>

          <!-- JetBrains Mono -->
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              JetBrains Mono &mdash; Monospace
            </h3>
            <div class="space-y-3">
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-sm / font-mono (14px)</span>
                <p class="text-sm font-mono text-foreground">UST 10Y 4.285% +2.3bps</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-xs / font-mono (12px)</span>
                <p class="text-xs font-mono text-foreground">DV01: $12,450 | P&amp;L: +$234,567</p>
              </div>
              <div>
                <span class="text-[10px] text-muted-foreground font-mono">text-[11px] / font-mono tabular-nums (11px)</span>
                <p class="text-[11px] font-mono tabular-nums text-foreground">102-16+ / 102-17 &nbsp; 3.2M &nbsp; +0.5</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════ -->
      <!-- 3. SPACING SCALE                                      -->
      <!-- ══════════════════════════════════════════════════════ -->
      <section>
        <h2 class="text-lg font-semibold text-foreground mb-4">Spacing Scale</h2>

        <div class="bg-card rounded-xl border border-border p-6">
          <div class="space-y-3">
            @for (sp of spacingScale; track sp.label) {
              <div class="flex items-center gap-4">
                <span class="text-xs font-mono text-muted-foreground w-10 text-right">{{ sp.label }}</span>
                <span class="text-[10px] font-mono text-muted-foreground w-12">{{ sp.px }}</span>
                <div
                  class="h-4 rounded-sm bg-primary/70"
                  [style.width.px]="sp.pxNum"
                ></div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════ -->
      <!-- 4. BORDER RADIUS                                      -->
      <!-- ══════════════════════════════════════════════════════ -->
      <section>
        <h2 class="text-lg font-semibold text-foreground mb-4">Border Radius</h2>

        <div class="bg-card rounded-xl border border-border p-6">
          <div class="flex flex-wrap gap-6">
            @for (r of borderRadii; track r.label) {
              <div class="flex flex-col items-center gap-2">
                <div
                  class="w-20 h-20 bg-primary/20 border-2 border-primary"
                  [style.border-radius]="r.value"
                ></div>
                <span class="text-xs font-mono text-foreground">{{ r.label }}</span>
                <span class="text-[10px] text-muted-foreground">{{ r.value }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════ -->
      <!-- 5. SHADOWS                                            -->
      <!-- ══════════════════════════════════════════════════════ -->
      <section class="pb-10">
        <h2 class="text-lg font-semibold text-foreground mb-4">Shadows</h2>

        <div class="bg-card rounded-xl border border-border p-6">
          <div class="flex flex-wrap gap-8">
            @for (s of shadows; track s.label) {
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-32 h-24 rounded-lg bg-background border border-border"
                  [class]="s.class"
                ></div>
                <span class="text-xs font-mono text-foreground">{{ s.label }}</span>
                <span class="text-[10px] text-muted-foreground">{{ s.tailwind }}</span>
              </div>
            }
          </div>
        </div>
      </section>

    </div>
  `,
})
export class DesignSystemPanelComponent {

  /* ── Color Tokens ────────────────────────────────────── */
  readonly colorGroups: { label: string; tokens: ColorToken[] }[] = [
    {
      label: 'Core Surfaces',
      tokens: [
        { name: 'background',          tailwind: 'bg-background',          description: 'Page / app background' },
        { name: 'foreground',           tailwind: 'text-foreground',        description: 'Primary text color' },
        { name: 'card',                 tailwind: 'bg-card',                description: 'Card / panel background' },
        { name: 'card-foreground',      tailwind: 'text-card-foreground',   description: 'Text on cards' },
        { name: 'popover',              tailwind: 'bg-popover',             description: 'Popover / dropdown background' },
        { name: 'popover-foreground',   tailwind: 'text-popover-foreground', description: 'Text inside popovers' },
      ],
    },
    {
      label: 'Brand',
      tokens: [
        { name: 'primary',             tailwind: 'bg-primary',             description: 'Primary brand / interactive color' },
        { name: 'primary-foreground',   tailwind: 'text-primary-foreground', description: 'Text on primary backgrounds' },
      ],
    },
    {
      label: 'Neutral',
      tokens: [
        { name: 'secondary',           tailwind: 'bg-secondary',           description: 'Secondary surfaces' },
        { name: 'secondary-foreground', tailwind: 'text-secondary-foreground', description: 'Text on secondary' },
        { name: 'muted',               tailwind: 'bg-muted',               description: 'Muted / subtle backgrounds' },
        { name: 'muted-foreground',     tailwind: 'text-muted-foreground',  description: 'De-emphasized text' },
        { name: 'accent',              tailwind: 'bg-accent',              description: 'Accent highlights' },
        { name: 'accent-foreground',    tailwind: 'text-accent-foreground', description: 'Text on accent' },
      ],
    },
    {
      label: 'Semantic',
      tokens: [
        { name: 'destructive',          tailwind: 'bg-destructive',         description: 'Error / destructive actions' },
        { name: 'destructive-foreground', tailwind: 'text-destructive-foreground', description: 'Text on destructive' },
      ],
    },
    {
      label: 'Chrome',
      tokens: [
        { name: 'border',              tailwind: 'border-border',          description: 'Borders and dividers' },
        { name: 'input',               tailwind: 'border-input',           description: 'Input field borders' },
        { name: 'ring',                tailwind: 'ring-ring',              description: 'Focus ring color' },
      ],
    },
    {
      label: 'Trading: Buy/Sell',
      tokens: [
        { name: 'buy',                 tailwind: 'bg-buy',                 description: 'Buy action background' },
        { name: 'buy-foreground',       tailwind: 'text-buy-foreground',    description: 'Text on buy background' },
        { name: 'sell',                tailwind: 'bg-sell',                description: 'Sell action background' },
        { name: 'sell-foreground',      tailwind: 'text-sell-foreground',   description: 'Text on sell background' },
      ],
    },
    {
      label: 'Trading: P&L',
      tokens: [
        { name: 'positive',            tailwind: 'text-positive',          description: 'Profit / positive change' },
        { name: 'negative',            tailwind: 'text-negative',          description: 'Loss / negative change' },
        { name: 'unchanged',           tailwind: 'text-unchanged',         description: 'Flat / no change' },
      ],
    },
    {
      label: 'Trading: Order Status',
      tokens: [
        { name: 'status-filled',       tailwind: 'text-status-filled',     description: 'Fully filled orders' },
        { name: 'status-partial',       tailwind: 'text-status-partial',    description: 'Partially filled orders' },
        { name: 'status-working',       tailwind: 'text-status-working',    description: 'Working / open orders' },
        { name: 'status-cancelled',     tailwind: 'text-status-cancelled',  description: 'Cancelled orders' },
        { name: 'status-rejected',      tailwind: 'text-status-rejected',   description: 'Rejected orders' },
      ],
    },
    {
      label: 'Alerts',
      tokens: [
        { name: 'warning',             tailwind: 'bg-warning',             description: 'Warning / caution state' },
        { name: 'warning-foreground',   tailwind: 'text-warning-foreground', description: 'Text on warning' },
        { name: 'info',                tailwind: 'bg-info',                description: 'Informational state' },
        { name: 'info-foreground',      tailwind: 'text-info-foreground',   description: 'Text on info' },
        { name: 'success',             tailwind: 'bg-success',             description: 'Success state' },
        { name: 'success-foreground',   tailwind: 'text-success-foreground', description: 'Text on success' },
      ],
    },
    {
      label: 'Charts',
      tokens: [
        { name: 'chart-1',             tailwind: 'bg-chart-1',             description: 'Chart series 1 (blue)' },
        { name: 'chart-2',             tailwind: 'bg-chart-2',             description: 'Chart series 2 (green)' },
        { name: 'chart-3',             tailwind: 'bg-chart-3',             description: 'Chart series 3 (amber)' },
        { name: 'chart-4',             tailwind: 'bg-chart-4',             description: 'Chart series 4 (red)' },
        { name: 'chart-5',             tailwind: 'bg-chart-5',             description: 'Chart series 5 (purple)' },
      ],
    },
    {
      label: 'UI',
      tokens: [
        { name: 'highlight',           tailwind: 'bg-highlight',           description: 'Row hover highlight' },
        { name: 'selection',            tailwind: 'bg-selection',           description: 'Selected row / item' },
        { name: 'ticker-bar',          tailwind: 'bg-ticker-bar',          description: 'Scrolling ticker bar background' },
        { name: 'ticker-bar-foreground', tailwind: 'text-ticker-bar-foreground', description: 'Ticker bar text' },
      ],
    },
    {
      label: 'Sidebar',
      tokens: [
        { name: 'sidebar',                     tailwind: 'bg-sidebar',                     description: 'Sidebar background' },
        { name: 'sidebar-foreground',           tailwind: 'text-sidebar-foreground',        description: 'Sidebar text' },
        { name: 'sidebar-primary',              tailwind: 'bg-sidebar-primary',             description: 'Sidebar primary accent' },
        { name: 'sidebar-primary-foreground',   tailwind: 'text-sidebar-primary-foreground', description: 'Text on sidebar primary' },
        { name: 'sidebar-accent',               tailwind: 'bg-sidebar-accent',              description: 'Sidebar accent background' },
        { name: 'sidebar-accent-foreground',     tailwind: 'text-sidebar-accent-foreground', description: 'Text on sidebar accent' },
        { name: 'sidebar-border',               tailwind: 'border-sidebar-border',          description: 'Sidebar border color' },
        { name: 'sidebar-ring',                 tailwind: 'ring-sidebar-ring',              description: 'Sidebar focus ring' },
      ],
    },
  ];

  /* ── Spacing Scale ───────────────────────────────────── */
  readonly spacingScale = [
    { label: '0.5', px: '2px',  pxNum: 2 },
    { label: '1',   px: '4px',  pxNum: 4 },
    { label: '1.5', px: '6px',  pxNum: 6 },
    { label: '2',   px: '8px',  pxNum: 8 },
    { label: '3',   px: '12px', pxNum: 12 },
    { label: '4',   px: '16px', pxNum: 16 },
    { label: '5',   px: '20px', pxNum: 20 },
    { label: '6',   px: '24px', pxNum: 24 },
    { label: '8',   px: '32px', pxNum: 32 },
    { label: '10',  px: '40px', pxNum: 40 },
    { label: '12',  px: '48px', pxNum: 48 },
    { label: '16',  px: '64px', pxNum: 64 },
    { label: '20',  px: '80px', pxNum: 80 },
    { label: '24',  px: '96px', pxNum: 96 },
  ];

  /* ── Border Radius ───────────────────────────────────── */
  readonly borderRadii = [
    { label: 'none',   value: '0px' },
    { label: 'sm',     value: '2px' },
    { label: 'DEFAULT', value: '4px' },
    { label: 'md',     value: '6px' },
    { label: 'lg',     value: '8px' },
    { label: 'xl',     value: '12px' },
    { label: '2xl',    value: '16px' },
    { label: 'full',   value: '9999px' },
  ];

  /* ── Shadows ─────────────────────────────────────────── */
  readonly shadows = [
    { label: 'shadow-sm',  class: 'shadow-sm',  tailwind: 'shadow-sm' },
    { label: 'shadow',     class: 'shadow',     tailwind: 'shadow' },
    { label: 'shadow-md',  class: 'shadow-md',  tailwind: 'shadow-md' },
    { label: 'shadow-lg',  class: 'shadow-lg',  tailwind: 'shadow-lg' },
    { label: 'shadow-xl',  class: 'shadow-xl',  tailwind: 'shadow-xl' },
    { label: 'shadow-2xl', class: 'shadow-2xl', tailwind: 'shadow-2xl' },
  ];
}
