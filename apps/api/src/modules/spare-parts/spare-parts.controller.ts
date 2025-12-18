import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SparePartsService, CreateSparePartDto, UpdateSparePartDto, SparePartMovementDto } from './spare-parts.service';

@Controller('api/v1/spare-parts')
export class SparePartsController {
  constructor(private readonly service: SparePartsService) {}

  // ═══════════════════════════════════════════════════════════════
  // Categories
  // ═══════════════════════════════════════════════════════════════

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: any) {
    return {
      success: true,
      data: await this.service.createCategory(dto),
      message: 'تم إنشاء تصنيف قطع الغيار بنجاح',
    };
  }

  @Get('categories')
  async findAllCategories(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return {
      success: true,
      data: await this.service.findAllCategories(businessId),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Spare Parts
  // ═══════════════════════════════════════════════════════════════

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSparePartDto) {
    return {
      success: true,
      data: await this.service.create(dto),
      message: 'تم إنشاء قطعة الغيار بنجاح',
    };
  }

  @Get()
  async findAll(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('categoryId') categoryId?: string,
    @Query('isCritical') isCritical?: string,
    @Query('lowStock') lowStock?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.service.findAll(businessId, {
      categoryId,
      isCritical: isCritical === 'true' ? true : isCritical === 'false' ? false : undefined,
      lowStock: lowStock === 'true',
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return {
      success: true,
      ...result,
    };
  }

  @Get('statistics/:businessId')
  async getStatistics(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return {
      success: true,
      data: await this.service.getStatistics(businessId),
    };
  }

  @Get('low-stock/:businessId')
  async getLowStockParts(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return {
      success: true,
      data: await this.service.getLowStockParts(businessId),
    };
  }

  @Get('stock-value/:businessId')
  async getStockValue(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return {
      success: true,
      data: await this.service.getStockValue(businessId),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.service.findOne(id),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSparePartDto,
  ) {
    return {
      success: true,
      data: await this.service.update(id, dto),
      message: 'تم تحديث قطعة الغيار بنجاح',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.delete(id);
    return {
      success: true,
      message: 'تم حذف قطعة الغيار بنجاح',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Stock Movements
  // ═══════════════════════════════════════════════════════════════

  @Post('movements')
  @HttpCode(HttpStatus.CREATED)
  async createMovement(@Body() dto: SparePartMovementDto) {
    return {
      success: true,
      data: await this.service.createMovement(dto),
      message: 'تم تسجيل حركة المخزون بنجاح',
    };
  }

  @Get(':id/movements')
  async getMovements(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('movementType') movementType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.service.getMovements(id, {
      movementType,
      startDate,
      endDate,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return {
      success: true,
      ...result,
    };
  }
}
