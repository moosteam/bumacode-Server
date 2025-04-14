import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('딸깍 (bumacode)')
    .setDescription('[@https://github.com/moosteam/bumacode-Server](https://github.com/moosteam/bumacode-Server)')
    .setVersion('1.0')
    .addTag('Write', '코드, 파일, zip 포함 등록')
    .addTag('Write-Get', '데이터베이스에 저장된 코드, 파일 등의 정보를 가져옵니다.')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
