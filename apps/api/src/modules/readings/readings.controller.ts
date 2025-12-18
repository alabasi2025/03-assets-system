import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReadingsService } from './readings.service';
import {
  CreateGeneratorReadingDto,
  UpdateGeneratorReadingDto,
  CreateMeterReadingDto,
  UpdateMeterReadingDto,
  VerifyMeterReadingDto,
  GeneratorReadingQueryDto,
  MeterReadingQueryDto
} from './dto/readings.dto';

@ApiTags('القراءات')
@Controller('api/v1/readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  // ═══════════════════════════════════════════════════════════════
  // Dashboard
  // ═══════════════════════════════════════════════════════════════

  @Get('dashboard')
  @ApiOperation({ summary: 'إحصائيات لوحة التحكم' })
  @ApiResponse({ status: 200, description: 'إحصائيات القراءات' })
  @ApiQuery({ name: 'business_id', required: false })
  getDashboardStats(@Query('business_id') businessId?: string) {
    return this.readingsService.getDashboardStats(businessId);
  }

  // ═══════════════════════════════════════════════════════════════
  // Generator Readings
  // ═══════════════════════════════════════════════════════════════

  @Post('generators')
  @ApiOperation({ summary: 'إضافة قراءة مولد' })
  @ApiResponse({ status: 201, description: 'تم إضافة القراءة بنجاح' })
  createGeneratorReading(@Body() dto: CreateGeneratorReadingDto) {
    return this.readingsService.createGeneratorReading(dto);
  }

  @Get('generators')
  @ApiOperation({ summary: 'الحصول على قراءات المولدات' })
  @ApiResponse({ status: 200, description: 'قائمة قراءات المولدات' })
  findAllGeneratorReadings(@Query() query: GeneratorReadingQueryDto) {
    return this.readingsService.findAllGeneratorReadings(query);
  }

  @Get('generators/stats/:generatorId')
  @ApiOperation({ summary: 'إحصائيات قراءات مولد' })
  @ApiResponse({ status: 200, description: 'إحصائيات القراءات' })
  @ApiParam({ name: 'generatorId', description: 'معرف المولد' })
  getGeneratorReadingStats(@Param('generatorId', ParseUUIDPipe) generatorId: string) {
    return this.readingsService.getGeneratorReadingStats(generatorId);
  }

  @Get('generators/:id')
  @ApiOperation({ summary: 'الحصول على تفاصيل قراءة مولد' })
  @ApiResponse({ status: 200, description: 'تفاصيل القراءة' })
  @ApiParam({ name: 'id', description: 'معرف القراءة' })
  findOneGeneratorReading(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.findOneGeneratorReading(id);
  }

  @Put('generators/:id')
  @ApiOperation({ summary: 'تحديث قراءة مولد' })
  @ApiResponse({ status: 200, description: 'تم تحديث القراءة بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف القراءة' })
  updateGeneratorReading(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGeneratorReadingDto) {
    return this.readingsService.updateGeneratorReading(id, dto);
  }

  @Delete('generators/:id')
  @ApiOperation({ summary: 'حذف قراءة مولد' })
  @ApiResponse({ status: 200, description: 'تم حذف القراءة بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف القراءة' })
  removeGeneratorReading(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.removeGeneratorReading(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Meter Readings
  // ═══════════════════════════════════════════════════════════════

  @Post('meters')
  @ApiOperation({ summary: 'إضافة قراءة عداد' })
  @ApiResponse({ status: 201, description: 'تم إضافة القراءة بنجاح' })
  createMeterReading(@Body() dto: CreateMeterReadingDto) {
    return this.readingsService.createMeterReading(dto);
  }

  @Get('meters')
  @ApiOperation({ summary: 'الحصول على قراءات العدادات' })
  @ApiResponse({ status: 200, description: 'قائمة قراءات العدادات' })
  findAllMeterReadings(@Query() query: MeterReadingQueryDto) {
    return this.readingsService.findAllMeterReadings(query);
  }

  @Get('meters/stats/:meterId')
  @ApiOperation({ summary: 'إحصائيات قراءات عداد' })
  @ApiResponse({ status: 200, description: 'إحصائيات القراءات' })
  @ApiParam({ name: 'meterId', description: 'معرف العداد' })
  getMeterReadingStats(@Param('meterId', ParseUUIDPipe) meterId: string) {
    return this.readingsService.getMeterReadingStats(meterId);
  }

  @Get('meters/:id')
  @ApiOperation({ summary: 'الحصول على تفاصيل قراءة عداد' })
  @ApiResponse({ status: 200, description: 'تفاصيل القراءة' })
  @ApiParam({ name: 'id', description: 'معرف القراءة' })
  findOneMeterReading(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.findOneMeterReading(id);
  }

  @Put('meters/:id')
  @ApiOperation({ summary: 'تحديث قراءة عداد' })
  @ApiResponse({ status: 200, description: 'تم تحديث القراءة بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف القراءة' })
  updateMeterReading(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMeterReadingDto) {
    return this.readingsService.updateMeterReading(id, dto);
  }

  @Delete('meters/:id')
  @ApiOperation({ summary: 'حذف قراءة عداد' })
  @ApiResponse({ status: 200, description: 'تم حذف القراءة بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف القراءة' })
  removeMeterReading(@Param('id', ParseUUIDPipe) id: string) {
    return this.readingsService.removeMeterReading(id);
  }

  @Post('meters/:id/verify')
  @ApiOperation({ summary: 'التحقق من قراءة عداد' })
  @ApiResponse({ status: 200, description: 'تم التحقق من القراءة بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف القراءة' })
  verifyMeterReading(@Param('id', ParseUUIDPipe) id: string, @Body() dto: VerifyMeterReadingDto) {
    return this.readingsService.verifyMeterReading(id, dto);
  }
}
