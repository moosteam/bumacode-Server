import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WriteDto {
  @ApiProperty({ description: '제목', example: '테스트1234' })
  title: string;

  @ApiPropertyOptional({ description: '텍스트 형식 코드' })
  code?: string;

  @ApiPropertyOptional({
    description: '파일, zip 파일 업로드',
    type: 'string',
    format: 'binary',
  })
  file?: any;
}