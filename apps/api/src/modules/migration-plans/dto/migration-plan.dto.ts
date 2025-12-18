import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum CostPolicy {
  FREE = 'free',
  METER_ONLY = 'meter_only',
  FULL_COST = 'full_cost',
  PARTIAL = 'partial'
}

export enum PlanStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum ItemStatus {
  PENDING = 'pending',
  INVOICED = 'invoiced',
  PAID = 'paid',
  WORK_ORDER_CREATED = 'work_order_created',
  MIGRATED = 'migrated'
}

// ═══════════════════════════════════════════════════════════════
// Migration Plan DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateMigrationPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiProperty()
  @IsString()
  plan_code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plan_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CostPolicy })
  @IsOptional()
  @IsEnum(CostPolicy)
  cost_policy?: CostPolicy;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cost_percentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  planned_start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  planned_end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  created_by?: string;
}

export class UpdateMigrationPlanDto extends PartialType(CreateMigrationPlanDto) {}

export class ApproveMigrationPlanDto {
  @ApiProperty()
  @IsUUID()
  approved_by: string;
}

export class MigrationPlanQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional({ enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════
// Migration Plan Item DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateMigrationPlanItemDto {
  @ApiProperty()
  @IsUUID()
  plan_id: string;

  @ApiProperty()
  @IsUUID()
  customer_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  old_wire_length?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  new_wire_length?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  meter_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wire_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  installation_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  old_meter_serial?: string;
}

export class UpdateMigrationPlanItemDto extends PartialType(CreateMigrationPlanItemDto) {
  @ApiPropertyOptional({ enum: ItemStatus })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoice_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  work_order_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  old_meter_returned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  returned_to_fund?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  return_date?: string;
}

export class BulkAddItemsDto {
  @ApiProperty()
  @IsUUID()
  plan_id: string;

  @ApiProperty({ type: [CreateMigrationPlanItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMigrationPlanItemDto)
  items: CreateMigrationPlanItemDto[];
}

export class MigrationPlanItemQueryDto {
  @ApiPropertyOptional({ enum: ItemStatus })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;
}
