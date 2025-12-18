import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CablesService } from './cables.service';
import { CreateCableDto, UpdateCableDto } from './dto/cable.dto';

@ApiTags('Cables')
@Controller('api/v1/cables')
export class CablesController {
  constructor(private readonly cablesService: CablesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cables' })
  async findAll(@Query('businessId') businessId: string) {
    return this.cablesService.findAll(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cable by ID' })
  async findOne(@Param('id') id: string) {
    return this.cablesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cable' })
  async create(@Body() dto: CreateCableDto) {
    return this.cablesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cable' })
  async update(@Param('id') id: string, @Body() dto: UpdateCableDto) {
    return this.cablesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cable' })
  async delete(@Param('id') id: string) {
    return this.cablesService.delete(id);
  }
}
