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
    const threshold = new Date(now.getTime() - 20 * 60 * 1000);

    const maxRetries = 3;
    let attempts = 0;
    let expired;

    while (attempts < maxRetries) {
      try {
        expired = await this.writeRepo.find({
          where: { createdAt: LessThan(threshold) },
        });
        break;
      } catch (error) {
        attempts++;
        console.error(`데이터베이스 연결 실패: ${error.message}. 재시도 중... (${attempts}/${maxRetries})`);
        if (attempts === maxRetries) {
          console.error('최대 재시도 횟수 초과. 작업을 중단합니다.');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

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
      console.log(`${expired.length} 삭제`);    
    }
  }
}
