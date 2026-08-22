import { env } from "../env.js";

export interface AISummarizerInput {
  postContent: string;
  comments: Array<{ id: string; body: string }>;
}

export interface AISummarizerOutput {
  postSnapshot: string;
  keyHighlights: string[];
  sentiment: string;
}

export interface AISummarizerProvider {
  generateSummary(input: AISummarizerInput): Promise<AISummarizerOutput>;
}

export class DefaultAISummarizerProvider implements AISummarizerProvider {
  async generateSummary(input: AISummarizerInput): Promise<AISummarizerOutput> {
    const apiKey = (env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "").trim();

    if (apiKey && process.env.NODE_ENV !== "test" && !apiKey.includes("your_") && apiKey.length > 10) {
      try {
        return await this.callLLM(apiKey, input);
      } catch (err) {
        console.error("[AISummarizer] ❌ DETAILED ERROR: LLM call failed. Reason:", err);
        return this.generateFallbackSummary(input);
      }
    }

    return this.generateFallbackSummary(input);
  }

  private async callLLM(apiKey: string, input: AISummarizerInput): Promise<AISummarizerOutput> {
    const prompt = this.buildPrompt(input);
    const models = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.5-flash"];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              const cleanText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
              const parsed = JSON.parse(cleanText);
              return {
                postSnapshot: parsed.postSnapshot || "Summary unavailable",
                keyHighlights: Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights : [],
                sentiment: parsed.sentiment || "Neutral",
              };
            } catch (parseError) {
              console.error("[AISummarizer] Failed to parse JSON from LLM. Raw text was:", rawText);
              throw parseError;
            }
          }
        } else {
          const errorText = await response.text();
          lastError = new Error(`LLM API (${model}) returned status ${response.status}. Body: ${errorText}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error("All LLM API endpoints failed");
  }

  private buildPrompt(input: AISummarizerInput): string {
    const commentsText = input.comments.map((c, i) => `Comment ${i + 1}: "${c.body}"`).join("\n");
    return `You are a community forum post summarizer. Analyze the post and selected comments below and output JSON with keys: "postSnapshot" (1-2 sentences), "keyHighlights" (array of 2-4 bullet strings summarizing key discussion points), and "sentiment" (e.g. "Supportive", "Divided", "Constructive", "Mixed").

Post Body:
"${input.postContent}"

Selected Comments (${input.comments.length}):
${commentsText || "No comments."}
`;
  }

  private generateFallbackSummary(input: AISummarizerInput): AISummarizerOutput {
    const cleanBody = input.postContent.trim();
    const postSnapshot = cleanBody
      ? (cleanBody.length > 150 ? cleanBody.substring(0, 150) + "..." : cleanBody)
      : "The post discusses community ideas and feedback.";

    const keyHighlights: string[] = [];
    if (input.comments.length > 0) {
      input.comments.slice(0, 3).forEach((c) => {
        const text = c.body.trim();
        if (text) {
          keyHighlights.push(text.length > 100 ? text.substring(0, 100) + "..." : text);
        }
      });
    }

    if (keyHighlights.length === 0) {
      keyHighlights.push("No community comments provided yet.");
    }

    return {
      postSnapshot,
      keyHighlights,
      sentiment: input.comments.length > 0 ? "Active Community Discussion" : "Neutral",
    };
  }
}

export const aiSummarizer = new DefaultAISummarizerProvider();
