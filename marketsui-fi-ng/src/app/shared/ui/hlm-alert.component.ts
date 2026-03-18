import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border px-3 py-2 text-xs [&>hlm-alert-title]:font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive: 'border-destructive/50 text-destructive bg-destructive/10',
        success: 'border-buy/50 text-buy bg-buy/10',
        warning: 'border-warning/50 text-warning bg-warning/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type AlertVariants = VariantProps<typeof alertVariants>;

@Component({
  selector: 'hlm-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'alert',
    '[class]': 'computedClass',
  },
})
export class HlmAlertComponent {
  private _variant: AlertVariants['variant'] = 'default';
  private _userClass = '';

  @Input()
  set variant(value: AlertVariants['variant']) {
    this._variant = value;
  }

  @Input('class')
  set userClass(value: string) {
    this._userClass = value;
  }

  get computedClass(): string {
    return [alertVariants({ variant: this._variant }), this._userClass].filter(Boolean).join(' ');
  }
}

@Component({
  selector: 'hlm-alert-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'block mb-0.5 text-xs font-semibold leading-tight tracking-tight' },
})
export class HlmAlertTitleComponent {}

@Component({
  selector: 'hlm-alert-description',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'block text-xs leading-relaxed [&_p]:leading-relaxed opacity-90' },
})
export class HlmAlertDescriptionComponent {}
