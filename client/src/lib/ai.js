/**
 * QuoteFlow AI — OpenAI service
 *
 * NOTE: For production, move these calls to a server-side proxy
 * (Supabase Edge Function, Next.js API route, etc.) so the API key
 * is not exposed in the browser bundle.
 *
 * For portfolio/demo: key lives in .env as VITE_OPENAI_API_KEY.
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

async function chat(systemPrompt, userPrompt) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing VITE_OPENAI_API_KEY in .env — AI features are disabled."
    );
  }

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

/**
 * Suggest a price range for a given item.
 * Returns an object: { min, max, unit, reasoning }
 */
export async function suggestPrice(itemName) {
  const system = `You are a pricing assistant for an Indian B2B quotation tool. 
When given a product or service name, respond with ONLY a JSON object like:
{"min": 5000, "max": 8000, "unit": "per unit", "reasoning": "brief one-line reason"}
Use INR (₹). No markdown, no extra text.`;

  const text = await chat(system, `Suggest a market price range for: ${itemName}`);

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Generate a professional one-line item description.
 * Returns a plain string.
 */
export async function generateItemDescription(itemName) {
  const system = `You are a professional copywriter for B2B quotations in India.
Write a concise, professional one-line description for a product or service.
Reply with ONLY the description — no quotes, no punctuation at the end, no extra text.`;

  return chat(system, `Write a description for: ${itemName}`);
}

/**
 * Generate an executive summary for a quote.
 * Returns a plain string paragraph.
 */
export async function generateQuoteSummary({ customerName, items, grandTotal }) {
  const system = `You are a professional business writer helping generate quotation summaries for Indian businesses.
Write a concise 2-3 sentence executive summary for a quotation. 
Be professional, specific, and mention the customer name and key items.
Reply with ONLY the paragraph — no headers, no bullet points.`;

  const itemList = items
    .filter((i) => i.itemName?.trim())
    .map((i) => `${i.itemName} (qty: ${i.quantity}, ₹${i.price} each)`)
    .join(", ");

  const prompt = `Customer: ${customerName}
Items: ${itemList}
Grand Total: ₹${grandTotal.toFixed(2)}`;

  return chat(system, prompt);
}
