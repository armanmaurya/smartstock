import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardKpiDTO, ReorderRecommendationDTO } from '../../core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            KPI & Optimization
            @if (isLoading()) {
              <span class="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            }
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">Valuation analysis, profit margins, and automated reorder algorithms</p>
        </div>

        <button
          type="button"
          (click)="loadReports()"
          [disabled]="isLoading()"
          class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 rounded transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5 text-slate-500" [class.animate-spin]="isLoading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Re-run Analytics
        </button>
      </div>

      <!-- Financial Valuation Strip (Flat, No Cards) -->
      <div class="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 pb-6 gap-6">
        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Inventory at Cost</div>
          <div class="text-3xl font-bold text-slate-900 mt-1.5">
            \${{ (kpi()?.totalCostValuation ?? 0) | number:'1.2-2' }}
          </div>
          <p class="text-xs text-slate-500 mt-1">Invested working capital</p>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Inventory at Retail</div>
          <div class="text-3xl font-bold text-slate-900 mt-1.5">
            \${{ (kpi()?.totalRetailValuation ?? 0) | number:'1.2-2' }}
          </div>
          <p class="text-xs text-slate-500 mt-1">Projected store revenue</p>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Gross Margin Potential</div>
          <div class="text-3xl font-bold text-emerald-700 mt-1.5">
            \${{ (kpi()?.potentialGrossMargin ?? 0) | number:'1.2-2' }}
          </div>
          <p class="text-xs text-slate-500 mt-1">Expected gross profit upside</p>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Markup Margin %</div>
          <div class="text-3xl font-bold text-slate-900 mt-1.5">
            {{ kpi()?.marginPercentage ?? 0 }}%
          </div>
          <p class="text-xs text-slate-500 mt-1">Average across all categories</p>
        </div>
      </div>

      <!-- Stock Health Breakdown (Flat, No Cards) -->
      <div class="border-b border-slate-200 pb-6 space-y-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Inventory Stock Health Distribution</h2>
          <p class="text-xs text-slate-500">Status of physical stock units across all retail locations</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-700">
              <span>Healthy Inventory</span>
              <span class="font-bold text-emerald-700">Optimal</span>
            </div>
            <div class="text-2xl font-bold text-slate-900 mt-1">
              {{ (kpi()?.totalStockUnits ?? 0) - (kpi()?.lowStockCount ?? 0) - (kpi()?.outOfStockCount ?? 0) }} Units
            </div>
            <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div class="bg-emerald-600 h-full rounded-full" style="width: 78%"></div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between text-xs text-slate-700">
              <span>Low Stock Alerts</span>
              <span class="font-bold text-amber-800">≤ Reorder Point</span>
            </div>
            <div class="text-2xl font-bold text-amber-800 mt-1">
              {{ kpi()?.lowStockCount ?? 0 }} SKUs
            </div>
            <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div class="bg-amber-600 h-full rounded-full" style="width: 15%"></div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between text-xs text-slate-700">
              <span>Out of Stock</span>
              <span class="font-bold text-rose-700">0 Units</span>
            </div>
            <div class="text-2xl font-bold text-rose-700 mt-1">
              {{ kpi()?.outOfStockCount ?? 0 }} SKUs
            </div>
            <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div class="bg-rose-600 h-full rounded-full" style="width: 7%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reorder Recommendations Table (Flat, No Cards) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Reorder Recommendations</h2>
            <p class="text-xs text-slate-500">Replenishment suggestions factoring lead times, safety stocks, and storage limits</p>
          </div>
          <span class="text-xs text-slate-500 font-medium">
            {{ recommendations().length }} Suggestions
          </span>
        </div>

        <div class="border-t border-b border-slate-200">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th class="py-3 px-3">Urgency</th>
                  <th class="py-3 px-3">Product / SKU</th>
                  <th class="py-3 px-3">Facility</th>
                  <th class="py-3 px-3 text-center">Current Stock</th>
                  <th class="py-3 px-3 text-center">Reorder Point</th>
                  <th class="py-3 px-3 text-right">Suggested Order</th>
                  <th class="py-3 px-3 text-right">Estimated Cost</th>
                  <th class="py-3 px-3">Supplier</th>
                  <th class="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @if (isLoading()) {
                  <tr>
                    <td colspan="9" class="text-center py-12 text-slate-500">
                      <div class="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <div class="mt-2 text-xs">Computing recommendations...</div>
                    </td>
                  </tr>
                } @else if (recommendations().length === 0) {
                  <tr>
                    <td colspan="9" class="text-center py-12 text-slate-500 text-xs">
                      All inventory levels are optimal. No restock needed at this time.
                    </td>
                  </tr>
                } @else {
                  @for (rec of recommendations(); track rec.productId + '-' + rec.locationId) {
                    <tr class="hover:bg-slate-50 transition">
                      <td class="py-3 px-3">
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          [ngClass]="{
                            'bg-rose-50 text-rose-700 border border-rose-200': rec.urgency === 'CRITICAL',
                            'bg-amber-50 text-amber-800 border border-amber-200': rec.urgency === 'HIGH',
                            'bg-blue-50 text-blue-700 border border-blue-200': rec.urgency === 'MEDIUM'
                          }"
                        >
                          {{ rec.urgency }}
                        </span>
                      </td>

                      <td class="py-3 px-3">
                        <div class="font-medium text-slate-900">{{ rec.productName }}</div>
                        <div class="text-xs text-indigo-600 font-mono">{{ rec.sku }}</div>
                      </td>

                      <td class="py-3 px-3 text-xs text-slate-700 font-medium">
                        {{ rec.locationName }}
                      </td>

                      <td class="py-3 px-3 text-center font-bold text-xs" [ngClass]="rec.currentStock === 0 ? 'text-rose-700' : 'text-amber-800'">
                        {{ rec.currentStock }}
                      </td>

                      <td class="py-3 px-3 text-center text-xs font-mono text-slate-500">
                        {{ rec.reorderPoint }} (Safety: {{ rec.safetyStock }})
                      </td>

                      <td class="py-3 px-3 text-right font-bold text-emerald-700 text-sm">
                        +{{ rec.suggestedReorderQuantity }}
                      </td>

                      <td class="py-3 px-3 text-right font-mono text-xs text-slate-900">
                        \${{ rec.estimatedCost | number:'1.2-2' }}
                      </td>

                      <td class="py-3 px-3 text-xs">
                        <div class="text-slate-900 font-medium">{{ rec.supplierName ?? 'Apex Retail' }}</div>
                        <div class="text-slate-500">Lead: {{ rec.supplierLeadTimeDays ?? 7 }}d</div>
                      </td>

                      <td class="py-3 px-3 text-right">
                        <a
                          routerLink="/purchase-orders"
                          [queryParams]="{ action: 'new', supplierId: rec.supplierId }"
                          class="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                        >
                          Order
                        </a>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);

  readonly kpi = signal<DashboardKpiDTO | null>(null);
  readonly recommendations = signal<ReorderRecommendationDTO[]>([]);
  readonly isLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading.set(true);

    this.reportService.getDashboardKpi().subscribe({
      next: data => {
        this.kpi.set(data);
        this.recommendations.set(data.reorderRecommendations ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load KPI reports. Check backend status.');
      }
    });
  }
}
