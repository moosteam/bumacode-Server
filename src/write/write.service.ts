import {
    Injectable,
    InternalServerErrorException,
  } from '@nestjs/common';
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
  
    async handleUpload(title: string, code?: string, file?: Express.Multer.File) {
      try {
        let saved: Write;
        let type: 'code' | 'file';
  
        if (code) {
          saved = this.writeRepo.create({ title, code, filePath: null });
          type = 'code';
        } else if (file) {
          const fileName = `${Date.now()}_${file.originalname}`;
  
          console.log('[파일 업로드 시도]', fileName, file.mimetype);
  
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
            });
  
          if (uploadError) {
            console.error('[업로드 에러]', uploadError);
            throw new InternalServerErrorException('파일 업로드 실패: ' + uploadError.message);
          }
  
          console.log('[업로드 완료]', uploadData);
  
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);
  
          console.log('[퍼블릭 URL 생성 완료]', urlData.publicUrl);
  
          const publicURL = urlData.publicUrl;
  
          saved = this.writeRepo.create({
            title,
            code: null,
            filePath: publicURL,
          });
  
          type = 'file';
        } else {
          throw new InternalServerErrorException('code 또는 file 중 하나는 필요합니다.');
        }
  
        await this.writeRepo.save(saved);
  
        return {
          message: `${type === 'code' ? '텍스트 코드' : '파일'} 저장 완료`,
          data: {
            id: saved.id,
            title: saved.title,
            type,
            code: saved.code,
            filePath: saved.filePath,
            createdAt: saved.createdAt,
          },
        };
      } catch (err) {
        console.error('[핸들 업로드 전체 에러]', err);
        throw new InternalServerErrorException('파일 업로드 중 문제가 발생했습니다.');
      }
    }
  }
  