import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WriteDto {
  @ApiProperty({ description: '제목', example: '코드 저장 예제' })
  title: string;

  @ApiPropertyOptional({ description: '텍스트 형식 코드 (파일 없이 보낼 때 사용)' })
  code?: string;
}