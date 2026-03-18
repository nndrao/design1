import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ContentChildren, QueryList, AfterContentInit } from '@angular/core';

@Component({
  selector: 'hlm-radio-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex items-center gap-2 cursor-pointer text-xs text-foreground">
      <div
        class="h-4 w-4 rounded-full border border-primary flex items-center justify-center transition-colors"
        [class.bg-primary]="checked"
        (click)="onSelect()"
      >
        @if (checked) {
          <div class="h-1.5 w-1.5 rounded-full bg-primary-foreground"></div>
        }
      </div>
      <ng-content />
    </label>
  `,
  host: { class: 'block' },
})
export class HlmRadioItemComponent {
  @Input() value = '';
  @Input() checked = false;
  @Output() selected = new EventEmitter<string>();

  onSelect(): void {
    this.selected.emit(this.value);
  }
}

@Component({
  selector: 'hlm-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'flex flex-col gap-2',
    role: 'radiogroup',
  },
})
export class HlmRadioGroupComponent implements AfterContentInit {
  @ContentChildren(HlmRadioItemComponent) items!: QueryList<HlmRadioItemComponent>;

  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  ngAfterContentInit(): void {
    this.updateChildren();
    this.items.forEach((item) => {
      item.selected.subscribe((val: string) => {
        this.value = val;
        this.valueChange.emit(val);
        this.updateChildren();
      });
    });
  }

  private updateChildren(): void {
    this.items?.forEach((item) => {
      item.checked = item.value === this.value;
    });
  }
}
