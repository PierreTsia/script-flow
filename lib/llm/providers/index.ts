export type LLMOptions = {
  apiKey: string;
  baseURL?: string;
};

export interface LLMProvider {
  analyzeScene(text: string): Promise<string>;
}
