// Minimal local proxy to call AWS Bedrock securely during development.
// Do NOT deploy this with credentials baked into the client. Run locally only.
// Usage:
// 1) Set env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BEDROCK_MODEL_ID
// 2) npm run bedrock:proxy
// 3) In .env, set VITE_LOCAL_BEDROCK_PROXY_URL=http://localhost:8787/analyze-essay

import http from 'node:http';
import { BedrockRuntimeClient, InvokeModelCommand, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify(body));
}

function notFound(res) { json(res, 404, { error: 'Not found' }); }

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS); return res.end();
  }

  if (req.url !== '/analyze-essay') return notFound(res);
  if (req.method !== 'POST') return notFound(res);

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    const { essay } = JSON.parse(raw || '{}');

    if (!essay || typeof essay !== 'string' || essay.trim().length < 20) {
      return json(res, 400, { success: false, error: 'Missing or too-short essay text (min 20 chars).' });
    }

    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const modelId = process.env.BEDROCK_MODEL_ID;

    if (!accessKeyId || !secretAccessKey || !modelId) {
      return json(res, 500, { success: false, error: 'Server missing AWS credentials or model ID' });
    }

    const client = new BedrockRuntimeClient({ region, credentials: { accessKeyId, secretAccessKey } });

    const prompt = `You are an expert writing instructor. Analyze the student's essay and return JSON only with two arrays: "positiveFeedback" and "negativeFeedback".
Each array should contain concise bullet-style strings (max 1–2 sentences).
Return exactly this JSON shape: { "positiveFeedback": ["..."], "negativeFeedback": ["..."] }

Student essay:\n${essay}`;

    let textOut = '';
    try {
      const conv = await client.send(new ConverseCommand({
        modelId,
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { temperature: 0.3, maxTokens: 800, topP: 0.9 },
      }));
      const content = conv.output?.message?.content?.[0];
      if (content && 'text' in content && content.text) textOut = content.text;
    } catch (e) {
      const body = JSON.stringify({ prompt, temperature: 0.3, top_p: 0.9, max_gen_len: 800 });
      const resp = await client.send(new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: Buffer.from(body, 'utf8'),
      }));
      const decoded = Buffer.from(resp.body).toString('utf8');
      try {
        const parsed = JSON.parse(decoded);
        textOut = parsed.output_text ?? parsed.generated_text ?? decoded;
      } catch {
        textOut = decoded;
      }
    }

    if (!textOut) return json(res, 502, { success: false, error: 'Model returned empty output' });

    let jsonText = textOut.trim();
    const start = jsonText.indexOf('{'); const end = jsonText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) jsonText = jsonText.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const lines = textOut.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      parsed = { positiveFeedback: lines.slice(0, 4), negativeFeedback: lines.slice(4, 8) };
    }

    const positiveFeedback = Array.isArray(parsed.positiveFeedback) ? parsed.positiveFeedback : [];
    const negativeFeedback = Array.isArray(parsed.negativeFeedback) ? parsed.negativeFeedback : [];
    return json(res, 200, { success: true, positiveFeedback, negativeFeedback });
  } catch (err) {
    console.error('Proxy error:', err);
    return json(res, 500, { success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`[local-bedrock-proxy] listening on http://localhost:${PORT}/analyze-essay`);
});
