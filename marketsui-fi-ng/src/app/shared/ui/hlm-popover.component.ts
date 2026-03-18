import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'hlm-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <div (click)="toggle()">
        <ng-content select="[hlmPopoverTrigger]" />
      </div>
      @if (isOpen()) {
        <div class="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
          <ng-content select="[hlmPopoverContent]" />
        </div>
      }
    </div>
  `,
  host: {
    class: 'inline-block',
    '(document:click)': 'onDocClick($event)',
  },
})
export class HlmPopoverComponent {
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  onDocClick(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.isOpen() && !el.closest('hlm-popover')) {
      this.isOpen.set(false);
    }
  }
}
