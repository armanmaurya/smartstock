import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardKpiDTO } from '../../core/models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Retail Operations
            @if (isLoading()) {
              <span class="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            }
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">Real-time inventory levels, fulfillment pipelines, and optimization metrics</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="loadDashboard()"
            [disabled]="isLoading()"
            class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 rounded transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" [class.animate-spin]="isLoading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          <a
            routerLink="/scanner"
            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition"
          >
            Quick Scan
          </a>
        </div>
      </div>

      <!-- Backend Alert (if unreachable) -->
      @if (backendError()) {
        <div class="border-l-4 border-amber-500 bg-amber-50 p-4 text-xs text-amber-900">
          <div class="font-semibold text-amber-900">Backend Server Offline</div>
          <div class="mt-1 text-amber-800">
            Could not reach Spring Boot backend at <code>http://localhost:8080/api</code>.
            Run: <code>cd /home/hunterx/Downloads/inventory && ./mvnw spring-boot:run</code>
          </div>
          <button
            type="button"
            (click)="loadDashboard()"
            class="mt-2 text-xs font-semibold text-amber-900 underline hover:no-underline"
          >
            Retry Connection
          </button>
        </div>
      }

      <!-- Primary Metrics Strip (Flat, No Cards) -->
      <div class="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 pb-6 gap-6">
        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Catalog SKUs</div>
          <div class="text-3xl font-bold text-slate-900 mt-1.5">{{ kpi()?.totalProducts ?? 0 }}</div>
          <div class="text-xs text-slate-500 mt-1">
            <a routerLink="/products" class="hover:text-indigo-600">View Catalog →</a>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Stock Units on Hand</div>
          <div class="text-3xl font-bold text-slate-900 mt-1.5">{{ kpi()?.totalStockUnits ?? 0 }}</div>
          <div class="text-xs text-slate-500 mt-1">
            Across {{ kpi()?.totalLocations ?? 0 }} Locations
          </div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Inventory Valuation</div>
          <div class="text-3xl font-bold text-slate-900 mt-1.5">\${{ (kpi()?.totalCostValuation ?? 0) | number:'1.2-2' }}</div>
          <div class="text-xs text-slate-500 mt-1">
            Retail: \${{ (kpi()?.totalRetailValuation ?? 0) | number:'1.2-2' }}
          </div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Alerts</div>
          <div class="text-3xl font-bold mt-1.5 text-amber-700 flex items-baseline gap-2">
            <span>{{ kpi()?.lowStockCount ?? 0 }}</span>
            <span class="text-xs font-normal text-slate-500">Low</span>
            <span class="text-rose-700 ml-2">{{ kpi()?.outOfStockCount ?? 0 }}</span>
            <span class="text-xs font-normal text-slate-500">Out</span>
          </div>
          <div class="text-xs text-slate-500 mt-1">
            <a routerLink="/inventory" [queryParams]="{ filter: 'low-stock' }" class="hover:text-amber-800">Review Items →</a>
          </div>
        </div>
      </div>

      <!-- Secondary Metrics Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 pb-6 gap-6 text-sm">
        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Potential Gross Margin</div>
          <div class="text-xl font-bold text-emerald-700 mt-1">
            \${{ (kpi()?.potentialGrossMargin ?? 0) | number:'1.2-2' }}
          </div>
          <div class="text-xs text-slate-500 mt-0.5">
            Average markup: <span class="font-medium text-slate-700">{{ kpi()?.marginPercentage ?? 0 }}%</span>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Inbound Replenishment</div>
          <div class="text-xl font-bold text-slate-900 mt-1">
            {{ kpi()?.pendingPurchaseOrders ?? 0 }} Pending POs
          </div>
          <div class="text-xs text-slate-500 mt-0.5">
            <a routerLink="/purchase-orders" class="hover:text-indigo-600">Goods Receipt Check-In →</a>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Customer Fulfillment</div>
          <div class="text-xl font-bold text-slate-900 mt-1">
            {{ kpi()?.pendingSalesOrders ?? 0 }} Active Orders
          </div>
          <div class="text-xs text-slate-500 mt-0.5">
            <a routerLink="/sales-orders" class="hover:text-indigo-600">Fulfill & Pack Orders →</a>
          </div>
        </div>
      </div>

      <!-- Operations Tables (Flat Layout) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Reorder Suggestions Table -->
        <div class="lg:col-span-7">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Optimization Reorders</h2>
              <p class="text-xs text-slate-500">Items at or below safety stock threshold</p>
            </div>
            <a routerLink="/reports" class="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              View All →
            </a>
          </div>

          @if ((kpi()?.reorderRecommendations?.length ?? 0) === 0) {
            <div class="py-8 text-center text-xs text-slate-500">
              Inventory levels are optimal. No restock needed.
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="text-slate-400 border-b border-slate-200 font-medium">
                  <tr>
                    <th class="py-2.5">Product</th>
                    <th class="py-2.5">Facility</th>
                    <th class="py-2.5 text-center">Current</th>
                    <th class="py-2.5 text-right">Suggested</th>
                    <th class="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (rec of kpi()?.reorderRecommendations?.slice(0, 5); track rec.productId + '-' + rec.locationId) {
                    <tr class="hover:bg-slate-50 transition">
                      <td class="py-2.5 pr-2 font-medium text-slate-900">
                        {{ rec.productName }}
                        <div class="text-[10px] text-slate-400 font-mono">{{ rec.sku }}</div>
                      </td>
                      <td class="py-2.5 text-slate-600">{{ rec.locationName }}</td>
                      <td class="py-2.5 text-center font-medium" [ngClass]="rec.currentStock === 0 ? 'text-rose-700' : 'text-amber-800'">
                        {{ rec.currentStock }}
                      </td>
                      <td class="py-2.5 text-right font-semibold text-emerald-700">
                        +{{ rec.suggestedReorderQuantity }}
                      </td>
                      <td class="py-2.5 text-right">
                        <a
                          routerLink="/purchase-orders"
                          [queryParams]="{ action: 'new', supplierId: rec.supplierId }"
                          class="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Order
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Stock Movements Trail -->
        <div class="lg:col-span-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Recent Movements</h2>
              <p class="text-xs text-slate-500">Audit ledger of inbound, outbound, & transfer actions</p>
            </div>
            <a routerLink="/inventory" class="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Audit Log →
            </a>
          </div>

          @if ((kpi()?.recentMovements?.length ?? 0) === 0) {
            <div class="py-8 text-center text-xs text-slate-500">
              No recent movements recorded.
            </div>
          } @else {
            <div class="divide-y divide-slate-100 text-xs">
              @for (mov of kpi()?.recentMovements?.slice(0, 6); track mov.id) {
                <div class="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div class="min-w-0">
                    <div class="font-medium text-slate-900 truncate">{{ mov.product.name }}</div>
                    <div class="text-[11px] text-slate-500 truncate">
                      {{ mov.movementType }} • Qty: <strong class="text-slate-700">{{ mov.quantity }}</strong>
                      @if (mov.reason) { • {{ mov.reason }} }
                    </div>
                  </div>
                  <div class="text-[11px] text-slate-400 shrink-0 font-mono">
                    {{ mov.movementDate | date:'shortTime' }}
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);

  readonly kpi = signal<DashboardKpiDTO | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly backendError = signal<boolean>(false);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading.set(true);
    this.backendError.set(false);

    this.reportService.getDashboardKpi().subscribe({
      next: data => {
        this.kpi.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.backendError.set(true);
        this.toastService.warning(
          'Could not reach backend at http://localhost:8080. Start the backend application to view live data.',
          'Backend Offline'
        );
      }
    });
  }
}
