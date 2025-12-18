// Asset Category Model
export interface AssetCategory {
  id: string;
  businessId: string;
  parentId: string | null;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  depreciationMethod: string;
  usefulLifeYears: number;
  salvageRate: number;
  assetAccountId: string | null;
  depreciationAccountId: string | null;
  expenseAccountId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: AssetCategory;
  children?: AssetCategory[];
  _count?: { assets: number };
}

// Asset Model
export interface Asset {
  id: string;
  businessId: string;
  categoryId: string;
  assetNumber: string;
  barcode: string | null;
  name: string;
  nameEn: string | null;
  description: string | null;
  
  // Technical Data
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  specifications: Record<string, any> | null;
  
  // Location
  stationId: string | null;
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  custodianId: string | null;
  
  // Financial Data
  acquisitionDate: Date;
  acquisitionCost: number;
  acquisitionMethod: string;
  supplierId: string | null;
  invoiceNumber: string | null;
  
  // Depreciation
  depreciationMethod: string;
  usefulLifeYears: number;
  salvageValue: number;
  accumulatedDepreciation: number;
  bookValue: number;
  lastDepreciationDate: Date | null;
  
  // Warranty
  warrantyStart: Date | null;
  warrantyEnd: Date | null;
  warrantyProvider: string | null;
  warrantyTerms: string | null;
  
  // Status
  status: AssetStatus;
  condition: AssetCondition;
  
  // Audit
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category?: AssetCategory;
  _count?: {
    depreciationEntries: number;
    movements: number;
    maintenanceSchedules: number;
    maintenanceRequests: number;
  };
}

export type AssetStatus = 'active' | 'inactive' | 'under_maintenance' | 'disposed' | 'sold';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

// Depreciation Entry Model
export interface DepreciationEntry {
  id: string;
  assetId: string;
  periodStart: Date;
  periodEnd: Date;
  depreciationAmount: number;
  accumulatedBefore: number;
  accumulatedAfter: number;
  bookValueBefore: number;
  bookValueAfter: number;
  journalEntryId: string | null;
  status: 'draft' | 'posted' | 'reversed';
  createdAt: Date;
  asset?: Asset;
}

// Asset Movement Model
export interface AssetMovement {
  id: string;
  assetId: string;
  movementType: MovementType;
  movementDate: Date;
  fromLocation: string | null;
  toLocation: string | null;
  fromCustodianId: string | null;
  toCustodianId: string | null;
  valueBefore: number | null;
  valueAfter: number | null;
  reason: string | null;
  journalEntryId: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
}

export type MovementType = 'acquisition' | 'transfer' | 'revaluation' | 'disposal' | 'sale';

// DTOs
export interface CreateAssetDto {
  businessId: string;
  categoryId: string;
  assetNumber: string;
  barcode?: string;
  name: string;
  nameEn?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  specifications?: Record<string, any>;
  stationId?: string;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  custodianId?: string;
  acquisitionDate: string;
  acquisitionCost: number;
  acquisitionMethod?: string;
  supplierId?: string;
  invoiceNumber?: string;
  depreciationMethod?: string;
  usefulLifeYears: number;
  salvageValue?: number;
  warrantyStart?: string;
  warrantyEnd?: string;
  warrantyProvider?: string;
  warrantyTerms?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
}

export interface UpdateAssetDto extends Partial<CreateAssetDto> {}

export interface AssetQueryParams {
  businessId?: string;
  categoryId?: string;
  stationId?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DisposeAssetDto {
  disposalDate: string;
  disposalMethod: 'sale' | 'scrap' | 'donation' | 'write_off';
  disposalValue?: number;
  reason?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssetStatistics {
  summary: {
    totalAssets: number;
    activeAssets: number;
    disposedAssets: number;
    totalAcquisitionValue: number;
    totalBookValue: number;
    totalDepreciation: number;
  };
  byCategory: Array<{
    categoryId: string;
    _count: number;
    _sum: { bookValue: number };
  }>;
  byStatus: Array<{
    status: string;
    _count: number;
  }>;
  byCondition: Array<{
    condition: string;
    _count: number;
  }>;
}
