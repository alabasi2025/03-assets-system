import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateStationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name_en?: string;

  @ApiProperty({ enum: ['generation_distribution', 'distribution_only'] })
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  location_lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  location_lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'maintenance'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  total_capacity_kw?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  installation_date?: string;
}

export class UpdateStationDto extends PartialType(CreateStationDto) {}
