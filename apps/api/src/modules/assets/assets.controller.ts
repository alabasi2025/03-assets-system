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
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, AssetQueryDto, DisposeAssetDto } from './dto/asset.dto';

@Controller('api/v1/assets')
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAssetDto) {
    return {
      success: true,
      data: await this.service.create(dto),
      message: 'تم إنشاء الأصل بنجاح',
    };
  }

  @Get()
  async findAll(@Query() query: AssetQueryDto) {
    const result = await this.service.findAll(query);
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

  @Get(':id/depreciation')
  async getDepreciationSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.service.getDepreciationSchedule(id),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return {
      success: true,
      data: await this.service.update(id, dto),
      message: 'تم تحديث الأصل بنجاح',
    };
  }

  @Post(':id/dispose')
  async dispose(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DisposeAssetDto,
  ) {
    return {
      success: true,
      data: await this.service.dispose(id, dto),
      message: 'تم استبعاد الأصل بنجاح',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.softDelete(id);
    return {
      success: true,
      message: 'تم حذف الأصل بنجاح',
    };
  }
}
