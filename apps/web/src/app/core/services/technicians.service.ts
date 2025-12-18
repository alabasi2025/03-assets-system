import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ═══════════════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════════════

export interface Contractor {
  id: string;
  business_id: string;
  contractor_code: string;
  name: string;
  name_en?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  specializations?: string[];
  tax_number?: string;
  bank_account?: string;
  rating: number;
  status: string;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    technicians: number;
    contracts: number;
  };
}

export interface Technician {
  id: string;
  business_id: string;
  employee_id?: string;
  technician_code: string;
  name: string;
  name_en?: string;
  phone?: string;
  email?: string;
  specializations?: string[];
  certifications?: any[];
  skills_level: string;
  hourly_rate: number;
  is_internal: boolean;
  contractor_id?: string;
  rating: number;
  total_jobs: number;
  completed_jobs: number;
  is_available: boolean;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  contractor?: Contractor;
  _count?: {
    work_orders: number;
    performances: number;
  };
}

export interface MaintenanceContract {
  id: string;
  business_id: string;
  contract_number: string;
  contractor_id: string;
  title: string;
  description?: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  value: number;
  payment_terms?: string;
  scope?: string;
  sla?: any;
  status: string;
  attachments?: any;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  contractor?: Contractor;
}

export interface TechnicianPerformance {
  id: string;
  technician_id: string;
  period_start: string;
  period_end: string;
  total_jobs: number;
  completed_on_time: number;
  completed_late: number;
  rework_count: number;
  customer_complaints: number;
  quality_score: number;
  efficiency_score: number;
  overall_score: number;
  notes?: string;
  evaluated_by?: string;
  created_at: string;
}

export interface TechniciansStatistics {
  summary: {
    contractorsCount: number;
    techniciansCount: number;
    internalTechnicians: number;
    externalTechnicians: number;
    availableTechnicians: number;
    activeContracts: number;
  };
  topTechnicians: Array<{
    id: string;
    name: string;
    rating: number;
    completed_jobs: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════

@Injectable({
  providedIn: 'root'
})
export class TechniciansService {
  private apiUrl = `${environment.apiUrl}/technicians`;
  private businessId = environment.defaultBusinessId;

  constructor(private http: HttpClient) {}

  // ═══════════════════════════════════════════════════════════════
  // Contractors
  // ═══════════════════════════════════════════════════════════════

  getContractors(filters?: { status?: string; search?: string }): Observable<Contractor[]> {
    let params = new HttpParams().set('businessId', this.businessId);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Contractor[]>(`${this.apiUrl}/contractors`, { params });
  }

  getContractor(id: string): Observable<Contractor> {
    return this.http.get<Contractor>(`${this.apiUrl}/contractors/${id}`);
  }

  createContractor(data: Partial<Contractor>): Observable<Contractor> {
    return this.http.post<Contractor>(`${this.apiUrl}/contractors`, {
      ...data,
      businessId: this.businessId,
    });
  }

  updateContractor(id: string, data: Partial<Contractor>): Observable<Contractor> {
    return this.http.put<Contractor>(`${this.apiUrl}/contractors/${id}`, data);
  }

  deleteContractor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contractors/${id}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Technicians
  // ═══════════════════════════════════════════════════════════════

  getTechnicians(filters?: {
    isInternal?: boolean;
    isAvailable?: boolean;
    skillsLevel?: string;
    contractorId?: string;
    search?: string;
  }): Observable<Technician[]> {
    let params = new HttpParams().set('businessId', this.businessId);
    if (filters?.isInternal !== undefined) params = params.set('isInternal', String(filters.isInternal));
    if (filters?.isAvailable !== undefined) params = params.set('isAvailable', String(filters.isAvailable));
    if (filters?.skillsLevel) params = params.set('skillsLevel', filters.skillsLevel);
    if (filters?.contractorId) params = params.set('contractorId', filters.contractorId);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Technician[]>(this.apiUrl, { params });
  }

  getTechnician(id: string): Observable<Technician> {
    return this.http.get<Technician>(`${this.apiUrl}/${id}`);
  }

  createTechnician(data: Partial<Technician>): Observable<Technician> {
    return this.http.post<Technician>(this.apiUrl, {
      ...data,
      businessId: this.businessId,
    });
  }

  updateTechnician(id: string, data: Partial<Technician>): Observable<Technician> {
    return this.http.put<Technician>(`${this.apiUrl}/${id}`, data);
  }

  deleteTechnician(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvailableTechnicians(specialization?: string): Observable<Technician[]> {
    let params = new HttpParams().set('businessId', this.businessId);
    if (specialization) params = params.set('specialization', specialization);
    return this.http.get<Technician[]>(`${this.apiUrl}/available`, { params });
  }

  // ═══════════════════════════════════════════════════════════════
  // Performance
  // ═══════════════════════════════════════════════════════════════

  createPerformance(technicianId: string, data: Partial<TechnicianPerformance>): Observable<TechnicianPerformance> {
    return this.http.post<TechnicianPerformance>(`${this.apiUrl}/${technicianId}/performance`, data);
  }

  getPerformanceHistory(technicianId: string): Observable<TechnicianPerformance[]> {
    return this.http.get<TechnicianPerformance[]>(`${this.apiUrl}/${technicianId}/performance`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Contracts
  // ═══════════════════════════════════════════════════════════════

  getContracts(filters?: { status?: string; contractorId?: string }): Observable<MaintenanceContract[]> {
    let params = new HttpParams().set('businessId', this.businessId);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.contractorId) params = params.set('contractorId', filters.contractorId);
    return this.http.get<MaintenanceContract[]>(`${this.apiUrl}/contracts`, { params });
  }

  getContract(id: string): Observable<MaintenanceContract> {
    return this.http.get<MaintenanceContract>(`${this.apiUrl}/contracts/${id}`);
  }

  createContract(data: Partial<MaintenanceContract>): Observable<MaintenanceContract> {
    return this.http.post<MaintenanceContract>(`${this.apiUrl}/contracts`, {
      ...data,
      businessId: this.businessId,
    });
  }

  updateContract(id: string, data: Partial<MaintenanceContract>): Observable<MaintenanceContract> {
    return this.http.put<MaintenanceContract>(`${this.apiUrl}/contracts/${id}`, data);
  }

  deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contracts/${id}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Statistics
  // ═══════════════════════════════════════════════════════════════

  getStatistics(): Observable<TechniciansStatistics> {
    const params = new HttpParams().set('businessId', this.businessId);
    return this.http.get<TechniciansStatistics>(`${this.apiUrl}/statistics`, { params });
  }
}
