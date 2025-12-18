import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsArray, IsEnum, Min, Max, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════════════════════════
// Contractor DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateContractorDto {
  @ApiProperty({ description: 'معرف المجموعة' })
  @IsUUID()
  businessId: string;

  @ApiProperty({ description: 'كود المقاول' })
  @IsString()
  contractorCode: string;

  @ApiProperty({ description: 'اسم المقاول' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'الاسم بالإنجليزية' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'جهة الاتصال' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'التخصصات', type: [String] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ description: 'الرقم الضريبي' })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'الحساب البنكي' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateContractorDto {
  @ApiPropertyOptional({ description: 'كود المقاول' })
  @IsOptional()
  @IsString()
  contractorCode?: string;

  @ApiPropertyOptional({ description: 'اسم المقاول' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'الاسم بالإنجليزية' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'جهة الاتصال' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'التخصصات', type: [String] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ description: 'الرقم الضريبي' })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'الحساب البنكي' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ description: 'التقييم', minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['active', 'inactive', 'blacklisted'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'blacklisted'])
  status?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════
// Technician DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateTechnicianDto {
  @ApiProperty({ description: 'معرف المجموعة' })
  @IsUUID()
  businessId: string;

  @ApiPropertyOptional({ description: 'معرف الموظف (من نظام HR)' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiProperty({ description: 'كود الفني' })
  @IsString()
  technicianCode: string;

  @ApiProperty({ description: 'اسم الفني' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'الاسم بالإنجليزية' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'التخصصات', type: [String] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ description: 'الشهادات', type: [Object] })
  @IsOptional()
  @IsArray()
  certifications?: any[];

  @ApiPropertyOptional({ description: 'مستوى المهارة', enum: ['junior', 'mid', 'senior', 'expert'] })
  @IsOptional()
  @IsEnum(['junior', 'mid', 'senior', 'expert'])
  skillsLevel?: string;

  @ApiPropertyOptional({ description: 'سعر الساعة' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'فني داخلي', default: true })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ description: 'معرف المقاول (إذا خارجي)' })
  @IsOptional()
  @IsUUID()
  contractorId?: string;

  @ApiPropertyOptional({ description: 'متاح', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTechnicianDto {
  @ApiPropertyOptional({ description: 'معرف الموظف (من نظام HR)' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'كود الفني' })
  @IsOptional()
  @IsString()
  technicianCode?: string;

  @ApiPropertyOptional({ description: 'اسم الفني' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'الاسم بالإنجليزية' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'التخصصات', type: [String] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ description: 'الشهادات', type: [Object] })
  @IsOptional()
  @IsArray()
  certifications?: any[];

  @ApiPropertyOptional({ description: 'مستوى المهارة', enum: ['junior', 'mid', 'senior', 'expert'] })
  @IsOptional()
  @IsEnum(['junior', 'mid', 'senior', 'expert'])
  skillsLevel?: string;

  @ApiPropertyOptional({ description: 'سعر الساعة' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'فني داخلي' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ description: 'معرف المقاول (إذا خارجي)' })
  @IsOptional()
  @IsUUID()
  contractorId?: string;

  @ApiPropertyOptional({ description: 'التقييم', minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'متاح' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════
// Maintenance Contract DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateMaintenanceContractDto {
  @ApiProperty({ description: 'معرف المجموعة' })
  @IsUUID()
  businessId: string;

  @ApiProperty({ description: 'رقم العقد' })
  @IsString()
  contractNumber: string;

  @ApiProperty({ description: 'معرف المقاول' })
  @IsUUID()
  contractorId: string;

  @ApiProperty({ description: 'عنوان العقد' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'نوع العقد', enum: ['annual', 'project', 'on_call'] })
  @IsOptional()
  @IsEnum(['annual', 'project', 'on_call'])
  contractType?: string;

  @ApiProperty({ description: 'تاريخ البدء' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'تاريخ الانتهاء' })
  @IsString()
  endDate: string;

  @ApiProperty({ description: 'قيمة العقد' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'شروط الدفع' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'نطاق العمل' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'اتفاقية مستوى الخدمة' })
  @IsOptional()
  sla?: any;
}

export class UpdateMaintenanceContractDto {
  @ApiPropertyOptional({ description: 'رقم العقد' })
  @IsOptional()
  @IsString()
  contractNumber?: string;

  @ApiPropertyOptional({ description: 'عنوان العقد' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'نوع العقد', enum: ['annual', 'project', 'on_call'] })
  @IsOptional()
  @IsEnum(['annual', 'project', 'on_call'])
  contractType?: string;

  @ApiPropertyOptional({ description: 'تاريخ البدء' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'تاريخ الانتهاء' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'قيمة العقد' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ description: 'شروط الدفع' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'نطاق العمل' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'اتفاقية مستوى الخدمة' })
  @IsOptional()
  sla?: any;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['draft', 'active', 'expired', 'terminated'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'expired', 'terminated'])
  status?: string;
}

// ═══════════════════════════════════════════════════════════════
// Performance DTOs
// ═══════════════════════════════════════════════════════════════

export class CreatePerformanceDto {
  @ApiProperty({ description: 'معرف الفني' })
  @IsUUID()
  technicianId: string;

  @ApiProperty({ description: 'بداية الفترة' })
  @IsString()
  periodStart: string;

  @ApiProperty({ description: 'نهاية الفترة' })
  @IsString()
  periodEnd: string;

  @ApiPropertyOptional({ description: 'إجمالي المهام' })
  @IsOptional()
  @IsNumber()
  totalJobs?: number;

  @ApiPropertyOptional({ description: 'المكتملة في الوقت' })
  @IsOptional()
  @IsNumber()
  completedOnTime?: number;

  @ApiPropertyOptional({ description: 'المتأخرة' })
  @IsOptional()
  @IsNumber()
  completedLate?: number;

  @ApiPropertyOptional({ description: 'إعادة العمل' })
  @IsOptional()
  @IsNumber()
  reworkCount?: number;

  @ApiPropertyOptional({ description: 'شكاوى العملاء' })
  @IsOptional()
  @IsNumber()
  customerComplaints?: number;

  @ApiPropertyOptional({ description: 'درجة الجودة', minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'درجة الكفاءة', minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  efficiencyScore?: number;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'المقيّم' })
  @IsOptional()
  @IsUUID()
  evaluatedBy?: string;
}
