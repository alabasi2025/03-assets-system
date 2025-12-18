import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Inventory {
  id: string;
  business_id: string;
  inventory_number: string;
  inventory_date: string;
  station_id?: string;
  category_id?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved';
  total_assets: number;
  found_assets: number;
  missing_assets: number;
  damaged_assets: number;
  notes?: string;
  conducted_by?: string;
  approved_by?: string;
  approved_at?: string;
  station?: any;
  category?: any;
  items?: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  inventory_id: string;
  asset_id: string;
  expected_location?: string;
  actual_location?: string;
  condition: 'good' | 'fair' | 'poor' | 'damaged' | 'missing';
  notes?: string;
  checked_by?: string;
  checked_at?: string;
  asset?: any;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  // Inventory CRUD
  getAll(params?: any): Observable<{ data: Inventory[]; meta: any }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<{ data: Inventory[]; meta: any }>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Inventory>): Observable<Inventory> {
    return this.http.post<Inventory>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Inventory>): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Workflow
  start(id: string): Observable<Inventory> {
    return this.http.post<Inventory>(`${this.apiUrl}/${id}/start`, {});
  }

  complete(id: string): Observable<Inventory> {
    return this.http.post<Inventory>(`${this.apiUrl}/${id}/complete`, {});
  }

  approve(id: string, approvedBy: string): Observable<Inventory> {
    return this.http.post<Inventory>(`${this.apiUrl}/${id}/approve`, { approved_by: approvedBy });
  }

  populate(id: string): Observable<{ added: number; message: string }> {
    return this.http.post<{ added: number; message: string }>(`${this.apiUrl}/${id}/populate`, {});
  }

  // Items
  getItems(inventoryId: string, params?: any): Observable<InventoryItem[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/${inventoryId}/items`, { params: httpParams });
  }

  addItem(data: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/items`, data);
  }

  updateItem(id: string, data: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/items/${id}`, data);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`);
  }

  bulkCheck(data: { item_ids: string[]; condition: string; actual_location?: string; checked_by: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/bulk-check`, data);
  }

  // Statistics
  getStatistics(businessId?: string): Observable<any> {
    let httpParams = new HttpParams();
    if (businessId) httpParams = httpParams.set('business_id', businessId);
    return this.http.get(`${this.apiUrl}/statistics`, { params: httpParams });
  }
}
