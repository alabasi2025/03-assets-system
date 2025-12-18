import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeneratorsService } from './generators.service';
import { CreateGeneratorDto, UpdateGeneratorDto, CreateGeneratorReadingDto } from './dto/generator.dto';

@ApiTags('Generators')
@Controller('api/v1/generators')
export class GeneratorsController {
  constructor(private readonly generatorsService: GeneratorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all generators' })
  async findAll(@Query('stationId') stationId?: string) {
    return this.generatorsService.findAll(stationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get generator by ID' })
  async findOne(@Param('id') id: string) {
    return this.generatorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new generator' })
  async create(@Body() createGeneratorDto: CreateGeneratorDto) {
    return this.generatorsService.create(createGeneratorDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update generator' })
  async update(@Param('id') id: string, @Body() updateGeneratorDto: UpdateGeneratorDto) {
    return this.generatorsService.update(id, updateGeneratorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete generator' })
  async delete(@Param('id') id: string) {
    return this.generatorsService.delete(id);
  }

  @Get(':id/readings')
  @ApiOperation({ summary: 'Get generator readings' })
  async getReadings(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.generatorsService.getReadings(id, limit);
  }

  @Post(':id/readings')
  @ApiOperation({ summary: 'Add generator reading' })
  async addReading(@Param('id') id: string, @Body() dto: CreateGeneratorReadingDto) {
    return this.generatorsService.addReading(id, dto);
  }

  @Get(':id/components')
  @ApiOperation({ summary: 'Get generator components' })
  async getComponents(@Param('id') id: string) {
    return this.generatorsService.getComponents(id);
  }
}
