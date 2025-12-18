import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/asset.model';
import {
  SparePart,
  SparePartCategory,
  SparePartMovement,
  CreateSparePartDto,
  UpdateSparePartDto,
  CreateSparePartMovementDto,
  SparePartQueryParams,
  SparePartStatistics,
} from '../models/spare-part.model';

@Injectable({
  providedIn: 'root'
})
export class SparePartsService {
  private endpoint = '/api/v1/spare-parts';

  constructor(private api: ApiService) {}

  // ═══════════════════════════════════════════════════════════════
  // Categories
  // ═══════════════════════════════════════════════════════════════

  getCategories(businessId: string): Observable<ApiResponse<SparePartCategory[]>> {
    return this.api.get<ApiResponse<SparePartCategory[]>>(`${this.endpoint}/categories`, { businessId });
  }

  createCategory(data: Partial<SparePartCategory>): Observable<ApiResponse<SparePartCategory>> {
    return this.api.post<ApiResponse<SparePartCategory>>(`${this.endpoint}/categories`, data);
  }

  // ═══════════════════════════════════════════════════════════════
  // Spare Parts
  // ═══════════════════════════════════════════════════════════════

  getSpareParts(params: SparePartQueryParams): Observable<PaginatedResponse<SparePart>> {
    return this.api.get<PaginatedResponse<SparePart>>(this.endpoint, params);
  }

  getSparePart(id: string): Observable<ApiResponse<SparePart>> {
    return this.api.get<ApiResponse<SparePart>>(`${this.endpoint}/${id}`);
  }

  createSparePart(data: CreateSparePartDto): Observable<ApiResponse<SparePart>> {
    return this.api.post<ApiResponse<SparePart>>(this.endpoint, data);
  }

  updateSparePart(id: string, data: UpdateSparePartDto): Observable<ApiResponse<SparePart>> {
    return this.api.put<ApiResponse<SparePart>>(`${this.endpoint}/${id}`, data);
  }

  // ═══════════════════════════════════════════════════════════════
  // Stock Movements
  // ═══════════════════════════════════════════════════════════════

  createMovement(data: CreateSparePartMovementDto): Observable<ApiResponse<{ movement: SparePartMovement; previousStock: number; newStock: number }>> {
    return this.api.post<ApiResponse<{ movement: SparePartMovement; previousStock: number; newStock: number }>>(`${this.endpoint}/movements`, data);
  }

  getMovements(partId: string, filters?: {
    movementType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<SparePartMovement>> {
    return this.api.get<PaginatedResponse<SparePartMovement>>(`${this.endpoint}/${partId}/movements`, filters);
  }

  // ═══════════════════════════════════════════════════════════════
  // Reports & Statistics
  // ═══════════════════════════════════════════════════════════════

  getStatistics(businessId: string): Observable<ApiResponse<SparePartStatistics>> {
    return this.api.get<ApiResponse<SparePartStatistics>>(`${this.endpoint}/statistics/${businessId}`);
  }

  getLowStockParts(businessId: string): Observable<ApiResponse<SparePart[]>> {
    return this.api.get<ApiResponse<SparePart[]>>(`${this.endpoint}/low-stock/${businessId}`);
  }

  getStockValue(businessId: string): Observable<ApiResponse<{ totalParts: number; totalQuantity: number; totalValue: number }>> {
    return this.api.get<ApiResponse<{ totalParts: number; totalQuantity: number; totalValue: number }>>(`${this.endpoint}/stock-value/${businessId}`);
  }
}
