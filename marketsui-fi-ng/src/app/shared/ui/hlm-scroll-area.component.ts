import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-scroll-area',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'block overflow-auto' },
  styles: [
    `
      :host {
        scrollbar-width: thin;
        scrollbar-color: var(--color-border) transparent;
      }
      :host::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      :host::-webkit-scrollbar-track {
        background: transparent;
      }
      :host::-webkit-scrollbar-thumb {
        background-color: var(--color-border);
        border-radius: 3px;
      }
      :host::-webkit-scrollbar-thumb:hover {
        background-color: var(--color-muted-foreground);
      }
    `,
  ],
})
export class HlmScrollAreaComponent {}
