// File: api/member-get.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return res.status(500).json({ error: 'CRM_WEBHOOK_URL not set' });
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CRM-Token': process.env.CRM_WEBHOOK_TOKEN || ''
      },
      body: JSON.stringify({ admin_action: 'LIST_MEMBERS' })
    });
    const data = await r.json();
    const member = (data.members || []).find(
      (m) => (m.email || '').toLowerCase() === email.toLowerCase()
    ) || null;
    return res.status(200).json({ ok: true, member, source: 'crm' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'crm error' });
  }
}
