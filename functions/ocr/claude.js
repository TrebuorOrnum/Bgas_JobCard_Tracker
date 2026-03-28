
const CLAUDE_KEY = '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';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const key = context.env.CLAUDE_KEY || CLAUDE_KEY;
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
    return Response.json(data, {
      status: res.status,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return Response.json({ error: e.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
