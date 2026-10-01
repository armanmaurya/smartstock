import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, ProductDTO } from '../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Product Catalog
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {{ filteredProducts().length }} Items
            </span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Manage SKUs, barcodes, RFID tags, retail pricing, and store allocations</p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Add New Product
        </button>
      </div>

      <!-- Search & Filters Toolbar (Flat, No Card) -->
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
            (ngModelChange)="onFilterChange()"
            placeholder="Search by SKU, product name, barcode, brand..."
            class="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
          />
        </div>

        <div class="w-full sm:w-48">
          <select
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onFilterChange()"
            class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
          >
            <option value="">All Categories</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>

        <div class="w-full sm:w-48">
          <select
            [(ngModel)]="selectedBrand"
            (ngModelChange)="onFilterChange()"
            class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
          >
            <option value="">All Brands</option>
            @for (brand of brands(); track brand) {
              <option [value]="brand">{{ brand }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Products Data Table (Flat, No Card) -->
      <div class="border-t border-b border-slate-200">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
              <tr>
                <th class="py-3 px-3">Product / SKU</th>
                <th class="py-3 px-3">Category & Brand</th>
                <th class="py-3 px-3">Barcode / RFID</th>
                <th class="py-3 px-3 text-right">Cost Price</th>
                <th class="py-3 px-3 text-right">Retail Price</th>
                <th class="py-3 px-3 text-right">Margin</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-500">
                    <div class="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <div class="mt-2 text-xs">Loading product catalog...</div>
                  </td>
                </tr>
              } @else if (filteredProducts().length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-500 text-sm">
                    No products found matching your search.
                  </td>
                </tr>
              } @else {
                @for (product of filteredProducts(); track product.id) {
                  <tr class="hover:bg-slate-50/60 transition">
                    <td class="py-3.5 px-4">
                      <div class="font-medium text-slate-900">{{ product.name }}</div>
                      <div class="text-xs text-indigo-600 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{{ product.sku }}</span>
                        <span class="text-slate-400">• {{ product.unitOfMeasure ?? 'EA' }}</span>
                      </div>
                    </td>

                    <td class="py-3.5 px-4">
                      <div class="text-slate-800">{{ product.category ?? 'Unassigned' }}</div>
                      <div class="text-xs text-slate-400">{{ product.brand ?? 'Generic' }}</div>
                    </td>

                    <td class="py-3.5 px-4 font-mono text-xs">
                      <div class="text-slate-700 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" />
                        </svg>
                        <span>{{ product.barcode }}</span>
                      </div>
                      @if (product.rfidTag) {
                        <div class="text-[11px] text-purple-600 truncate max-w-[130px]" [title]="product.rfidTag">
                          RFID: {{ product.rfidTag }}
                        </div>
                      }
                    </td>

                    <td class="py-3.5 px-4 text-right font-medium text-slate-600">
                      \${{ product.costPrice | number:'1.2-2' }}
                    </td>

                    <td class="py-3.5 px-4 text-right font-semibold text-emerald-600">
                      \${{ product.sellingPrice | number:'1.2-2' }}
                    </td>

                    <td class="py-3.5 px-4 text-right">
                      <span class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {{ getMargin(product) }}%
                      </span>
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      @if (product.active) {
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">Archived</span>
                      }
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <!-- Quick Scan Link -->
                        <a
                          routerLink="/scanner"
                          [queryParams]="{ barcode: product.barcode }"
                          title="Scan Barcode Lookup"
                          class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" />
                          </svg>
                        </a>

                        <!-- Multi-Location Stock Link -->
                        <a
                          routerLink="/inventory"
                          [queryParams]="{ productId: product.id }"
                          title="Store Stock Allocation"
                          class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </a>

                        <!-- Edit Button -->
                        <button
                          type="button"
                          (click)="openEditModal(product)"
                          title="Edit Details"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <!-- Delete Button -->
                        <button
                          type="button"
                          (click)="confirmDelete(product)"
                          title="Delete Product"
                          class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">
                {{ editingId() ? 'Edit Product: ' + formModel.sku : 'Create New Product' }}
              </h3>
              <button
                type="button"
                (click)="closeModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="saveProduct()" class="space-y-4 pt-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">SKU <span class="text-rose-500">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.sku"
                    name="sku"
                    required
                    placeholder="e.g. SKU-TECH-005"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Product Name <span class="text-rose-500">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.name"
                    name="name"
                    required
                    placeholder="e.g. Bluetooth Earbuds"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.category"
                    name="category"
                    placeholder="e.g. Electronics, Apparel"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.brand"
                    name="brand"
                    placeholder="e.g. SoundWave"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Cost Price ($) <span class="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="formModel.costPrice"
                    name="costPrice"
                    required
                    placeholder="0.00"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Selling Price ($) <span class="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="formModel.sellingPrice"
                    name="sellingPrice"
                    required
                    placeholder="0.00"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Barcode (UPC/EAN) <span class="text-rose-500">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.barcode"
                    name="barcode"
                    required
                    placeholder="e.g. 8901234560080"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">RFID EPC Tag</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.rfidTag"
                    name="rfidTag"
                    placeholder="e.g. E28011606000020478140008"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    [(ngModel)]="formModel.unitOfMeasure"
                    name="unitOfMeasure"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  >
                    <option value="EA">EA (Each)</option>
                    <option value="PAIR">PAIR</option>
                    <option value="BOX">BOX</option>
                    <option value="PACK">PACK</option>
                    <option value="KG">KG</option>
                  </select>
                </div>

                <div class="flex items-center pt-6">
                  <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="checkbox"
                      [(ngModel)]="formModel.active"
                      name="active"
                      class="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span>Active in retail catalog</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  [(ngModel)]="formModel.description"
                  name="description"
                  rows="2"
                  placeholder="Optional product description..."
                  class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                ></textarea>
              </div>

              <div class="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="isSaving()"
                  class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition disabled:opacity-50"
                >
                  {{ isSaving() ? 'Saving...' : 'Save Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  readonly products = signal<Product[]>([]);
  readonly filteredProducts = signal<Product[]>([]);
  readonly categories = signal<string[]>([]);
  readonly brands = signal<string[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly showModal = signal<boolean>(false);
  readonly editingId = signal<number | null>(null);

  searchQuery = '';
  selectedCategory = '';
  selectedBrand = '';

  formModel: ProductDTO = this.emptyForm();

  ngOnInit() {
    this.loadProducts();
  }

  emptyForm(): ProductDTO {
    return {
      sku: '',
      name: '',
      description: '',
      category: '',
      brand: '',
      costPrice: 0,
      sellingPrice: 0,
      barcode: '',
      rfidTag: '',
      unitOfMeasure: 'EA',
      active: true
    };
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAll().subscribe({
      next: data => {
        this.products.set(data);
        this.extractFilters(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load products. Backend might be offline.', 'Catalog Error');
      }
    });
  }

  extractFilters(items: Product[]) {
    const cats = Array.from(new Set(items.map(p => p.category).filter((c): c is string => !!c)));
    const brs = Array.from(new Set(items.map(p => p.brand).filter((b): b is string => !!b)));
    this.categories.set(cats.sort());
    this.brands.set(brs.sort());
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let list = this.products();

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.rfidTag && p.rfidTag.toLowerCase().includes(q))
      );
    }

    if (this.selectedCategory) {
      list = list.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedBrand) {
      list = list.filter(p => p.brand === this.selectedBrand);
    }

    this.filteredProducts.set(list);
  }

  getMargin(product: Product): number {
    if (!product.costPrice || product.costPrice <= 0) return 100;
    const margin = ((product.sellingPrice - product.costPrice) / product.costPrice) * 100;
    return Math.round(margin * 10) / 10;
  }

  openCreateModal() {
    this.editingId.set(null);
    this.formModel = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.editingId.set(product.id ?? null);
    this.formModel = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description ?? '',
      category: product.category ?? '',
      brand: product.brand ?? '',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      barcode: product.barcode,
      rfidTag: product.rfidTag ?? '',
      unitOfMeasure: product.unitOfMeasure ?? 'EA',
      active: product.active
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveProduct() {
    if (!this.formModel.sku || !this.formModel.name || !this.formModel.barcode) {
      this.toastService.warning('SKU, Name, and Barcode are required.', 'Missing Fields');
      return;
    }

    this.isSaving.set(true);
    const id = this.editingId();

    if (id) {
      this.productService.update(id, this.formModel).subscribe({
        next: updated => {
          this.isSaving.set(false);
          this.closeModal();
          this.toastService.success(`Product ${updated.sku} updated successfully!`);
          this.loadProducts();
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message ?? 'Failed to update product');
        }
      });
    } else {
      this.productService.create(this.formModel).subscribe({
        next: created => {
          this.isSaving.set(false);
          this.closeModal();
          this.toastService.success(`Product ${created.sku} created successfully!`);
          this.loadProducts();
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message ?? 'Failed to create product');
        }
      });
    }
  }

  confirmDelete(product: Product) {
    if (confirm(`Are you sure you want to deactivate product "${product.name}" (${product.sku})?`)) {
      if (!product.id) return;
      this.productService.delete(product.id).subscribe({
        next: () => {
          this.toastService.success(`Product ${product.sku} deactivated.`);
          this.loadProducts();
        },
        error: err => {
          this.toastService.error(err?.error?.message ?? 'Failed to delete product');
        }
      });
    }
  }
}
