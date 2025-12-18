import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateGeneratorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serial_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capacity_kva?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capacity_kw?: number;

  @ApiPropertyOptional({ enum: ['diesel', 'gas', 'dual'] })
  @IsOptional()
  @IsString()
  fuel_type?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'maintenance', 'faulty'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ enum: ['excellent', 'good', 'fair', 'poor'] })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  purchase_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warranty_end?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateGeneratorDto extends PartialType(CreateGeneratorDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  running_hours?: number;
}

export class CreateGeneratorReadingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  running_hours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fuel_consumption?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  voltage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  current?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  frequency?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  oil_pressure?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  power_output?: number;

  @ApiPropertyOptional({ enum: ['manual', 'iot'] })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  recorded_by?: string;
}
