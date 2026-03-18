import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-alert-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div
          class="relative z-50 w-full bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden"
          [style.max-width]="maxWidth"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class HlmAlertDialogComponent {
  @Input() open = false;
  @Input() maxWidth = '26rem';
  @Output() openChange = new EventEmitter<boolean>();

  close(): void {
    this.openChange.emit(false);
  }
}
