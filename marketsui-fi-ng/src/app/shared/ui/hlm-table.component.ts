import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'block w-full overflow-auto' },
  styles: [`:host { display: block; } :host ::ng-deep table { width: 100%; caption-side: bottom; text-align: left; font-size: 0.75rem; }`],
})
export class HlmTableComponent {}

@Component({
  selector: 'hlm-table-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'block [&_hlm-table-row]:border-b [&_hlm-table-row]:border-border' },
})
export class HlmTableHeaderComponent {}

@Component({
  selector: 'hlm-table-body',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'block [&_hlm-table-row:last-child]:border-0' },
})
export class HlmTableBodyComponent {}

@Component({
  selector: 'hlm-table-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'flex w-full border-b border-border/50 transition-colors hover:bg-muted/50' },
})
export class HlmTableRowComponent {}

@Component({
  selector: 'hlm-table-head',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'flex-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground' },
})
export class HlmTableHeadComponent {}

@Component({
  selector: 'hlm-table-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'flex-1 px-2 py-1.5 text-xs text-foreground' },
})
export class HlmTableCellComponent {}
