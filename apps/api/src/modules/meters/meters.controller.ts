import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetersService } from './meters.service';
import { CreateMeterDto, UpdateMeterDto, CreateMeterReadingDto } from './dto/meter.dto';

@ApiTags('Meters')
@Controller('api/v1/meters')
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all meters' })
  async findAll(@Query('businessId') businessId: string) {
    return this.metersService.findAll(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meter by ID' })
  async findOne(@Param('id') id: string) {
    return this.metersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new meter' })
  async create(@Body() dto: CreateMeterDto) {
    return this.metersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update meter' })
  async update(@Param('id') id: string, @Body() dto: UpdateMeterDto) {
    return this.metersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meter' })
  async delete(@Param('id') id: string) {
    return this.metersService.delete(id);
  }

  @Get(':id/readings')
  @ApiOperation({ summary: 'Get meter readings' })
  async getReadings(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.metersService.getReadings(id, limit);
  }

  @Post(':id/readings')
  @ApiOperation({ summary: 'Add meter reading' })
  async addReading(@Param('id') id: string, @Body() dto: CreateMeterReadingDto) {
    return this.metersService.addReading(id, dto);
  }
}
