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
import { MaintenancePlansService, CreateMaintenancePlanDto, UpdateMaintenancePlanDto } from './maintenance-plans.service';

@Controller('api/v1/maintenance-plans')
export class MaintenancePlansController {
  constructor(private readonly service: MaintenancePlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMaintenancePlanDto) {
    return {
      success: true,
      data: await this.service.create(dto),
      message: 'تم إنشاء خطة الصيانة بنجاح',
    };
  }

  @Get()
  async findAll(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return {
      success: true,
      data: await this.service.findAll(businessId, active),
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
    @Body() dto: UpdateMaintenancePlanDto,
  ) {
    return {
      success: true,
      data: await this.service.update(id, dto),
      message: 'تم تحديث خطة الصيانة بنجاح',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      success: true,
      message: 'تم حذف خطة الصيانة بنجاح',
    };
  }

  @Post(':id/generate-schedules')
  @HttpCode(HttpStatus.CREATED)
  async generateSchedules(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { assetIds: string[]; startDate: string; endDate: string },
  ) {
    return {
      success: true,
      data: await this.service.generateSchedules(id, body.assetIds, body.startDate, body.endDate),
      message: 'تم إنشاء جداول الصيانة بنجاح',
    };
  }
}
