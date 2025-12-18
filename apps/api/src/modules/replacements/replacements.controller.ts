import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReplacementsService } from './replacements.service';
import {
  CreateComponentReplacementDto,
  UpdateComponentReplacementDto,
  ComponentReplacementQueryDto,
  WizardStep1Dto,
  WizardStep2Dto,
  WizardStep3Dto,
  WizardStep4Dto,
  WizardStep5Dto,
  DamagedMeterQueryDto
} from './dto/replacement.dto';

@ApiTags('عمليات الاستبدال')
@Controller('api/v1/replacements')
export class ReplacementsController {
  constructor(private readonly service: ReplacementsService) {}

  // Component Replacements
  @Post()
  @ApiOperation({ summary: 'إنشاء عملية استبدال مكون' })
  create(@Body() dto: CreateComponentReplacementDto) {
    return this.service.createReplacement(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة عمليات الاستبدال' })
  findAll(@Query() query: ComponentReplacementQueryDto) {
    return this.service.findAllReplacements(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'إحصائيات عمليات الاستبدال' })
  getStatistics(@Query('business_id') businessId?: string) {
    return this.service.getStatistics(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل عملية استبدال' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneReplacement(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث عملية استبدال' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateComponentReplacementDto) {
    return this.service.updateReplacement(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عملية استبدال' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeReplacement(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'إكمال عملية استبدال' })
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.completeReplacement(id);
  }

  // Damaged Meter Wizard
  @Post('damaged-meter/wizard/step1')
  @ApiOperation({ summary: 'معالج استبدال العداد - الخطوة 1: تحديد العميل' })
  wizardStep1(@Body() dto: WizardStep1Dto) {
    return this.service.wizardStep1(dto);
  }

  @Post('damaged-meter/wizard/:id/step2')
  @ApiOperation({ summary: 'معالج استبدال العداد - الخطوة 2: تقدير الاستهلاك' })
  wizardStep2(@Param('id', ParseUUIDPipe) id: string, @Body() dto: WizardStep2Dto) {
    return this.service.wizardStep2(id, dto);
  }

  @Post('damaged-meter/wizard/:id/step3')
  @ApiOperation({ summary: 'معالج استبدال العداد - الخطوة 3: تحديد التكلفة' })
  wizardStep3(@Param('id', ParseUUIDPipe) id: string, @Body() dto: WizardStep3Dto) {
    return this.service.wizardStep3(id, dto);
  }

  @Post('damaged-meter/wizard/:id/step4')
  @ApiOperation({ summary: 'معالج استبدال العداد - الخطوة 4: إنشاء أمر العمل' })
  wizardStep4(@Param('id', ParseUUIDPipe) id: string, @Body() dto: WizardStep4Dto) {
    return this.service.wizardStep4(id, dto);
  }

  @Post('damaged-meter/wizard/:id/step5')
  @ApiOperation({ summary: 'معالج استبدال العداد - الخطوة 5: التأكيد' })
  wizardStep5(@Param('id', ParseUUIDPipe) id: string, @Body() dto: WizardStep5Dto) {
    return this.service.wizardStep5(id, dto);
  }

  // Damaged Meter Requests
  @Get('damaged-meter')
  @ApiOperation({ summary: 'قائمة طلبات استبدال العداد التالف' })
  findAllDamagedMeter(@Query() query: DamagedMeterQueryDto) {
    return this.service.findAllDamagedMeterRequests(query);
  }

  @Get('damaged-meter/:id')
  @ApiOperation({ summary: 'تفاصيل طلب استبدال العداد' })
  findOneDamagedMeter(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findDamagedMeterRequest(id);
  }

  @Post('damaged-meter/:id/cancel')
  @ApiOperation({ summary: 'إلغاء طلب استبدال العداد' })
  cancelDamagedMeter(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancelDamagedMeterRequest(id);
  }

  @Post('damaged-meter/:id/complete')
  @ApiOperation({ summary: 'إكمال طلب استبدال العداد' })
  completeDamagedMeter(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.completeDamagedMeterRequest(id);
  }
}
