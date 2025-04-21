import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Write } from '../write/entity/write.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WriteGetService {
  constructor(
    @InjectRepository(Write)
    private writeRepo: Repository<Write>,
  ) {}

  private formatToKoreanTime(date: Date): string {
    const koreanDate = new Date(date);
    return koreanDate.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  private transformItem(item: any): any {
    if (!item) return item;

    const result = { ...item };
    
    if (result.createdAt && !isNaN(new Date(result.createdAt).getTime())) {
      result.createdAt = this.formatToKoreanTime(result.createdAt);
    }
    
    if (result.expireAt) {
      result.expireAt = this.formatToKoreanTime(result.expireAt);
    } else {
      result.expireAt = '영구보존';
    }
    
    if (!result.fileType) {
      result.fileType = 'file';
    }
    
    result.type = result.fileType;
    
    return result;
  }

  private transformItems(data: any[]): any[] {
    return data.map(item => this.transformItem(item));
  }

  async findAll() {
    try {
      const items = await this.writeRepo.query(`
        SELECT 
          id, 
          title, 
          "filePath", 
          "userIp", 
          "fileType",
          "createdAt",
          "expireAt"
        FROM "write"
        ORDER BY "createdAt" DESC
      `);

      const transformedItems = this.transformItems(items);

      return {
        items: transformedItems,
        meta: {
          total: items.length,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('데이터 조회 중 오류가 발생했습니다.');
    }
  }

  async findOne(id: number) {
    try {
      const items = await this.writeRepo.query(`
        SELECT 
          id, 
          title, 
          "filePath", 
          "userIp", 
          "fileType",
          "createdAt",
          "expireAt"
        FROM "write"
        WHERE id = $1
      `, [id]);
      
      if (!items || items.length === 0) {
        throw new NotFoundException(`ID ${id}의 항목을 찾을 수 없습니다.`);
      }
      
      return this.transformItem(items[0]);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('데이터 조회 중 오류가 발생했습니다.');
    }
  }
}
