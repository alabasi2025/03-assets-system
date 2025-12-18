import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const dbStatus = await this.checkDatabase();
    const memoryUsage = process.memoryUsage();

    const result: HealthCheckResult = {
      status: dbStatus.status === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      database: dbStatus,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
    };

    this.logger.log(JSON.stringify({ event: 'health_check', ...result }));

    return result;
  }

  async checkReadiness(): Promise<{ status: string; checks: Record<string, boolean> }> {
    const dbCheck = await this.checkDatabase();
    
    return {
      status: dbCheck.status === 'connected' ? 'ready' : 'not_ready',
      checks: {
        database: dbCheck.status === 'connected',
      },
    };
  }

  private async checkDatabase(): Promise<{ status: 'connected' | 'disconnected'; responseTime?: number }> {
    const startTime = Date.now();
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'connected',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(JSON.stringify({ event: 'database_health_check_failed', error: error.message }));
      return {
        status: 'disconnected',
      };
    }
  }
}
