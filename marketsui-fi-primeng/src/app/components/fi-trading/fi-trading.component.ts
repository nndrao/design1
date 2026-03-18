import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { DashboardPanelComponent } from './dashboard-panel/dashboard-panel.component';
import { RatesPanelComponent } from './rates-panel/rates-panel.component';
import { CreditPanelComponent } from './credit-panel/credit-panel.component';
import { FuturesPanelComponent } from './futures-panel/futures-panel.component';
import { RiskPanelComponent } from './risk-panel/risk-panel.component';
import { PositionsPanelComponent } from './positions-panel/positions-panel.component';
import { BlotterPanelComponent } from './blotter-panel/blotter-panel.component';
import { MarketDataService } from '../../services/market-data.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HeaderComponent,
    DashboardPanelComponent,
    RatesPanelComponent,
    CreditPanelComponent,
    FuturesPanelComponent,
    RiskPanelComponent,
    PositionsPanelComponent,
    BlotterPanelComponent,
  ],
  template: `
    <div class="flex flex-col h-full bg-[var(--background)]">
      <!-- Header + Ticker -->
      <app-header />

      <!-- Tab Bar -->
      <div class="flex items-center border-b border-[var(--border)] bg-[var(--card)] px-4 shrink-0">
        @for (tab of tabs; track tab; let i = $index) {
          <button
            class="relative px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap"
            [class.text-[var(--primary)]]="activeTab() === tab"
            [class.text-[var(--muted-foreground)]]="activeTab() !== tab"
            [class.hover:text-[var(--foreground)]]="activeTab() !== tab"
            (click)="setActiveTab(tab)"
          >
            {{ tab }}
            @if (activeTab() === tab) {
              <span class="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-[var(--primary)]"></span>
            }
            <span class="ml-1 text-[9px] text-[var(--muted-foreground)] opacity-50 font-mono">{{ i + 1 }}</span>
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
            <div class="h-full overflow-auto p-3">
              <app-futures-panel />
            </div>
          }
          @case ('Risk') {
            <div class="h-full overflow-auto p-3">
              <app-risk-panel />
            </div>
          }
          @case ('Positions & P&L') {
            <div class="h-full overflow-auto p-3">
              <app-positions-panel />
            </div>
          }
          @case ('Order Blotter') {
            <div class="h-full overflow-auto p-3">
              <app-blotter-panel />
            </div>
          }
          @case ('Design System') {
            <div class="flex items-center justify-center h-full text-[var(--muted-foreground)] text-sm">Design System (coming soon)</div>
          }
          @case ('Components') {
            <div class="flex items-center justify-center h-full text-[var(--muted-foreground)] text-sm">Components (coming soon)</div>
          }
        }
      </div>
    </div>
  `,
})
export class FiTradingComponent implements OnInit, OnDestroy {
  private mds = inject(MarketDataService);

  readonly tabs = TABS;
  readonly activeTab = signal<FITab>('Overview');

  private keyHandler = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
    if (isInput) return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 9 && num <= TABS.length) {
      e.preventDefault();
      this.activeTab.set(TABS[num - 1]);
      return;
    }

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      this.activeTab.set('Order Blotter');
    }
  };

  ngOnInit(): void {
    this.mds.startLiveUpdates();
    window.addEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy(): void {
    this.mds.stopLiveUpdates();
    window.removeEventListener('keydown', this.keyHandler);
  }

  setActiveTab(tab: FITab): void {
    this.activeTab.set(tab);
  }
}
