import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'hlm-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #track
      class="relative flex w-full touch-none select-none items-center cursor-pointer"
      style="height: 20px;"
      (mousedown)="onTrackClick($event)"
    >
      <div class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
        <div
          class="absolute h-full bg-primary rounded-full"
          [style.width.%]="percentage"
        ></div>
      </div>
      <div
        class="absolute h-4 w-4 rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        [style.left]="'calc(' + percentage + '% - 8px)'"
      ></div>
    </div>
  `,
  host: {
    class: 'block w-full',
  },
})
export class HlmSliderComponent {
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;

  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Output() valueChange = new EventEmitter<number>();

  get percentage(): number {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  onTrackClick(event: MouseEvent): void {
    const rect = this.trackRef.nativeElement.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const raw = this.min + percent * (this.max - this.min);
    const stepped = Math.round(raw / this.step) * this.step;
    this.value = stepped;
    this.valueChange.emit(stepped);
  }
}
