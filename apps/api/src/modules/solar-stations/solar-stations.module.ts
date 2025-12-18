import { Module } from '@nestjs/common';
import { SolarStationsController } from './solar-stations.controller';
import { SolarStationsService } from './solar-stations.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SolarStationsController],
  providers: [SolarStationsService],
  exports: [SolarStationsService]
})
export class SolarStationsModule {}
