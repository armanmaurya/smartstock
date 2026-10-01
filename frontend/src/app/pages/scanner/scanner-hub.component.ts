import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ScannerService } from '../../core/services/scanner.service';
import { LocationService } from '../../core/services/location.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import {
  BarcodeScanResultDTO,
  RfidScanRequestDTO,
  RfidScanResultDTO,
  CycleCountRequestDTO,
  CycleCountAudit
} from '../../core/models/scanner.model';
import { Location } from '../../core/models/location.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-scanner-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Scanner & Auto-ID
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">Barcode scanning, bulk RFID tag ingestion, and cycle count variance reconciliation</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          (click)="activeTab.set('barcode')"
          class="pb-2.5 text-xs font-semibold border-b-2 transition"
          [ngClass]="activeTab() === 'barcode' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          Barcode Lookup
        </button>

        <button
          type="button"
          (click)="activeTab.set('rfid')"
          class="pb-2.5 text-xs font-semibold border-b-2 transition"
          [ngClass]="activeTab() === 'rfid' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          RFID Batch Ingestion
        </button>

        <button
          type="button"
          (click)="activeTab.set('cycle-count')"
          class="pb-2.5 text-xs font-semibold border-b-2 transition"
          [ngClass]="activeTab() === 'cycle-count' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          Physical Cycle Count
        </button>
      </div>

      <!-- ============================================== -->
      <!-- TAB 1: BARCODE SCANNER & AVAILABILITY MATRIX   -->
      <!-- ============================================== -->
      @if (activeTab() === 'barcode') {
        <div class="space-y-6">
          <!-- Scanner Input Bar (Flat, No Card) -->
          <div class="border-b border-slate-200 pb-5">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div class="md:col-span-6">
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Scan / Enter Barcode (UPC / EAN)
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    [(ngModel)]="barcodeInput"
                    (keyup.enter)="executeBarcodeScan()"
                    placeholder="e.g. 8901234560011"
                    class="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div class="md:col-span-4">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Store Location</label>
                <select
                  [(ngModel)]="barcodeLocationId"
                  class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option [value]="0">All / Unspecified Store</option>
                  @for (loc of locations(); track loc.id) {
                    <option [value]="loc.id">{{ loc.name }}</option>
                  }
                </select>
              </div>

              <div class="md:col-span-2">
                <button
                  type="button"
                  (click)="executeBarcodeScan()"
                  [disabled]="isScanningBarcode()"
                  class="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  @if (isScanningBarcode()) {
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  } @else {
                    Scan Barcode
                  }
                </button>
              </div>
            </div>

            <!-- Quick Barcode Simulation Buttons -->
            <div class="mt-3 flex flex-wrap items-center gap-1.5">
              <span class="text-xs text-slate-500 font-medium">Test Barcodes:</span>
              <button
                type="button"
                (click)="setTestBarcode('8901234560011')"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-mono transition"
              >
                Headphones
              </button>
              <button
                type="button"
                (click)="setTestBarcode('8901234560028')"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-mono transition"
              >
                Watch
              </button>
              <button
                type="button"
                (click)="setTestBarcode('8901234560035')"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-mono transition"
              >
                Jacket
              </button>
              <button
                type="button"
                (click)="setTestBarcode('8901234560073')"
                class="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-xs text-amber-800 font-mono border border-amber-200 transition"
              >
                Charger
              </button>
            </div>
          </div>

          <!-- Barcode Scan Result View (Flat, No Cards) -->
          @if (barcodeResult()) {
            <div class="space-y-6">
              <!-- Result Overview Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-slate-200 pb-6 text-sm">
                <!-- Product Details -->
                <div>
                  <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Product Scanned</div>
                  <h2 class="text-lg font-bold text-slate-900 mt-1">{{ barcodeResult()?.product?.name }}</h2>
                  <div class="text-xs text-indigo-600 font-mono mt-0.5">{{ barcodeResult()?.product?.sku }}</div>

                  <div class="mt-3 space-y-1 text-xs text-slate-600">
                    <div>Brand: <strong class="text-slate-800">{{ barcodeResult()?.product?.brand ?? 'Generic' }}</strong></div>
                    <div>Retail Price: <strong class="text-emerald-700">\${{ barcodeResult()?.product?.sellingPrice | number:'1.2-2' }}</strong></div>
                    <div>Cost Price: \${{ barcodeResult()?.product?.costPrice | number:'1.2-2' }}</div>
                    @if (barcodeResult()?.product?.rfidTag) {
                      <div class="font-mono text-[11px]">RFID: {{ barcodeResult()?.product?.rfidTag }}</div>
                    }
                  </div>

                  <div class="mt-3 text-xs text-slate-500">
                    Total Across All Stores: <strong class="text-slate-900 text-sm font-mono">{{ barcodeResult()?.totalStockAcrossLocations }} units</strong>
                  </div>
                </div>

                <!-- Selected Store Stock -->
                <div>
                  <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Current Facility Stock</div>
                  <div class="text-base font-semibold text-slate-900 mt-1">
                    {{ barcodeResult()?.currentStoreStock?.locationName ?? 'No facility selected' }}
                  </div>

                  @if (barcodeResult()?.currentStoreStock) {
                    <div class="grid grid-cols-3 gap-3 mt-3 text-xs">
                      <div>
                        <div class="text-slate-500">On Hand</div>
                        <div class="text-xl font-bold text-slate-900 mt-0.5">{{ barcodeResult()?.currentStoreStock?.quantityOnHand }}</div>
                      </div>
                      <div>
                        <div class="text-slate-500">Reserved</div>
                        <div class="text-xl font-bold text-slate-600 mt-0.5">{{ barcodeResult()?.currentStoreStock?.quantityReserved }}</div>
                      </div>
                      <div>
                        <div class="text-slate-500">Available</div>
                        <div class="text-xl font-bold text-emerald-700 mt-0.5">{{ barcodeResult()?.currentStoreStock?.availableQuantity }}</div>
                      </div>
                    </div>

                    <div class="mt-3 text-xs text-slate-500">
                      Shelf Location: <span class="font-mono font-medium text-slate-800">{{ barcodeResult()?.currentStoreStock?.aisleBinLocation ?? 'Unassigned' }}</span>
                    </div>

                    @if (barcodeResult()?.lowStockAlert) {
                      <div class="mt-2 text-xs font-semibold text-amber-800">
                        ⚠️ Low stock threshold reached at this facility
                      </div>
                    }
                  } @else {
                    <p class="text-xs text-slate-500 mt-2">Select a store in the dropdown to view local bin allocation.</p>
                  }
                </div>

                <!-- Actions -->
                <div>
                  <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Quick Actions</div>
                  <p class="text-xs text-slate-500 mt-1">Create replenishment transfer or purchase order for this item.</p>
                  <div class="mt-3 space-y-2">
                    <a
                      routerLink="/transfers"
                      class="block text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      → Request Inter-Store Transfer
                    </a>
                    <a
                      routerLink="/purchase-orders"
                      class="block text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      → Create Vendor Purchase Order
                    </a>
                  </div>
                </div>
              </div>

              <!-- Multi-Store Company Stock Matrix (Flat, No Card) -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm">Multi-Location Stock Matrix</h3>
                    <p class="text-xs text-slate-500">Inventory levels across all facilities</p>
                  </div>
                </div>

                <div class="border-t border-b border-slate-200">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-700">
                      <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                        <tr>
                          <th class="py-3 px-3">Location Facility</th>
                          <th class="py-3 px-3">Type</th>
                          <th class="py-3 px-3">Aisle / Shelf</th>
                          <th class="py-3 px-3 text-right">On Hand</th>
                          <th class="py-3 px-3 text-right">Reserved</th>
                          <th class="py-3 px-3 text-right">Available</th>
                          <th class="py-3 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (locStock of barcodeResult()?.allLocationsStock; track locStock.locationId) {
                          <tr class="hover:bg-slate-50 transition">
                            <td class="py-3 px-3 font-medium text-slate-900">
                              {{ locStock.locationName }}
                              <div class="text-[11px] font-mono text-indigo-600">{{ locStock.locationCode }}</div>
                            </td>

                            <td class="py-3 px-3 text-xs text-slate-600">
                              {{ locStock.locationType }}
                            </td>

                            <td class="py-3 px-3 font-mono text-xs text-slate-500">
                              {{ locStock.aisleBinLocation ?? '—' }}
                            </td>

                            <td class="py-3 px-3 text-right font-bold text-slate-900">
                              {{ locStock.quantityOnHand }}
                            </td>

                            <td class="py-3 px-3 text-right text-xs text-slate-500">
                              {{ locStock.quantityReserved }}
                            </td>

                            <td class="py-3 px-3 text-right font-semibold text-emerald-700">
                              {{ locStock.availableQuantity }}
                            </td>

                            <td class="py-3 px-3 text-center">
                              @if (locStock.quantityOnHand <= 0) {
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Out</span>
                              } @else if (locStock.isLowStock) {
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Low</span>
                              } @else {
                                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">OK</span>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ============================================== -->
      <!-- TAB 2: RFID BATCH INGESTION (HANDHELD READER)  -->
      <!-- ============================================== -->
      @if (activeTab() === 'rfid') {
        <div class="space-y-6">
          <div class="border-b border-slate-200 pb-5">
            <h3 class="text-sm font-bold text-slate-900 mb-1">Simulate Handheld RFID Bulk Tag Ingestion</h3>
            <p class="text-xs text-slate-500 mb-4">
              Ingests bulk RFID EPC tags from readers (Zebra, Impinj). Tallies scanned tags against catalog products and flags unknown tags.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div class="md:col-span-6">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Scanning Facility <span class="text-rose-600">*</span></label>
                <select
                  [(ngModel)]="rfidLocationId"
                  class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  @for (loc of locations(); track loc.id) {
                    <option [value]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
                  }
                </select>
              </div>

              <div class="md:col-span-6">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Operator ID</label>
                <input
                  type="text"
                  [(ngModel)]="rfidOperator"
                  class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div class="md:col-span-12">
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  RFID Tags List (comma or newline separated EPC hex values)
                </label>
                <textarea
                  [(ngModel)]="rfidTagsInput"
                  rows="3"
                  placeholder="E28011606000020478140001, E28011606000020478140002..."
                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                ></textarea>
              </div>
            </div>

            <!-- Simulation Presets -->
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="text-xs text-slate-500 font-medium">Sample Batches:</span>
              <button
                type="button"
                (click)="loadRfidPreset(1)"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition"
              >
                7 Items Normal
              </button>
              <button
                type="button"
                (click)="loadRfidPreset(2)"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition"
              >
                12 Tags with Multi-Reads
              </button>
              <button
                type="button"
                (click)="loadRfidPreset(3)"
                class="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-xs font-medium text-rose-700 border border-rose-200 transition"
              >
                Unregistered Tag Discrepancy
              </button>
            </div>

            <div class="mt-4 flex justify-end">
              <button
                type="button"
                (click)="executeRfidScan()"
                [disabled]="isScanningRfid()"
                class="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
              >
                @if (isScanningRfid()) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                }
                Process RFID Batch
              </button>
            </div>
          </div>

          <!-- RFID Results View (Flat, No Cards) -->
          @if (rfidResult()) {
            <div class="space-y-6">
              <!-- KPI Summary Strip -->
              <div class="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 pb-5 gap-6">
                <div>
                  <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Scanned</div>
                  <div class="text-2xl font-bold text-slate-900 mt-1">{{ rfidResult()?.totalTagsScanned }} Tags</div>
                </div>

                <div>
                  <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Recognized</div>
                  <div class="text-2xl font-bold text-emerald-700 mt-1">{{ rfidResult()?.recognizedTagsCount }} Tags</div>
                </div>

                <div>
                  <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Unregistered</div>
                  <div class="text-2xl font-bold text-rose-700 mt-1">{{ rfidResult()?.unknownTagsCount }} Tags</div>
                </div>

                <div>
                  <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Facility</div>
                  <div class="text-sm font-semibold text-slate-900 mt-1.5 truncate">{{ rfidResult()?.locationName }}</div>
                </div>
              </div>

              <!-- Unregistered Tags Warning Banner -->
              @if ((rfidResult()?.unknownTagsCount ?? 0) > 0) {
                <div class="border-l-4 border-rose-500 bg-rose-50 p-4 text-xs text-rose-900">
                  <div class="font-semibold text-rose-900">Flagged Unknown RFID Tags Detected:</div>
                  <div class="flex flex-wrap gap-1.5 pt-1.5 font-mono text-[11px]">
                    @for (tag of rfidResult()?.unknownTags; track tag) {
                      <span class="px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800">
                        {{ tag }}
                      </span>
                    }
                  </div>
                </div>
              }

              <!-- Identified Products Breakdown Table (Flat, No Card) -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold text-slate-900 text-sm">Identified Products Breakdown</h3>
                </div>

                <div class="border-t border-b border-slate-200">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-700">
                      <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                        <tr>
                          <th class="py-3 px-3">Product Name</th>
                          <th class="py-3 px-3">SKU / Category</th>
                          <th class="py-3 px-3">Aisle Location</th>
                          <th class="py-3 px-3 text-right">Scanned Count</th>
                          <th class="py-3 px-3 text-right">System Stock</th>
                          <th class="py-3 px-3 text-right">Variance</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (grp of rfidResult()?.identifiedProducts; track grp.product.id) {
                          <tr class="hover:bg-slate-50 transition">
                            <td class="py-3 px-3 font-medium text-slate-900">{{ grp.product.name }}</td>
                            <td class="py-3 px-3 text-xs">
                              <span class="font-mono text-indigo-600">{{ grp.product.sku }}</span>
                              <span class="text-slate-500"> • {{ grp.product.category }}</span>
                            </td>
                            <td class="py-3 px-3 font-mono text-xs text-slate-500">{{ grp.aisleBinLocation ?? '—' }}</td>
                            <td class="py-3 px-3 text-right font-bold text-slate-900">{{ grp.scannedCount }}</td>
                            <td class="py-3 px-3 text-right font-medium text-slate-700">{{ grp.systemOnHand }}</td>
                            <td class="py-3 px-3 text-right font-bold text-xs" [ngClass]="grp.variance === 0 ? 'text-emerald-700' : (grp.variance < 0 ? 'text-rose-700' : 'text-amber-800')">
                              {{ grp.variance > 0 ? '+' : '' }}{{ grp.variance }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ============================================== -->
      <!-- TAB 3: PHYSICAL CYCLE COUNT AUDIT              -->
      <!-- ============================================== -->
      @if (activeTab() === 'cycle-count') {
        <div class="space-y-6">
          <div class="border-b border-slate-200 pb-5">
            <h3 class="text-sm font-bold text-slate-900 mb-1">Physical Stocktake & Reconciliation</h3>
            <p class="text-xs text-slate-500 mb-4">Conduct physical counts and automatically reconcile system variances into inventory stock</p>

            <form (ngSubmit)="submitCycleCount()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Audit Facility <span class="text-rose-600">*</span></label>
                  <select
                    [(ngModel)]="cycleCountModel.locationId"
                    name="locationId"
                    required
                    class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    @for (loc of locations(); track loc.id) {
                      <option [value]="loc.id">{{ loc.name }} ({{ loc.code }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Audit Notes / Scope</label>
                  <input
                    type="text"
                    [(ngModel)]="cycleCountModel.notes"
                    name="notes"
                    placeholder="e.g. Q3 Electronics Section physical stocktake"
                    class="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <!-- Count Items Table -->
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold uppercase tracking-wider text-slate-700">Counted Products</label>
                  <button
                    type="button"
                    (click)="addCountItemLine()"
                    class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div class="space-y-1.5">
                  @for (item of cycleCountModel.items; track $index; let idx = $index) {
                    <div class="flex items-center gap-2">
                      <div class="flex-1">
                        <select
                          [(ngModel)]="item.productId"
                          name="prod_{{ idx }}"
                          required
                          class="w-full px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
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
                          min="0"
                          [(ngModel)]="item.countedQuantity"
                          name="qty_{{ idx }}"
                          placeholder="Counted Qty"
                          class="w-full px-3 py-1 bg-white border border-slate-300 rounded text-xs text-emerald-700 font-bold font-mono focus:outline-none focus:border-emerald-600 text-center"
                        />
                      </div>

                      @if (cycleCountModel.items.length > 1) {
                        <button
                          type="button"
                          (click)="removeCountItemLine(idx)"
                          class="text-slate-400 hover:text-rose-600 p-1"
                        >
                          &times;
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Auto-Reconciliation Option -->
              <div class="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
                <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    [(ngModel)]="autoReconcile"
                    name="autoReconcile"
                    class="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Auto-Reconcile System Inventory (reconcile=true)</span>
                </label>

                <button
                  type="submit"
                  [disabled]="isSubmittingAudit()"
                  class="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  @if (isSubmittingAudit()) {
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  }
                  Submit Audit
                </button>
              </div>
            </form>
          </div>

          <!-- Past Audits History (Flat, No Card) -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm">Past Physical Audit History</h3>
                <p class="text-xs text-slate-500">Stocktake records, item discrepancies, and reconciliation state</p>
              </div>
              <button
                type="button"
                (click)="loadAudits()"
                class="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
              >
                Refresh
              </button>
            </div>

            <div class="border-t border-b border-slate-200">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-700">
                  <thead class="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 tracking-wider">
                    <tr>
                      <th class="py-3 px-3">Audit Number</th>
                      <th class="py-3 px-3">Location</th>
                      <th class="py-3 px-3 text-center">Items Counted</th>
                      <th class="py-3 px-3">Audit Date</th>
                      <th class="py-3 px-3 text-center">Status</th>
                      <th class="py-3 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @if (audits().length === 0) {
                      <tr>
                        <td colspan="6" class="text-center py-12 text-slate-500 text-xs">
                          No cycle count audits recorded yet.
                        </td>
                      </tr>
                    } @else {
                      @for (aud of audits(); track aud.id) {
                        <tr class="hover:bg-slate-50 transition">
                          <td class="py-3 px-3 font-mono font-medium text-slate-900">{{ aud.auditNumber }}</td>
                          <td class="py-3 px-3 font-medium text-slate-800">{{ aud.location.name }}</td>
                          <td class="py-3 px-3 text-center font-bold text-emerald-700">{{ aud.items.length }} items</td>
                          <td class="py-3 px-3 text-xs font-mono text-slate-500">{{ aud.auditDate | date:'medium' }}</td>
                          <td class="py-3 px-3 text-center">
                            <span
                              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                              [ngClass]="{
                                'bg-emerald-50 text-emerald-700 border border-emerald-200': aud.status === 'COMPLETED' || aud.status === 'RECONCILED',
                                'bg-amber-50 text-amber-800 border border-amber-200': aud.status === 'IN_PROGRESS'
                              }"
                            >
                              {{ aud.status }}
                            </span>
                          </td>
                          <td class="py-3 px-3 text-xs text-slate-500">{{ aud.notes ?? '—' }}</td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ScannerHubComponent implements OnInit {
  private scannerService = inject(ScannerService);
  private locationService = inject(LocationService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  readonly activeTab = signal<'barcode' | 'rfid' | 'cycle-count'>('barcode');
  readonly locations = signal<Location[]>([]);
  readonly products = signal<Product[]>([]);
  readonly audits = signal<CycleCountAudit[]>([]);

  // Barcode tab state
  barcodeInput = '8901234560011';
  barcodeLocationId = 0;
  readonly isScanningBarcode = signal<boolean>(false);
  readonly barcodeResult = signal<BarcodeScanResultDTO | null>(null);

  // RFID tab state
  rfidLocationId = 0;
  rfidOperator = 'RFID_HANDHELD_READER';
  rfidTagsInput = '';
  readonly isScanningRfid = signal<boolean>(false);
  readonly rfidResult = signal<RfidScanResultDTO | null>(null);

  // Cycle count tab state
  autoReconcile = true;
  readonly isSubmittingAudit = signal<boolean>(false);
  cycleCountModel: CycleCountRequestDTO = {
    locationId: 0,
    notes: '',
    items: [{ productId: 0, countedQuantity: 10 }]
  };

  ngOnInit() {
    this.loadLocations();
    this.loadProducts();
    this.loadAudits();

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'rfid') {
        this.activeTab.set('rfid');
      } else if (params['tab'] === 'cycle-count') {
        this.activeTab.set('cycle-count');
      }

      if (params['barcode']) {
        this.barcodeInput = params['barcode'];
        this.activeTab.set('barcode');
        this.executeBarcodeScan();
      }
    });

    this.loadRfidPreset(1);
  }

  loadLocations() {
    this.locationService.getAll().subscribe({
      next: locs => {
        this.locations.set(locs);
        if (locs.length > 0) {
          this.barcodeLocationId = locs[1]?.id ?? locs[0]?.id ?? 0;
          this.rfidLocationId = locs[0]?.id ?? 0;
          this.cycleCountModel.locationId = locs[1]?.id ?? locs[0]?.id ?? 0;
        }
      }
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: prods => {
        this.products.set(prods);
        if (prods.length > 0) {
          this.cycleCountModel.items[0].productId = prods[0].id ?? 0;
        }
      }
    });
  }

  loadAudits() {
    this.scannerService.getAudits().subscribe({
      next: list => this.audits.set(list),
      error: () => {}
    });
  }

  setTestBarcode(code: string) {
    this.barcodeInput = code;
    this.executeBarcodeScan();
  }

  executeBarcodeScan() {
    if (!this.barcodeInput.trim()) {
      this.toastService.warning('Please enter or scan a barcode.');
      return;
    }

    this.isScanningBarcode.set(true);
    const locId = this.barcodeLocationId > 0 ? this.barcodeLocationId : undefined;

    this.scannerService.scanBarcode(this.barcodeInput.trim(), locId).subscribe({
      next: res => {
        this.barcodeResult.set(res);
        this.isScanningBarcode.set(false);
        this.toastService.success(`Scanned: ${res.product?.name ?? 'Product'}`, 'Barcode Verified');
      },
      error: err => {
        this.isScanningBarcode.set(false);
        this.toastService.error(err?.error?.message ?? 'No product found with this barcode', 'Scan Failed');
      }
    });
  }

  loadRfidPreset(preset: number) {
    if (preset === 1) {
      this.rfidTagsInput = [
        'E28011606000020478140001',
        'E28011606000020478140002',
        'E28011606000020478140003',
        'E28011606000020478140004',
        'E28011606000020478140005',
        'E28011606000020478140006',
        'E28011606000020478140007'
      ].join('\n');
    } else if (preset === 2) {
      this.rfidTagsInput = [
        'E28011606000020478140001',
        'E28011606000020478140001',
        'E28011606000020478140001',
        'E28011606000020478140002',
        'E28011606000020478140002',
        'E28011606000020478140003',
        'E28011606000020478140004',
        'E28011606000020478140005',
        'E28011606000020478140005',
        'E28011606000020478140006',
        'E28011606000020478140007',
        'E28011606000020478140007'
      ].join('\n');
    } else {
      this.rfidTagsInput = [
        'E28011606000020478140001',
        'E28011606000020478140002',
        'E28011606000020478140099_UNKNOWN',
        'E28011606000020478140088_UNREGISTERED'
      ].join('\n');
    }
  }

  executeRfidScan() {
    const rawTags = this.rfidTagsInput
      .split(/[\n,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (rawTags.length === 0) {
      this.toastService.warning('Please input at least one RFID tag.');
      return;
    }

    if (!this.rfidLocationId) {
      this.toastService.warning('Please select a scanning facility.');
      return;
    }

    this.isScanningRfid.set(true);
    const dto: RfidScanRequestDTO = {
      locationId: this.rfidLocationId,
      rfidTags: rawTags,
      operator: this.rfidOperator
    };

    this.scannerService.scanRfidBatch(dto).subscribe({
      next: res => {
        this.rfidResult.set(res);
        this.isScanningRfid.set(false);
        this.toastService.success(
          `Processed ${res.totalTagsScanned} tags (${res.recognizedTagsCount} recognized, ${res.unknownTagsCount} unknown).`,
          'RFID Batch Completed'
        );
      },
      error: err => {
        this.isScanningRfid.set(false);
        this.toastService.error(err?.error?.message ?? 'Failed to process RFID batch');
      }
    });
  }

  addCountItemLine() {
    const defaultProduct = this.products()[0];
    this.cycleCountModel.items.push({
      productId: defaultProduct?.id ?? 0,
      countedQuantity: 10
    });
  }

  removeCountItemLine(idx: number) {
    this.cycleCountModel.items.splice(idx, 1);
  }

  submitCycleCount() {
    if (!this.cycleCountModel.locationId) {
      this.toastService.warning('Please select an audit facility.');
      return;
    }

    if (this.cycleCountModel.items.some(i => !i.productId || i.countedQuantity < 0)) {
      this.toastService.warning('Please ensure all items have a selected product and valid counted quantity.');
      return;
    }

    this.isSubmittingAudit.set(true);
    this.scannerService.performCycleCount(this.cycleCountModel, this.autoReconcile).subscribe({
      next: audit => {
        this.isSubmittingAudit.set(false);
        this.toastService.success(
          `Cycle count audit ${audit.auditNumber} completed! ${this.autoReconcile ? 'System stocks automatically reconciled.' : ''}`,
          'Stocktake Success'
        );
        this.loadAudits();
      },
      error: err => {
        this.isSubmittingAudit.set(false);
        this.toastService.error(err?.error?.message ?? 'Failed to submit cycle count audit');
      }
    });
  }
}
