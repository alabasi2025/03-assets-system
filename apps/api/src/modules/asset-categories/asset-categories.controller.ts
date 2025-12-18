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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AssetCategoriesService } from './asset-categories.service';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto,
  AssetCategoryQueryDto,
  AssetCategoryResponseDto,
} from './dto/asset-category.dto';

@ApiTags('Asset Categories - تصنيفات الأصول')
@Controller('api/v1/asset-categories')
export class AssetCategoriesController {
  constructor(private readonly service: AssetCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'إنشاء تصنيف جديد',
    description: 'إنشاء تصنيف أصول جديد مع إمكانية تحديد التصنيف الأب وطريقة الإهلاك'
  })
  @ApiBody({ type: CreateAssetCategoryDto })
  @ApiResponse({ 
    status: 201, 
    description: 'تم إنشاء التصنيف بنجاح',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/AssetCategoryResponseDto' },
        message: { type: 'string', example: 'تم إنشاء تصنيف الأصول بنجاح' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 409, description: 'كود التصنيف موجود مسبقاً' })
  async create(@Body() dto: CreateAssetCategoryDto) {
    return {
      success: true,
      data: await this.service.create(dto),
      message: 'تم إنشاء تصنيف الأصول بنجاح',
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'جلب جميع التصنيفات',
    description: 'جلب قائمة بجميع تصنيفات الأصول مع إمكانية الفلترة والبحث'
  })
  @ApiQuery({ name: 'businessId', required: false, description: 'معرف الشركة' })
  @ApiQuery({ name: 'parentId', required: false, description: 'معرف التصنيف الأب' })
  @ApiQuery({ name: 'isActive', required: false, type: 'boolean', description: 'حالة التصنيف (نشط/غير نشط)' })
  @ApiQuery({ name: 'search', required: false, description: 'نص البحث في الاسم أو الكود' })
  @ApiResponse({ 
    status: 200, 
    description: 'قائمة التصنيفات',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { $ref: '#/components/schemas/AssetCategoryResponseDto' } }
      }
    }
  })
  async findAll(@Query() query: AssetCategoryQueryDto) {
    return {
      success: true,
      data: await this.service.findAll(query),
    };
  }

  @Get('tree/:businessId')
  @ApiOperation({ 
    summary: 'جلب شجرة التصنيفات',
    description: 'جلب التصنيفات بشكل هرمي (شجري) لشركة محددة'
  })
  @ApiParam({ name: 'businessId', description: 'معرف الشركة' })
  @ApiResponse({ 
    status: 200, 
    description: 'شجرة التصنيفات',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { $ref: '#/components/schemas/AssetCategoryResponseDto' } }
      }
    }
  })
  async findTree(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return {
      success: true,
      data: await this.service.findTree(businessId),
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'جلب تصنيف محدد',
    description: 'جلب تفاصيل تصنيف أصول محدد بواسطة المعرف'
  })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ 
    status: 200, 
    description: 'تفاصيل التصنيف',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/AssetCategoryResponseDto' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.service.findOne(id),
    };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'تحديث تصنيف',
    description: 'تحديث بيانات تصنيف أصول موجود'
  })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiBody({ type: UpdateAssetCategoryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'تم تحديث التصنيف بنجاح',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/AssetCategoryResponseDto' },
        message: { type: 'string', example: 'تم تحديث تصنيف الأصول بنجاح' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  @ApiResponse({ status: 409, description: 'كود التصنيف موجود مسبقاً أو مرجع دائري' })
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
  @ApiOperation({ 
    summary: 'حذف تصنيف',
    description: 'حذف تصنيف أصول. لا يمكن حذف تصنيف يحتوي على أصول أو تصنيفات فرعية'
  })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ 
    status: 200, 
    description: 'تم حذف التصنيف بنجاح',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم حذف تصنيف الأصول بنجاح' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف تصنيف يحتوي على أصول أو تصنيفات فرعية' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      success: true,
      message: 'تم حذف تصنيف الأصول بنجاح',
    };
  }
}
