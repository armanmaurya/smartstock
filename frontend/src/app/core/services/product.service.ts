import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductDTO } from '../models/product.model';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = `${API_BASE_URL}/products`;

  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/sku/${encodeURIComponent(sku)}`);
  }

  getByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/barcode/${encodeURIComponent(barcode)}`);
  }

  getByRfid(rfid: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/rfid/${encodeURIComponent(rfid)}`);
  }

  create(dto: ProductDTO): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, dto);
  }

  update(id: number, dto: ProductDTO): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
