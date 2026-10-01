import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesOrder, SalesOrderRequestDTO } from '../models/sales-order.model';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private readonly baseUrl = `${API_BASE_URL}/sales-orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SalesOrder[]> {
    return this.http.get<SalesOrder[]>(this.baseUrl);
  }

  getById(id: number): Observable<SalesOrder> {
    return this.http.get<SalesOrder>(`${this.baseUrl}/${id}`);
  }

  create(dto: SalesOrderRequestDTO): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(this.baseUrl, dto);
  }

  fulfill(id: number): Observable<SalesOrder> {
    return this.http.put<SalesOrder>(`${this.baseUrl}/${id}/fulfill`, {});
  }

  cancel(id: number): Observable<SalesOrder> {
    return this.http.put<SalesOrder>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
