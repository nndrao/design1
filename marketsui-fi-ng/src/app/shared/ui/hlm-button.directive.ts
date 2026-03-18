import { Directive, HostBinding, Input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        buy: 'bg-buy text-buy-foreground hover:bg-buy/90',
        sell: 'bg-sell text-sell-foreground hover:bg-sell/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

@Directive({
  selector: '[hlmBtn]',
  standalone: true,
})
export class HlmButtonDirective {
  private _variant: ButtonVariants['variant'] = 'default';
  private _size: ButtonVariants['size'] = 'default';
  private _userClass = '';

  @Input()
  set variant(value: ButtonVariants['variant']) {
    this._variant = value;
  }

  @Input()
  set size(value: ButtonVariants['size']) {
    this._size = value;
  }

  @Input('class')
  set userClass(value: string) {
    this._userClass = value;
  }

  @HostBinding('class')
  get computedClass(): string {
    return [buttonVariants({ variant: this._variant, size: this._size }), this._userClass].filter(Boolean).join(' ');
  }
}
