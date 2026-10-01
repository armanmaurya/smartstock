import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { SupplierService } from '../../core/services/supplier.service';
import { LocationService } from '../../core/services/location.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import {
  PurchaseOrder,
  PurchaseOrderRequestDTO,
  PurchaseOrderItemDTO,
  PurchaseOrderReceiveDTO,
  ReceiveItem
} from '../../core/models/purchase-order.model';
import { Supplier } from '../../core/models/supplier.model';
import { Location } from '../../core/models/location.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Purchase Orders (Replenishment)
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {{ orders().length }} Orders
            </span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Issue replenishment orders to suppliers and receive inventory directly into store stock</p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Purchase Order
        </button>
      </div>

      <!-- POs Table (Flat, No Cards) -->
      <div class="border-t border-b border-slate-200">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th class="py-3.5 px-4">PO Number</th>
                <th class="py-3.5 px-4">Supplier</th>
                <th class="py-3.5 px-4">Destination Location</th>
                <th class="py-3.5 px-4 text-center">Items</th>
                <th class="py-3.5 px-4 text-right">Total Amount</th>
                <th class="py-3.5 px-4">Delivery Due</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-500">
                    <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <div class="mt-2 text-xs">Loading purchase orders...</div>
                  </td>
                </tr>
              } @else if (orders().length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-500">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              } @else {
                @for (po of orders(); track po.id) {
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4 font-mono font-medium text-slate-900">
                      <div>{{ po.poNumber }}</div>
                      <div class="text-[11px] text-slate-500 font-sans">{{ po.orderDate | date:'shortDate' }}</div>
                    </td>

                    <td class="py-3.5 px-4">
                      <div class="font-medium text-slate-900">{{ po.supplier.name }}</div>
                      <div class="text-xs text-indigo-600 font-mono">{{ po.supplier.code }}</div>
                    </td>

                    <td class="py-3.5 px-4">
                      <div class="text-slate-800">{{ po.destinationLocation.name }}</div>
                      <div class="text-xs text-slate-500">{{ po.destinationLocation.code }}</div>
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        (click)="viewDetails(po)"
                        class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 border border-slate-200 transition"
                      >
                        {{ po.items.length }} line items
                      </button>
                    </td>

                    <td class="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                      \${{ po.totalAmount | number:'1.2-2' }}
                    </td>

                    <td class="py-3.5 px-4 text-xs font-mono text-slate-600">
                      {{ po.expectedDeliveryDate ? (po.expectedDeliveryDate | date:'mediumDate') : 'Immediate' }}
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-slate-100 text-slate-700 border border-slate-200': po.status === 'DRAFT',
                          'bg-blue-50 text-blue-700 border border-blue-200': po.status === 'ISSUED',
                          'bg-amber-50 text-amber-700 border border-amber-200': po.status === 'PARTIALLY_RECEIVED',
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': po.status === 'COMPLETED',
                          'bg-rose-50 text-rose-700 border border-rose-200': po.status === 'CANCELLED'
                        }"
                      >
                        {{ po.status }}
                      </span>
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        @if (po.status === 'DRAFT') {
                          <button
                            type="button"
                            (click)="issueOrder(po)"
                            class="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition"
                          >
                            Issue PO
                          </button>
                          <button
                            type="button"
                            (click)="cancelOrder(po)"
                            class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-600 border border-slate-200 text-xs transition"
                          >
                            Cancel
                          </button>
                        } @else if (po.status === 'ISSUED' || po.status === 'PARTIALLY_RECEIVED') {
                          <button
                            type="button"
                            (click)="openReceiveModal(po)"
                            class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Receive Goods
                          </button>
                          <button
                            type="button"
                            (click)="cancelOrder(po)"
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

      <!-- PO Line Items Manifest Modal -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl relative">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ selectedOrder()?.poNumber }} Manifest</h3>
                <div class="text-xs text-slate-500">Supplier: {{ selectedOrder()?.supplier?.name }} ➔ {{ selectedOrder()?.destinationLocation?.name }}</div>
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
                      <div class="text-slate-700">
                        Ordered: <strong class="text-slate-900">{{ item.quantityOrdered }}</strong> |
                        Received: <strong class="text-emerald-600">{{ item.quantityReceived }}</strong>
                      </div>
                      <div class="text-[11px] text-slate-500">
                        Line Total: \${{ (item.quantityOrdered * item.unitPrice) | number:'1.2-2' }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-200">
              <div class="text-xs text-slate-500">
                Total PO Value: <strong class="text-slate-900 text-sm font-bold">\${{ selectedOrder()?.totalAmount | number:'1.2-2' }}</strong>
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

      <!-- Receive Goods Modal -->
      @if (orderToReceive()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Receive Goods: {{ orderToReceive()?.poNumber }}</h3>
                <div class="text-xs text-emerald-700 font-medium">Stock intake will be booked directly to {{ orderToReceive()?.destinationLocation?.name }}</div>
              </div>
              <button
                type="button"
                (click)="orderToReceive.set(null)"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="submitReceive()" class="space-y-4 pt-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Received By / Inspector</label>
                  <input
                    type="text"
                    [(ngModel)]="receiveModel.receivedBy"
                    name="receivedBy"
                    class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Receiving Notes</label>
                  <input
                    type="text"
                    [(ngModel)]="receiveModel.notes"
                    name="notes"
                    placeholder="e.g. Inbound shipment verified by dock team"
                    class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="space-y-2 pt-2">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-700">Line Items Check-In</label>

                <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  @for (item of orderToReceive()?.items; track item.id; let idx = $index) {
                    <div class="p-3 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                      <div class="min-w-0">
                        <div class="font-medium text-slate-900 truncate">{{ item.product.name }}</div>
                        <div class="text-[11px] text-slate-500 font-mono">
                          Ordered: {{ item.quantityOrdered }} | Prev Received: {{ item.quantityReceived }} | Outstanding: {{ item.quantityOrdered - item.quantityReceived }}
                        </div>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <span class="text-slate-500 text-xs font-medium">Intake Qty:</span>
                        <input
                          type="number"
                          min="0"
                          [max]="item.quantityOrdered - item.quantityReceived"
                          [(ngModel)]="receiveModel.items[idx].quantityReceived"
                          name="qty_{{ idx }}"
                          class="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-emerald-700 font-bold focus:outline-none focus:border-emerald-500 font-mono text-center"
                        />
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="orderToReceive.set(null)"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="isReceiving()"
                  class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs transition disabled:opacity-50"
                >
                  {{ isReceiving() ? 'Receiving...' : 'Complete Stock Receipt' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Create PO Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-900">Create Purchase Order (PO)</h3>
              <button
                type="button"
                (click)="closeCreateModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="submitPO()" class="space-y-4 pt-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Supplier <span class="text-rose-500">*</span></label>
                  <select
                    [(ngModel)]="createModel.supplierId"
                    name="supplierId"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option [value]="0" disabled>Select supplier partner...</option>
                    @for (sup of suppliers(); track sup.id) {
                      <option [value]="sup.id">{{ sup.name }} ({{ sup.code }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Destination Location <span class="text-rose-500">*</span></label>
                  <select
                    [(ngModel)]="createModel.destinationLocationId"
                    name="destinationLocationId"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option [value]="0" disabled>Select receiving facility...</option>
                    @for (loc of locations(); track loc.id) {
                      <option [value]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    [(ngModel)]="createModel.expectedDeliveryDate"
                    name="expectedDeliveryDate"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">PO Notes</label>
                  <input
                    type="text"
                    [(ngModel)]="createModel.notes"
                    name="notes"
                    placeholder="e.g. Urgent restock for fall sales promotion"
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
                    (click)="addOrderItemLine()"
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
                          [(ngModel)]="item.quantityOrdered"
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
                          placeholder="Unit $"
                          class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 text-right font-mono"
                        />
                      </div>

                      <div class="col-span-1 text-center">
                        @if (createModel.items.length > 1) {
                          <button
                            type="button"
                            (click)="removeOrderItemLine(idx)"
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
                  <span class="text-slate-500 font-medium">Estimated PO Total:</span>
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
                  {{ isSubmitting() ? 'Creating PO...' : 'Create Purchase Order' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class PoListComponent implements OnInit {
  private poService = inject(PurchaseOrderService);
  private supplierService = inject(SupplierService);
  private locationService = inject(LocationService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  readonly orders = signal<PurchaseOrder[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly products = signal<Product[]>([]);

  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly isReceiving = signal<boolean>(false);

  readonly showCreateModal = signal<boolean>(false);
  readonly selectedOrder = signal<PurchaseOrder | null>(null);
  readonly orderToReceive = signal<PurchaseOrder | null>(null);

  createModel: PurchaseOrderRequestDTO = this.emptyPO();
  receiveModel: PurchaseOrderReceiveDTO = {
    receivedBy: 'WAREHOUSE_OPERATOR',
    notes: '',
    items: []
  };

  ngOnInit() {
    this.loadSuppliers();
    this.loadLocations();
    this.loadProducts();
    this.loadOrders();

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new') {
        this.openCreateModal();
        if (params['supplierId']) {
          this.createModel.supplierId = Number(params['supplierId']);
        }
      }
    });
  }

  emptyPO(): PurchaseOrderRequestDTO {
    return {
      supplierId: 0,
      destinationLocationId: 0,
      expectedDeliveryDate: '',
      notes: '',
      items: [{ productId: 0, quantityOrdered: 50, unitPrice: 0 }]
    };
  }

  loadSuppliers() {
    this.supplierService.getAll().subscribe({
      next: list => this.suppliers.set(list)
    });
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
    this.poService.getAll().subscribe({
      next: list => {
        this.orders.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load purchase orders.');
      }
    });
  }

  viewDetails(po: PurchaseOrder) {
    this.selectedOrder.set(po);
  }

  openCreateModal() {
    this.createModel = {
      supplierId: this.suppliers()[0]?.id ?? 0,
      destinationLocationId: this.locations()[0]?.id ?? 0,
      expectedDeliveryDate: '',
      notes: '',
      items: [{
        productId: this.products()[0]?.id ?? 0,
        quantityOrdered: 50,
        unitPrice: this.products()[0]?.costPrice ?? 0
      }]
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  addOrderItemLine() {
    const defaultProduct = this.products()[0];
    this.createModel.items.push({
      productId: defaultProduct?.id ?? 0,
      quantityOrdered: 25,
      unitPrice: defaultProduct?.costPrice ?? 0
    });
  }

  removeOrderItemLine(idx: number) {
    this.createModel.items.splice(idx, 1);
  }

  onProductSelected(item: PurchaseOrderItemDTO) {
    const prod = this.products().find(p => p.id === Number(item.productId));
    if (prod) {
      item.unitPrice = prod.costPrice;
    }
  }

  calculateTotal(): number {
    return this.createModel.items.reduce((acc, it) => acc + ((it.quantityOrdered || 0) * (it.unitPrice || 0)), 0);
  }

  submitPO() {
    if (!this.createModel.supplierId || !this.createModel.destinationLocationId) {
      this.toastService.warning('Please select supplier and destination location.');
      return;
    }

    if (this.createModel.items.some(i => !i.productId || i.quantityOrdered <= 0)) {
      this.toastService.warning('All items must have a selected product and quantity > 0.');
      return;
    }

    this.isSubmitting.set(true);
    this.poService.create(this.createModel).subscribe({
      next: created => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.toastService.success(`Purchase Order ${created.poNumber} created!`);
        this.loadOrders();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toastService.error(err?.error?.message ?? 'Failed to create PO');
      }
    });
  }

  issueOrder(po: PurchaseOrder) {
    if (!po.id) return;
    this.poService.issue(po.id).subscribe({
      next: () => {
        this.toastService.success(`PO ${po.poNumber} issued to supplier!`);
        this.loadOrders();
      },
      error: err => this.toastService.error(err?.error?.message ?? 'Failed to issue PO')
    });
  }

  openReceiveModal(po: PurchaseOrder) {
    const receiveItems: ReceiveItem[] = po.items.map(item => ({
      productId: item.product.id ?? 0,
      quantityReceived: Math.max(0, item.quantityOrdered - item.quantityReceived)
    }));

    this.receiveModel = {
      receivedBy: 'WAREHOUSE_OPERATOR',
      notes: `Receipt check-in for PO ${po.poNumber}`,
      items: receiveItems
    };
    this.orderToReceive.set(po);
  }

  submitReceive() {
    const po = this.orderToReceive();
    if (!po || !po.id) return;

    this.isReceiving.set(true);
    this.poService.receive(po.id, this.receiveModel).subscribe({
      next: updated => {
        this.isReceiving.set(false);
        this.orderToReceive.set(null);
        this.toastService.success(`Goods received for PO ${updated.poNumber}! On-hand stock updated in store.`);
        this.loadOrders();
      },
      error: err => {
        this.isReceiving.set(false);
        this.toastService.error(err?.error?.message ?? 'Receiving failed');
      }
    });
  }

  cancelOrder(po: PurchaseOrder) {
    if (!po.id) return;
    if (confirm(`Cancel Purchase Order ${po.poNumber}?`)) {
      this.poService.cancel(po.id).subscribe({
        next: () => {
          this.toastService.info(`PO ${po.poNumber} cancelled.`);
          this.loadOrders();
        },
        error: err => this.toastService.error(err?.error?.message ?? 'Failed to cancel PO')
      });
    }
  }
}
