import { IsString, IsOptional, IsUUID, IsInt, IsNumber, IsBoolean, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetCategoryDto {
  @ApiProperty({ description: 'معرف الشركة', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  businessId: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف الأب', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'كود التصنيف', example: 'CAT001', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'اسم التصنيف بالعربي', example: 'أجهزة كمبيوتر', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'اسم التصنيف بالإنجليزي', example: 'Computers', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'وصف التصنيف', example: 'تصنيف لجميع أجهزة الكمبيوتر والملحقات' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'طريقة الإهلاك', 
    example: 'straight_line',
    enum: ['straight_line', 'declining_balance', 'units_of_production']
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  depreciationMethod?: string;

  @ApiPropertyOptional({ description: 'العمر الافتراضي بالسنوات', example: 5, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  usefulLifeYears?: number;

  @ApiPropertyOptional({ description: 'نسبة القيمة المتبقية', example: 0.1 })
  @IsOptional()
  @IsNumber()
  salvageRate?: number;

  @ApiPropertyOptional({ description: 'معرف حساب الأصل' })
  @IsOptional()
  @IsUUID()
  assetAccountId?: string;

  @ApiPropertyOptional({ description: 'معرف حساب الإهلاك' })
  @IsOptional()
  @IsUUID()
  depreciationAccountId?: string;

  @ApiPropertyOptional({ description: 'معرف حساب المصروفات' })
  @IsOptional()
  @IsUUID()
  expenseAccountId?: string;

  @ApiPropertyOptional({ description: 'حالة التصنيف', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetCategoryDto {
  @ApiPropertyOptional({ description: 'معرف التصنيف الأب' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'كود التصنيف', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ description: 'اسم التصنيف بالعربي', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'اسم التصنيف بالإنجليزي', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'وصف التصنيف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'طريقة الإهلاك',
    enum: ['straight_line', 'declining_balance', 'units_of_production']
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  depreciationMethod?: string;

  @ApiPropertyOptional({ description: 'العمر الافتراضي بالسنوات', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  usefulLifeYears?: number;

  @ApiPropertyOptional({ description: 'نسبة القيمة المتبقية' })
  @IsOptional()
  @IsNumber()
  salvageRate?: number;

  @ApiPropertyOptional({ description: 'معرف حساب الأصل' })
  @IsOptional()
  @IsUUID()
  assetAccountId?: string;

  @ApiPropertyOptional({ description: 'معرف حساب الإهلاك' })
  @IsOptional()
  @IsUUID()
  depreciationAccountId?: string;

  @ApiPropertyOptional({ description: 'معرف حساب المصروفات' })
  @IsOptional()
  @IsUUID()
  expenseAccountId?: string;

  @ApiPropertyOptional({ description: 'حالة التصنيف' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssetCategoryResponseDto {
  @ApiProperty({ description: 'معرف التصنيف' })
  id: string;

  @ApiProperty({ description: 'معرف الشركة' })
  businessId: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف الأب' })
  parentId: string | null;

  @ApiProperty({ description: 'كود التصنيف' })
  code: string;

  @ApiProperty({ description: 'اسم التصنيف بالعربي' })
  name: string;

  @ApiPropertyOptional({ description: 'اسم التصنيف بالإنجليزي' })
  nameEn: string | null;

  @ApiPropertyOptional({ description: 'وصف التصنيف' })
  description: string | null;

  @ApiProperty({ description: 'طريقة الإهلاك' })
  depreciationMethod: string;

  @ApiProperty({ description: 'العمر الافتراضي بالسنوات' })
  usefulLifeYears: number;

  @ApiProperty({ description: 'نسبة القيمة المتبقية' })
  salvageRate: number;

  @ApiPropertyOptional({ description: 'معرف حساب الأصل' })
  assetAccountId: string | null;

  @ApiPropertyOptional({ description: 'معرف حساب الإهلاك' })
  depreciationAccountId: string | null;

  @ApiPropertyOptional({ description: 'معرف حساب المصروفات' })
  expenseAccountId: string | null;

  @ApiProperty({ description: 'حالة التصنيف' })
  isActive: boolean;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt: Date;

  @ApiProperty({ description: 'تاريخ التحديث' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'التصنيفات الفرعية', type: [AssetCategoryResponseDto] })
  children?: AssetCategoryResponseDto[];
}

export class AssetCategoryQueryDto {
  @ApiPropertyOptional({ description: 'معرف الشركة' })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف الأب' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'حالة التصنيف' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'نص البحث' })
  @IsOptional()
  @IsString()
  search?: string;
}
