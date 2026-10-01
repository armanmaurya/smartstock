import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { ToastService } from '../../core/services/toast.service';
import { Location, LocationType } from '../../core/models/location.model';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Stores & Fulfillment Hubs
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {{ locations().length }} Facilities
            </span>
          </h1>
          <p class="text-sm text-slate-500 mt-1">Manage physical distribution centers, flagship stores, outlets, and aisle mapping</p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Location
        </button>
      </div>

      <!-- Facility Summary Strip (Flat, No Cards) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 pb-5 gap-6">
        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Distribution Centers</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ countByType('WAREHOUSE') + countByType('DISTRIBUTION_CENTER') }}</div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Retail Stores</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ countByType('RETAIL_STORE') }}</div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Outlet Stores</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ countByType('OUTLET') }}</div>
        </div>

        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Active Facilities</div>
          <div class="text-2xl font-bold text-emerald-700 mt-1">{{ countActive() }}</div>
        </div>
      </div>

      <!-- Locations Data Table (Flat, No Cards) -->
      @if (isLoading()) {
        <div class="text-center py-16 text-slate-500">
          <div class="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div class="mt-2 text-xs">Loading retail locations...</div>
        </div>
      } @else if (locations().length === 0) {
        <div class="text-center py-16 text-slate-500 border-t border-b border-slate-200">
          No locations registered yet.
        </div>
      } @else {
        <div class="border-t border-b border-slate-200">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                <tr>
                  <th class="py-3 px-3">Location / Code</th>
                  <th class="py-3 px-3">Type</th>
                  <th class="py-3 px-3">Address & City</th>
                  <th class="py-3 px-3">Contact</th>
                  <th class="py-3 px-3 text-center">Status</th>
                  <th class="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (loc of locations(); track loc.id) {
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-3.5 px-3">
                      <div class="font-medium text-slate-900">{{ loc.name }}</div>
                      <div class="text-xs font-mono text-indigo-600">{{ loc.code }}</div>
                    </td>

                    <td class="py-3.5 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {{ loc.type }}
                      </span>
                    </td>

                    <td class="py-3.5 px-3 text-xs text-slate-600">
                      <div>{{ loc.address ?? '—' }}</div>
                      <div class="text-slate-500">{{ loc.city }}{{ loc.state ? ', ' + loc.state : '' }} {{ loc.postalCode }}</div>
                    </td>

                    <td class="py-3.5 px-3 text-xs text-slate-600">
                      <div>{{ loc.phone ?? '—' }}</div>
                      <div class="text-slate-500">{{ loc.email ?? '—' }}</div>
                    </td>

                    <td class="py-3.5 px-3 text-center">
                      @if (loc.active) {
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Operational
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      }
                    </td>

                    <td class="py-3.5 px-3 text-right">
                      <div class="flex items-center justify-end gap-3 text-xs">
                        <a
                          routerLink="/inventory"
                          [queryParams]="{ locationId: loc.id }"
                          class="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Stock
                        </a>
                        <button
                          type="button"
                          (click)="openEditModal(loc)"
                          class="text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(loc)"
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

      <!-- Create / Edit Location Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-900">
                {{ editingId() ? 'Edit Location: ' + formModel.code : 'Add New Location' }}
              </h3>
              <button
                type="button"
                (click)="closeModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form (ngSubmit)="saveLocation()" class="space-y-4 pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Location Code <span class="text-rose-500">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.code"
                    name="code"
                    required
                    placeholder="LOC-STORE-03"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Facility Type <span class="text-rose-500">*</span></label>
                  <select
                    [(ngModel)]="formModel.type"
                    name="type"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="RETAIL_STORE">RETAIL_STORE</option>
                    <option value="WAREHOUSE">WAREHOUSE</option>
                    <option value="OUTLET">OUTLET</option>
                    <option value="DISTRIBUTION_CENTER">DISTRIBUTION_CENTER</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Facility Name <span class="text-rose-500">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="formModel.name"
                  name="name"
                  required
                  placeholder="e.g. West Suburban Mall Store"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  [(ngModel)]="formModel.address"
                  name="address"
                  placeholder="Street address..."
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.city"
                    name="city"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.state"
                    name="state"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    [(ngModel)]="formModel.postalCode"
                    name="postalCode"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
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
                    placeholder="+1-312-555-0199"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    [(ngModel)]="formModel.email"
                    name="email"
                    placeholder="store@stocksmart.com"
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
                  {{ isSaving() ? 'Saving...' : 'Save Location' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class LocationListComponent implements OnInit {
  private locationService = inject(LocationService);
  private toastService = inject(ToastService);

  readonly locations = signal<Location[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly showModal = signal<boolean>(false);
  readonly editingId = signal<number | null>(null);

  formModel: Partial<Location> = this.emptyForm();

  ngOnInit() {
    this.loadLocations();
  }

  emptyForm(): Partial<Location> {
    return {
      code: '',
      name: '',
      type: 'RETAIL_STORE',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
      email: '',
      active: true
    };
  }

  loadLocations() {
    this.isLoading.set(true);
    this.locationService.getAll().subscribe({
      next: data => {
        this.locations.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load locations from server.');
      }
    });
  }

  countByType(type: LocationType): number {
    return this.locations().filter(l => l.type === type).length;
  }

  countActive(): number {
    return this.locations().filter(l => l.active).length;
  }

  openCreateModal() {
    this.editingId.set(null);
    this.formModel = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(loc: Location) {
    this.editingId.set(loc.id ?? null);
    this.formModel = { ...loc };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveLocation() {
    if (!this.formModel.code || !this.formModel.name || !this.formModel.type) {
      this.toastService.warning('Code, Name, and Type are required.');
      return;
    }

    this.isSaving.set(true);
    const id = this.editingId();

    if (id) {
      this.locationService.update(id, this.formModel).subscribe({
        next: updated => {
          this.isSaving.set(false);
          this.closeModal();
          this.toastService.success(`Location ${updated.name} updated!`);
          this.loadLocations();
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message ?? 'Failed to update location');
        }
      });
    } else {
      this.locationService.create(this.formModel).subscribe({
        next: created => {
          this.isSaving.set(false);
          this.closeModal();
          this.toastService.success(`Location ${created.name} created!`);
          this.loadLocations();
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message ?? 'Failed to create location');
        }
      });
    }
  }

  confirmDelete(loc: Location) {
    if (confirm(`Deactivate facility "${loc.name}" (${loc.code})?`)) {
      if (!loc.id) return;
      this.locationService.delete(loc.id).subscribe({
        next: () => {
          this.toastService.success(`Location ${loc.code} deactivated.`);
          this.loadLocations();
        },
        error: err => {
          this.toastService.error(err?.error?.message ?? 'Failed to deactivate location');
        }
      });
    }
  }
}
