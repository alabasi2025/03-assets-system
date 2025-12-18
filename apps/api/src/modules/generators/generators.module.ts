import { Module } from '@nestjs/common';
import { GeneratorsController } from './generators.controller';
import { GeneratorsService } from './generators.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GeneratorsController],
  providers: [GeneratorsService],
  exports: [GeneratorsService]
})
export class GeneratorsModule {}
