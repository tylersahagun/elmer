import { mcpGet } from "../convex-client.js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface ConvexDocumentFull {
  _id: string;
  title: string;
  type: string;
  content: string;
  version: number;
}

async function fetchDocument(documentId: string): Promise<ConvexDocumentFull> {
  const doc = await mcpGet("/documents", { id: documentId }) as ConvexDocumentFull;
  if (!doc || !doc._id) {
    throw new Error(`Document not found: ${documentId}`);
  }
  return doc;
}

async function callAnthropicWithDoc(docContent: string, docTitle: string, question: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    // Fallback: basic text excerpt answer without LLM
    const excerpt = docContent.slice(0, 500);
    return `[No ANTHROPIC_API_KEY configured — document excerpt]\n\n${excerpt}${docContent.length > 500 ? "…" : ""}`;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `You are a helpful assistant answering questions about a product document. 
Answer concisely and accurately based only on the document content provided. 
If the document doesn't contain the answer, say so clearly.`,
      messages: [
        {
          role: "user",
          content: `Document title: ${docTitle}\n\nDocument content:\n${docContent}\n\n---\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text?: string }>;
  };

  const textBlock = data.content.find((c) => c.type === "text");
  return textBlock?.text ?? "No response generated.";
}

export async function discussDocument(documentId: string, question: string): Promise<string> {
  const doc = await fetchDocument(documentId);
  const answer = await callAnthropicWithDoc(doc.content, doc.title, question);
  return `# Answer about "${doc.title}"\n\n${answer}`;
}
