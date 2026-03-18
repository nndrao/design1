import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FiTradingComponent } from './components/fi-trading/fi-trading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FiTradingComponent],
  template: `<app-fi-trading />`,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
  `],
})
export class App {}
