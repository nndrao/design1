import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: {
    '[class]': 'computedClass',
  },
})
export class HlmSkeletonComponent {
  private _userClass = '';

  @Input('class')
  set userClass(value: string) {
    this._userClass = value;
  }

  get computedClass(): string {
    return ['block animate-pulse rounded-md bg-muted', this._userClass].filter(Boolean).join(' ');
  }
}
