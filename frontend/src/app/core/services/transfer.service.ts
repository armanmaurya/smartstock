import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockTransfer, StockTransferRequestDTO } from '../models/transfer.model';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private readonly baseUrl = `${API_BASE_URL}/transfers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StockTransfer[]> {
    return this.http.get<StockTransfer[]>(this.baseUrl);
  }

  create(dto: StockTransferRequestDTO): Observable<StockTransfer> {
    return this.http.post<StockTransfer>(this.baseUrl, dto);
  }

  approve(id: number): Observable<StockTransfer> {
    return this.http.put<StockTransfer>(`${this.baseUrl}/${id}/approve`, {});
  }

  ship(id: number): Observable<StockTransfer> {
    return this.http.put<StockTransfer>(`${this.baseUrl}/${id}/ship`, {});
  }

  receive(id: number): Observable<StockTransfer> {
    return this.http.put<StockTransfer>(`${this.baseUrl}/${id}/receive`, {});
  }

  cancel(id: number): Observable<StockTransfer> {
    return this.http.put<StockTransfer>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
