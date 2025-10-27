import OpenAI from 'openai';
import { LLM, ChatParams } from './LLM';

export class QwenLLM extends LLM {
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: process.env.QWEN_API_KEY, // 在 .env 配置
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
  }

  async chat(p: ChatParams): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (p.system) {
      messages.push({ role: 'system', content: p.system });
    }
    messages.push({ role: 'user', content: p.user });

    const resp = await this.client.chat.completions.create({
      model: process.env.QWEN_MODEL?.trim() ?? '',
      messages,
      temperature: p.temperature ?? 0.7,
    });

    return resp.choices[0]?.message?.content ?? '';
  }

  /**
   * 创建文本向量
   * @param text 输入文本
   * @param model 可选模型名称，如果未指定或无效，使用默认模型
   */
  async createEmbeddings(texts: string[]): Promise<Float32Array[]> {
    const chosenModel = process.env.QWEN_EMBEDDING_MODEL?.trim() || '';

    // 简单校验模型名
    if (!chosenModel) {
      throw new Error('未指定有效 embedding 模型，请检查环境变量 QWEN_EMBEDDING_MODEL 或传入 model 参数');
    }

    try {
      const res = await this.client.embeddings.create({
        model: chosenModel,
        input: texts,
      });

      if (!res.data?.[0]?.embedding) {
        throw new Error('Embedding API 返回异常，未包含 embedding 数据');
      }

      return res.data.map(item => new Float32Array(item.embedding));
    } catch (err: any) {
      console.error('生成 embedding 出错:', err.message || err);
      throw err;
    }
  }
}
