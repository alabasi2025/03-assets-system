import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'فحص صحة النظام', description: 'يتحقق من حالة النظام وقاعدة البيانات' })
  @ApiResponse({ status: 200, description: 'النظام يعمل بشكل صحيح' })
  @ApiResponse({ status: 503, description: 'النظام غير متاح' })
  async check() {
    return this.healthService.check();
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'فحص الحياة', description: 'يتحقق من أن التطبيق يعمل' })
  @ApiResponse({ status: 200, description: 'التطبيق يعمل' })
  async liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'فحص الجاهزية', description: 'يتحقق من جاهزية التطبيق لاستقبال الطلبات' })
  @ApiResponse({ status: 200, description: 'التطبيق جاهز' })
  @ApiResponse({ status: 503, description: 'التطبيق غير جاهز' })
  async readiness() {
    return this.healthService.checkReadiness();
  }
}
