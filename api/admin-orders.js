
import crypto from 'crypto';
function verifyToken(token, secret) {
  try {
    const { ts, sig } = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    const ok = crypto.createHmac('sha256', secret).update(String(ts)).digest('hex') === sig;
    const fresh = (Date.now() - ts) < 12*60*60*1000;
    return ok && fresh;
  } catch { return false; }
}

import fs from 'fs';
const TMP_FILE = '/tmp/kentu_orders.json';
async function readLocal(){ try { return JSON.parse(fs.readFileSync(TMP_FILE,'utf8')); } catch { return []; } }
async function writeLocal(data){ fs.writeFileSync(TMP_FILE, JSON.stringify(data)); }

export default async function handler(req, res) {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return res.status(500).json({ error: 'ADMIN_PASSWORD not set' });
  const token = req.headers['x-admin-token'];
  if (!token || !verifyToken(token, adminPw)) return res.status(401).json({ error: 'Unauthorized' });

  const crm = process.env.CRM_WEBHOOK_URL;

  if (req.method === 'GET') {
    if (crm) {
      try {
        const r = await fetch(crm, { method:'POST',
          headers: { 'Content-Type':'application/json', 'X-CRM-Token': process.env.CRM_WEBHOOK_TOKEN || '' },
          body: JSON.stringify({ admin_action:'LIST_ORDERS' })
        });
        const data = await r.json().catch(()=>({ raw:true }));
        return res.status(200).json({ ok:true, source:'crm', data });
      } catch {}
    }
    const data = await readLocal();
    return res.status(200).json({ ok:true, source:'local', data });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (crm) {
      try {
        const r = await fetch(crm, { method:'POST',
          headers: { 'Content-Type':'application/json', 'X-CRM-Token': process.env.CRM_WEBHOOK_TOKEN || '' },
          body: JSON.stringify({ admin_action:'UPDATE_ORDER', ...body })
        });
        const text = await r.text();
        return res.status(200).json({ ok:true, source:'crm', resp:text });
      } catch {}
    }
    const orders = await readLocal();
    const i = orders.findIndex(o => o.orderId === body.orderId);
    if (i >= 0) orders[i] = { ...orders[i], status: body.status || orders[i].status };
    await writeLocal(orders);
    return res.status(200).json({ ok:true, source:'local' });
  }

  return res.status(405).json({ error:'Method not allowed' });
}
