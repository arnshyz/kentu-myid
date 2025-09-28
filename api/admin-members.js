// File: api/admin-members.js
// Admin endpoint to LIST/UPDATE members using Google Sheets CRM webhook
import crypto from 'crypto';

function requireAdmin(req){
  const token = req.headers['x-admin-token'] || '';
  const expect = (process.env.ADMIN_PASSWORD || '').trim();
  if (!expect) throw new Error('ADMIN_PASSWORD not set');
  if (!token || token !== crypto.createHash('sha256').update(expect).digest('hex')) {
    const ok = token === expect; // backward compatibility if client still sends plain password
    if (!ok) throw new Error('Unauthorized');
  }
}

async function callCRM(payload){
  const url = process.env.CRM_WEBHOOK_URL;
  const secret = process.env.CRM_WEBHOOK_TOKEN || '';
  if (!url) throw new Error('CRM_WEBHOOK_URL not set');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'X-CRM-Token': secret },
    body: JSON.stringify(payload)
  });
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { ok: r.ok, raw: text }; }
}

export default async function handler(req, res){
  try {
    requireAdmin(req);

    if (req.method === 'GET'){
      const data = await callCRM({ admin_action:'LIST_MEMBERS' });
      return res.status(200).json({ ok:true, data });
    }

    if (req.method === 'POST'){
      const body = req.body || {};
      if (!body.email) return res.status(400).json({ error:'email required' });
      const resp = await callCRM({
        admin_action: 'UPDATE_MEMBER',
        email: body.email,
        name: body.name,
        phone: body.phone,
        tier: body.tier,
        verified: body.verified
      });
      return res.status(200).json({ ok:true, data: resp });
    }

    return res.status(405).json({ error:'Method not allowed' });
  } catch (e){
    return res.status(401).json({ error: e.message || 'Unauthorized' });
  }
}
