import { Component, Injectable, ChangeDetectionStrategy, signal, computed } from '@angular/core';

export interface HlmToast {
  id: number;
  message: string;
  variant: 'default' | 'success' | 'destructive' | 'warning';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class HlmToastService {
  private _nextId = 0;
  readonly toasts = signal<HlmToast[]>([]);

  show(message: string, options?: { variant?: HlmToast['variant']; duration?: number }): void {
    const id = this._nextId++;
    const toast: HlmToast = {
      id,
      message,
      variant: options?.variant ?? 'default',
      duration: options?.duration ?? 3000,
    };
    this.toasts.update((t) => [...t, toast]);
    setTimeout(() => this.dismiss(id), toast.duration);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

@Component({
  selector: 'hlm-toaster',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto min-w-[220px] rounded-lg border px-3 py-2 text-xs shadow-lg transition-all"
          [class]="toastClasses(toast.variant)"
        >
          <div class="flex items-center justify-between gap-2">
            <span>{{ toast.message }}</span>
            <button
              class="shrink-0 text-current opacity-60 hover:opacity-100"
              (click)="dismiss(toast.id)"
            >
              <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class HlmToasterComponent {
  private readonly toastService: HlmToastService;

  readonly toasts;

  constructor(toastService: HlmToastService) {
    this.toastService = toastService;
    this.toasts = this.toastService.toasts;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  toastClasses(variant: HlmToast['variant']): string {
    switch (variant) {
      case 'success':
        return 'bg-buy/15 border-buy/30 text-buy';
      case 'destructive':
        return 'bg-destructive/15 border-destructive/30 text-destructive';
      case 'warning':
        return 'bg-warning/15 border-warning/30 text-warning';
      default:
        return 'bg-card border-border text-foreground';
    }
  }
}
