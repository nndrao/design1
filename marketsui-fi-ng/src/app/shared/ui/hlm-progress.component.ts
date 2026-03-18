import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="h-full rounded-full bg-primary transition-all"
      [style.width.%]="clampedValue"
    ></div>
  `,
  host: {
    class: 'block relative h-2 w-full overflow-hidden rounded-full bg-secondary',
    role: 'progressbar',
    '[attr.aria-valuenow]': 'value',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': '100',
  },
})
export class HlmProgressComponent {
  @Input() value = 0;

  get clampedValue(): number {
    return Math.min(100, Math.max(0, this.value));
  }
}
