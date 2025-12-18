import { IsString, IsUUID, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EventType {
  CREATED = 'created',
  CAPITALIZED = 'capitalized',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  REPLACEMENT = 'replacement',
  ADDITION = 'addition',
  REVALUATION = 'revaluation',
  IMPAIRMENT = 'impairment',
  DISPOSAL = 'disposal',
  TRANSFER = 'transfer'
}

export class CreateAssetHistoryDto {
  @ApiProperty()
  @IsUUID()
  asset_id: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  event_type: EventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  event_date?: string;

  @ApiProperty()
  @IsString()
  event_description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reference_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cost_impact?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  value_before?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  value_after?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  performed_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class AssetHistoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  asset_id?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  event_type?: EventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
