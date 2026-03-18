import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { HlmButtonDirective } from '../../shared/ui/hlm-button.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [HlmButtonDirective],
  template: `
    <header class="flex items-center justify-between border-b border-border bg-card px-4 h-11 shrink-0">
      <!-- Left: Logo + Title -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5 font-semibold text-foreground">
          <!-- MarketsUI logo SVG -->
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#60A5FA"/>
            <polyline
              points="4,22 9,16 13,18.5 19,8 25,12"
              stroke="white"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="25" cy="12" r="3" fill="white"/>
          </svg>
          <span class="text-sm tracking-tight">MarketsUI</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">Fixed Income</span>
          <span class="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-medium">Trading Terminal</span>
        </div>
      </div>

      <!-- Right: Search + Icons + Theme toggle -->
      <div class="flex items-center gap-2">
        <!-- Search pill -->
        <button hlmBtn variant="outline" size="sm" class="gap-2 text-muted-foreground">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Search bonds...
          <kbd class="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">&#8984;K</kbd>
        </button>

        <!-- Notification bell -->
        <button hlmBtn variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>

        <!-- Settings gear -->
        <button hlmBtn variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>

        <!-- Theme toggle -->
        <button
          hlmBtn
          variant="outline"
          size="sm"
          class="gap-1.5 text-muted-foreground"
          (click)="themeService.toggleTheme()"
        >
          @if (themeService.theme() === 'dark') {
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            Light
          } @else {
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            Dark
          }
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
}
