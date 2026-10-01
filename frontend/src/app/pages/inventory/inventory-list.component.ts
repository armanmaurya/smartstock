import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { LocationService } from '../../core/services/location.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { InventoryStock, StockMovement, StockAdjustmentDTO, AdjustmentReason } from '../../core/models/inventory.model';
import { Location } from '../../core/models/location.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Multi-Location Stock
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {{ activeTab() === 'stocks' ? filteredStocks().length + ' Stock Entries' : movements().length + ' Movements' }}
            </span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Track physical stock, reservations, aisle bins, and audit trails across all retail stores</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openAdjustModal()"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Record Adjustment
          </button>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          (click)="activeTab.set('stocks')"
          class="pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2"
          [ngClass]="activeTab() === 'stocks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Current Store Inventory
        </button>

        <button
          type="button"
          (click)="switchToMovements()"
          class="pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2"
          [ngClass]="activeTab() === 'movements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Audit Movement Ledger
        </button>
      </div>

      <!-- Tab 1: Current Stock Levels -->
      @if (activeTab() === 'stocks') {
        <!-- Filters Toolbar (Flat, No Card) -->
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <div class="flex-1 w-full relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="applyStockFilters()"
              placeholder="Search by product name or SKU..."
              class="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          <div class="w-full sm:w-60">
            <select
              [(ngModel)]="selectedLocationId"
              (ngModelChange)="onLocationFilterChange()"
              class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            >
              <option [value]="0">All Locations (Stores & WH)</option>
              @for (loc of locations(); track loc.id) {
                <option [value]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
              }
            </select>
          </div>

          <div class="w-full sm:w-52">
            <select
              [(ngModel)]="selectedHealthFilter"
              (ngModelChange)="applyStockFilters()"
              class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="LOW_STOCK">Low Stock Alerts</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="HEALTHY">Optimal Stock</option>
            </select>
          </div>
        </div>

        <!-- Inventory Stock Table (Flat, No Card) -->
        <div class="border-t border-b border-slate-200">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th class="py-3 px-3">Product / SKU</th>
                  <th class="py-3 px-3">Location</th>
                  <th class="py-3 px-3 text-center">Aisle / Bin</th>
                  <th class="py-3 px-3 text-right">On Hand</th>
                  <th class="py-3 px-3 text-right">Reserved</th>
                  <th class="py-3 px-3 text-right">Available</th>
                  <th class="py-3 px-3 text-center">Safety / Reorder</th>
                  <th class="py-3 px-3 text-center">Status</th>
                  <th class="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @if (isLoading()) {
                  <tr>
                    <td colspan="9" class="text-center py-12 text-slate-500">
                      <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <div class="mt-2 text-xs">Loading inventory stock records...</div>
                    </td>
                  </tr>
                } @else if (filteredStocks().length === 0) {
                  <tr>
                    <td colspan="9" class="text-center py-12 text-slate-500">
                      No stock records found matching filters.
                    </td>
                  </tr>
                } @else {
                  @for (stock of filteredStocks(); track stock.id) {
                    <tr class="hover:bg-slate-50/80 transition">
                      <td class="py-3.5 px-4">
                        <div class="font-medium text-slate-900">{{ stock.product.name }}</div>
                        <div class="text-xs text-indigo-600 font-mono mt-0.5">
                          {{ stock.product.sku }} • {{ stock.product.category }}
                        </div>
                      </td>

                      <td class="py-3.5 px-4">
                        <div class="text-slate-800 font-medium">{{ stock.location.name }}</div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {{ stock.location.type }}
                        </span>
                      </td>

                      <td class="py-3.5 px-4 text-center text-xs font-mono text-slate-500">
                        {{ stock.aisleBinLocation ?? '—' }}
                      </td>

                      <td class="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                        {{ stock.quantityOnHand }}
                      </td>

                      <td class="py-3.5 px-4 text-right text-xs text-slate-500">
                        {{ stock.quantityReserved ?? 0 }}
                      </td>

                      <td class="py-3.5 px-4 text-right font-semibold text-emerald-600">
                        {{ getAvailableQty(stock) }}
                      </td>

                      <td class="py-3.5 px-4 text-center text-xs font-mono text-slate-500">
                        Safety: {{ stock.safetyStock }} | Reorder: {{ stock.reorderPoint }}
                      </td>

                      <td class="py-3.5 px-4 text-center">
                        @if (stock.quantityOnHand <= 0) {
                          <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        } @else if (stock.quantityOnHand <= stock.reorderPoint) {
                          <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Low Stock
                          </span>
                        } @else {
                          <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Optimal
                          </span>
                        }
                      </td>

                      <td class="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          (click)="openAdjustForStock(stock)"
                          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition text-xs font-medium"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab 2: Stock Movement Audit Log (Flat, No Card) -->
      @if (activeTab() === 'movements') {
        <div class="border-t border-b border-slate-200">
          <div class="py-3 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Audit Trail & Transaction Log</h3>
              <p class="text-xs text-slate-500">Immutable record of every receipt, inter-store transfer, and manual adjustment</p>
            </div>
            <button
              type="button"
              (click)="loadMovements()"
              class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 rounded transition"
            >
              Reload Log
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th class="py-3.5 px-4">Date & Time</th>
                  <th class="py-3.5 px-4">Movement Type</th>
                  <th class="py-3.5 px-4">Product</th>
                  <th class="py-3.5 px-4">From Location</th>
                  <th class="py-3.5 px-4">To Location</th>
                  <th class="py-3.5 px-4 text-right">Quantity</th>
                  <th class="py-3.5 px-4">Reference / Reason</th>
                  <th class="py-3.5 px-4">Operator</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @if (isMovementsLoading()) {
                  <tr>
                    <td colspan="8" class="text-center py-12 text-slate-500">
                      <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <div class="mt-2 text-xs">Loading movement logs...</div>
                    </td>
                  </tr>
                } @else if (movements().length === 0) {
                  <tr>
                    <td colspan="8" class="text-center py-12 text-slate-500">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                } @else {
                  @for (mov of movements(); track mov.id) {
                    <tr class="hover:bg-slate-50/80 transition text-xs">
                      <td class="py-3 px-4 font-mono text-slate-500">
                        {{ mov.movementDate | date:'medium' }}
                      </td>

                      <td class="py-3 px-4">
                        <span
                          class="px-2 py-0.5 rounded font-bold text-[10px]"
                          [ngClass]="{
                            'bg-emerald-50 text-emerald-700 border border-emerald-200': mov.movementType === 'RECEIPT',
                            'bg-blue-50 text-blue-700 border border-blue-200': mov.movementType === 'TRANSFER_IN' || mov.movementType === 'TRANSFER_OUT',
                            'bg-amber-50 text-amber-700 border border-amber-200': mov.movementType === 'ADJUSTMENT',
                            'bg-purple-50 text-purple-700 border border-purple-200': mov.movementType === 'SHIPMENT',
                            'bg-cyan-50 text-cyan-700 border border-cyan-200': mov.movementType === 'CYCLE_COUNT'
                          }"
                        >
                          {{ mov.movementType }}
                        </span>
                      </td>

                      <td class="py-3 px-4">
                        <div class="font-medium text-slate-900">{{ mov.product.name }}</div>
                        <div class="text-[11px] text-slate-500 font-mono">{{ mov.product.sku }}</div>
                      </td>

                      <td class="py-3 px-4 text-slate-700">
                        {{ mov.fromLocation?.name ?? '—' }}
                      </td>

                      <td class="py-3 px-4 text-slate-700">
                        {{ mov.toLocation?.name ?? '—' }}
                      </td>

                      <td class="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        {{ mov.quantity }}
                      </td>

                      <td class="py-3 px-4">
                        <div class="font-mono text-indigo-600 font-medium">{{ mov.referenceNumber ?? 'N/A' }}</div>
                        <div class="text-[11px] text-slate-500">{{ mov.reason ?? '—' }}</div>
                      </td>

                      <td class="py-3 px-4 text-slate-500 font-mono">
                        {{ mov.performedBy ?? 'SYSTEM' }}
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Stock Adjustment Modal -->
      @if (showAdjustModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Record Stock Adjustment
              </h3>
              <button
                type="button"
                (click)="closeAdjustModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="submitAdjustment()" class="space-y-4 pt-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Product <span class="text-rose-500">*</span></label>
                <select
                  [(ngModel)]="adjustModel.productId"
                  name="productId"
                  required
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option [value]="0" disabled>Select product to adjust...</option>
                  @for (prod of products(); track prod.id) {
                    <option [value]="prod.id">{{ prod.name }} ({{ prod.sku }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Store / Warehouse Location <span class="text-rose-500">*</span></label>
                <select
                  [(ngModel)]="adjustModel.locationId"
                  name="locationId"
                  required
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option [value]="0" disabled>Select store location...</option>
                  @for (loc of locations(); track loc.id) {
                    <option [value]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Delta (+ to increase, - to decrease) <span class="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="adjustModel.quantityDelta"
                  name="quantityDelta"
                  required
                  placeholder="e.g. -5 (for damaged) or +10 (for recount)"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
                <span class="text-[11px] text-slate-500 mt-1 block">
                  Example: Enter <code class="text-rose-600 font-medium">-2</code> to write-off 2 damaged units, or <code class="text-emerald-600 font-medium">+5</code> for discovered surplus.
                </span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Adjustment Reason <span class="text-rose-500">*</span></label>
                <select
                  [(ngModel)]="adjustModel.adjustmentReason"
                  name="adjustmentReason"
                  required
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="DAMAGED_GOODS">DAMAGED_GOODS (Damaged on floor or shelf)</option>
                  <option value="EXPIRED_STOCK">EXPIRED_STOCK (Past shelf expiration)</option>
                  <option value="SHRINKAGE_THEFT">SHRINKAGE_THEFT (Unaccounted shortage / theft)</option>
                  <option value="CYCLE_COUNT_VARIANCE">CYCLE_COUNT_VARIANCE (Discrepancy in physical count)</option>
                  <option value="SYSTEM_CORRECTION">SYSTEM_CORRECTION (Data entry fix)</option>
                  <option value="CUSTOMER_RETURN">CUSTOMER_RETURN (Returned to inventory)</option>
                  <option value="INITIAL_STOCK_COUNT">INITIAL_STOCK_COUNT (Opening balance)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Notes / Incident Details</label>
                <textarea
                  [(ngModel)]="adjustModel.notes"
                  name="notes"
                  rows="2"
                  placeholder="Enter audit notes (e.g. Water damage in Aisle B Bin 201)..."
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="closeAdjustModal()"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="isAdjusting()"
                  class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition disabled:opacity-50"
                >
                  {{ isAdjusting() ? 'Recording...' : 'Commit Adjustment' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private locationService = inject(LocationService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  readonly activeTab = signal<'stocks' | 'movements'>('stocks');
  readonly stocks = signal<InventoryStock[]>([]);
  readonly filteredStocks = signal<InventoryStock[]>([]);
  readonly movements = signal<StockMovement[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly products = signal<Product[]>([]);

  readonly isLoading = signal<boolean>(false);
  readonly isMovementsLoading = signal<boolean>(false);
  readonly isAdjusting = signal<boolean>(false);
  readonly showAdjustModal = signal<boolean>(false);

  searchQuery = '';
  selectedLocationId = 0;
  selectedHealthFilter = 'ALL';

  adjustModel: StockAdjustmentDTO = {
    productId: 0,
    locationId: 0,
    quantityDelta: 0,
    adjustmentReason: 'DAMAGED_GOODS',
    notes: '',
    performedBy: 'STORE_MGR'
  };

  ngOnInit() {
    this.loadLocations();
    this.loadProducts();

    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'low-stock') {
        this.selectedHealthFilter = 'LOW_STOCK';
      }
      if (params['action'] === 'adjust') {
        this.openAdjustModal();
      }
      if (params['productId']) {
        const pId = Number(params['productId']);
        if (pId) {
          this.searchQuery = '';
          this.loadStocksForProduct(pId);
          return;
        }
      }
      this.loadStocks();
    });
  }

  loadLocations() {
    this.locationService.getAll().subscribe({
      next: locs => this.locations.set(locs),
      error: () => {}
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: prods => this.products.set(prods),
      error: () => {}
    });
  }

  loadStocks() {
    this.isLoading.set(true);
    if (this.selectedLocationId > 0) {
      this.inventoryService.getStocksByLocation(this.selectedLocationId).subscribe({
        next: list => {
          this.stocks.set(list);
          this.applyStockFilters();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastService.error('Failed to load store inventory.');
        }
      });
    } else {
      this.inventoryService.getAllStocks().subscribe({
        next: list => {
          this.stocks.set(list);
          this.applyStockFilters();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastService.error('Failed to load inventory stock.');
        }
      });
    }
  }

  loadStocksForProduct(productId: number) {
    this.isLoading.set(true);
    this.inventoryService.getStocksByProduct(productId).subscribe({
      next: list => {
        this.stocks.set(list);
        this.applyStockFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadStocks();
      }
    });
  }

  onLocationFilterChange() {
    this.loadStocks();
  }

  applyStockFilters() {
    let list = this.stocks();

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.product.name.toLowerCase().includes(q) ||
        s.product.sku.toLowerCase().includes(q)
      );
    }

    if (this.selectedHealthFilter === 'LOW_STOCK') {
      list = list.filter(s => s.quantityOnHand > 0 && s.quantityOnHand <= s.reorderPoint);
    } else if (this.selectedHealthFilter === 'OUT_OF_STOCK') {
      list = list.filter(s => s.quantityOnHand <= 0);
    } else if (this.selectedHealthFilter === 'HEALTHY') {
      list = list.filter(s => s.quantityOnHand > s.reorderPoint);
    }

    this.filteredStocks.set(list);
  }

  getAvailableQty(stock: InventoryStock): number {
    return Math.max(0, (stock.quantityOnHand ?? 0) - (stock.quantityReserved ?? 0));
  }

  switchToMovements() {
    this.activeTab.set('movements');
    this.loadMovements();
  }

  loadMovements() {
    this.isMovementsLoading.set(true);
    this.inventoryService.getRecentMovements().subscribe({
      next: data => {
        this.movements.set(data);
        this.isMovementsLoading.set(false);
      },
      error: () => {
        this.isMovementsLoading.set(false);
        this.toastService.error('Failed to load stock movements audit log.');
      }
    });
  }

  openAdjustModal() {
    this.adjustModel = {
      productId: this.products()[0]?.id ?? 0,
      locationId: this.locations()[0]?.id ?? 0,
      quantityDelta: 0,
      adjustmentReason: 'DAMAGED_GOODS',
      notes: '',
      performedBy: 'STORE_MGR'
    };
    this.showAdjustModal.set(true);
  }

  openAdjustForStock(stock: InventoryStock) {
    this.adjustModel = {
      productId: stock.product.id ?? 0,
      locationId: stock.location.id ?? 0,
      quantityDelta: 0,
      adjustmentReason: 'DAMAGED_GOODS',
      notes: `Adjustment for ${stock.product.name} at ${stock.location.name}`,
      performedBy: 'STORE_MGR'
    };
    this.showAdjustModal.set(true);
  }

  closeAdjustModal() {
    this.showAdjustModal.set(false);
  }

  submitAdjustment() {
    if (!this.adjustModel.productId || !this.adjustModel.locationId) {
      this.toastService.warning('Please select product and location.');
      return;
    }
    if (this.adjustModel.quantityDelta === 0) {
      this.toastService.warning('Quantity delta cannot be 0.');
      return;
    }

    this.isAdjusting.set(true);
    this.inventoryService.adjustStock(this.adjustModel).subscribe({
      next: updatedStock => {
        this.isAdjusting.set(false);
        this.closeAdjustModal();
        this.toastService.success(
          `Stock updated! New on-hand quantity is ${updatedStock.quantityOnHand}.`,
          'Adjustment Completed'
        );
        this.loadStocks();
      },
      error: err => {
        this.isAdjusting.set(false);
        this.toastService.error(err?.error?.message ?? 'Failed to adjust stock');
      }
    });
  }
}
