import { IsString, IsOptional, IsUUID, IsInt, IsDecimal, IsBoolean, Min, Max, MaxLength } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  depreciationMethod?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  usefulLifeYears?: number;

  @IsOptional()
  @IsDecimal()
  salvageRate?: number;

  @IsOptional()
  @IsUUID()
  assetAccountId?: string;

  @IsOptional()
  @IsUUID()
  depreciationAccountId?: string;

  @IsOptional()
  @IsUUID()
  expenseAccountId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetCategoryDto {
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  depreciationMethod?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  usefulLifeYears?: number;

  @IsOptional()
  @IsDecimal()
  salvageRate?: number;

  @IsOptional()
  @IsUUID()
  assetAccountId?: string;

  @IsOptional()
  @IsUUID()
  depreciationAccountId?: string;

  @IsOptional()
  @IsUUID()
  expenseAccountId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssetCategoryResponseDto {
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
  children?: AssetCategoryResponseDto[];
}

export class AssetCategoryQueryDto {
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
