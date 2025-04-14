import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Write } from './entity/write.entity';
import { Repository } from 'typeorm';
import { supabase } from '../supabase';

@Injectable()
export class WriteService {
  constructor(
    @InjectRepository(Write)
    private writeRepo: Repository<Write>,
  ) {}

  private detectExtension(code: string): string {
    if (code.includes('import React') || code.includes('from "react"')) return 'tsx';
    if (code.includes('function') || code.includes('console.log')) return 'js';
    if (code.includes('def ') || (code.includes('import ') && code.includes('print('))) return 'py';
    if (code.includes('#include') || code.includes('int main')) return 'cpp';
    if (code.includes('public class') || code.includes('System.out.println')) return 'java';
    if (code.includes('const') || code.includes('type') || code.includes('interface')) return 'ts';
    return 'txt';
  }

  private trimIp(ip: string): string {
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    if (ip.includes('::ffff:')) {
      return ip.split('::ffff:')[1];
    }
    
    return ip;
  }

  async handleUpload(title: string, code?: string, file?: Express.Multer.File, userIp?: string) {
    try {
      let saved: Write;
      let type: 'code' | 'file';
      let publicURL: string;
      if (code) {
        const ext = this.detectExtension(code);
        const fileName = `${Date.now()}_code.${ext}`;
        const buffer = Buffer.from(code, 'utf-8');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('file')
          .upload(fileName, buffer, { contentType: 'text/plain' });
        if (uploadError) {
          throw new InternalServerErrorException('텍스트 코드 업로드 실패: ' + uploadError.message);
        }
        const { data: urlData } = supabase.storage
          .from('file')
          .getPublicUrl(fileName);
        publicURL = urlData.publicUrl;
        type = 'code';
      } else if (file) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('file')
          .upload(fileName, file.buffer, { contentType: file.mimetype });
        if (uploadError) {
          throw new InternalServerErrorException('파일 업로드 실패: ' + uploadError.message);
        }
        const { data: urlData } = supabase.storage
          .from('file')
          .getPublicUrl(fileName);
        publicURL = urlData.publicUrl;
        type = 'file'; 
      } else {
        throw new InternalServerErrorException('code 또는 file 중 하나는 필요합니다.');
      }
      const fullIp = userIp ? this.trimIp(userIp) : null;
      saved = this.writeRepo.create({ title, filePath: publicURL, userIp: fullIp });
      await this.writeRepo.save(saved);
      return {
        message: type === 'code' ? '텍스트 코드 저장 완료' : '파일 저장 완료',
        data: {
          id: saved.id,
          title: saved.title,
          type,
          filePath: saved.filePath,
          createdAt: saved.createdAt,
          userIp: saved.userIp,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('파일 업로드 중 문제가 발생했습니다.');
    }
  }
}