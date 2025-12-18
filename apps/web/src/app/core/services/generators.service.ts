import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Generator {
  id: string;
  station_id: string;
  code: string;
  name: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  year?: number;
  capacity_kva?: number;
  capacity_kw?: number;
  fuel_type?: string;
  status: string;
  condition: string;
  running_hours?: number;
  station?: any;
}

@Injectable({ providedIn: 'root' })
export class GeneratorsService {
  private apiUrl = `${environment.apiUrl}/generators`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Generator[]> {
    return this.http.get<Generator[]>(this.apiUrl);
  }

  getById(id: string): Observable<Generator> {
    return this.http.get<Generator>(`${this.apiUrl}/${id}`);
  }

  create(generator: Partial<Generator>): Observable<Generator> {
    return this.http.post<Generator>(this.apiUrl, generator);
  }

  update(id: string, generator: Partial<Generator>): Observable<Generator> {
    return this.http.put<Generator>(`${this.apiUrl}/${id}`, generator);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReadings(generatorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${generatorId}/readings`);
  }

  addReading(generatorId: string, reading: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${generatorId}/readings`, reading);
  }
}
