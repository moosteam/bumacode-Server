import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WriteModule } from './write/write.module';
import { Write } from './write/entity/write.entity';
import { WriteGetModule } from './write-get/write-get.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [Write],
      }),
      inject: [ConfigService],
    }),
    WriteModule,
    WriteGetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
