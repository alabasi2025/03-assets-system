import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MaintenanceRequestsService, CreateMaintenanceRequestDto, UpdateMaintenanceRequestDto } from './maintenance-requests.service';

@Controller('api/v1/maintenance-requests')
export class MaintenanceRequestsController {
  constructor(private readonly service: MaintenanceRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMaintenanceRequestDto) {
    return {
      success: true,
      data: await this.service.create(dto),
      message: 'تم إنشاء طلب الصيانة بنجاح',
    };
  }

  @Get()
  async findAll(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assetId') assetId?: string,
    @Query('stationId') stationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.service.findAll(businessId, {
      status,
      priority,
      assetId,
      stationId,
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
    @Body() dto: UpdateMaintenanceRequestDto,
  ) {
    return {
      success: true,
      data: await this.service.update(id, dto),
      message: 'تم تحديث طلب الصيانة بنجاح',
    };
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { assignedTo: string; teamId?: string },
  ) {
    return {
      success: true,
      data: await this.service.assign(id, body.assignedTo, body.teamId),
      message: 'تم تعيين طلب الصيانة بنجاح',
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { resolution: string; rootCause?: string },
  ) {
    return {
      success: true,
      data: await this.service.complete(id, body.resolution, body.rootCause),
      message: 'تم إكمال طلب الصيانة بنجاح',
    };
  }
}
