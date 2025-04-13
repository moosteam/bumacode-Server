import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WriteDto } from './dto/write.dto';
import { WriteService } from './write.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';

@ApiTags('Write')
@Controller('write')
export class WriteController {
  constructor(private readonly writeService: WriteService) {}

  @Post()
  @ApiOperation({ summary: '코드 업로드 (텍스트 or 파일 or zip)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: WriteDto })
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
  }))
  async uploadWriteData(
    @Body() body: WriteDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!body.code && !file) {
      throw new BadRequestException('code 또는 file 중 하나는 반드시 있어야 합니다.');
    }

    if (body.code && file) {
      throw new BadRequestException('code와 file은 동시에 보낼 수 없습니다.');
    }

    return this.writeService.handleUpload(body.title, body.code, file);
  }
}
