import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cable {
  id: string;
  business_id: string;
  code: string;
  name: string;
  type: string;
  cross_section?: number;
  material?: string;
  length_meters?: number;
  capacity_amp?: number;
  status: string;
  installation_date?: string;
}

@Injectable({ providedIn: 'root' })
export class CablesService {
  private apiUrl = `${environment.apiUrl}/cables`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cable[]> {
    return this.http.get<Cable[]>(this.apiUrl);
  }

  getById(id: string): Observable<Cable> {
    return this.http.get<Cable>(`${this.apiUrl}/${id}`);
  }

  create(cable: Partial<Cable>): Observable<Cable> {
    return this.http.post<Cable>(this.apiUrl, cable);
  }

  update(id: string, cable: Partial<Cable>): Observable<Cable> {
    return this.http.put<Cable>(`${this.apiUrl}/${id}`, cable);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
