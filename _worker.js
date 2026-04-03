/**
 * Brackenfell Gas – OCR Proxy
 * Cloudflare Pages Worker (_worker.js)
 * 
 * This file goes in the SAME folder as index.html when you upload to Cloudflare Pages.
 * It runs automatically — no separate Worker deployment needed.
 * 
 * Add these as Environment Variables in Cloudflare Pages dashboard:
 *   Settings → Environment Variables → Production:
 *   VISION_KEY = AIzaSyCeE9ZEGoBduSI78fKj43mYPL-Qlr6n0Eo
 *   CLAUDE_KEY = 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
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Only handle /ocr/vision and /ocr/claude — everything else serves static files
    if (path === '/ocr/vision' && request.method === 'POST') {
      try {
        const { base64 } = await request.json();
        const VISION_KEY = env.VISION_KEY || 'AIzaSyA_k3F4f5ZpMGoIFGmH2I9n3xMxrWzJSI0';
        
        const res = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`,
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
        return new Response(JSON.stringify(data), {
          status: res.status,
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    if (path === '/ocr/claude' && request.method === 'POST') {
      try {
        const body = await request.json();
        const CLAUDE_KEY = env.CLAUDE_KEY || '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';

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          status: res.status,
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    // Health check
    if (path === '/ocr/health') {
      return new Response(JSON.stringify({ ok: true, service: 'BG OCR Proxy' }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    // All other paths — let Cloudflare Pages serve static files
    return env.ASSETS.fetch(request);
  }
};
