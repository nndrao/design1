import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50">
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm"
          (click)="close()"
        ></div>
        <div
          class="fixed z-50 bg-card border-border shadow-lg flex flex-col overflow-auto"
          [class]="panelClasses"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class HlmSheetComponent {
  @Input() open = false;
  @Input() side: 'left' | 'right' | 'top' | 'bottom' = 'right';
  @Output() openChange = new EventEmitter<boolean>();

  get panelClasses(): string {
    switch (this.side) {
      case 'left':
        return 'inset-y-0 left-0 w-72 border-r';
      case 'right':
        return 'inset-y-0 right-0 w-72 border-l';
      case 'top':
        return 'inset-x-0 top-0 h-72 border-b';
      case 'bottom':
        return 'inset-x-0 bottom-0 h-72 border-t';
    }
  }

  close(): void {
    this.openChange.emit(false);
  }
}
