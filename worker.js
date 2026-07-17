/* =====================================================
   Cloudflare Worker — secure proxy for the L'Oréal chatbot

   Why this exists:
   The OpenAI API key must NEVER appear in front-end code,
   where anyone could read it in DevTools. Instead, the
   browser sends chat messages here; the Worker attaches
   the secret key (stored as an encrypted environment
   variable) and forwards the request to OpenAI.

   Setup:
   1. Create a Worker in the Cloudflare dashboard.
   2. Paste this code in.
   3. Settings → Variables → add secret: OPENAI_API_TOKEN
   4. Deploy, then copy the Worker URL into script.js.
   ===================================================== */

// CORS headers so your GitHub Pages / local site can call the Worker.
// For extra security, replace "*" with your site's exact origin,
// e.g. "https://yourusername.github.io"
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Handle the browser's CORS preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
      const { messages } = await request.json();

      // Basic validation: only accept a well-formed messages array
      if (!Array.isArray(messages) || messages.length === 0) {
        return jsonResponse({ error: "Invalid request body" }, 400);
      }

      // Forward to OpenAI with the secret key from Worker env vars
      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.OPENAI_API_TOKEN}`,
          },
          body: JSON.stringify({
            model: "gpt-5",
            messages: messages,
            max_completion_tokens: 2000,
          }),
        }
      );

      const data = await openaiResponse.json();
      return jsonResponse(data, openaiResponse.status);
    } catch (err) {
      return jsonResponse({ error: "Server error", detail: err.message }, 500);
    }
  },
};

// Small helper for JSON responses with CORS headers attached
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
