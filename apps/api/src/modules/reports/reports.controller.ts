import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { AssetReportQueryDto, MaintenanceReportQueryDto, CostReportQueryDto } from './dto/reports.dto';

@ApiTags('التقارير')
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  // تقارير الأصول
  @Get('assets/depreciation')
  @ApiOperation({ summary: 'تقرير الإهلاك الدوري' })
  getDepreciationReport(@Query() query: AssetReportQueryDto) {
    return this.service.getDepreciationReport(query);
  }

  @Get('assets/by-location')
  @ApiOperation({ summary: 'تقرير الأصول حسب الموقع' })
  getAssetsByLocationReport(@Query() query: AssetReportQueryDto) {
    return this.service.getAssetsByLocationReport(query);
  }

  @Get('assets/inventory')
  @ApiOperation({ summary: 'تقرير الجرد' })
  getInventoryReport(@Query() query: AssetReportQueryDto) {
    return this.service.getInventoryReport(query);
  }

  // تقارير الصيانة
  @Get('maintenance/preventive')
  @ApiOperation({ summary: 'تقرير الصيانة الوقائية' })
  getPreventiveMaintenanceReport(@Query() query: MaintenanceReportQueryDto) {
    return this.service.getPreventiveMaintenanceReport(query);
  }

  @Get('maintenance/emergency')
  @ApiOperation({ summary: 'تقرير الصيانة الطارئة' })
  getEmergencyMaintenanceReport(@Query() query: MaintenanceReportQueryDto) {
    return this.service.getEmergencyMaintenanceReport(query);
  }

  @Get('maintenance/work-orders')
  @ApiOperation({ summary: 'تقرير أوامر العمل' })
  getWorkOrdersReport(@Query() query: MaintenanceReportQueryDto) {
    return this.service.getWorkOrdersReport(query);
  }

  // تقارير الأداء
  @Get('performance/technicians')
  @ApiOperation({ summary: 'تقرير أداء الفنيين' })
  getTechnicianPerformanceReport(@Query() query: MaintenanceReportQueryDto) {
    return this.service.getTechnicianPerformanceReport(query);
  }

  @Get('performance/efficiency')
  @ApiOperation({ summary: 'تقرير كفاءة الصيانة (MTTR)' })
  getMaintenanceEfficiencyReport(@Query() query: MaintenanceReportQueryDto) {
    return this.service.getMaintenanceEfficiencyReport(query);
  }

  // تقارير التكاليف
  @Get('costs/maintenance')
  @ApiOperation({ summary: 'تقرير تكاليف الصيانة' })
  getMaintenanceCostReport(@Query() query: CostReportQueryDto) {
    return this.service.getMaintenanceCostReport(query);
  }

  @Get('costs/spare-parts')
  @ApiOperation({ summary: 'تقرير تكاليف قطع الغيار' })
  getSparePartsCostReport(@Query() query: CostReportQueryDto) {
    return this.service.getSparePartsCostReport(query);
  }

  // لوحة التحكم
  @Get('dashboard')
  @ApiOperation({ summary: 'ملخص لوحة التحكم' })
  getDashboardSummary(@Query('business_id') businessId?: string) {
    return this.service.getDashboardSummary(businessId);
  }
}
