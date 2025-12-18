import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsDateString, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum ComponentType {
  METER = 'meter',
  BREAKER = 'breaker',
  SEAL = 'seal'
}

export enum OldCondition {
  DAMAGED = 'damaged',
  MALFUNCTION = 'malfunction',
  UPGRADE = 'upgrade'
}

export enum WarrantyStatus {
  UNDER_WARRANTY = 'under_warranty',
  OUT_OF_WARRANTY = 'out_of_warranty'
}

export enum ReplacementStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CostOption {
  FULL = 'full',
  HALF = 'half',
  FREE = 'free'
}

export enum DamagedMeterStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  READY_FOR_INSTALLATION = 'ready_for_installation',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ═══════════════════════════════════════════════════════════════
// Component Replacement DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateComponentReplacementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  work_order_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @ApiProperty({ enum: ComponentType })
  @IsEnum(ComponentType)
  component_type: ComponentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  old_serial_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  old_model?: string;

  @ApiPropertyOptional({ enum: OldCondition })
  @IsOptional()
  @IsEnum(OldCondition)
  old_condition?: OldCondition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  old_damage_reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  new_serial_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  new_model?: string;

  @ApiPropertyOptional({ enum: WarrantyStatus })
  @IsOptional()
  @IsEnum(WarrantyStatus)
  warranty_status?: WarrantyStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warranty_end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_billable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  component_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  labor_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  replacement_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  replacement_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateComponentReplacementDto extends PartialType(CreateComponentReplacementDto) {
  @ApiPropertyOptional({ enum: ReplacementStatus })
  @IsOptional()
  @IsEnum(ReplacementStatus)
  status?: ReplacementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoice_id?: string;
}

export class ComponentReplacementQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  work_order_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ enum: ComponentType })
  @IsOptional()
  @IsEnum(ComponentType)
  component_type?: ComponentType;

  @ApiPropertyOptional({ enum: ReplacementStatus })
  @IsOptional()
  @IsEnum(ReplacementStatus)
  status?: ReplacementStatus;

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
// Damaged Meter Replacement Wizard DTOs
// ═══════════════════════════════════════════════════════════════

// الخطوة 1: تحديد العميل والعداد
export class WizardStep1Dto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiProperty()
  @IsUUID()
  customer_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  old_meter_serial?: string;
}

// الخطوة 2: تقدير الاستهلاك
export class WizardStep2Dto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  missing_days: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  avg_daily_consumption?: number; // إذا أراد المستخدم تجاوز الحساب التلقائي
}

// الخطوة 3: تحديد تكلفة الاستبدال
export class WizardStep3Dto {
  @ApiProperty({ enum: CostOption })
  @IsEnum(CostOption)
  cost_option: CostOption;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  meter_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cost_reason?: string;
}

// الخطوة 4: إنشاء أمر العمل
export class WizardStep4Dto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  new_meter_serial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduled_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;
}

// الخطوة 5: التأكيد
export class WizardStep5Dto {
  @ApiProperty()
  @IsBoolean()
  confirmed: boolean;
}

export class DamagedMeterQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ enum: DamagedMeterStatus })
  @IsOptional()
  @IsEnum(DamagedMeterStatus)
  status?: DamagedMeterStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
