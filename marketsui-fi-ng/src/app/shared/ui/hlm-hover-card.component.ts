import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'hlm-hover-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative inline-block"
      (mouseenter)="show.set(true)"
      (mouseleave)="show.set(false)"
    >
      <ng-content select="[hlmHoverTrigger]" />
      @if (show()) {
        <div class="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
          <ng-content select="[hlmHoverContent]" />
        </div>
      }
    </div>
  `,
  host: { class: 'inline-block' },
})
export class HlmHoverCardComponent {
  readonly show = signal(false);
}
