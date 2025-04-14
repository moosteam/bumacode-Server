import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Write } from './entity/write.entity';
import { supabase } from '../supabase';

@Injectable()
export class WriteCleanupService {
  constructor(
    @InjectRepository(Write)
    private writeRepo: Repository<Write>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupOldEntries() {
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const threshold = new Date(kstNow.getTime() - 20 * 60 * 1000);
    
    const expired = await this.writeRepo.find({
      where: { createdAt: LessThan(threshold) },
    });

    for (const entry of expired) {
      if (entry.filePath) {
        const fileName = entry.filePath.split('/').pop();
        if (fileName) {
          await supabase.storage.from('file').remove([fileName]);
        }
      }

      await this.writeRepo.remove(entry);
    }

    if (expired.length) {
      console.log(`[자동삭제] ${expired.length}건 삭제됨`);
    }
  }
}