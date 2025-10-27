import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeishuService } from './feishu.service';

@Module({
  imports: [ConfigModule],
  providers: [FeishuService],
  exports: [FeishuService],
})
export class FeishuModule {}
