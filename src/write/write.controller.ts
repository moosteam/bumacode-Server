import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException, Req } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { WriteDto } from './dto/write.dto';
import { WriteService } from './write.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';
import axios from 'axios';

@ApiTags('Write')
@Controller('write')
export class WriteController {
  constructor(private readonly writeService: WriteService) {}
  
  private async getRealIp(req: Request): Promise<string> {
    let ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.ip;
    
    if (Array.isArray(ip)) {
      ip = ip[0];
    }
    
    if (typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
      } catch (error) {
        console.error('외부 IP 조회 실패:', error);
        return ip as string || '0.0.0.0';
      }
    }
    
    return ip as string;
  }

  @Post()
  @ApiOperation({ summary: '코드 업로드 (텍스트 or 파일 or zip)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: WriteDto })
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadWriteData(@Body() body: WriteDto, @UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!body.code && !file) {
      throw new BadRequestException('code 또는 file 중 하나는 반드시 있어야 합니다.');
    }
    if (body.code && file) {
      throw new BadRequestException('code와 file은 동시에 보낼 수 없습니다.');
    }
    if (body.expireMinutes !== undefined && (body.expireMinutes < 0 || body.expireMinutes > 1440)) {
      throw new BadRequestException('만료 시간은 0(영구보존)에서 1440분(24시간) 사이여야 합니다.');
    }
    const userIp = await this.getRealIp(req);
    
    return this.writeService.handleUpload(
      body.title, 
      body.code, 
      file, 
      userIp,
      body.expireMinutes
    );
  }
}