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

  async findAll() {
    try {
      const items = await this.writeRepo.query(`
        SELECT 
          id, 
          title, 
          "filePath", 
          "userIp", 
          to_char("createdAt", 'YYYY-MM-DD HH24:MI:SS.US') as "createdAt"
        FROM "write"
        ORDER BY "createdAt" DESC
      `);

      return {
        items: items,
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
      // 직접 SQL 쿼리를 사용하여 날짜를 문자열로 가져오기
      const items = await this.writeRepo.query(`
        SELECT 
          id, 
          title, 
          "filePath", 
          "userIp", 
          to_char("createdAt", 'YYYY-MM-DD HH24:MI:SS.US') as "createdAt"
        FROM "write"
        WHERE id = $1
      `, [id]);
      
      if (!items || items.length === 0) {
        throw new NotFoundException(`ID ${id}의 항목을 찾을 수 없습니다.`);
      }
      
      return items[0];
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('데이터 조회 중 오류가 발생했습니다.');
    }
  }
}
