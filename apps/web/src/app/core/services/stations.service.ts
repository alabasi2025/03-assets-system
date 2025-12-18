import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Station {
  id: string;
  business_id: string;
  code: string;
  name: string;
  name_en?: string;
  type: string;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  description?: string;
  status: string;
  total_capacity_kw?: number;
  installation_date?: string;
  generators?: any[];
  _count?: { generators: number; control_panels: number; transformers: number };
}

@Injectable({ providedIn: 'root' })
export class StationsService {
  private apiUrl = `${environment.apiUrl}/stations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Station[]> {
    return this.http.get<Station[]>(this.apiUrl);
  }

  getById(id: string): Observable<Station> {
    return this.http.get<Station>(`${this.apiUrl}/${id}`);
  }

  create(station: Partial<Station>): Observable<Station> {
    return this.http.post<Station>(this.apiUrl, station);
  }

  update(id: string, station: Partial<Station>): Observable<Station> {
    return this.http.put<Station>(`${this.apiUrl}/${id}`, station);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGenerators(stationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${stationId}/generators`);
  }

  getStats(stationId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${stationId}/stats`);
  }
}
