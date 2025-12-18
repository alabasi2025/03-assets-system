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
import { AssetCategoriesService } from './asset-categories.service';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto,
  AssetCategoryQueryDto,
} from './dto/asset-category.dto';

@Controller('api/v1/asset-categories')
export class AssetCategoriesController {
  constructor(private readonly service: AssetCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAssetCategoryDto) {
    return {
      success: true,
      data: await this.service.create(dto),
      message: 'تم إنشاء تصنيف الأصول بنجاح',
    };
  }

  @Get()
  async findAll(@Query() query: AssetCategoryQueryDto) {
    return {
      success: true,
      data: await this.service.findAll(query),
    };
  }

  @Get('tree/:businessId')
  async findTree(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return {
      success: true,
      data: await this.service.findTree(businessId),
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
    @Body() dto: UpdateAssetCategoryDto,
  ) {
    return {
      success: true,
      data: await this.service.update(id, dto),
      message: 'تم تحديث تصنيف الأصول بنجاح',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      success: true,
      message: 'تم حذف تصنيف الأصول بنجاح',
    };
  }
}
