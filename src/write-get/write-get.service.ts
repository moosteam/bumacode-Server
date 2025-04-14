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
    return new Date(date).toLocaleString('ko-KR', {
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

  private transformDateToKorean(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.transformDateToKorean(item));
    }

    if (typeof data === 'object') {
      const result = { ...data };

      if (result.createdAt && !isNaN(new Date(result.createdAt).getTime())) {
        result.createdAt = this.formatToKoreanTime(result.createdAt);
      }
      
      return result;
    }
    
    return data;
  }

  async findAll() {
    try {
      const items = await this.writeRepo.find({
        order: { createdAt: 'DESC' },
      });

      const transformedItems = this.transformDateToKorean(items);

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
      const write = await this.writeRepo.findOne({ where: { id } });
      if (!write) {
        throw new NotFoundException(`ID ${id}의 항목을 찾을 수 없습니다.`);
      }
      
      return this.transformDateToKorean(write);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('데이터 조회 중 오류가 발생했습니다.');
    }
  }
}
