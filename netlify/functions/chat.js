// netlify/functions/chat.js
// ---------------------------------------------------------------------------
// Provider adapter. The browser sends { system, user } and gets back { text }.
// The API key lives here as an environment variable and never reaches the
// browser. To swap from OpenAI to Anthropic later, change ONLY this file.
// ---------------------------------------------------------------------------

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// Confirm the exact model ID in your OpenAI dashboard. Override without
// touching code by setting OPENAI_MODEL in Netlify environment variables.
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return json(500, { error: "Server is missing OPENAI_API_KEY. Set it in Netlify environment variables." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Request body was not valid JSON." });
  }

  const system = String(payload.system || "");
  const user = String(payload.user || "");
  if (!user) return json(400, { error: "No user message supplied." });

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        // GPT-5 family uses max_completion_tokens (not max_tokens).
        // Kept generous so reasoning models do not run out before answering.
        max_completion_tokens: 2000
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      return json(502, { error: "OpenAI returned an error.", status: res.status, detail: detail.slice(0, 600) });
    }

    const data = await res.json();
    const text =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

    return json(200, { text: text.trim() });
  } catch (err) {
    return json(502, { error: "Could not reach OpenAI.", detail: String(err) });
  }
};

function json(statusCode, obj) {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  };
}
