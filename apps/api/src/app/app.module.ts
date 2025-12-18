import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Common Modules
import { PrismaModule } from '../common/prisma/prisma.module';

// Feature Modules
import { AssetCategoriesModule } from '../modules/asset-categories/asset-categories.module';
import { AssetsModule } from '../modules/assets/assets.module';
import { DepreciationModule } from '../modules/depreciation/depreciation.module';
import { MaintenancePlansModule } from '../modules/maintenance-plans/maintenance-plans.module';
import { MaintenanceRequestsModule } from '../modules/maintenance-requests/maintenance-requests.module';
import { WorkOrdersModule } from '../modules/work-orders/work-orders.module';
import { SparePartsModule } from '../modules/spare-parts/spare-parts.module';

@Module({
  imports: [
    // Core
    PrismaModule,
    
    // Assets Management
    AssetCategoriesModule,
    AssetsModule,
    DepreciationModule,
    
    // Maintenance
    MaintenancePlansModule,
    MaintenanceRequestsModule,
    WorkOrdersModule,
    
    // Spare Parts
    SparePartsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
