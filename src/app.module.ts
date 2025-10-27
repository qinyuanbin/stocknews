import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsEntity } from './news/news.entity';
import { NewsService } from './news/news.service';
import { NewsController } from './news/news.controller';
import { ScraperService } from './scraper/scraper.service';
import { ConfigModule } from '@nestjs/config';
import { FeishuModule } from './feishu/feishu.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sqlite.db',
      entities: [NewsEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([NewsEntity]),
    FeishuModule,
    ConfigModule.forRoot({ isGlobal: true }), // ✅ 读取 .env 文件
  ],
  controllers: [NewsController],
  providers: [NewsService, ScraperService],
})
export class AppModule {}
