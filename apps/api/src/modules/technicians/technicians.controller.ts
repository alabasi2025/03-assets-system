import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';
import {
  CreateContractorDto,
  UpdateContractorDto,
  CreateTechnicianDto,
  UpdateTechnicianDto,
  CreateMaintenanceContractDto,
  UpdateMaintenanceContractDto,
  CreatePerformanceDto,
} from './dto/technician.dto';

@ApiTags('Technicians & Contractors')
@Controller('api/v1/technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  // ═══════════════════════════════════════════════════════════════
  // Contractors
  // ═══════════════════════════════════════════════════════════════

  @Post('contractors')
  @ApiOperation({ summary: 'إنشاء مقاول جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المقاول بنجاح' })
  createContractor(@Body() dto: CreateContractorDto) {
    return this.techniciansService.createContractor(dto);
  }

  @Get('contractors')
  @ApiOperation({ summary: 'جلب قائمة المقاولين' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllContractors(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.techniciansService.findAllContractors(businessId, { status, search });
  }

  @Get('contractors/:id')
  @ApiOperation({ summary: 'جلب تفاصيل مقاول' })
  findOneContractor(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.findOneContractor(id);
  }

  @Put('contractors/:id')
  @ApiOperation({ summary: 'تحديث بيانات مقاول' })
  updateContractor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractorDto,
  ) {
    return this.techniciansService.updateContractor(id, dto);
  }

  @Delete('contractors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف مقاول' })
  deleteContractor(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.deleteContractor(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Technicians
  // ═══════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'إنشاء فني جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الفني بنجاح' })
  createTechnician(@Body() dto: CreateTechnicianDto) {
    return this.techniciansService.createTechnician(dto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب قائمة الفنيين' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'isInternal', required: false })
  @ApiQuery({ name: 'isAvailable', required: false })
  @ApiQuery({ name: 'skillsLevel', required: false })
  @ApiQuery({ name: 'contractorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllTechnicians(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('isInternal') isInternal?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('skillsLevel') skillsLevel?: string,
    @Query('contractorId') contractorId?: string,
    @Query('search') search?: string,
  ) {
    return this.techniciansService.findAllTechnicians(businessId, {
      isInternal: isInternal ? isInternal === 'true' : undefined,
      isAvailable: isAvailable ? isAvailable === 'true' : undefined,
      skillsLevel,
      contractorId,
      search,
    });
  }

  @Get('available')
  @ApiOperation({ summary: 'جلب الفنيين المتاحين' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'specialization', required: false })
  getAvailableTechnicians(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('specialization') specialization?: string,
  ) {
    return this.techniciansService.getAvailableTechnicians(businessId, specialization);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'جلب إحصائيات الفنيين والمقاولين' })
  @ApiQuery({ name: 'businessId', required: true })
  getStatistics(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.techniciansService.getStatistics(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب تفاصيل فني' })
  findOneTechnician(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.findOneTechnician(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث بيانات فني' })
  updateTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.techniciansService.updateTechnician(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف فني' })
  deleteTechnician(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.deleteTechnician(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Performance
  // ═══════════════════════════════════════════════════════════════

  @Post(':id/performance')
  @ApiOperation({ summary: 'إضافة تقييم أداء للفني' })
  createPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePerformanceDto,
  ) {
    dto.technicianId = id;
    return this.techniciansService.createPerformance(dto);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'جلب سجل أداء الفني' })
  getPerformanceHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.getPerformanceHistory(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // Maintenance Contracts
  // ═══════════════════════════════════════════════════════════════

  @Post('contracts')
  @ApiOperation({ summary: 'إنشاء عقد صيانة جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء العقد بنجاح' })
  createContract(@Body() dto: CreateMaintenanceContractDto) {
    return this.techniciansService.createContract(dto);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'جلب قائمة عقود الصيانة' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'contractorId', required: false })
  findAllContracts(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('status') status?: string,
    @Query('contractorId') contractorId?: string,
  ) {
    return this.techniciansService.findAllContracts(businessId, { status, contractorId });
  }

  @Get('contracts/:id')
  @ApiOperation({ summary: 'جلب تفاصيل عقد صيانة' })
  findOneContract(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.findOneContract(id);
  }

  @Put('contracts/:id')
  @ApiOperation({ summary: 'تحديث عقد صيانة' })
  updateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceContractDto,
  ) {
    return this.techniciansService.updateContract(id, dto);
  }

  @Delete('contracts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف عقد صيانة' })
  deleteContract(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.deleteContract(id);
  }
}
