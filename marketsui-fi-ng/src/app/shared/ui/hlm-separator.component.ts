import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: {
    role: 'separator',
    '[class]': 'computedClass',
  },
})
export class HlmSeparatorComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  get computedClass(): string {
    return this.orientation === 'horizontal'
      ? 'block shrink-0 bg-border h-px w-full'
      : 'inline-block shrink-0 bg-border w-px h-full';
  }
}
