import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum ReportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf'
}

export class ReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ enum: ReportPeriod })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @ApiPropertyOptional({ enum: ReportFormat })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class AssetReportQueryDto extends ReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  station_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;
}

export class MaintenanceReportQueryDto extends ReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  asset_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  maintenance_type?: string;
}

export class CostReportQueryDto extends ReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  asset_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  cost_type?: string;
}
