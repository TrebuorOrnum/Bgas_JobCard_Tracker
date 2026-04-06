const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle Preflight CORS requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // 1️⃣ GOOGLE VISION ROUTE
    if (path === "/ocr/vision" && request.method === "POST") {
      try {
        const { base64 } = await request.json();
        const key = env.VISION_KEY || "AIzaSyA_k3F4f5ZpMGoIFGmH2I9n3xMxrWzJSI0";

        const res = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { content: base64 },
                features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
              }]
            })
          }
        );

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
      }
    }

    // 2️⃣ CLAUDE ROUTE
    if (path === "/ocr/claude" && request.method === "POST") {
      try {
        const body = await request.json();
        const key = env.CLAUDE_KEY || "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";

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: res.status, headers: { ...CORS, "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
      }
    }

    // HEALTH CHECK
    if (path === "/ocr/health") {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  }
};
