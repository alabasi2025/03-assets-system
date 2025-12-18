import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MigrationPlansService } from './migration-plans.service';
import {
  CreateMigrationPlanDto,
  UpdateMigrationPlanDto,
  ApproveMigrationPlanDto,
  MigrationPlanQueryDto,
  CreateMigrationPlanItemDto,
  UpdateMigrationPlanItemDto,
  BulkAddItemsDto,
  MigrationPlanItemQueryDto
} from './dto/migration-plan.dto';

@ApiTags('خطط الترحيل')
@Controller('api/v1/migration-plans')
export class MigrationPlansController {
  constructor(private readonly service: MigrationPlansService) {}

  // ═══════════════════════════════════════════════════════════════
  // Migration Plans
  // ═══════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'إنشاء خطة ترحيل جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الخطة بنجاح' })
  create(@Body() dto: CreateMigrationPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة خطط الترحيل' })
  @ApiResponse({ status: 200, description: 'قائمة الخطط' })
  findAll(@Query() query: MigrationPlanQueryDto) {
    return this.service.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'إحصائيات خطط الترحيل' })
  @ApiResponse({ status: 200, description: 'الإحصائيات' })
  getStatistics(@Query('business_id') businessId?: string) {
    return this.service.getStatistics(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تفاصيل الخطة' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تم التحديث بنجاح' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMigrationPlanDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تم الحذف بنجاح' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Workflow
  // ═══════════════════════════════════════════════════════════════

  @Post(':id/approve')
  @ApiOperation({ summary: 'اعتماد خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تم الاعتماد بنجاح' })
  approve(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ApproveMigrationPlanDto) {
    return this.service.approve(id, dto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'بدء تنفيذ خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تم البدء بنجاح' })
  start(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.start(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'إكمال خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تم الإكمال بنجاح' })
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.complete(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Items
  // ═══════════════════════════════════════════════════════════════

  @Get(':id/items')
  @ApiOperation({ summary: 'قائمة عناصر خطة الترحيل' })
  @ApiResponse({ status: 200, description: 'قائمة العناصر' })
  getItems(@Param('id', ParseUUIDPipe) id: string, @Query() query: MigrationPlanItemQueryDto) {
    return this.service.getItems(id, query);
  }

  @Post('items')
  @ApiOperation({ summary: 'إضافة عنصر لخطة ترحيل' })
  @ApiResponse({ status: 201, description: 'تم الإضافة بنجاح' })
  addItem(@Body() dto: CreateMigrationPlanItemDto) {
    return this.service.addItem(dto);
  }

  @Post('items/bulk')
  @ApiOperation({ summary: 'إضافة عناصر متعددة لخطة ترحيل' })
  @ApiResponse({ status: 201, description: 'تم الإضافة بنجاح' })
  bulkAddItems(@Body() dto: BulkAddItemsDto) {
    return this.service.bulkAddItems(dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'تحديث عنصر في خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تم التحديث بنجاح' })
  updateItem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMigrationPlanItemDto) {
    return this.service.updateItem(id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'حذف عنصر من خطة ترحيل' })
  @ApiResponse({ status: 200, description: 'تم الحذف بنجاح' })
  removeItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeItem(id);
  }
}
