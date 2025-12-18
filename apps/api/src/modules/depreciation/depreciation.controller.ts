import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DepreciationService, RunDepreciationDto } from './depreciation.service';

@Controller('api/v1/depreciation')
export class DepreciationController {
  constructor(private readonly service: DepreciationService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runDepreciation(@Body() dto: RunDepreciationDto) {
    return {
      success: true,
      data: await this.service.runDepreciation(dto),
      message: 'تم تشغيل الإهلاك بنجاح',
    };
  }

  @Get('period/:businessId')
  async getByPeriod(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('periodEnd') periodEnd: string,
  ) {
    return {
      success: true,
      data: await this.service.getByPeriod(businessId, periodEnd),
    };
  }

  @Get('summary/:businessId')
  async getSummaryByCategory(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('periodEnd') periodEnd: string,
  ) {
    return {
      success: true,
      data: await this.service.getSummaryByCategory(businessId, periodEnd),
    };
  }

  @Post('post/:businessId')
  @HttpCode(HttpStatus.OK)
  async postDepreciation(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('periodEnd') periodEnd: string,
    @Body('createdBy') createdBy?: string,
  ) {
    return {
      success: true,
      data: await this.service.postDepreciation(businessId, periodEnd, createdBy),
      message: 'تم ترحيل قيود الإهلاك بنجاح',
    };
  }

  @Delete('reverse/:businessId')
  @HttpCode(HttpStatus.OK)
  async reverseDepreciation(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('periodEnd') periodEnd: string,
    @Body('createdBy') createdBy?: string,
  ) {
    return {
      success: true,
      data: await this.service.reverseDepreciation(businessId, periodEnd, createdBy),
      message: 'تم عكس قيود الإهلاك بنجاح',
    };
  }
}
