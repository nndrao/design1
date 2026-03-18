import { Directive, HostBinding, Input } from '@angular/core';

const baseClasses =
  'flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors ' +
  'placeholder:text-muted-foreground ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

@Directive({
  selector: '[hlmTextarea]',
  standalone: true,
})
export class HlmTextareaDirective {
  private _userClass = '';

  @Input('class')
  set userClass(value: string) {
    this._userClass = value;
  }

  @HostBinding('class')
  get computedClass(): string {
    return [baseClasses, this._userClass].filter(Boolean).join(' ');
  }
}
