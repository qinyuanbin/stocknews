// llm/index.ts
import { LLMProxy } from "./LLMProxy";

export { LLM, ChatParams } from "./LLM";

// 初始化并注册（如果你有 register 方法，可以放这里）
const llm = new LLMProxy();

// 可选：提前懒加载默认模型
// void llm.chat("init").catch(() => {});

export default llm;
