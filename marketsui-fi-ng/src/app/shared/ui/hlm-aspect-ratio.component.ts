import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-aspect-ratio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full" [style.paddingBottom]="paddingBottom">
      <div class="absolute inset-0">
        <ng-content />
      </div>
    </div>
  `,
  host: { class: 'block' },
})
export class HlmAspectRatioComponent {
  @Input() ratio = 16 / 9;

  get paddingBottom(): string {
    return (1 / this.ratio) * 100 + '%';
  }
}
