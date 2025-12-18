import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Common Modules
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

// Feature Modules - Assets Management
import { AssetCategoriesModule } from '../modules/asset-categories/asset-categories.module';
import { AssetsModule } from '../modules/assets/assets.module';
import { DepreciationModule } from '../modules/depreciation/depreciation.module';

// Feature Modules - Maintenance
import { MaintenancePlansModule } from '../modules/maintenance-plans/maintenance-plans.module';
import { MaintenanceRequestsModule } from '../modules/maintenance-requests/maintenance-requests.module';
import { WorkOrdersModule } from '../modules/work-orders/work-orders.module';
import { SparePartsModule } from '../modules/spare-parts/spare-parts.module';

// Feature Modules - Technical Assets (Stations & Generators)
import { StationsModule } from '../modules/stations/stations.module';
import { GeneratorsModule } from '../modules/generators/generators.module';

// Feature Modules - Electrical Network
import { CablesModule } from '../modules/cables/cables.module';
import { MetersModule } from '../modules/meters/meters.module';

// Feature Modules - Solar Energy
import { SolarStationsModule } from '../modules/solar-stations/solar-stations.module';

// Health Check
import { HealthModule } from '../modules/health/health.module';

@Module({
  imports: [
    // Rate Limiting - 100 requests per minute per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    
    // Core
    PrismaModule,
    
    // Health Check
    HealthModule,
    
    // Assets Management (Accounting)
    AssetCategoriesModule,
    AssetsModule,
    DepreciationModule,
    
    // Maintenance
    MaintenancePlansModule,
    MaintenanceRequestsModule,
    WorkOrdersModule,
    
    // Spare Parts
    SparePartsModule,
    
    // Technical Assets - Stations & Generators
    StationsModule,
    GeneratorsModule,
    
    // Electrical Network
    CablesModule,
    MetersModule,
    
    // Solar Energy
    SolarStationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
