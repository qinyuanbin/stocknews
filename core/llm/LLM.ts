export interface ChatParams { system?: string; user: string; temperature?: number }

export abstract class LLM {
  abstract chat(p: ChatParams): Promise<string>;
  abstract createEmbeddings(texts: string[]): Promise<Float32Array[]>;
  abstract createEmbeddings(texts: string[], batchSize: number): Promise<Float32Array[]>;
}
