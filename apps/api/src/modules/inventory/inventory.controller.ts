import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  ApproveInventoryDto,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  BulkCheckItemsDto,
  InventoryQueryDto,
  InventoryItemQueryDto
} from './dto/inventory.dto';

@ApiTags('الجرد والمطابقة')
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ═══════════════════════════════════════════════════════════════
  // Inventory CRUD
  // ═══════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'إنشاء جرد جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الجرد بنجاح' })
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة الجرد' })
  @ApiResponse({ status: 200, description: 'قائمة الجرد' })
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'إحصائيات الجرد' })
  @ApiResponse({ status: 200, description: 'إحصائيات الجرد' })
  @ApiQuery({ name: 'business_id', required: false })
  getStatistics(@Query('business_id') businessId?: string) {
    return this.inventoryService.getStatistics(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل جرد' })
  @ApiResponse({ status: 200, description: 'تفاصيل الجرد' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث جرد' })
  @ApiResponse({ status: 200, description: 'تم تحديث الجرد بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف جرد' })
  @ApiResponse({ status: 200, description: 'تم حذف الجرد بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Inventory Workflow
  // ═══════════════════════════════════════════════════════════════

  @Post(':id/start')
  @ApiOperation({ summary: 'بدء الجرد' })
  @ApiResponse({ status: 200, description: 'تم بدء الجرد بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  startInventory(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.startInventory(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'إكمال الجرد' })
  @ApiResponse({ status: 200, description: 'تم إكمال الجرد بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  completeInventory(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.completeInventory(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'اعتماد الجرد' })
  @ApiResponse({ status: 200, description: 'تم اعتماد الجرد بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  approveInventory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ApproveInventoryDto) {
    return this.inventoryService.approveInventory(id, dto);
  }

  @Post(':id/populate')
  @ApiOperation({ summary: 'تعبئة الأصول تلقائياً' })
  @ApiResponse({ status: 200, description: 'تمت تعبئة الأصول بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  populateFromAssets(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.populateFromAssets(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Inventory Items
  // ═══════════════════════════════════════════════════════════════

  @Get(':id/items')
  @ApiOperation({ summary: 'الحصول على بنود الجرد' })
  @ApiResponse({ status: 200, description: 'قائمة بنود الجرد' })
  @ApiParam({ name: 'id', description: 'معرف الجرد' })
  getItems(@Param('id', ParseUUIDPipe) id: string, @Query() query: InventoryItemQueryDto) {
    return this.inventoryService.getItems(id, query);
  }

  @Post('items')
  @ApiOperation({ summary: 'إضافة بند جرد' })
  @ApiResponse({ status: 201, description: 'تم إضافة البند بنجاح' })
  addItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.addItem(dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'تحديث بند جرد' })
  @ApiResponse({ status: 200, description: 'تم تحديث البند بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف البند' })
  updateItem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'حذف بند جرد' })
  @ApiResponse({ status: 200, description: 'تم حذف البند بنجاح' })
  @ApiParam({ name: 'id', description: 'معرف البند' })
  removeItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.removeItem(id);
  }

  @Post('items/bulk-check')
  @ApiOperation({ summary: 'فحص بنود متعددة' })
  @ApiResponse({ status: 200, description: 'تم فحص البنود بنجاح' })
  bulkCheckItems(@Body() dto: BulkCheckItemsDto) {
    return this.inventoryService.bulkCheckItems(dto);
  }
}
