import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHighcharts } from 'highcharts-angular';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const MarketsUIPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}', 100: '{blue.100}', 200: '{blue.200}', 300: '{blue.300}',
      400: '{blue.400}', 500: '{blue.500}', 600: '{blue.600}', 700: '{blue.700}',
      800: '{blue.800}', 900: '{blue.900}', 950: '{blue.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff', 50: '#f8f9fa', 100: '#f1f3f5', 200: '#e9ecef',
          300: '#dee2e6', 400: '#ced4da', 500: '#adb5bd', 600: '#868e96',
          700: '#495057', 800: '#343a40', 900: '#212529', 950: '#0d0f12',
        },
      },
      dark: {
        surface: {
          0: '#1a1d23', 50: '#1e2128', 100: '#22252d', 200: '#2a2e36',
          300: '#363b45', 400: '#464d59', 500: '#6b7280', 600: '#9ca3af',
          700: '#d1d5db', 800: '#e5e7eb', 900: '#f3f4f6', 950: '#f9fafb',
        },
      },
    },
  },
  components: {
    datatable: { headerCell: { padding: '0.5rem 0.75rem' }, bodyCell: { padding: '0.4rem 0.75rem' } },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MarketsUIPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: { name: 'primeng', order: 'tailwind, primeng' },
        },
      },
    }),
    provideHighcharts({
      instance: () => import('highcharts').then((m: any) => m.default ?? m),
    }),
  ],
};
