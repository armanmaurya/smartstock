import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardKpiDTO, ReorderRecommendationDTO } from '../models/report.model';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly baseUrl = `${API_BASE_URL}/reports`;

  constructor(private http: HttpClient) {}

  getDashboardKpi(): Observable<DashboardKpiDTO> {
    return this.http.get<DashboardKpiDTO>(`${this.baseUrl}/kpi`);
  }

  getReorderRecommendations(): Observable<ReorderRecommendationDTO[]> {
    return this.http.get<ReorderRecommendationDTO[]>(`${this.baseUrl}/reorder-recommendations`);
  }
}
