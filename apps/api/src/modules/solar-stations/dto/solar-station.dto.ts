import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateSolarStationDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() business_id?: string;
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name_en?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() location_lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() location_lng?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() total_capacity_kw?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() panels_count?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() inverters_count?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() installation_date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateSolarStationDto extends PartialType(CreateSolarStationDto) {}
