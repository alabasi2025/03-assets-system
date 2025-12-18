import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SolarStation {
  id: string;
  business_id: string;
  code: string;
  name: string;
  name_en?: string;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  total_capacity_kw?: number;
  panels_count: number;
  inverters_count: number;
  installation_date?: string;
  status: string;
  description?: string;
  _count?: { panels: number; inverters: number; batteries: number };
}

@Injectable({ providedIn: 'root' })
export class SolarStationsService {
  private apiUrl = `${environment.apiUrl}/solar-stations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SolarStation[]> {
    return this.http.get<SolarStation[]>(this.apiUrl);
  }

  getById(id: string): Observable<SolarStation> {
    return this.http.get<SolarStation>(`${this.apiUrl}/${id}`);
  }

  create(station: Partial<SolarStation>): Observable<SolarStation> {
    return this.http.post<SolarStation>(this.apiUrl, station);
  }

  update(id: string, station: Partial<SolarStation>): Observable<SolarStation> {
    return this.http.put<SolarStation>(`${this.apiUrl}/${id}`, station);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPanels(stationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${stationId}/panels`);
  }

  getInverters(stationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${stationId}/inverters`);
  }

  getStats(stationId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${stationId}/stats`);
  }
}
