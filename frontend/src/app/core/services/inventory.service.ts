import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryStock, StockMovement, StockAdjustmentDTO } from '../models/inventory.model';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly baseUrl = `${API_BASE_URL}/inventory`;

  constructor(private http: HttpClient) {}

  getAllStocks(): Observable<InventoryStock[]> {
    return this.http.get<InventoryStock[]>(this.baseUrl);
  }

  getStocksByLocation(locationId: number): Observable<InventoryStock[]> {
    return this.http.get<InventoryStock[]>(`${this.baseUrl}/location/${locationId}`);
  }

  getStocksByProduct(productId: number): Observable<InventoryStock[]> {
    return this.http.get<InventoryStock[]>(`${this.baseUrl}/product/${productId}`);
  }

  getStock(productId: number, locationId: number): Observable<InventoryStock> {
    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('locationId', locationId.toString());
    return this.http.get<InventoryStock>(`${this.baseUrl}/stock`, { params });
  }

  getLowStock(locationId?: number): Observable<InventoryStock[]> {
    let params = new HttpParams();
    if (locationId) {
      params = params.set('locationId', locationId.toString());
    }
    return this.http.get<InventoryStock[]>(`${this.baseUrl}/low-stock`, { params });
  }

  getOutOfStock(locationId?: number): Observable<InventoryStock[]> {
    let params = new HttpParams();
    if (locationId) {
      params = params.set('locationId', locationId.toString());
    }
    return this.http.get<InventoryStock[]>(`${this.baseUrl}/out-of-stock`, { params });
  }

  adjustStock(dto: StockAdjustmentDTO): Observable<InventoryStock> {
    return this.http.post<InventoryStock>(`${this.baseUrl}/adjust`, dto);
  }

  getRecentMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.baseUrl}/movements`);
  }
}
