import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Meter {
  id: string;
  business_id: string;
  code: string;
  serial_number?: string;
  type: string;
  manufacturer?: string;
  model?: string;
  capacity_amp?: number;
  status: string;
  installation_date?: string;
  _count?: { readings: number };
}

@Injectable({ providedIn: 'root' })
export class MetersService {
  private apiUrl = `${environment.apiUrl}/meters`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Meter[]> {
    return this.http.get<Meter[]>(this.apiUrl);
  }

  getById(id: string): Observable<Meter> {
    return this.http.get<Meter>(`${this.apiUrl}/${id}`);
  }

  create(meter: Partial<Meter>): Observable<Meter> {
    return this.http.post<Meter>(this.apiUrl, meter);
  }

  update(id: string, meter: Partial<Meter>): Observable<Meter> {
    return this.http.put<Meter>(`${this.apiUrl}/${id}`, meter);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReadings(meterId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${meterId}/readings`);
  }

  addReading(meterId: string, reading: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${meterId}/readings`, reading);
  }
}
