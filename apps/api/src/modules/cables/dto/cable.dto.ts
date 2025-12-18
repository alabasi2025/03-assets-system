import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateCableDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() business_id?: string;
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cross_section?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() material?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() length_meters?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacity_amp?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() start_point_type?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() start_point_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() end_point_type?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() end_point_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() path_coordinates?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() installation_date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateCableDto extends PartialType(CreateCableDto) {}
