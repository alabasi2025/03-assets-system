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
import { WorkOrdersService, CreateWorkOrderDto, UpdateWorkOrderDto } from './work-orders.service';

@Controller('api/v1/work-orders')
export class WorkOrdersController {
  constructor(private readonly service: WorkOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkOrderDto) {
    return {
      success: true,
      data: await this.service.create(dto),
      message: 'تم إنشاء أمر العمل بنجاح',
    };
  }

  @Get()
  async findAll(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('orderType') orderType?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.service.findAll(businessId, {
      status,
      priority,
      orderType,
      assignedTo,
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
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return {
      success: true,
      data: await this.service.update(id, dto),
      message: 'تم تحديث أمر العمل بنجاح',
    };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return {
      success: true,
      data: await this.service.approve(id, approvedBy),
      message: 'تم اعتماد أمر العمل بنجاح',
    };
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.service.start(id),
      message: 'تم بدء أمر العمل بنجاح',
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { actualCost?: number; notes?: string },
  ) {
    return {
      success: true,
      data: await this.service.complete(id, body.actualCost, body.notes),
      message: 'تم إكمال أمر العمل بنجاح',
    };
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('closedBy') closedBy: string,
  ) {
    return {
      success: true,
      data: await this.service.close(id, closedBy),
      message: 'تم إغلاق أمر العمل بنجاح',
    };
  }

  @Post(':id/records')
  @HttpCode(HttpStatus.CREATED)
  async addMaintenanceRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() record: any,
  ) {
    return {
      success: true,
      data: await this.service.addMaintenanceRecord(id, record),
      message: 'تم إضافة سجل الصيانة بنجاح',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.delete(id);
    return {
      success: true,
      message: 'تم حذف أمر العمل بنجاح',
    };
  }
}
