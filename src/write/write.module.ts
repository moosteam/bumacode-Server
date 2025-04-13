import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Write } from './entity/write.entity';
import { WriteService } from './write.service';
import { WriteController } from './write.controller';
import { WriteCleanupService } from './write-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Write])],
  controllers: [WriteController],
  providers: [WriteService, WriteCleanupService],
})
export class WriteModule {}
