import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  business_id?: string;
  parent_id?: string;
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  depreciation_method: string;
  useful_life_years: number;
  salvage_rate: number;
  asset_account_id?: string;
  depreciation_account_id?: string;
  expense_account_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    assets: number;
    children: number;
  };
}

export interface CategoryQuery {
  parentId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CategoryStatistics {
  total: number;
  active: number;
  inactive: number;
  withAssets: number;
  rootCategories: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private apiUrl = `${environment.apiUrl}/asset-categories`;

  constructor(private http: HttpClient) {}

  getCategories(query: CategoryQuery = {}): Observable<{ data: Category[]; meta: any }> {
    let params = new HttpParams();
    
    if (query.parentId) params = params.set('parentId', query.parentId);
    if (query.isActive !== undefined) params = params.set('isActive', query.isActive.toString());
    if (query.search) params = params.set('search', query.search);
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());

    return this.http.get<{ data: Category[]; meta: any }>(this.apiUrl, { params });
  }

  getCategory(id: string): Observable<{ data: Category }> {
    return this.http.get<{ data: Category }>(`${this.apiUrl}/${id}`);
  }

  getTree(businessId?: string): Observable<{ data: Category[] }> {
    const id = businessId || environment.defaultBusinessId;
    return this.http.get<{ data: Category[] }>(`${this.apiUrl}/tree/${id}`);
  }

  getStatistics(): Observable<CategoryStatistics> {
    return this.http.get<CategoryStatistics>(`${this.apiUrl}/statistics`);
  }

  createCategory(category: Partial<Category>): Observable<{ data: Category }> {
    return this.http.post<{ data: Category }>(this.apiUrl, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<{ data: Category }> {
    return this.http.put<{ data: Category }>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
