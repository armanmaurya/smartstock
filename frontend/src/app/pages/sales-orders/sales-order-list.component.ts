import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../core/services/sales-order.service';
import { LocationService } from '../../core/services/location.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { SalesOrder, SalesOrderRequestDTO, SalesOrderItemDTO } from '../../core/models/sales-order.model';
import { Location } from '../../core/models/location.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-sales-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Customer Sales Orders
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {{ orders().length }} Orders
            </span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Retail POS & online order processing, automatic stock reservation, and store fulfillment</p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Sales Order
        </button>
      </div>

      <!-- Sales Orders Table (Flat, No Cards) -->
      <div class="border-t border-b border-slate-200">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th class="py-3.5 px-4">Order Number</th>
                <th class="py-3.5 px-4">Customer</th>
                <th class="py-3.5 px-4">Store Location</th>
                <th class="py-3.5 px-4 text-center">Items</th>
                <th class="py-3.5 px-4 text-right">Order Total</th>
                <th class="py-3.5 px-4">Order Date</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-500">
                    <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <div class="mt-2 text-xs">Loading sales orders...</div>
                  </td>
                </tr>
              } @else if (orders().length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-500">
                    No sales orders found.
                  </td>
                </tr>
              } @else {
                @for (so of orders(); track so.id) {
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {{ so.orderNumber }}
                    </td>

                    <td class="py-3.5 px-4">
                      <div class="font-medium text-slate-900">{{ so.customerName ?? 'Walk-in Customer' }}</div>
                      @if (so.customerEmail) {
                        <div class="text-xs text-slate-500">{{ so.customerEmail }}</div>
                      }
                    </td>

                    <td class="py-3.5 px-4">
                      <div class="text-slate-800 font-medium">{{ so.location.name }}</div>
                      <div class="text-xs text-indigo-600 font-mono">{{ so.location.code }}</div>
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        (click)="viewDetails(so)"
                        class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 border border-slate-200 transition"
                      >
                        {{ so.items.length }} items
                      </button>
                    </td>

                    <td class="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                      \${{ so.totalAmount | number:'1.2-2' }}
                    </td>

                    <td class="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {{ so.orderDate | date:'medium' }}
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-amber-50 text-amber-700 border border-amber-200': so.status === 'PENDING',
                          'bg-blue-50 text-blue-700 border border-blue-200': so.status === 'CONFIRMED' || so.status === 'PACKED' || so.status === 'SHIPPED',
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': so.status === 'DELIVERED',
                          'bg-rose-50 text-rose-700 border border-rose-200': so.status === 'CANCELLED'
                        }"
                      >
                        {{ so.status }}
                      </span>
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        @if (so.status !== 'DELIVERED' && so.status !== 'CANCELLED') {
                          <button
                            type="button"
                            (click)="fulfillOrder(so)"
                            class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition flex items-center gap-1"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Fulfill
                          </button>
                          <button
                            type="button"
                            (click)="cancelOrder(so)"
                            class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-600 border border-slate-200 text-xs transition"
                          >
                            Cancel
                          </button>
                        } @else {
                          <span class="text-xs text-slate-400 font-mono">Completed</span>
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

      <!-- Order Details Manifest Modal -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl relative">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ selectedOrder()?.orderNumber }}</h3>
                <div class="text-xs text-slate-500">Customer: {{ selectedOrder()?.customerName }} • {{ selectedOrder()?.location?.name }}</div>
              </div>
              <button
                type="button"
                (click)="selectedOrder.set(null)"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div class="py-4 space-y-3">
              <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                @for (item of selectedOrder()?.items; track item.id) {
                  <div class="p-3 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <div class="font-medium text-slate-900">{{ item.product.name }}</div>
                      <div class="text-indigo-600 font-mono">{{ item.product.sku }} • Unit: \${{ item.unitPrice | number:'1.2-2' }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-slate-700">Qty: <strong class="text-slate-900">{{ item.quantity }}</strong></div>
                      <div class="text-[11px] text-emerald-700 font-semibold font-mono">
                        \${{ (item.quantity * item.unitPrice) | number:'1.2-2' }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-200">
              <div class="text-xs text-slate-500">
                Order Value: <strong class="text-slate-900 text-sm font-bold font-mono">\${{ selectedOrder()?.totalAmount | number:'1.2-2' }}</strong>
              </div>
              <button
                type="button"
                (click)="selectedOrder.set(null)"
                class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 border border-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create Sales Order Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-900">Create Customer Sales Order</h3>
              <button
                type="button"
                (click)="closeCreateModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="submitOrder()" class="space-y-4 pt-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Store Location <span class="text-rose-500">*</span></label>
                <select
                  [(ngModel)]="createModel.locationId"
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

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Name <span class="text-rose-500">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="createModel.customerName"
                    name="customerName"
                    required
                    placeholder="e.g. Alex Morgan"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    [(ngModel)]="createModel.customerEmail"
                    name="customerEmail"
                    placeholder="alex.morgan@example.com"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <!-- Line Items -->
              <div class="space-y-3 pt-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold uppercase tracking-wider text-slate-700">Order Items</label>
                  <button
                    type="button"
                    (click)="addItemLine()"
                    class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-medium transition"
                  >
                    + Add Item Line
                  </button>
                </div>

                <div class="space-y-2">
                  @for (item of createModel.items; track $index; let idx = $index) {
                    <div class="grid grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center">
                      <div class="col-span-6">
                        <select
                          [(ngModel)]="item.productId"
                          (ngModelChange)="onProductSelected(item)"
                          name="prod_{{ idx }}"
                          required
                          class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option [value]="0" disabled>Select product...</option>
                          @for (p of products(); track p.id) {
                            <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                          }
                        </select>
                      </div>

                      <div class="col-span-2">
                        <input
                          type="number"
                          min="1"
                          [(ngModel)]="item.quantity"
                          name="qty_{{ idx }}"
                          placeholder="Qty"
                          class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 text-center font-mono"
                        />
                      </div>

                      <div class="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          [(ngModel)]="item.unitPrice"
                          name="price_{{ idx }}"
                          placeholder="Price"
                          class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 text-right font-mono"
                        />
                      </div>

                      <div class="col-span-1 text-center">
                        @if (createModel.items.length > 1) {
                          <button
                            type="button"
                            (click)="removeItemLine(idx)"
                            class="text-slate-400 hover:text-rose-600 transition p-1"
                          >
                            &times;
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span class="text-slate-500 font-medium">Order Total:</span>
                  <span class="text-slate-900 font-bold text-base font-mono">\${{ calculateTotal() | number:'1.2-2' }}</span>
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
                  {{ isSubmitting() ? 'Submitting Order...' : 'Place Order & Reserve Stock' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SalesOrderListComponent implements OnInit {
  private salesOrderService = inject(SalesOrderService);
  private locationService = inject(LocationService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  readonly orders = signal<SalesOrder[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly products = signal<Product[]>([]);

  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly showCreateModal = signal<boolean>(false);
  readonly selectedOrder = signal<SalesOrder | null>(null);

  createModel: SalesOrderRequestDTO = this.emptyOrder();

  ngOnInit() {
    this.loadLocations();
    this.loadProducts();
    this.loadOrders();
  }

  emptyOrder(): SalesOrderRequestDTO {
    return {
      locationId: 0,
      customerName: '',
      customerEmail: '',
      items: [{ productId: 0, quantity: 1, unitPrice: 0 }]
    };
  }

  loadLocations() {
    this.locationService.getAll().subscribe({
      next: list => this.locations.set(list)
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: list => this.products.set(list)
    });
  }

  loadOrders() {
    this.isLoading.set(true);
    this.salesOrderService.getAll().subscribe({
      next: list => {
        this.orders.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load sales orders.');
      }
    });
  }

  viewDetails(so: SalesOrder) {
    this.selectedOrder.set(so);
  }

  openCreateModal() {
    this.createModel = {
      locationId: this.locations()[0]?.id ?? 0,
      customerName: '',
      customerEmail: '',
      items: [{
        productId: this.products()[0]?.id ?? 0,
        quantity: 1,
        unitPrice: this.products()[0]?.sellingPrice ?? 0
      }]
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  addItemLine() {
    const defaultProduct = this.products()[0];
    this.createModel.items.push({
      productId: defaultProduct?.id ?? 0,
      quantity: 1,
      unitPrice: defaultProduct?.sellingPrice ?? 0
    });
  }

  removeItemLine(idx: number) {
    this.createModel.items.splice(idx, 1);
  }

  onProductSelected(item: SalesOrderItemDTO) {
    const prod = this.products().find(p => p.id === Number(item.productId));
    if (prod) {
      item.unitPrice = prod.sellingPrice;
    }
  }

  calculateTotal(): number {
    return this.createModel.items.reduce((acc, it) => acc + ((it.quantity || 0) * (it.unitPrice || 0)), 0);
  }

  submitOrder() {
    if (!this.createModel.locationId || !this.createModel.customerName) {
      this.toastService.warning('Store location and customer name are required.');
      return;
    }

    if (this.createModel.items.some(i => !i.productId || i.quantity <= 0)) {
      this.toastService.warning('Please select a product and positive quantity for all items.');
      return;
    }

    this.isSubmitting.set(true);
    this.salesOrderService.create(this.createModel).subscribe({
      next: created => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.toastService.success(`Sales Order ${created.orderNumber} placed! Stock reserved in store.`);
        this.loadOrders();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toastService.error(err?.error?.message ?? 'Failed to place sales order. Check stock availability.');
      }
    });
  }

  fulfillOrder(so: SalesOrder) {
    if (!so.id) return;
    this.salesOrderService.fulfill(so.id).subscribe({
      next: () => {
        this.toastService.success(`Order ${so.orderNumber} fulfilled! Inventory deducted.`);
        this.loadOrders();
      },
      error: err => this.toastService.error(err?.error?.message ?? 'Fulfillment failed')
    });
  }

  cancelOrder(so: SalesOrder) {
    if (!so.id) return;
    if (confirm(`Cancel sales order ${so.orderNumber}? Reserved stock will be released.`)) {
      this.salesOrderService.cancel(so.id).subscribe({
        next: () => {
          this.toastService.info(`Order ${so.orderNumber} cancelled. Stock reservation released.`);
          this.loadOrders();
        },
        error: err => this.toastService.error(err?.error?.message ?? 'Failed to cancel order')
      });
    }
  }
}
