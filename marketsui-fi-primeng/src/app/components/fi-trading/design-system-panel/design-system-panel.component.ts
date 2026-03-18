import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

/* ── Data types ──────────────────────────────────────────── */

interface ColorToken {
  token: string;
  tailwind: string;
  description: string;
}

interface ColorGroup {
  label: string;
  tokens: ColorToken[];
}

/* ── Color palette data ─────────────────────────────────── */

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: 'Core Surfaces',
    tokens: [
      { token: '--background', tailwind: 'bg-background', description: 'Page / app background' },
      { token: '--foreground', tailwind: 'text-foreground', description: 'Primary text color' },
      { token: '--card', tailwind: 'bg-card', description: 'Card / panel background' },
      { token: '--card-foreground', tailwind: 'text-card-foreground', description: 'Text on cards' },
      { token: '--popover', tailwind: 'bg-popover', description: 'Popover / dropdown background' },
      { token: '--popover-foreground', tailwind: 'text-popover-foreground', description: 'Text inside popovers' },
    ],
  },
  {
    label: 'Brand',
    tokens: [
      { token: '--primary', tailwind: 'bg-primary', description: 'Primary brand / interactive color' },
      { token: '--primary-foreground', tailwind: 'text-primary-foreground', description: 'Text on primary backgrounds' },
    ],
  },
  {
    label: 'Neutral',
    tokens: [
      { token: '--secondary', tailwind: 'bg-secondary', description: 'Secondary surfaces' },
      { token: '--secondary-foreground', tailwind: 'text-secondary-foreground', description: 'Text on secondary' },
      { token: '--muted', tailwind: 'bg-muted', description: 'Muted / subtle backgrounds' },
      { token: '--muted-foreground', tailwind: 'text-muted-foreground', description: 'De-emphasized text' },
      { token: '--accent', tailwind: 'bg-accent', description: 'Accent highlights' },
      { token: '--accent-foreground', tailwind: 'text-accent-foreground', description: 'Text on accent' },
    ],
  },
  {
    label: 'Semantic',
    tokens: [
      { token: '--destructive', tailwind: 'bg-destructive', description: 'Error / destructive actions' },
      { token: '--destructive-foreground', tailwind: 'text-destructive-foreground', description: 'Text on destructive' },
    ],
  },
  {
    label: 'Chrome',
    tokens: [
      { token: '--border', tailwind: 'border-border', description: 'Borders and dividers' },
      { token: '--input', tailwind: 'border-input', description: 'Input field borders' },
      { token: '--ring', tailwind: 'ring-ring', description: 'Focus ring color' },
    ],
  },
  {
    label: 'Trading: Buy/Sell',
    tokens: [
      { token: '--buy', tailwind: 'bg-buy', description: 'Buy action background' },
      { token: '--buy-foreground', tailwind: 'text-buy-foreground', description: 'Text on buy background' },
      { token: '--sell', tailwind: 'bg-sell', description: 'Sell action background' },
      { token: '--sell-foreground', tailwind: 'text-sell-foreground', description: 'Text on sell background' },
    ],
  },
  {
    label: 'Trading: P&L',
    tokens: [
      { token: '--positive', tailwind: 'text-positive', description: 'Profit / positive change' },
      { token: '--negative', tailwind: 'text-negative', description: 'Loss / negative change' },
      { token: '--unchanged', tailwind: 'text-unchanged', description: 'Flat / no change' },
    ],
  },
  {
    label: 'Trading: Order Status',
    tokens: [
      { token: '--status-filled', tailwind: 'text-status-filled', description: 'Fully filled orders' },
      { token: '--status-partial', tailwind: 'text-status-partial', description: 'Partially filled orders' },
      { token: '--status-working', tailwind: 'text-status-working', description: 'Working / open orders' },
      { token: '--status-cancelled', tailwind: 'text-status-cancelled', description: 'Cancelled orders' },
      { token: '--status-rejected', tailwind: 'text-status-rejected', description: 'Rejected orders' },
    ],
  },
  {
    label: 'Alerts',
    tokens: [
      { token: '--warning', tailwind: 'bg-warning', description: 'Warning / caution state' },
      { token: '--warning-foreground', tailwind: 'text-warning-foreground', description: 'Text on warning' },
      { token: '--info', tailwind: 'bg-info', description: 'Informational state' },
      { token: '--info-foreground', tailwind: 'text-info-foreground', description: 'Text on info' },
      { token: '--success', tailwind: 'bg-success', description: 'Success state' },
      { token: '--success-foreground', tailwind: 'text-success-foreground', description: 'Text on success' },
    ],
  },
  {
    label: 'Charts',
    tokens: [
      { token: '--chart-1', tailwind: 'bg-chart-1', description: 'Chart series 1 (blue)' },
      { token: '--chart-2', tailwind: 'bg-chart-2', description: 'Chart series 2 (green)' },
      { token: '--chart-3', tailwind: 'bg-chart-3', description: 'Chart series 3 (amber)' },
      { token: '--chart-4', tailwind: 'bg-chart-4', description: 'Chart series 4 (red)' },
      { token: '--chart-5', tailwind: 'bg-chart-5', description: 'Chart series 5 (purple)' },
    ],
  },
  {
    label: 'UI',
    tokens: [
      { token: '--highlight', tailwind: 'bg-highlight', description: 'Row hover highlight' },
      { token: '--selection', tailwind: 'bg-selection', description: 'Selected row / item' },
      { token: '--ticker-bar', tailwind: 'bg-ticker-bar', description: 'Scrolling ticker bar background' },
      { token: '--ticker-bar-foreground', tailwind: 'text-ticker-bar-foreground', description: 'Ticker bar text' },
    ],
  },
  {
    label: 'Sidebar',
    tokens: [
      { token: '--sidebar', tailwind: 'bg-sidebar', description: 'Sidebar background' },
      { token: '--sidebar-foreground', tailwind: 'text-sidebar-foreground', description: 'Sidebar text' },
      { token: '--sidebar-primary', tailwind: 'bg-sidebar-primary', description: 'Sidebar primary accent' },
      { token: '--sidebar-primary-foreground', tailwind: 'text-sidebar-primary-foreground', description: 'Text on sidebar primary' },
      { token: '--sidebar-accent', tailwind: 'bg-sidebar-accent', description: 'Sidebar accent background' },
      { token: '--sidebar-accent-foreground', tailwind: 'text-sidebar-accent-foreground', description: 'Text on sidebar accent' },
      { token: '--sidebar-border', tailwind: 'border-sidebar-border', description: 'Sidebar border color' },
      { token: '--sidebar-ring', tailwind: 'ring-sidebar-ring', description: 'Sidebar focus ring' },
    ],
  },
];

/* ── Flatten for p-table ────────────────────────────────── */

interface FlatRow {
  isGroupHeader: boolean;
  groupLabel: string;
  token: string;
  cssVar: string;
  tailwind: string;
  description: string;
}

function flattenGroups(groups: ColorGroup[]): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const g of groups) {
    rows.push({ isGroupHeader: true, groupLabel: g.label, token: '', cssVar: '', tailwind: '', description: '' });
    for (const t of g.tokens) {
      rows.push({
        isGroupHeader: false,
        groupLabel: g.label,
        token: t.token,
        cssVar: `var(${t.token})`,
        tailwind: t.tailwind,
        description: t.description,
      });
    }
  }
  return rows;
}

const FLAT_ROWS = flattenGroups(COLOR_GROUPS);

/* ── Typography data ────────────────────────────────────── */

const TYPE_SIZES = [
  { label: 'text-xs', size: '10px', px: 10 },
  { label: 'text-sm', size: '12px', px: 12 },
  { label: 'text-base', size: '14px', px: 14 },
  { label: 'text-lg', size: '16px', px: 16 },
  { label: 'text-xl', size: '20px', px: 20 },
  { label: 'text-2xl', size: '24px', px: 24 },
];

const FONT_WEIGHTS = [
  { label: 'Normal', weight: 400 },
  { label: 'Medium', weight: 500 },
  { label: 'Semibold', weight: 600 },
  { label: 'Bold', weight: 700 },
];

const SPACING_SCALE = [
  { unit: 1, px: 4 },
  { unit: 2, px: 8 },
  { unit: 3, px: 12 },
  { unit: 4, px: 16 },
  { unit: 6, px: 24 },
  { unit: 8, px: 32 },
  { unit: 12, px: 48 },
  { unit: 16, px: 64 },
];

const RADII = [
  { label: 'rounded-sm' },
  { label: 'rounded' },
  { label: 'rounded-md' },
  { label: 'rounded-lg' },
  { label: 'rounded-xl' },
  { label: 'rounded-2xl' },
];

const SHADOWS = [
  { label: 'shadow-sm' },
  { label: 'shadow' },
  { label: 'shadow-md' },
  { label: 'shadow-lg' },
  { label: 'shadow-xl' },
];

@Component({
  selector: 'app-design-system-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule],
  template: `
    <div class="h-full overflow-y-auto p-4 space-y-6 bg-background">
      <h1 class="text-2xl font-bold text-foreground">Design System</h1>

      <!-- Color Palette -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-semibold text-card-foreground mb-4">Color Palette</h2>
        <div class="overflow-x-auto">
          <p-table [value]="flatRows" [scrollable]="true" styleClass="p-datatable-sm p-datatable-gridlines">
            <ng-template pTemplate="header">
              <tr>
                <th class="!text-xs !font-semibold !text-muted-foreground uppercase tracking-wider" style="width:60px">Swatch</th>
                <th class="!text-xs !font-semibold !text-muted-foreground uppercase tracking-wider">Token</th>
                <th class="!text-xs !font-semibold !text-muted-foreground uppercase tracking-wider">CSS Variable</th>
                <th class="!text-xs !font-semibold !text-muted-foreground uppercase tracking-wider">Tailwind</th>
                <th class="!text-xs !font-semibold !text-muted-foreground uppercase tracking-wider">Description</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row>
              @if (row.isGroupHeader) {
                <tr>
                  <td colspan="5" class="!pt-4 !pb-1 !px-3 !text-xs !font-semibold uppercase tracking-wider !text-muted-foreground !bg-transparent !border-0">
                    {{ row.groupLabel }}
                  </td>
                </tr>
              } @else {
                <tr>
                  <td class="!px-3 !py-2">
                    <div class="w-8 h-8 rounded-md border border-border" [style.background]="'var(' + row.token + ')'"></div>
                  </td>
                  <td class="!px-3 !py-2 font-mono !text-xs !text-foreground">{{ row.token }}</td>
                  <td class="!px-3 !py-2 font-mono !text-xs !text-muted-foreground">{{ row.cssVar }}</td>
                  <td class="!px-3 !py-2 font-mono !text-xs !text-muted-foreground">{{ row.tailwind }}</td>
                  <td class="!px-3 !py-2 !text-sm !text-muted-foreground">{{ row.description }}</td>
                </tr>
              }
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- Typography -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-semibold text-card-foreground mb-4">Typography</h2>
        <div class="space-y-6">
          <!-- Font Sizes -->
          <div>
            <h3 class="text-sm font-semibold text-muted-foreground mb-3">Font Family: Inter</h3>
            <div class="space-y-3">
              @for (s of typeSizes; track s.label) {
                <div class="flex items-baseline gap-4">
                  <span class="w-24 shrink-0 font-mono text-xs text-muted-foreground">{{ s.label }} ({{ s.size }})</span>
                  <span [style.fontSize]="s.size" [style.fontFamily]="'Inter, sans-serif'" class="text-foreground">
                    The quick brown fox jumps over the lazy dog
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Font Weights -->
          <div class="border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-muted-foreground mb-3">Font Weights</h3>
            <div class="space-y-2">
              @for (w of fontWeights; track w.weight) {
                <div class="flex items-baseline gap-4">
                  <span class="w-24 shrink-0 font-mono text-xs text-muted-foreground">{{ w.weight }}</span>
                  <span class="text-sm text-foreground" [style.fontWeight]="w.weight" [style.fontFamily]="'Inter, sans-serif'">
                    {{ w.label }} &mdash; Trading Dashboard 123,456.78
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Monospace -->
          <div class="border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-muted-foreground mb-3">Monospace: JetBrains Mono</h3>
            <div class="space-y-2">
              @for (s of monoSizes; track s.label) {
                <div class="flex items-baseline gap-4">
                  <span class="w-24 shrink-0 font-mono text-xs text-muted-foreground">{{ s.label }} ({{ s.size }})</span>
                  <span [style.fontSize]="s.size" [style.fontFamily]="'JetBrains Mono, monospace'" class="text-foreground">
                    USD/JPY 149.325 +0.42%
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Spacing Scale -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-semibold text-card-foreground mb-4">Spacing Scale</h2>
        <div class="space-y-3">
          @for (s of spacingScale; track s.unit) {
            <div class="flex items-center gap-4">
              <span class="w-20 shrink-0 font-mono text-xs text-muted-foreground text-right">{{ s.unit }} ({{ s.px }}px)</span>
              <div class="bg-primary rounded-sm" [style.width.px]="s.px" style="height:24px"></div>
            </div>
          }
        </div>
      </div>

      <!-- Border Radius -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-semibold text-card-foreground mb-4">Border Radius</h2>
        <div class="flex flex-wrap gap-6">
          @for (r of radii; track r.label) {
            <div class="flex flex-col items-center gap-2">
              <div class="w-16 h-16 bg-primary" [ngClass]="r.label"></div>
              <span class="font-mono text-xs text-muted-foreground">{{ r.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Shadows -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-semibold text-card-foreground mb-4">Shadows</h2>
        <div class="flex flex-wrap gap-6">
          @for (s of shadows; track s.label) {
            <div class="flex flex-col items-center gap-2">
              <div class="w-24 h-24 bg-card border border-border rounded-lg flex items-center justify-center" [ngClass]="s.label">
                <span class="text-xs text-muted-foreground text-center px-1">{{ s.label }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DesignSystemPanelComponent {
  readonly flatRows = FLAT_ROWS;
  readonly typeSizes = TYPE_SIZES;
  readonly monoSizes = TYPE_SIZES.slice(0, 4);
  readonly fontWeights = FONT_WEIGHTS;
  readonly spacingScale = SPACING_SCALE;
  readonly radii = RADII;
  readonly shadows = SHADOWS;
}
