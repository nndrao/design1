import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hlm-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-xl border border-border bg-card text-card-foreground shadow-sm' },
  template: `<ng-content />`,
})
export class HlmCardComponent {}

@Component({
  selector: 'hlm-card-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col space-y-1.5 p-4' },
  template: `<ng-content />`,
})
export class HlmCardHeaderComponent {}

@Component({
  selector: 'hlm-card-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-sm font-semibold leading-none tracking-tight' },
  template: `<ng-content />`,
})
export class HlmCardTitleComponent {}

@Component({
  selector: 'hlm-card-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block p-4 pt-0' },
  template: `<ng-content />`,
})
export class HlmCardContentComponent {}

@Component({
  selector: 'hlm-card-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center p-4 pt-0' },
  template: `<ng-content />`,
})
export class HlmCardFooterComponent {}
