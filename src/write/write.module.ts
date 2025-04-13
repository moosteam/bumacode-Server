import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Write } from './write.entity';
import { WriteService } from './write.service';
import { WriteController } from './write.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Write])],
  controllers: [WriteController],
  providers: [WriteService],
})
export class WriteModule {}
