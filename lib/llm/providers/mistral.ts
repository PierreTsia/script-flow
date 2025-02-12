import { LLMProvider, LLMOptions } from "@/lib/llm/providers";
import { HeliconeManualLogger } from "@helicone/helpers";
import buildPrompt from "@/lib/llm/prompts";

export class MistralProvider implements LLMProvider {
  private heliconeLogger: HeliconeManualLogger;
  private apiKey: string;
  private baseURL = "https://api.mistral.ai/v1";
  private model = "mistral-small-latest";

  constructor({ apiKey, baseURL }: LLMOptions) {
    this.apiKey = apiKey;
    if (baseURL) this.baseURL = baseURL;
    this.heliconeLogger = new HeliconeManualLogger({
      apiKey: process.env.HELICONE_API_KEY!,
      headers: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        "Helicone-Property-Project": "script-flow",
      },
    });
  }

  async analyzeScene(text: string): Promise<string> {
    return this.heliconeLogger.logRequest(
      {
        _type: "tool",
        toolName: "mistral",
        input: {
          model: this.model,
          prompt: text,
        },
      },
      async (resultRecorder) => {
        try {
          const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: this.model,
              messages: [{ role: "user", content: buildPrompt(text) }],
              temperature: 0.7,
              max_tokens: 500,
            }),
          });

          if (!response.ok) {
            throw new Error(`Mistral API failed: ${response.statusText}`);
          }

          const data = await response.json();
          resultRecorder.appendResults({
            status: response.status,
            response: data.choices[0].message.content,
          });

          return data.choices[0].message.content;
        } catch (error) {
          resultRecorder.appendResults({
            error: error instanceof Error ? error.message : "Unknown error",
            status: 500,
          });
          throw error;
        }
      }
    );
  }
}
