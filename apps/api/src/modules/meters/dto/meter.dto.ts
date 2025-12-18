import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateMeterDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() business_id?: string;
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serial_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() manufacturer?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() model?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacity_amp?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() distribution_box_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() subscriber_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() location_lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() location_lng?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() connection_type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() installation_date?: string;
}

export class UpdateMeterDto extends PartialType(CreateMeterDto) {}

export class CreateMeterReadingDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() reading_value?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() consumption?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() peak_demand?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() power_factor?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() reader_id?: string;
}
