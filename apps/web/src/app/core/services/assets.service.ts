import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Asset,
  AssetCategory,
  CreateAssetDto,
  UpdateAssetDto,
  AssetQueryParams,
  DisposeAssetDto,
  ApiResponse,
  PaginatedResponse,
  AssetStatistics,
  DepreciationEntry,
} from '../models/asset.model';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  private endpoint = '/assets';
  private categoriesEndpoint = '/asset-categories';
  private depreciationEndpoint = '/depreciation';

  constructor(private api: ApiService) {}

  // ═══════════════════════════════════════════════════════════════
  // Asset Categories
  // ═══════════════════════════════════════════════════════════════

  getCategories(params?: { businessId?: string; parentId?: string; isActive?: boolean; search?: string }): Observable<ApiResponse<AssetCategory[]>> {
    return this.api.get<ApiResponse<AssetCategory[]>>(this.categoriesEndpoint, params);
  }

  getCategoryTree(businessId: string): Observable<ApiResponse<AssetCategory[]>> {
    return this.api.get<ApiResponse<AssetCategory[]>>(`${this.categoriesEndpoint}/tree/${businessId}`);
  }

  getCategory(id: string): Observable<ApiResponse<AssetCategory>> {
    return this.api.get<ApiResponse<AssetCategory>>(`${this.categoriesEndpoint}/${id}`);
  }

  createCategory(data: Partial<AssetCategory>): Observable<ApiResponse<AssetCategory>> {
    return this.api.post<ApiResponse<AssetCategory>>(this.categoriesEndpoint, data);
  }

  updateCategory(id: string, data: Partial<AssetCategory>): Observable<ApiResponse<AssetCategory>> {
    return this.api.put<ApiResponse<AssetCategory>>(`${this.categoriesEndpoint}/${id}`, data);
  }

  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.categoriesEndpoint}/${id}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Assets
  // ═══════════════════════════════════════════════════════════════

  getAssets(params?: AssetQueryParams): Observable<PaginatedResponse<Asset>> {
    return this.api.get<PaginatedResponse<Asset>>(this.endpoint, params);
  }

  getAsset(id: string): Observable<ApiResponse<Asset>> {
    return this.api.get<ApiResponse<Asset>>(`${this.endpoint}/${id}`);
  }

  createAsset(data: CreateAssetDto): Observable<ApiResponse<Asset>> {
    return this.api.post<ApiResponse<Asset>>(this.endpoint, data);
  }

  updateAsset(id: string, data: UpdateAssetDto): Observable<ApiResponse<Asset>> {
    return this.api.put<ApiResponse<Asset>>(`${this.endpoint}/${id}`, data);
  }

  deleteAsset(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  disposeAsset(id: string, data: DisposeAssetDto): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(`${this.endpoint}/${id}/dispose`, data);
  }

  getAssetStatistics(businessId: string): Observable<ApiResponse<AssetStatistics>> {
    return this.api.get<ApiResponse<AssetStatistics>>(`${this.endpoint}/statistics/${businessId}`);
  }

  getAssetDepreciation(id: string): Observable<ApiResponse<{ asset: any; entries: DepreciationEntry[] }>> {
    return this.api.get<ApiResponse<{ asset: any; entries: DepreciationEntry[] }>>(`${this.endpoint}/${id}/depreciation`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Depreciation
  // ═══════════════════════════════════════════════════════════════

  runDepreciation(data: { businessId: string; periodEnd: string; createdBy?: string }): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(`${this.depreciationEndpoint}/run`, data);
  }

  getDepreciationByPeriod(businessId: string, periodEnd: string): Observable<ApiResponse<DepreciationEntry[]>> {
    return this.api.get<ApiResponse<DepreciationEntry[]>>(`${this.depreciationEndpoint}/period/${businessId}`, { periodEnd });
  }

  getDepreciationSummary(businessId: string, periodEnd: string): Observable<ApiResponse<any[]>> {
    return this.api.get<ApiResponse<any[]>>(`${this.depreciationEndpoint}/summary/${businessId}`, { periodEnd });
  }

  postDepreciation(businessId: string, periodEnd: string, createdBy?: string): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(`${this.depreciationEndpoint}/post/${businessId}?periodEnd=${periodEnd}`, { createdBy });
  }

  reverseDepreciation(businessId: string, periodEnd: string, createdBy?: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`${this.depreciationEndpoint}/reverse/${businessId}?periodEnd=${periodEnd}`);
  }
}
