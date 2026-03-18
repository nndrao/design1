import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'hlm-dropdown-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <div (click)="toggle()">
        <ng-content select="[hlmDropdownTrigger]" />
      </div>
      @if (isOpen()) {
        <div class="absolute left-0 top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md">
          <ng-content select="[hlmDropdownContent]" />
        </div>
      }
    </div>
  `,
  host: {
    class: 'inline-block',
    '(document:click)': 'onDocClick($event)',
  },
})
export class HlmDropdownMenuComponent {
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  onDocClick(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.isOpen() && !el.closest('hlm-dropdown-menu')) {
      this.isOpen.set(false);
    }
  }
}

@Component({
  selector: 'hlm-dropdown-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class:
      'block relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
  },
})
export class HlmDropdownItemComponent {}
