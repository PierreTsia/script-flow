import { LLMProvider, LLMOptions } from "@/lib/llm/providers";
import buildPrompt from "@/lib/llm/prompts";

export class MistralProvider implements LLMProvider {
  private apiKey: string;
  private baseURL = "https://api.mistral.ai/v1";

  constructor({ apiKey, baseURL }: LLMOptions) {
    this.apiKey = apiKey;
    if (baseURL) this.baseURL = baseURL;
  }

  async analyzeScene(text: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: buildPrompt(text) }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
