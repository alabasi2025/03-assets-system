import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GeneratorReading {
  id: string;
  business_id: string;
  generator_id: string;
  reading_time: string;
  running_hours?: number;
  fuel_consumption?: number;
  voltage?: number;
  current?: number;
  frequency?: number;
  temperature?: number;
  oil_pressure?: number;
  power_output?: number;
  source: 'manual' | 'iot' | 'import';
  notes?: string;
  recorded_by?: string;
  generator?: any;
}

export interface MeterReading {
  id: string;
  business_id: string;
  meter_id: string;
  reading_time: string;
  reading_value: number;
  previous_value?: number;
  consumption?: number;
  reading_type: 'regular' | 'initial' | 'final' | 'correction';
  source: 'manual' | 'iot' | 'import';
  image_url?: string;
  notes?: string;
  recorded_by?: string;
  verified_by?: string;
  verified_at?: string;
  meter?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReadingsService {
  private apiUrl = `${environment.apiUrl}/readings`;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardStats(businessId?: string): Observable<any> {
    let params = new HttpParams();
    if (businessId) params = params.set('business_id', businessId);
    return this.http.get(`${this.apiUrl}/dashboard`, { params });
  }

  // Generator Readings
  getGeneratorReadings(params?: any): Observable<{ data: GeneratorReading[]; meta: any }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<{ data: GeneratorReading[]; meta: any }>(`${this.apiUrl}/generators`, { params: httpParams });
  }

  getGeneratorReading(id: string): Observable<GeneratorReading> {
    return this.http.get<GeneratorReading>(`${this.apiUrl}/generators/${id}`);
  }

  createGeneratorReading(data: Partial<GeneratorReading>): Observable<GeneratorReading> {
    return this.http.post<GeneratorReading>(`${this.apiUrl}/generators`, data);
  }

  updateGeneratorReading(id: string, data: Partial<GeneratorReading>): Observable<GeneratorReading> {
    return this.http.put<GeneratorReading>(`${this.apiUrl}/generators/${id}`, data);
  }

  deleteGeneratorReading(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/generators/${id}`);
  }

  getGeneratorStats(generatorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/generators/stats/${generatorId}`);
  }

  // Meter Readings
  getMeterReadings(params?: any): Observable<{ data: MeterReading[]; meta: any }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<{ data: MeterReading[]; meta: any }>(`${this.apiUrl}/meters`, { params: httpParams });
  }

  getMeterReading(id: string): Observable<MeterReading> {
    return this.http.get<MeterReading>(`${this.apiUrl}/meters/${id}`);
  }

  createMeterReading(data: Partial<MeterReading>): Observable<MeterReading> {
    return this.http.post<MeterReading>(`${this.apiUrl}/meters`, data);
  }

  updateMeterReading(id: string, data: Partial<MeterReading>): Observable<MeterReading> {
    return this.http.put<MeterReading>(`${this.apiUrl}/meters/${id}`, data);
  }

  deleteMeterReading(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/meters/${id}`);
  }

  verifyMeterReading(id: string, verifiedBy: string): Observable<MeterReading> {
    return this.http.post<MeterReading>(`${this.apiUrl}/meters/${id}/verify`, { verified_by: verifiedBy });
  }

  getMeterStats(meterId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/meters/stats/${meterId}`);
  }
}
