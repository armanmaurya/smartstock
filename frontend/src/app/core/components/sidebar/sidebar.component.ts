import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
  `],
  template: `
    <aside
      class="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 md:static md:sticky md:top-0 md:h-screen md:z-30 md:translate-x-0"
      [ngClass]="isOpen() ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <!-- Brand Logo / Title -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
        <a routerLink="/" class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            S
          </div>
          <div>
            <span class="font-bold text-sm text-slate-900 tracking-tight">StockSmart</span>
            <div class="text-[10px] text-slate-500 font-medium leading-none">Inventory System</div>
          </div>
        </a>

        <button
          type="button"
          (click)="closeSidebar.emit()"
          class="md:hidden text-slate-400 hover:text-slate-600 p-1"
          aria-label="Close navigation menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <div class="px-3 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Inventory</div>

        <a
          routerLink="/dashboard"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </div>
        </a>

        <a
          routerLink="/products"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Products</span>
          </div>
        </a>

        <a
          routerLink="/inventory"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Stock Tracking</span>
          </div>
        </a>

        <a
          routerLink="/locations"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Locations</span>
          </div>
        </a>

        <div class="pt-4 px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Operations</div>

        <a
          routerLink="/transfers"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Transfers</span>
          </div>
        </a>

        <a
          routerLink="/suppliers"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Suppliers</span>
          </div>
        </a>

        <a
          routerLink="/purchase-orders"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Purchase Orders</span>
          </div>
        </a>

        <a
          routerLink="/sales-orders"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Sales Orders</span>
          </div>
        </a>

        <div class="pt-4 px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tools</div>

        <a
          routerLink="/scanner"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Barcode & RFID</span>
          </div>
        </a>

        <a
          routerLink="/reports"
          routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-sm"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Reports</span>
          </div>
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly isOpen = input<boolean>(false);
  readonly closeSidebar = output<void>();

  onLinkClick() {
    this.closeSidebar.emit();
  }
}
