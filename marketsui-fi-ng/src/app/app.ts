import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FiTradingComponent } from './components/fi-trading/fi-trading.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FiTradingComponent],
  template: `
    <app-header />
    <app-fi-trading />
  `,
})
export class App {}
