// Spare Part Category Model
export interface SparePartCategory {
  id: string;
  businessId: string;
  parentId: string | null;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: SparePartCategory;
  children?: SparePartCategory[];
  _count?: { parts: number };
}

// Spare Part Model
export interface SparePart {
  id: string;
  businessId: string;
  categoryId: string | null;
  partCode: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  unit: string;
  manufacturer: string | null;
  modelCompatibility: string[] | null;
  assetCategories: string[] | null;
  minStock: number;
  maxStock: number | null;
  reorderPoint: number;
  currentStock: number;
  unitCost: number;
  location: string | null;
  isCritical: boolean;
  leadTimeDays: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: SparePartCategory;
}

// Spare Part Movement Model
export interface SparePartMovement {
  id: string;
  partId: string;
  movementType: SparePartMovementType;
  movementDate: Date;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  referenceType: string | null;
  referenceId: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  part?: SparePart;
}

export type SparePartMovementType = 'receipt' | 'issue' | 'return' | 'adjustment';

// DTOs
export interface CreateSparePartDto {
  businessId: string;
  categoryId?: string;
  partCode: string;
  name: string;
  nameEn?: string;
  description?: string;
  unit: string;
  manufacturer?: string;
  modelCompatibility?: string[];
  assetCategories?: string[];
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  unitCost?: number;
  location?: string;
  isCritical?: boolean;
  leadTimeDays?: number;
  notes?: string;
}

export interface UpdateSparePartDto extends Partial<CreateSparePartDto> {
  isActive?: boolean;
}

export interface CreateSparePartMovementDto {
  partId: string;
  movementType: SparePartMovementType;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
}

export interface SparePartQueryParams {
  businessId: string;
  categoryId?: string;
  isCritical?: boolean;
  lowStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SparePartStatistics {
  totalParts: number;
  criticalParts: number;
  lowStockParts: number;
  stockValue: {
    totalParts: number;
    totalQuantity: number;
    totalValue: number;
  };
  recentMovements: SparePartMovement[];
}
