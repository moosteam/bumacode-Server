import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Write } from './entity/write.entity';
import { Repository } from 'typeorm';
import { supabase } from '../supabase';
import * as path from 'path';

@Injectable()
export class WriteService {
  constructor(
    @InjectRepository(Write)
    private writeRepo: Repository<Write>,
  ) {
    this.writeRepo.query("SET timezone = 'Asia/Seoul';").catch(err => {
    });
  }

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

  private formatToKoreanTime(date: Date): string {
    return new Date(date).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  private sanitizeFilename(filename: string): string {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '');
    return `${Date.now()}${sanitized}${ext}`;
  }

  private isZipFile(file: Express.Multer.File): boolean {
    const extension = path.extname(file.originalname).toLowerCase();
    if (extension === '.zip') return true;
    
    const zipMimeTypes = [
      'application/zip', 
      'application/x-zip-compressed', 
      'application/x-zip',
      'multipart/x-zip'
    ];
    return zipMimeTypes.includes(file.mimetype);
  }

  private isBinaryFile(file: Express.Multer.File): boolean {
    const extension = path.extname(file.originalname).toLowerCase();
    const binaryExtensions = [
      '.unitypackage', '.xlsx', '.xls', '.xlsm', '.doc', '.docx', '.pdf',
      '.ppt', '.pptx', '.odt', '.ods', '.odp', '.rtf', '.txt',
      '.rar', '.7z', '.zip', '.tar', '.gz', '.bz2', '.iso', '.dmg',
      '.exe', '.dll', '.so', '.dylib', '.msi', '.deb', '.rpm', '.apk',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg', '.webp',
      '.tiff', '.psd', '.ai', '.sketch', '.eps', '.raw', '.cr2', '.nef',
      '.mp3', '.mp4', '.wav', '.avi', '.mov', '.wmv', '.flv', '.mkv',
      '.webm', '.m4v', '.3gp', '.mpeg', '.mpg', '.vob', '.swf',
      '.stl', '.dwg', '.dxf', '.3mf', '.obj', '.fbx', '.3ds', '.max',
      '.blend', '.ma', '.mb', '.lwo', '.ply', '.gltf', '.glb', '.f3d',
      '.step', '.ipt', '.iam',
      '.db', '.sqlite', '.mdb', '.accdb', '.frm', '.myd', '.myi',
      '.vdi', '.vmdk', '.vhd', '.vhdx', '.qcow2', '.img', '.bin',
      '.dat', '.bin', '.pak', '.pak2', '.pak3', '.pak4', '.pak5',
      '.pak6', '.pak7', '.pak8', '.pak9', '.pak10', '.pak11', '.pak12',
      '.pak13', '.pak14', '.pak15', '.pak16', '.pak17', '.pak18', '.pak19',
      '.pak20', '.pak21', '.pak22', '.pak23', '.pak24', '.pak25', '.pak26',
      '.pak27', '.pak28', '.pak29', '.pak30', '.pak31', '.pak32', '.pak33',
      '.pak34', '.pak35', '.pak36', '.pak37', '.pak38', '.pak39', '.pak40',
      '.pak41', '.pak42', '.pak43', '.pak44', '.pak45', '.pak46', '.pak47',
      '.pak48', '.pak49', '.pak50'
    ];
    return binaryExtensions.includes(extension);
  }

  async handleUpload(title: string, code?: string, file?: Express.Multer.File, userIp?: string) {
    try {
      let type: 'file' | 'zip' | 'binary';
      let publicURL: string;
      
      if (code) {
        const ext = this.detectExtension(code);
        const fileName = this.sanitizeFilename(`code.${ext}`);
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
        type = 'file';
      } else if (file) {
        const isZip = this.isZipFile(file);
        const isBinary = this.isBinaryFile(file);
        const fileName = this.sanitizeFilename(file.originalname);
        
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
        type = isZip ? 'zip' : (isBinary ? 'binary' : 'file');
      } else {
        throw new InternalServerErrorException('code 또는 file 중 하나는 필요합니다.');
      }
      
      const fullIp = userIp ? this.trimIp(userIp) : null;
      
      const result = await this.writeRepo.query(
        `INSERT INTO "write" (title, "filePath", "userIp", "createdAt", "fileType") 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul', $4)
         RETURNING id, title, "filePath", "userIp", "createdAt", "fileType"`,
        [title, publicURL, fullIp, type]
      );
      
      if (!result || result.length === 0) {
        throw new InternalServerErrorException('데이터 저장 실패');
      }
      
      const savedData = result[0];
      
      return {
        message: type === 'zip' ? 'ZIP 파일 저장 완료' : (type === 'binary' ? '바이너리 파일 저장 완료' : '파일 저장 완료'),
        data: {
          id: savedData.id,
          title: savedData.title,
          type: savedData.fileType,
          filePath: savedData.filePath,
          createdAt: this.formatToKoreanTime(savedData.createdAt),
          userIp: savedData.userIp,
        },
      };
    } catch (err) {
      console.error('업로드 에러:', err);
      throw new InternalServerErrorException('파일 업로드 중 문제가 발생했습니다: ' + (err.message || JSON.stringify(err)));
    }
  }
}
