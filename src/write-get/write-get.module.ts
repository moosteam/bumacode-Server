import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Write } from '../write/entity/write.entity';
import { WriteGetController } from './write-get.controller';
import { WriteGetService } from './write-get.service';

@Module({
  imports: [TypeOrmModule.forFeature([Write])],
  controllers: [WriteGetController],
  providers: [WriteGetService],
  exports: [WriteGetService],
})
export class WriteGetModule {}
