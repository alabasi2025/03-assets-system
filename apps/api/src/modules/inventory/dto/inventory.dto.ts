import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum, IsInt, IsDateString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum InventoryStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  APPROVED = 'approved'
}

export enum ItemCondition {
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  MISSING = 'missing'
}

// ═══════════════════════════════════════════════════════════════
// Inventory DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateInventoryDto {
  @ApiProperty({ description: 'معرف المجموعة' })
  @IsUUID()
  business_id: string;

  @ApiProperty({ description: 'رقم الجرد' })
  @IsString()
  inventory_number: string;

  @ApiProperty({ description: 'تاريخ الجرد' })
  @IsDateString()
  inventory_date: string;

  @ApiPropertyOptional({ description: 'معرف المحطة' })
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'معرف المنفذ' })
  @IsOptional()
  @IsUUID()
  conducted_by?: string;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
  @ApiPropertyOptional({ enum: InventoryStatus, description: 'الحالة' })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @ApiPropertyOptional({ description: 'إجمالي الأصول' })
  @IsOptional()
  @IsInt()
  @Min(0)
  total_assets?: number;

  @ApiPropertyOptional({ description: 'الأصول الموجودة' })
  @IsOptional()
  @IsInt()
  @Min(0)
  found_assets?: number;

  @ApiPropertyOptional({ description: 'الأصول المفقودة' })
  @IsOptional()
  @IsInt()
  @Min(0)
  missing_assets?: number;

  @ApiPropertyOptional({ description: 'الأصول التالفة' })
  @IsOptional()
  @IsInt()
  @Min(0)
  damaged_assets?: number;
}

export class ApproveInventoryDto {
  @ApiProperty({ description: 'معرف الموافق' })
  @IsUUID()
  approved_by: string;
}

// ═══════════════════════════════════════════════════════════════
// Inventory Item DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'معرف الجرد' })
  @IsUUID()
  inventory_id: string;

  @ApiProperty({ description: 'معرف الأصل' })
  @IsUUID()
  asset_id: string;

  @ApiPropertyOptional({ description: 'الموقع المتوقع' })
  @IsOptional()
  @IsString()
  expected_location?: string;

  @ApiPropertyOptional({ description: 'الموقع الفعلي' })
  @IsOptional()
  @IsString()
  actual_location?: string;

  @ApiPropertyOptional({ enum: ItemCondition, description: 'الحالة' })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'معرف الفاحص' })
  @IsOptional()
  @IsUUID()
  checked_by?: string;
}

export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {}

export class BulkCheckItemsDto {
  @ApiProperty({ type: [String], description: 'معرفات البنود' })
  @IsArray()
  @IsUUID('4', { each: true })
  item_ids: string[];

  @ApiProperty({ enum: ItemCondition, description: 'الحالة' })
  @IsEnum(ItemCondition)
  condition: ItemCondition;

  @ApiPropertyOptional({ description: 'الموقع الفعلي' })
  @IsOptional()
  @IsString()
  actual_location?: string;

  @ApiProperty({ description: 'معرف الفاحص' })
  @IsUUID()
  checked_by: string;
}

// ═══════════════════════════════════════════════════════════════
// Query DTOs
// ═══════════════════════════════════════════════════════════════

export class InventoryQueryDto {
  @ApiPropertyOptional({ description: 'معرف المجموعة' })
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional({ enum: InventoryStatus, description: 'الحالة' })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @ApiPropertyOptional({ description: 'معرف المحطة' })
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: 'من تاريخ' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ' })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class InventoryItemQueryDto {
  @ApiPropertyOptional({ enum: ItemCondition, description: 'الحالة' })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @ApiPropertyOptional({ description: 'تم الفحص', enum: ['true', 'false'] })
  @IsOptional()
  @IsString()
  checked?: string;
}
