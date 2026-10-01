import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BarcodeScanResultDTO,
  RfidScanRequestDTO,
  RfidScanResultDTO,
  CycleCountRequestDTO,
  CycleCountAudit
} from '../models/scanner.model';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private readonly baseUrl = `${API_BASE_URL}/scanner`;

  constructor(private http: HttpClient) {}

  scanBarcode(barcode: string, locationId?: number): Observable<BarcodeScanResultDTO> {
    let params = new HttpParams();
    if (locationId) {
      params = params.set('locationId', locationId.toString());
    }
    return this.http.get<BarcodeScanResultDTO>(`${this.baseUrl}/barcode/${encodeURIComponent(barcode)}`, { params });
  }

  scanRfidBatch(dto: RfidScanRequestDTO): Observable<RfidScanResultDTO> {
    return this.http.post<RfidScanResultDTO>(`${this.baseUrl}/rfid-batch`, dto);
  }

  performCycleCount(dto: CycleCountRequestDTO, reconcile: boolean = false): Observable<CycleCountAudit> {
    const params = new HttpParams().set('reconcile', reconcile.toString());
    return this.http.post<CycleCountAudit>(`${this.baseUrl}/cycle-count`, dto, { params });
  }

  getAudits(): Observable<CycleCountAudit[]> {
    return this.http.get<CycleCountAudit[]>(`${this.baseUrl}/audits`);
  }
}
