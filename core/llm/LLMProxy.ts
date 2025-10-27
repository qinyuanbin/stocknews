// llm/LLMProxy.ts
import { ChatParams, LLM } from "./LLM";
import { QwenLLM } from "./QwenLLM";
import pLimit from "p-limit";

export class LLMProxy implements LLM {
  // 存放实例（缓存）
  private instances: Partial<Record<string, LLM>> = {};

  // 懒加载构造函数映射表
  private factories: Record<string, () => LLM> = {
    qwen: () => new QwenLLM(),
  };

  private get activeProvider(): LLM {
    const key = process.env.LLM_PROVIDER || "qwen";

    // 如果已有实例，直接复用
    if (this.instances[key]) return this.instances[key]!;

    const factory = this.factories[key];
    if (!factory) throw new Error(`未知的 LLM_PROVIDER: ${key}`);

    // 首次访问时实例化并缓存
    const instance = factory();
    this.instances[key] = instance;
    return instance;
  }

  async chat(p: ChatParams): Promise<string> {
    return this.activeProvider.chat(p);
  }

  /**
   * 批量生成 embedding
   * @param texts 字符串数组
   * @param batchSize 每批大小（可调整）
   */
  async createEmbeddings(texts: string[], batchSize = 10): Promise<Float32Array[]> {
    const limit = pLimit(3); // 并发批次数量，可调
    const allEmbeddings: Float32Array[] = [];

    const tasks: any[] = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      tasks.push(
        limit(async () => {
          const res = await this.activeProvider.createEmbeddings(batch);
          // res 应该返回 Float32Array[]，对应 batch 的顺序
          allEmbeddings.push(...res);
        })
      );
    }

    await Promise.all(tasks);
    return allEmbeddings;
  }
}
