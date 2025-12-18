import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SolarStationsService } from './solar-stations.service';
import { CreateSolarStationDto, UpdateSolarStationDto } from './dto/solar-station.dto';

@ApiTags('Solar Stations')
@Controller('api/v1/solar-stations')
export class SolarStationsController {
  constructor(private readonly solarStationsService: SolarStationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all solar stations' })
  async findAll(@Query('businessId') businessId: string) {
    return this.solarStationsService.findAll(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get solar station by ID' })
  async findOne(@Param('id') id: string) {
    return this.solarStationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new solar station' })
  async create(@Body() dto: CreateSolarStationDto) {
    return this.solarStationsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update solar station' })
  async update(@Param('id') id: string, @Body() dto: UpdateSolarStationDto) {
    return this.solarStationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete solar station' })
  async delete(@Param('id') id: string) {
    return this.solarStationsService.delete(id);
  }

  @Get(':id/panels')
  @ApiOperation({ summary: 'Get solar panels for a station' })
  async getPanels(@Param('id') id: string) {
    return this.solarStationsService.getPanels(id);
  }

  @Get(':id/inverters')
  @ApiOperation({ summary: 'Get inverters for a station' })
  async getInverters(@Param('id') id: string) {
    return this.solarStationsService.getInverters(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get solar station statistics' })
  async getStats(@Param('id') id: string) {
    return this.solarStationsService.getStats(id);
  }
}
