import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { WriteGetService } from './write-get.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Write-Get')
@Controller('write-get')
export class WriteGetController {
  constructor(private readonly writeGetService: WriteGetService) {}

  @Get()
  @ApiOperation({ summary: '업로드된 코드 전체 목록 조회 (페이징 없이)' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              filePath: { type: 'string' },
              userIp: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
          },
        },
      },
    },
  })
  async getAllWrites() {
    return this.writeGetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 ID의 업로드된 코드 조회' })
  @ApiParam({ name: 'id', required: true, description: '조회할 코드의 ID' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        filePath: { type: 'string' },
        userIp: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '해당 ID의 코드를 찾을 수 없음' })
  async getWriteById(@Param('id', ParseIntPipe) id: number) {
    const write = await this.writeGetService.findOne(id);
    if (!write) {
      throw new NotFoundException(`ID ${id}의 항목을 찾을 수 없습니다.`);
    }
    return write;
  }
}
