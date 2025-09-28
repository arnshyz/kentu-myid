
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return res.status(400).json({ error: 'CRM_WEBHOOK_URL missing' });
  const token = process.env.CRM_WEBHOOK_TOKEN;
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-CRM-Token': token } : {}) }, body: JSON.stringify(req.body || {}) });
    const text = await r.text();
    return res.status(200).json({ ok: true, status: r.status, body: text });
  } catch (e) {
    return res.status(500).json({ error: 'CRM forward failed', details: e.message });
  }
}
