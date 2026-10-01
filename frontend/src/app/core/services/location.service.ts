import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../models/location.model';
import { API_BASE_URL } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly baseUrl = `${API_BASE_URL}/locations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Location[]> {
    return this.http.get<Location[]>(this.baseUrl);
  }

  getActive(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.baseUrl}/active`);
  }

  getById(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.baseUrl}/${id}`);
  }

  create(location: Partial<Location>): Observable<Location> {
    return this.http.post<Location>(this.baseUrl, location);
  }

  update(id: number, location: Partial<Location>): Observable<Location> {
    return this.http.put<Location>(`${this.baseUrl}/${id}`, location);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
