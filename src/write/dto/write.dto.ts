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

  @ApiPropertyOptional({ 
    description: '만료 시간 (분 단위, 0이면 영구보존됨, 최대 1440분(24시간), 기본값 20분)',
    type: 'number',
    format: 'int32',
    example: 20,
    default: 20,
    minimum: 0,
    maximum: 1440
  })
  expireMinutes?: number;
}