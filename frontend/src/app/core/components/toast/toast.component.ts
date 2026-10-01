import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto rounded-xl p-4 shadow-lg border flex items-start gap-3 bg-white transition-all duration-300"
          [ngClass]="{
            'border-emerald-200': toast.type === 'success',
            'border-rose-200': toast.type === 'error',
            'border-amber-200': toast.type === 'warning',
            'border-indigo-200': toast.type === 'info'
          }"
        >
          <div class="mt-0.5 shrink-0">
            @if (toast.type === 'success') {
              <div class="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</div>
            } @else if (toast.type === 'error') {
              <div class="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">✕</div>
            } @else if (toast.type === 'warning') {
              <div class="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">!</div>
            } @else {
              <div class="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">ℹ</div>
            }
          </div>

          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h4 class="text-sm font-semibold text-slate-900">{{ toast.title }}</h4>
            }
            <p class="text-xs text-slate-600 mt-0.5 break-words leading-relaxed">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none p-1 rounded hover:bg-slate-100"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }
}
