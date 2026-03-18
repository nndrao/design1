import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'hlm-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border-b border-border">
      <button
        class="flex w-full items-center justify-between py-2 px-1 text-xs font-medium text-foreground transition-all hover:text-foreground/80"
        (click)="toggle()"
      >
        {{ title }}
        <svg
          class="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      @if (isOpen()) {
        <div class="px-1 pb-2 text-xs text-muted-foreground">
          <ng-content />
        </div>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class HlmAccordionItemComponent {
  @Input() title = '';
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }
}

@Component({
  selector: 'hlm-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'block w-full' },
})
export class HlmAccordionComponent {}
