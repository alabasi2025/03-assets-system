import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum ReadingSource {
  MANUAL = 'manual',
  IOT = 'iot',
  IMPORT = 'import'
}

export enum MeterReadingType {
  REGULAR = 'regular',
  INITIAL = 'initial',
  FINAL = 'final',
  CORRECTION = 'correction'
}

// ═══════════════════════════════════════════════════════════════
// Generator Readings DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateGeneratorReadingDto {
  @ApiProperty({ description: 'معرف المجموعة' })
  @IsUUID()
  business_id: string;

  @ApiProperty({ description: 'معرف المولد' })
  @IsUUID()
  generator_id: string;

  @ApiPropertyOptional({ description: 'وقت القراءة' })
  @IsOptional()
  @IsDateString()
  reading_time?: string;

  @ApiPropertyOptional({ description: 'ساعات التشغيل' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  running_hours?: number;

  @ApiPropertyOptional({ description: 'استهلاك الوقود (لتر)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fuel_consumption?: number;

  @ApiPropertyOptional({ description: 'الجهد (فولت)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  voltage?: number;

  @ApiPropertyOptional({ description: 'التيار (أمبير)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  current?: number;

  @ApiPropertyOptional({ description: 'التردد (هرتز)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  frequency?: number;

  @ApiPropertyOptional({ description: 'درجة الحرارة (°C)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'ضغط الزيت (بار)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oil_pressure?: number;

  @ApiPropertyOptional({ description: 'الطاقة المنتجة (كيلوواط)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  power_output?: number;

  @ApiPropertyOptional({ enum: ReadingSource, description: 'مصدر القراءة' })
  @IsOptional()
  @IsEnum(ReadingSource)
  source?: ReadingSource;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'معرف المسجل' })
  @IsOptional()
  @IsUUID()
  recorded_by?: string;
}

export class UpdateGeneratorReadingDto extends PartialType(CreateGeneratorReadingDto) {}

// ═══════════════════════════════════════════════════════════════
// Meter Readings DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateMeterReadingDto {
  @ApiProperty({ description: 'معرف المجموعة' })
  @IsUUID()
  business_id: string;

  @ApiProperty({ description: 'معرف العداد' })
  @IsUUID()
  meter_id: string;

  @ApiPropertyOptional({ description: 'وقت القراءة' })
  @IsOptional()
  @IsDateString()
  reading_time?: string;

  @ApiProperty({ description: 'قيمة القراءة' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reading_value: number;

  @ApiPropertyOptional({ description: 'القراءة السابقة' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  previous_value?: number;

  @ApiPropertyOptional({ enum: MeterReadingType, description: 'نوع القراءة' })
  @IsOptional()
  @IsEnum(MeterReadingType)
  reading_type?: MeterReadingType;

  @ApiPropertyOptional({ enum: ReadingSource, description: 'مصدر القراءة' })
  @IsOptional()
  @IsEnum(ReadingSource)
  source?: ReadingSource;

  @ApiPropertyOptional({ description: 'رابط صورة القراءة' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'معرف المسجل' })
  @IsOptional()
  @IsUUID()
  recorded_by?: string;
}

export class UpdateMeterReadingDto extends PartialType(CreateMeterReadingDto) {}

export class VerifyMeterReadingDto {
  @ApiProperty({ description: 'معرف المدقق' })
  @IsUUID()
  verified_by: string;
}

// ═══════════════════════════════════════════════════════════════
// Query DTOs
// ═══════════════════════════════════════════════════════════════

export class GeneratorReadingQueryDto {
  @ApiPropertyOptional({ description: 'معرف المجموعة' })
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional({ description: 'معرف المولد' })
  @IsOptional()
  @IsUUID()
  generator_id?: string;

  @ApiPropertyOptional({ enum: ReadingSource, description: 'مصدر القراءة' })
  @IsOptional()
  @IsEnum(ReadingSource)
  source?: ReadingSource;

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
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class MeterReadingQueryDto {
  @ApiPropertyOptional({ description: 'معرف المجموعة' })
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional({ description: 'معرف العداد' })
  @IsOptional()
  @IsUUID()
  meter_id?: string;

  @ApiPropertyOptional({ enum: MeterReadingType, description: 'نوع القراءة' })
  @IsOptional()
  @IsEnum(MeterReadingType)
  reading_type?: MeterReadingType;

  @ApiPropertyOptional({ enum: ReadingSource, description: 'مصدر القراءة' })
  @IsOptional()
  @IsEnum(ReadingSource)
  source?: ReadingSource;

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
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
