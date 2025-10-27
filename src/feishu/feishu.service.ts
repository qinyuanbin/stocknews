import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as lark from '@larksuiteoapi/node-sdk';

@Injectable()
export class FeishuService implements OnModuleInit {
  private readonly logger = new Logger(FeishuService.name);
  private client: lark.Client;
  private tenantToken = '';

  private appId: string;
  private appSecret: string;
  private defaultReceiveId: string;
  private receiveIdType: 'user_id' | 'chat_id' | 'email' | 'open_id';

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('FEISHU_APP_ID', '');
    this.appSecret = this.configService.get<string>('FEISHU_APP_SECRET', '');
    this.defaultReceiveId = this.configService.get<string>('FEISHU_RECEIVE_ID', '');
    this.receiveIdType = this.configService.get<'user_id' | 'chat_id' | 'email' | 'open_id'>('FEISHU_RECEIVE_ID_TYPE', 'user_id');
  }

  async onModuleInit() {
    this.client = new lark.Client({
      appId: this.appId,
      appSecret: this.appSecret,
      disableTokenCache: false,
    });
  }

  /**
   * 发送文本消息
   * @param text 消息文本
   * @param receiveId 接收者ID（默认从env读取）
   * @param receiveIdType user_id | chat_id | email | open_id
   */
  async sendTextMessage(
    text: string,
    receiveId: string = this.defaultReceiveId,
    receiveIdType: 'user_id' | 'chat_id' | 'email' | 'open_id' = this.receiveIdType,
  ) {
    try {
      const res = await this.client.im.v1.message.create(
        {
          params: { receive_id_type: receiveIdType },
          data: {
            receive_id: receiveId,
            msg_type: 'text',
            content: JSON.stringify({ text: `${text}` }),
          },
        },
        lark.withTenantToken(this.tenantToken),
      );

      if (res.code === 0) {
        this.logger.log(`✅ 飞书消息发送成功: ${text.slice(0, 30)}...`);
      } else {
        this.logger.error(`❌ 飞书消息发送失败: ${res.code} ${res.msg}`);
      }
    } catch (e) {
      this.logger.error('飞书消息发送异常: ' + e.message);
    }
  }
}
