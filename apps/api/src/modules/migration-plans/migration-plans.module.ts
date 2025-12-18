import { Module } from '@nestjs/common';
import { MigrationPlansController } from './migration-plans.controller';
import { MigrationPlansService } from './migration-plans.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MigrationPlansController],
  providers: [MigrationPlansService],
  exports: [MigrationPlansService]
})
export class MigrationPlansModule {}
