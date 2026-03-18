import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';

import { NgClass } from '@angular/common';
import { MarketDataService } from '../../services/market-data.service';
import { ThemeService } from '../../services/theme.service';
import { fmtYield, fmtChgBps } from '../../shared/utils';
import { HlmButtonDirective } from '../../shared/ui/hlm-button.directive';
import { DashboardPanelComponent } from './dashboard-panel/dashboard-panel.component';
import { RatesPanelComponent } from './rates-panel/rates-panel.component';
import { CreditPanelComponent } from './credit-panel/credit-panel.component';
import { FuturesPanelComponent } from './futures-panel/futures-panel.component';
import { RiskPanelComponent } from './risk-panel/risk-panel.component';
import { PositionsPanelComponent } from './positions-panel/positions-panel.component';
import { BlotterPanelComponent } from './blotter-panel/blotter-panel.component';
import { DesignSystemPanelComponent } from './design-system-panel/design-system-panel.component';
import { ComponentsPanelComponent } from './components-panel/components-panel.component';

type FITab =
  | 'Overview'
  | 'Rates'
  | 'Credit'
  | 'Futures'
  | 'Risk'
  | 'Positions & P&L'
  | 'Order Blotter'
  | 'Design System'
  | 'Components';

const TABS: FITab[] = [
  'Overview',
  'Rates',
  'Credit',
  'Futures',
  'Risk',
  'Positions & P&L',
  'Order Blotter',
  'Design System',
  'Components',
];

@Component({
  selector: 'app-fi-trading',
  standalone: true,
  imports: [
    NgClass,
    HlmButtonDirective,
    DashboardPanelComponent,
    RatesPanelComponent,
    CreditPanelComponent,
    FuturesPanelComponent,
    RiskPanelComponent,
    PositionsPanelComponent,
    BlotterPanelComponent,
    DesignSystemPanelComponent,
    ComponentsPanelComponent,
  ],
  template: `
    <div class="flex flex-col h-full bg-background">
      <!-- Market Status Bar -->
      <div class="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 h-8 text-[11px] font-mono shrink-0">
        <!-- Left: status + yields -->
        <div class="flex items-center gap-4">
          <!-- Market status -->
          <div class="flex items-center gap-1.5">
            <span
              class="inline-block w-1.5 h-1.5 rounded-full"
              [class.bg-buy]="isOpen()"
              [class.pulse-dot]="isOpen()"
              [class.bg-sell]="!isOpen()"
            ></span>
            <span class="text-muted-foreground text-[10px] uppercase tracking-wider">
              {{ isOpen() ? 'Market Open' : 'Market Closed' }}
            </span>
          </div>

          <div class="h-3 w-px bg-border"></div>

          <!-- Treasury yields -->
          @for (b of benchmarks(); track b.label) {
            <div class="flex items-center gap-1">
              <span class="text-muted-foreground">{{ b.label }}</span>
              <span class="text-foreground" [ngClass]="flashMap()[b.label] || ''">{{ b.mid }}</span>
              @if (b.ust) {
                <span
                  class="text-[10px]"
                  [class.text-sell]="b.chgNum >= 0"
                  [class.text-buy]="b.chgNum < 0"
                >{{ b.chg }}</span>
              }
            </div>
          }

          <div class="h-3 w-px bg-border"></div>

          <!-- 2s10s -->
          <div class="flex items-center gap-1">
            <span class="text-muted-foreground">2s10s</span>
            <span class="text-foreground">{{ slope2s10s() }} bps</span>
          </div>

          <div class="h-3 w-px bg-border"></div>

          <!-- CDX IG -->
          @if (cdxIG(); as ig) {
            <div class="flex items-center gap-1">
              <span class="text-muted-foreground">CDX IG</span>
              <span class="text-foreground" [ngClass]="flashMap()['CDX IG'] || ''">{{ ig.mid.toFixed(1) }}</span>
              <span
                class="text-[10px]"
                [class.text-sell]="ig.chg >= 0"
                [class.text-buy]="ig.chg < 0"
              >{{ formatChgBps(ig.chg) }}</span>
            </div>
          }

          <!-- CDX HY -->
          @if (cdxHY(); as hy) {
            <div class="flex items-center gap-1">
              <span class="text-muted-foreground">CDX HY</span>
              <span class="text-foreground" [ngClass]="flashMap()['CDX HY'] || ''">{{ hy.mid.toFixed(1) }}</span>
              <span
                class="text-[10px]"
                [class.text-sell]="hy.chg >= 0"
                [class.text-buy]="hy.chg < 0"
              >{{ formatChgBps(hy.chg) }}</span>
            </div>
          }
        </div>

        <!-- Right: ET time -->
        <div class="text-muted-foreground">
          {{ etString() }} <span class="text-[9px] tracking-wider">ET</span>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="flex items-center border-b border-border bg-card px-4 shrink-0">
        @for (tab of tabs; track tab) {
          <button
            hlmBtn
            variant="ghost"
            size="sm"
            (click)="activeTab.set(tab)"
            class="relative rounded-none px-4 py-2.5 text-xs font-medium whitespace-nowrap h-auto"
            [class.text-primary]="activeTab() === tab"
            [class.text-muted-foreground]="activeTab() !== tab"
          >
            {{ tab }}
            @if (activeTab() === tab) {
              <span class="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary"></span>
            }
          </button>
        }
      </div>

      <!-- Tab Content -->
      <div class="flex-1 min-h-0 overflow-hidden">
        @switch (activeTab()) {
          @case ('Overview') {
            <app-dashboard-panel />
          }
          @case ('Rates') {
            <app-rates-panel />
          }
          @case ('Credit') {
            <app-credit-panel />
          }
          @case ('Futures') {
            <app-futures-panel />
          }
          @case ('Risk') {
            <app-risk-panel />
          }
          @case ('Positions & P&L') {
            <app-positions-panel />
          }
          @case ('Order Blotter') {
            <app-blotter-panel />
          }
          @case ('Design System') {
            <app-design-system-panel />
          }
          @case ('Components') {
            <app-components-panel />
          }
        }
      </div>
    </div>
  `,
})
export class FiTradingComponent implements OnInit, OnDestroy {
  private readonly marketDataService = inject(MarketDataService);
  private readonly themeService = inject(ThemeService);

  readonly tabs = TABS;
  readonly activeTab = signal<FITab>('Overview');

  /* ── Market time ──────────────────────────────────────────── */
  readonly etString = signal('');
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  readonly isOpen = computed(() => {
    const str = this.etString();
    if (!str) return false;
    const now = new Date();
    const day = now.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
    });
    const etHour = Number(
      now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false,
      })
    );
    const isWeekday = !['Sat', 'Sun'].includes(day);
    return isWeekday && etHour >= 8 && etHour < 17;
  });

  /* ── Market data computed signals ─────────────────────────── */
  readonly benchmarks = computed(() => {
    const treasuries = this.marketDataService.treasuries();
    const labels: { label: string; tenor: string }[] = [
      { label: '2Y', tenor: '2Y' },
      { label: '5Y', tenor: '5Y' },
      { label: '10Y', tenor: '10Y' },
      { label: '30Y', tenor: '30Y' },
    ];
    return labels.map(({ label, tenor }) => {
      const ust = treasuries.find((t) => t.tenor === tenor);
      return {
        label,
        ust,
        mid: ust ? fmtYield(ust.mid) : '\u2014',
        chg: ust ? fmtChgBps(ust.chg) : '',
        chgNum: ust ? ust.chg : 0,
      };
    });
  });

  readonly slope2s10s = computed(() => {
    const treasuries = this.marketDataService.treasuries();
    const ust2 = treasuries.find((t) => t.tenor === '2Y');
    const ust10 = treasuries.find((t) => t.tenor === '10Y');
    return ust10 && ust2
      ? ((ust10.mid - ust2.mid) * 100).toFixed(1)
      : '\u2014';
  });

  readonly cdxIG = computed(() => {
    return this.marketDataService
      .cdxIndices()
      .find((c) => c.name.includes('IG'));
  });

  readonly cdxHY = computed(() => {
    return this.marketDataService
      .cdxIndices()
      .find((c) => c.name.includes('HY'));
  });

  /* ── Flash map for ticker value changes ──────────────────── */
  readonly flashMap = signal<Record<string, string>>({});
  private prevMids: Record<string, number> = {};
  private flashTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  constructor() {
    // Watch benchmarks for changes and set flash classes
    effect(() => {
      const bms = this.benchmarks();
      const ig = this.cdxIG();
      const hy = this.cdxHY();
      const entries: { key: string; mid: number | undefined }[] = [
        ...bms.map((b) => ({ key: b.label, mid: b.ust?.mid })),
        { key: 'CDX IG', mid: ig?.mid },
        { key: 'CDX HY', mid: hy?.mid },
      ];
      const newFlash: Record<string, string> = { ...this.flashMap() };
      for (const { key, mid } of entries) {
        if (mid == null) continue;
        const prev = this.prevMids[key];
        if (prev != null && prev !== mid) {
          newFlash[key] = mid > prev ? 'flash-positive' : 'flash-negative';
          if (this.flashTimers[key]) clearTimeout(this.flashTimers[key]);
          this.flashTimers[key] = setTimeout(() => {
            this.flashMap.update((m) => {
              const copy = { ...m };
              delete copy[key];
              return copy;
            });
          }, 600);
        }
        this.prevMids[key] = mid;
      }
      this.flashMap.set(newFlash);
    });
  }

  /* ── Template helpers ─────────────────────────────────────── */
  formatChgBps = fmtChgBps;

  /* ── Lifecycle ────────────────────────────────────────────── */
  ngOnInit(): void {
    this.marketDataService.startLiveUpdates();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1_000);
  }

  ngOnDestroy(): void {
    this.marketDataService.stopLiveUpdates();
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  private updateClock(): void {
    const now = new Date();
    this.etString.set(
      now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );
  }
}
