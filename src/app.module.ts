import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WriteModule } from './write/write.module';
import { Write } from './write/entity/write.entity';
import { WriteGetModule } from './write-get/write-get.module';
import { Connection } from 'typeorm';

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
        timezone: '+09:00',
      }),
      inject: [ConfigService],
    }),
    WriteModule,
    WriteGetModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'DATABASE_INITIALIZER',
      useFactory: async (connection: Connection) => {
        try {
          await connection.query("SET timezone = 'Asia/Seoul';");
          console.log('Database timezone set to Asia/Seoul');
        } catch (error) {
          console.error('Error setting database timezone:', error);
        }
      },
      inject: [Connection],
    },
  ],
})
export class AppModule {}
