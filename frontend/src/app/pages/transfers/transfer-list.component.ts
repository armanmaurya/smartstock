import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../core/services/transfer.service';
import { LocationService } from '../../core/services/location.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { StockTransfer, StockTransferRequestDTO, TransferStatus } from '../../core/models/transfer.model';
import { Location } from '../../core/models/location.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Inter-Store Stock Transfers
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {{ filteredTransfers().length }} Transfers
            </span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Multi-store replenishment state machine: Requested ➔ Approved ➔ In-Transit ➔ Received</p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Request Transfer
        </button>
      </div>

      <!-- State Machine Workflow Strip (Flat, No Cards) -->
      <div class="border-y border-slate-200 py-3">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div class="flex items-center gap-1.5 font-semibold text-slate-800">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 1. REQUESTED
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Store manager requests restock.</p>
          </div>

          <div>
            <div class="flex items-center gap-1.5 font-semibold text-slate-800">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 2. APPROVED
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Logistics verifies stock availability.</p>
          </div>

          <div>
            <div class="flex items-center gap-1.5 font-semibold text-slate-800">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 3. IN_TRANSIT
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Dispatched: Stock deducted at origin.</p>
          </div>

          <div>
            <div class="flex items-center gap-1.5 font-semibold text-slate-800">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 4. RECEIVED
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Verified: Stock added at target store.</p>
          </div>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="flex flex-wrap gap-1.5">
        @for (st of statusFilters; track st) {
          <button
            type="button"
            (click)="selectedStatus.set(st)"
            class="px-2.5 py-1 rounded text-xs font-medium transition"
            [ngClass]="selectedStatus() === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          >
            {{ st === 'ALL' ? 'All Transfers' : st }}
          </button>
        }
      </div>

      <!-- Transfers Table (Flat, No Cards) -->
      <div class="border-t border-b border-slate-200">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th class="py-3 px-3">Transfer Number</th>
                <th class="py-3 px-3">Origin / Destination</th>
                <th class="py-3 px-3 text-center">Items</th>
                <th class="py-3 px-3">Request Date</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (isLoading()) {
                <tr>
                  <td colspan="6" class="text-center py-12 text-slate-500">
                    <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <div class="mt-2 text-xs">Loading stock transfers...</div>
                  </td>
                </tr>
              } @else if (filteredTransfers().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-12 text-slate-500">
                    No transfers found for the selected status.
                  </td>
                </tr>
              } @else {
                @for (trf of filteredTransfers(); track trf.id) {
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4 font-mono font-medium text-slate-900">
                      <div>{{ trf.transferNumber }}</div>
                      @if (trf.notes) {
                        <div class="text-xs text-slate-500 font-sans mt-0.5 truncate max-w-[200px]" [title]="trf.notes">{{ trf.notes }}</div>
                      }
                    </td>

                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2 text-xs">
                        <span class="font-medium text-slate-800">{{ trf.fromLocation.name }}</span>
                        <span class="text-slate-400 font-bold">➔</span>
                        <span class="font-medium text-slate-800">{{ trf.toLocation.name }}</span>
                      </div>
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        (click)="viewItems(trf)"
                        class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 border border-slate-200 transition"
                      >
                        {{ trf.items.length }} line items
                      </button>
                    </td>

                    <td class="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {{ trf.requestDate | date:'mediumDate' }}
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-amber-50 text-amber-700 border border-amber-200': trf.status === 'REQUESTED',
                          'bg-blue-50 text-blue-700 border border-blue-200': trf.status === 'APPROVED',
                          'bg-purple-50 text-purple-700 border border-purple-200': trf.status === 'IN_TRANSIT',
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': trf.status === 'RECEIVED',
                          'bg-rose-50 text-rose-700 border border-rose-200': trf.status === 'CANCELLED'
                        }"
                      >
                        {{ trf.status }}
                      </span>
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        @if (trf.status === 'REQUESTED') {
                          <button
                            type="button"
                            (click)="approveTransfer(trf)"
                            class="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            (click)="cancelTransfer(trf)"
                            class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-600 border border-slate-200 text-xs transition"
                          >
                            Cancel
                          </button>
                        } @else if (trf.status === 'APPROVED') {
                          <button
                            type="button"
                            (click)="shipTransfer(trf)"
                            class="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Ship Goods
                          </button>
                        } @else if (trf.status === 'IN_TRANSIT') {
                          <button
                            type="button"
                            (click)="receiveTransfer(trf)"
                            class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Receipt
                          </button>
                        } @else {
                          <span class="text-xs text-slate-400 font-mono">Archived</span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Transfer Details Modal -->
      @if (selectedTransfer()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl relative">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ selectedTransfer()?.transferNumber }}</h3>
                <div class="text-xs text-slate-500 mt-0.5">
                  {{ selectedTransfer()?.fromLocation?.name }} ➔ {{ selectedTransfer()?.toLocation?.name }}
                </div>
              </div>
              <button
                type="button"
                (click)="selectedTransfer.set(null)"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div class="py-4 space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Transfer Manifest</h4>
              <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                @for (item of selectedTransfer()?.items; track item.id) {
                  <div class="p-3 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <div class="font-medium text-slate-900">{{ item.product.name }}</div>
                      <div class="text-indigo-600 font-mono">{{ item.product.sku }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-slate-700">Requested: <strong class="text-slate-900">{{ item.quantityRequested }}</strong></div>
                      <div class="text-[11px] text-slate-500">
                        Shipped: {{ item.quantityShipped ?? 0 }} | Received: {{ item.quantityReceived ?? 0 }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                (click)="selectedTransfer.set(null)"
                class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 border border-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create Transfer Request Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-900">Create Inter-Store Transfer Request</h3>
              <button
                type="button"
                (click)="closeCreateModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="submitTransfer()" class="space-y-4 pt-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Source Location (From) <span class="text-rose-500">*</span></label>
                  <select
                    [(ngModel)]="requestModel.fromLocationId"
                    name="fromLocationId"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option [value]="0" disabled>Select origin...</option>
                    @for (loc of locations(); track loc.id) {
                      <option [value]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Destination Location (To) <span class="text-rose-500">*</span></label>
                  <select
                    [(ngModel)]="requestModel.toLocationId"
                    name="toLocationId"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option [value]="0" disabled>Select target store...</option>
                    @for (loc of locations(); track loc.id) {
                      <option [value]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
                    }
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Transfer Purpose / Notes</label>
                <input
                  type="text"
                  [(ngModel)]="requestModel.notes"
                  name="notes"
                  placeholder="e.g. Replenishment for weekend promotional event..."
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <!-- Line Items Section -->
              <div class="space-y-3 pt-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold uppercase tracking-wider text-slate-700">Items to Transfer</label>
                  <button
                    type="button"
                    (click)="addItemLine()"
                    class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-medium transition flex items-center gap-1"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div class="space-y-2">
                  @for (item of requestModel.items; track $index; let idx = $index) {
                    <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div class="flex-1">
                        <select
                          [(ngModel)]="item.productId"
                          name="product_{{ idx }}"
                          required
                          class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option [value]="0" disabled>Select product...</option>
                          @for (p of products(); track p.id) {
                            <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                          }
                        </select>
                      </div>

                      <div class="w-32">
                        <input
                          type="number"
                          min="1"
                          [(ngModel)]="item.quantity"
                          name="qty_{{ idx }}"
                          placeholder="Quantity"
                          class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      @if (requestModel.items.length > 1) {
                        <button
                          type="button"
                          (click)="removeItemLine(idx)"
                          class="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        >
                          &times;
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="closeCreateModal()"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="isSubmitting()"
                  class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition disabled:opacity-50"
                >
                  {{ isSubmitting() ? 'Submitting...' : 'Submit Transfer Request' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class TransferListComponent implements OnInit {
  private transferService = inject(TransferService);
  private locationService = inject(LocationService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  readonly transfers = signal<StockTransfer[]>([]);
  readonly filteredTransfers = signal<StockTransfer[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly products = signal<Product[]>([]);

  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly showCreateModal = signal<boolean>(false);
  readonly selectedTransfer = signal<StockTransfer | null>(null);

  readonly statusFilters = ['ALL', 'REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'];
  readonly selectedStatus = signal<string>('ALL');

  requestModel: StockTransferRequestDTO = this.emptyRequest();

  ngOnInit() {
    this.loadLocations();
    this.loadProducts();
    this.loadTransfers();
  }

  emptyRequest(): StockTransferRequestDTO {
    return {
      fromLocationId: 0,
      toLocationId: 0,
      notes: '',
      items: [{ productId: 0, quantity: 10 }]
    };
  }

  loadLocations() {
    this.locationService.getAll().subscribe({
      next: locs => this.locations.set(locs)
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: prods => this.products.set(prods)
    });
  }

  loadTransfers() {
    this.isLoading.set(true);
    this.transferService.getAll().subscribe({
      next: list => {
        this.transfers.set(list);
        this.filterTransfers();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load transfers from server.');
      }
    });
  }

  filterTransfers() {
    const st = this.selectedStatus();
    if (st === 'ALL') {
      this.filteredTransfers.set(this.transfers());
    } else {
      this.filteredTransfers.set(this.transfers().filter(t => t.status === st));
    }
  }

  viewItems(trf: StockTransfer) {
    this.selectedTransfer.set(trf);
  }

  openCreateModal() {
    this.requestModel = {
      fromLocationId: this.locations()[0]?.id ?? 0,
      toLocationId: this.locations()[1]?.id ?? 0,
      notes: '',
      items: [{ productId: this.products()[0]?.id ?? 0, quantity: 10 }]
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  addItemLine() {
    this.requestModel.items.push({
      productId: this.products()[0]?.id ?? 0,
      quantity: 5
    });
  }

  removeItemLine(index: number) {
    this.requestModel.items.splice(index, 1);
  }

  submitTransfer() {
    if (this.requestModel.fromLocationId === this.requestModel.toLocationId) {
      this.toastService.warning('Source and destination locations cannot be the same!');
      return;
    }

    if (this.requestModel.items.some(i => !i.productId || i.quantity <= 0)) {
      this.toastService.warning('Please select a valid product and positive quantity for all items.');
      return;
    }

    this.isSubmitting.set(true);
    this.transferService.create(this.requestModel).subscribe({
      next: trf => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.toastService.success(`Transfer ${trf.transferNumber} created!`);
        this.loadTransfers();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toastService.error(err?.error?.message ?? 'Failed to create transfer request');
      }
    });
  }

  approveTransfer(trf: StockTransfer) {
    if (!trf.id) return;
    this.transferService.approve(trf.id).subscribe({
      next: () => {
        this.toastService.success(`Transfer ${trf.transferNumber} approved!`);
        this.loadTransfers();
      },
      error: err => this.toastService.error(err?.error?.message ?? 'Approval failed')
    });
  }

  shipTransfer(trf: StockTransfer) {
    if (!trf.id) return;
    this.transferService.ship(trf.id).subscribe({
      next: () => {
        this.toastService.success(`Transfer ${trf.transferNumber} dispatched! Stock deducted from origin.`);
        this.loadTransfers();
      },
      error: err => this.toastService.error(err?.error?.message ?? 'Shipment failed')
    });
  }

  receiveTransfer(trf: StockTransfer) {
    if (!trf.id) return;
    this.transferService.receive(trf.id).subscribe({
      next: () => {
        this.toastService.success(`Transfer ${trf.transferNumber} received! Stock added to destination.`);
        this.loadTransfers();
      },
      error: err => this.toastService.error(err?.error?.message ?? 'Receipt failed')
    });
  }

  cancelTransfer(trf: StockTransfer) {
    if (!trf.id) return;
    if (confirm(`Cancel transfer ${trf.transferNumber}?`)) {
      this.transferService.cancel(trf.id).subscribe({
        next: () => {
          this.toastService.info(`Transfer ${trf.transferNumber} cancelled.`);
          this.loadTransfers();
        },
        error: err => this.toastService.error(err?.error?.message ?? 'Cancellation failed')
      });
    }
  }
}
