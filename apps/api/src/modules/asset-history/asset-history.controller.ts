import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssetHistoryService } from './asset-history.service';
import { CreateAssetHistoryDto, AssetHistoryQueryDto } from './dto/asset-history.dto';

@ApiTags('سجل الأصل التاريخي')
@Controller('api/v1/asset-history')
export class AssetHistoryController {
  constructor(private readonly service: AssetHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة حدث للسجل التاريخي' })
  create(@Body() dto: CreateAssetHistoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الأحداث التاريخية' })
  findAll(@Query() query: AssetHistoryQueryDto) {
    return this.service.findAll(query);
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'السجل التاريخي لأصل محدد' })
  findByAsset(
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Query('limit') limit?: number
  ) {
    return this.service.findByAsset(assetId, limit);
  }

  @Get('asset/:assetId/quick')
  @ApiOperation({ summary: 'آخر 10 أحداث للأصل' })
  getQuickHistory(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.service.getQuickHistory(assetId);
  }

  @Get('asset/:assetId/profile')
  @ApiOperation({ summary: 'الملف التاريخي الشامل للأصل' })
  getCompleteProfile(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.service.getCompleteProfile(assetId);
  }

  @Get('asset/:assetId/timeline')
  @ApiOperation({ summary: 'الجدول الزمني للأصل' })
  getTimeline(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.service.getTimeline(assetId);
  }
}
