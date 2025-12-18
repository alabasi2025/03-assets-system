import { Module } from '@nestjs/common';
import { CablesController } from './cables.controller';
import { CablesService } from './cables.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CablesController],
  providers: [CablesService],
  exports: [CablesService]
})
export class CablesModule {}
