import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MarketDataService } from '../../../services/market-data.service';
import { fmtYield, fmtChgBps } from '../../../shared/utils';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <!-- Header Bar -->
    <header class="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 h-12 shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold tracking-tight">
          <span class="text-[var(--foreground)]">Markets</span><span class="text-[var(--primary)]">UI</span>
        </span>
      </div>

      <div class="flex items-center gap-2">
        <p-button
          [text]="true"
          [rounded]="true"
          severity="secondary"
          styleClass="flex items-center gap-2 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] h-8 px-3"
        >
          <i class="pi pi-search text-xs"></i>
          <span class="text-xs">Search bonds...</span>
          <kbd class="ml-1 px-1.5 py-0.5 rounded bg-[var(--muted)] text-[10px] font-mono">&#8984;K</kbd>
        </p-button>

        <p-button
          [text]="true"
          [rounded]="true"
          severity="secondary"
          icon="pi pi-bell"
          pTooltip="Notifications"
          styleClass="text-[var(--muted-foreground)] hover:text-[var(--foreground)] w-8 h-8"
        />

        <p-button
          [text]="true"
          [rounded]="true"
          severity="secondary"
          icon="pi pi-cog"
          pTooltip="Settings"
          styleClass="text-[var(--muted-foreground)] hover:text-[var(--foreground)] w-8 h-8"
        />

        <div class="h-5 w-px bg-[var(--border)] mx-0.5"></div>

        <p-button
          [outlined]="true"
          [rounded]="true"
          size="small"
          (onClick)="toggleTheme()"
          styleClass="gap-1.5 h-8"
        >
          <i [class]="isDark() ? 'pi pi-sun text-sm' : 'pi pi-moon text-sm'"></i>
          <span class="text-xs">{{ isDark() ? 'Light' : 'Dark' }}</span>
        </p-button>
      </div>
    </header>

    <!-- Market Status / Ticker Bar -->
    <div class="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 h-8 text-[11px] font-mono shrink-0" style="opacity: 0.8; backdrop-filter: blur(12px);">
      <!-- Left: status + yields -->
      <div class="flex items-center gap-4">
        <!-- Market status -->
        <div class="flex items-center gap-1.5">
          <span
            class="inline-block w-1.5 h-1.5 rounded-full"
            [class.bg-buy]="isMarketOpen()"
            [class.pulse-dot]="isMarketOpen()"
            [class.bg-sell]="!isMarketOpen()"
          ></span>
          <span class="text-[var(--muted-foreground)] text-[10px] uppercase tracking-wider">
            {{ isMarketOpen() ? 'Market Open' : 'Market Closed' }}
          </span>
        </div>

        <div class="h-3 w-px bg-[var(--border)]"></div>

        <!-- Treasury yields -->
        @for (b of tickerBenchmarks(); track b.label) {
          <div class="flex items-center gap-1">
            <span class="text-[var(--muted-foreground)]">{{ b.label }}</span>
            <span class="text-[var(--foreground)]">{{ b.fmtMid }}</span>
            @if (b.chg !== undefined) {
              <span class="text-[10px]" [class.text-sell]="b.chg >= 0" [class.text-buy]="b.chg < 0">
                {{ b.fmtChg }}
              </span>
            }
          </div>
        }

        <div class="h-3 w-px bg-[var(--border)]"></div>

        <!-- 2s10s -->
        <div class="flex items-center gap-1">
          <span class="text-[var(--muted-foreground)]">2s10s</span>
          <span class="text-[var(--foreground)]">{{ slope2s10s() }} bps</span>
        </div>

        <div class="h-3 w-px bg-[var(--border)]"></div>

        <!-- CDX indices -->
        @for (c of cdxTicker(); track c.label) {
          <div class="flex items-center gap-1">
            <span class="text-[var(--muted-foreground)]">{{ c.label }}</span>
            <span class="text-[var(--foreground)]">{{ c.fmtMid }}</span>
            <span class="text-[10px]" [class.text-sell]="c.chg >= 0" [class.text-buy]="c.chg < 0">
              {{ c.fmtChg }}
            </span>
          </div>
        }
      </div>

      <!-- Right: ET time -->
      <div class="text-[var(--muted-foreground)]">
        {{ etTime() }} <span class="text-[9px] tracking-wider">ET</span>
      </div>
    </div>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private mds = inject(MarketDataService);
  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly isDark = signal(true);
  readonly etTime = signal('');
  readonly isMarketOpen = signal(false);

  readonly tickerBenchmarks = computed(() => {
    const treasuries = this.mds.treasuries();
    const ust2 = treasuries.find(t => t.tenor === '2Y');
    const ust5 = treasuries.find(t => t.tenor === '5Y');
    const ust10 = treasuries.find(t => t.tenor === '10Y');
    const ust30 = treasuries.find(t => t.tenor === '30Y');
    return [
      { label: '2Y', mid: ust2?.mid, chg: ust2?.chg, fmtMid: ust2 ? fmtYield(ust2.mid) : '\u2014', fmtChg: ust2 ? fmtChgBps(ust2.chg) : '' },
      { label: '5Y', mid: ust5?.mid, chg: ust5?.chg, fmtMid: ust5 ? fmtYield(ust5.mid) : '\u2014', fmtChg: ust5 ? fmtChgBps(ust5.chg) : '' },
      { label: '10Y', mid: ust10?.mid, chg: ust10?.chg, fmtMid: ust10 ? fmtYield(ust10.mid) : '\u2014', fmtChg: ust10 ? fmtChgBps(ust10.chg) : '' },
      { label: '30Y', mid: ust30?.mid, chg: ust30?.chg, fmtMid: ust30 ? fmtYield(ust30.mid) : '\u2014', fmtChg: ust30 ? fmtChgBps(ust30.chg) : '' },
    ];
  });

  readonly slope2s10s = computed(() => {
    const treasuries = this.mds.treasuries();
    const ust2 = treasuries.find(t => t.tenor === '2Y');
    const ust10 = treasuries.find(t => t.tenor === '10Y');
    return ust10 && ust2 ? ((ust10.mid - ust2.mid) * 100).toFixed(1) : '\u2014';
  });

  readonly cdxTicker = computed(() => {
    const cdx = this.mds.cdxIndices();
    const cdxIG = cdx.find(c => c.name.includes('IG'));
    const cdxHY = cdx.find(c => c.name.includes('HY'));
    const items: { label: string; mid: number; chg: number; fmtMid: string; fmtChg: string }[] = [];
    if (cdxIG) items.push({ label: 'CDX IG', mid: cdxIG.mid, chg: cdxIG.chg, fmtMid: cdxIG.mid.toFixed(1), fmtChg: fmtChgBps(cdxIG.chg) });
    if (cdxHY) items.push({ label: 'CDX HY', mid: cdxHY.mid, chg: cdxHY.chg, fmtMid: cdxHY.mid.toFixed(1), fmtChg: fmtChgBps(cdxHY.chg) });
    return items;
  });

  ngOnInit(): void {
    // Apply dark mode by default
    document.documentElement.classList.add('dark');

    // Start market time updates
    this.updateTime();
    this.timerId = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
    document.documentElement.classList.toggle('dark');
  }

  private updateTime(): void {
    const now = new Date();
    this.etTime.set(
      now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );

    const etHour = Number(
      now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false })
    );
    const day = now.toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short' });
    const isWeekday = !['Sat', 'Sun'].includes(day);
    this.isMarketOpen.set(isWeekday && etHour >= 8 && etHour < 17);
  }
}
