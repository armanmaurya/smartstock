import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupplierService } from '../../core/services/supplier.service';
import { ToastService } from '../../core/services/toast.service';
import { Supplier } from '../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Suppliers Directory
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {{ suppliers().length }} Partners
            </span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Manage vendor contacts, replenishment lead times, ratings, and payment terms</p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Supplier
        </button>
      </div>

      <!-- Quick Metrics Strip (Flat, No Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200 pb-5 gap-6">
        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Suppliers</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ suppliers().length }} Partners</div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Average Lead Time</div>
          <div class="text-2xl font-bold text-emerald-700 mt-1">{{ getAverageLeadTime() }} Days</div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Partner Rating</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">★ {{ getAverageRating() }} / 5.0</div>
        </div>
      </div>

      <!-- Suppliers Data Table (Flat, No Cards) -->
      @if (isLoading()) {
        <div class="text-center py-16 text-slate-500">
          <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div class="mt-2 text-xs">Loading supplier records...</div>
        </div>
      } @else if (suppliers().length === 0) {
        <div class="text-center py-16 text-slate-500 border-t border-b border-slate-200">
          No suppliers found.
        </div>
      } @else {
        <div class="border-t border-b border-slate-200">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th class="py-3 px-3">Supplier / Code</th>
                  <th class="py-3 px-3">Contact Person</th>
                  <th class="py-3 px-3">Contact Info</th>
                  <th class="py-3 px-3">Location</th>
                  <th class="py-3 px-3">Lead Time & Terms</th>
                  <th class="py-3 px-3 text-center">Rating</th>
                  <th class="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (sup of suppliers(); track sup.id) {
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-3.5 px-3">
                      <div class="font-medium text-slate-900">{{ sup.name }}</div>
                      <div class="text-xs font-mono text-indigo-600">{{ sup.code }}</div>
                    </td>

                    <td class="py-3.5 px-3 text-slate-800 text-xs">
                      {{ sup.contactPerson ?? '—' }}
                    </td>

                    <td class="py-3.5 px-3 text-xs text-slate-600">
                      @if (sup.email) {
                        <div><a href="mailto:{{ sup.email }}" class="text-indigo-600 hover:underline">{{ sup.email }}</a></div>
                      }
                      <div>{{ sup.phone ?? '—' }}</div>
                    </td>

                    <td class="py-3.5 px-3 text-xs text-slate-600">
                      {{ sup.city ?? 'Global' }}, {{ sup.country ?? 'USA' }}
                    </td>

                    <td class="py-3.5 px-3 text-xs">
                      <div class="text-emerald-700 font-medium">{{ sup.leadTimeDays }} Days Lead</div>
                      <div class="text-slate-500">{{ sup.paymentTerms ?? 'Net 30' }}</div>
                    </td>

                    <td class="py-3.5 px-3 text-center text-xs font-semibold text-amber-700">
                      ★ {{ sup.rating ?? 4.5 }}
                    </td>

                    <td class="py-3.5 px-3 text-right">
                      <div class="flex items-center justify-end gap-3 text-xs">
                        <a
                          routerLink="/purchase-orders"
                          [queryParams]="{ action: 'new', supplierId: sup.id }"
                          class="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Create PO
                        </a>
                        <button
                          type="button"
                          (click)="openEditModal(sup)"
                          class="text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(sup)"
                          class="text-rose-600 hover:text-rose-800 font-medium"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Create / Edit Supplier Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-900">
                {{ editingId() ? 'Edit Supplier: ' + formModel.code : 'Add New Supplier' }}
              </h3>
              <button
                type="button"
                (click)="closeModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="saveSupplier()" class="space-y-4 pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Supplier Code <span class="text-rose-500">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.code"
                    name="code"
                    required
                    placeholder="SUP-104"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days) <span class="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="formModel.leadTimeDays"
                    name="leadTimeDays"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name <span class="text-rose-500">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="formModel.name"
                  name="name"
                  required
                  placeholder="Apex Retail Distributors"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.contactPerson"
                    name="contactPerson"
                    placeholder="Sarah Jenkins"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    [(ngModel)]="formModel.email"
                    name="email"
                    placeholder="orders@apexretail.com"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.phone"
                    name="phone"
                    placeholder="+1-800-555-0100"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.paymentTerms"
                    name="paymentTerms"
                    placeholder="Net 30, Net 60, Advance"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-1">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.city"
                    name="city"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div class="col-span-1">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.country"
                    name="country"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div class="col-span-1">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    [(ngModel)]="formModel.rating"
                    name="rating"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="isSaving()"
                  class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition disabled:opacity-50"
                >
                  {{ isSaving() ? 'Saving...' : 'Save Supplier' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);

  readonly suppliers = signal<Supplier[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly showModal = signal<boolean>(false);
  readonly editingId = signal<number | null>(null);

  formModel: Partial<Supplier> = this.emptyForm();

  ngOnInit() {
    this.loadSuppliers();
  }

  emptyForm(): Partial<Supplier> {
    return {
      code: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'USA',
      leadTimeDays: 7,
      paymentTerms: 'Net 30',
      rating: 4.5,
      active: true
    };
  }

  loadSuppliers() {
    this.isLoading.set(true);
    this.supplierService.getAll().subscribe({
      next: data => {
        this.suppliers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load suppliers.');
      }
    });
  }

  getAverageLeadTime(): number {
    const list = this.suppliers();
    if (!list.length) return 0;
    const total = list.reduce((acc, s) => acc + (s.leadTimeDays ?? 0), 0);
    return Math.round(total / list.length);
  }

  getAverageRating(): number {
    const list = this.suppliers();
    if (!list.length) return 5;
    const total = list.reduce((acc, s) => acc + (s.rating ?? 5), 0);
    return Math.round((total / list.length) * 10) / 10;
  }

  openCreateModal() {
    this.editingId.set(null);
    this.formModel = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(sup: Supplier) {
    this.editingId.set(sup.id ?? null);
    this.formModel = { ...sup };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveSupplier() {
    if (!this.formModel.code || !this.formModel.name) {
      this.toastService.warning('Supplier code and company name are required.');
      return;
    }

    this.isSaving.set(true);
    const id = this.editingId();

    if (id) {
      this.supplierService.update(id, this.formModel).subscribe({
        next: updated => {
          this.isSaving.set(false);
          this.closeModal();
          this.toastService.success(`Supplier ${updated.name} updated!`);
          this.loadSuppliers();
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message ?? 'Failed to update supplier');
        }
      });
    } else {
      this.supplierService.create(this.formModel).subscribe({
        next: created => {
          this.isSaving.set(false);
          this.closeModal();
          this.toastService.success(`Supplier ${created.name} added!`);
          this.loadSuppliers();
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message ?? 'Failed to create supplier');
        }
      });
    }
  }

  confirmDelete(sup: Supplier) {
    if (confirm(`Deactivate supplier "${sup.name}" (${sup.code})?`)) {
      if (!sup.id) return;
      this.supplierService.delete(sup.id).subscribe({
        next: () => {
          this.toastService.success(`Supplier ${sup.name} deactivated.`);
          this.loadSuppliers();
        },
        error: err => this.toastService.error(err?.error?.message ?? 'Deactivation failed')
      });
    }
  }
}
