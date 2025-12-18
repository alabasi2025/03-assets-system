import { 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsInt, 
  IsNumber,
   
  IsDateString,
  IsObject,
  Min, 
  MaxLength 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssetDto {
  @IsUUID()
  businessId: string;

  @IsUUID()
  categoryId: string;

  @IsString()
  @MaxLength(50)
  assetNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

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

  // البيانات الفنية
  @IsOptional()
  @IsString()
  @MaxLength(255)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  // الموقع
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsUUID()
  custodianId?: string;

  // البيانات المالية
  @IsDateString()
  acquisitionDate: string;

  @IsNumber()
  @Min(0)
  acquisitionCost: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acquisitionMethod?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  // الإهلاك
  @IsOptional()
  @IsString()
  @MaxLength(50)
  depreciationMethod?: string;

  @IsInt()
  @Min(1)
  usefulLifeYears: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salvageValue?: number;

  // الضمان
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  warrantyProvider?: string;

  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  // الحالة
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  condition?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  assetNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

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
  @MaxLength(255)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsUUID()
  custodianId?: string;

  @IsOptional()
  @IsDateString()
  acquisitionDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  acquisitionCost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acquisitionMethod?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  depreciationMethod?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usefulLifeYears?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salvageValue?: number;

  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  warrantyProvider?: string;

  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  condition?: string;

  @IsOptional()
  @IsUUID()
  updatedBy?: string;
}

export class AssetQueryDto {
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class DisposeAssetDto {
  @IsDateString()
  disposalDate: string;

  @IsString()
  @MaxLength(50)
  disposalMethod: string; // sale, scrap, donation, write_off

  @IsOptional()
  @IsNumber()
  @Min(0)
  disposalValue?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
