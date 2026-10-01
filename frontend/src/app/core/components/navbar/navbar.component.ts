import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div class="flex items-center gap-4">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="md:hidden p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Toggle navigation menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span class="text-xs font-medium text-slate-500">Retail Inventory Optimization</span>
      </div>

      <div class="flex items-center gap-4">
        <!-- Quick Scanner Shortcut -->
        <a
          routerLink="/scanner"
          class="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span class="hidden sm:inline">Scanner</span>
        </a>

        <!-- Restock Alert Shortcut -->
        <a
          routerLink="/inventory"
          [queryParams]="{ filter: 'low-stock' }"
          class="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition"
        >
          <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="hidden sm:inline">Alerts</span>
        </a>

        <!-- User -->
        <div class="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-200">
            SO
          </div>
          <span class="text-xs text-slate-700 font-medium hidden sm:inline">Operator</span>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  readonly toggleSidebar = output<void>();
}
