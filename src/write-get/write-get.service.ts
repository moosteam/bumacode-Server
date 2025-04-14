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
      const items = await this.writeRepo.find({
        order: { createdAt: 'DESC' },
      });

      return {
        items,
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
      return write;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('데이터 조회 중 오류가 발생했습니다.');
    }
  }
}
