import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed } from '@angular/core';

@Component({
  selector: 'hlm-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full rounded-lg border border-border bg-card p-2">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <button
          class="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          (click)="prevMonth()"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-xs font-semibold text-foreground">{{ monthLabel() }}</span>
        <button
          class="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          (click)="nextMonth()"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <!-- Day names -->
      <div class="grid grid-cols-7 mb-1">
        @for (d of dayNames; track d) {
          <div class="text-center text-[10px] font-medium text-muted-foreground py-0.5">{{ d }}</div>
        }
      </div>

      <!-- Days -->
      <div class="grid grid-cols-7">
        @for (day of calendarDays(); track $index) {
          <button
            class="h-7 w-full text-center text-xs rounded-md transition-colors"
            [class.text-muted-foreground]="!day.currentMonth"
            [class.text-foreground]="day.currentMonth && !day.selected"
            [class.bg-primary]="day.selected"
            [class.text-primary-foreground]="day.selected"
            [class.hover:bg-accent]="!day.selected"
            [class.font-semibold]="day.today"
            (click)="selectDay(day.date)"
          >{{ day.day }}</button>
        }
      </div>
    </div>
  `,
  host: { class: 'block' },
})
export class HlmCalendarComponent {
  @Input()
  set selected(value: Date | null) {
    this._selected = value;
  }
  get selected(): Date | null {
    return this._selected;
  }
  private _selected: Date | null = null;

  @Output() selectedChange = new EventEmitter<Date>();

  readonly currentMonth = signal(new Date());
  readonly dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  readonly monthLabel = computed(() => {
    const d = this.currentMonth();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  readonly calendarDays = computed(() => {
    const cm = this.currentMonth();
    const year = cm.getFullYear();
    const month = cm.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();

    const days: { day: number; date: Date; currentMonth: boolean; selected: boolean; today: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrev - i);
      days.push({ day: daysInPrev - i, date: d, currentMonth: false, selected: this.isSameDay(d, this._selected), today: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        day: i,
        date: d,
        currentMonth: true,
        selected: this.isSameDay(d, this._selected),
        today: this.isSameDay(d, today),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ day: i, date: d, currentMonth: false, selected: this.isSameDay(d, this._selected), today: false });
    }

    return days;
  });

  prevMonth(): void {
    const cm = this.currentMonth();
    this.currentMonth.set(new Date(cm.getFullYear(), cm.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const cm = this.currentMonth();
    this.currentMonth.set(new Date(cm.getFullYear(), cm.getMonth() + 1, 1));
  }

  selectDay(date: Date): void {
    this._selected = date;
    this.selectedChange.emit(date);
    this.currentMonth.set(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  private isSameDay(a: Date, b: Date | null): boolean {
    if (!b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
