import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto, UpdateStationDto } from './dto/station.dto';

@ApiTags('Stations')
@Controller('api/v1/stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stations' })
  @ApiResponse({ status: 200, description: 'Return all stations' })
  async findAll(@Query('businessId') businessId: string) {
    return this.stationsService.findAll(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiResponse({ status: 200, description: 'Return station by ID' })
  async findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new station' })
  @ApiResponse({ status: 201, description: 'Station created successfully' })
  async create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update station' })
  @ApiResponse({ status: 200, description: 'Station updated successfully' })
  async update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete station' })
  @ApiResponse({ status: 200, description: 'Station deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.stationsService.delete(id);
  }

  @Get(':id/generators')
  @ApiOperation({ summary: 'Get generators for a station' })
  async getGenerators(@Param('id') id: string) {
    return this.stationsService.getGenerators(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get station statistics' })
  async getStats(@Param('id') id: string) {
    return this.stationsService.getStats(id);
  }
}
