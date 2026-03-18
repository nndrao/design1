import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        buy: 'border-buy/20 bg-buy/15 text-buy',
        sell: 'border-sell/20 bg-sell/15 text-sell',
        warning: 'border-warning/20 bg-warning/15 text-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

@Component({
  selector: 'hlm-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass',
  },
})
export class HlmBadgeComponent {
  private _variant: BadgeVariants['variant'] = 'default';
  private _userClass = '';

  @Input()
  set variant(value: BadgeVariants['variant']) {
    this._variant = value;
  }

  @Input('class')
  set userClass(value: string) {
    this._userClass = value;
  }

  get computedClass(): string {
    return [badgeVariants({ variant: this._variant }), this._userClass].filter(Boolean).join(' ');
  }
}
