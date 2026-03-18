import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm"
          (click)="dismissableMask && closeDialog()"
        ></div>
        <!-- Content -->
        <div
          class="relative z-50 w-full bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden"
          [style.max-width]="maxWidth"
          [style.max-height]="maxHeight"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class HlmDialogComponent {
  @Input() open = false;
  @Input() maxWidth = '28rem';
  @Input() maxHeight = '80vh';
  @Input() dismissableMask = true;
  @Output() openChange = new EventEmitter<boolean>();

  closeDialog(): void {
    this.openChange.emit(false);
  }
}
