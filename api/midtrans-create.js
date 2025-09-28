// api/midtrans-create.js (secure version)
import fs from 'fs';
const TMP_MEMBERS = '/tmp/kentu_members.json';

async function getMemberByEmail(email) {
  const crm = process.env.CRM_WEBHOOK_URL;
  if (crm) {
    try {
      const r = await fetch(crm, { method:'POST',
        headers: { 'Content-Type':'application/json', 'X-CRM-Token': process.env.CRM_WEBHOOK_TOKEN || '' },
        body: JSON.stringify({ admin_action:'LIST_MEMBERS' })
      });
      const data = await r.json().catch(()=>({members:[]}));
      return (data.members||[]).find(m => (m.email||'').toLowerCase() === (email||'').toLowerCase()) || null;
    } catch {}
  }
  try {
    const arr = JSON.parse(fs.readFileSync(TMP_MEMBERS,'utf8'));
    return arr.find(m => (m.email||'').toLowerCase() === (email||'').toLowerCase()) || null;
  } catch { return null; }
}

const TIERS_META = { GUEST:0, SILVER:0.05, GOLD:0.10, PLATINUM:0.15 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, items = [], customer = {} } = req.body || {};
  if (!orderId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing orderId/items' });
  }

  const subtotal = items.reduce((s, it) => s + (Number(it.price)||0) * (Number(it.qty)||0), 0);
  const member = customer.email ? await getMemberByEmail(customer.email) : null;
  const tier = (member?.tier || 'GUEST').toUpperCase();
  const discountPct = TIERS_META[tier] || 0;
  const discount = Math.round(subtotal * discountPct);
  const total = Math.max(0, subtotal - discount);

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const baseUrl = process.env.MIDTRANS_BASE_URL || 'https://api.sandbox.midtrans.com';
  if (!serverKey) return res.status(400).json({ error: 'MIDTRANS_SERVER_KEY missing' });

  const auth = Buffer.from(serverKey + ':').toString('base64');
  const origin = `${(req.headers['x-forwarded-proto']||'https')}://${(req.headers['x-forwarded-host']||req.headers.host)}`;

  const payload = {
    transaction_details: { order_id: orderId, gross_amount: Math.round(total) },
    customer_details: customer || {},
    item_details: items.map(it => ({ id: it.id, name: it.name, price: Math.round(it.price), quantity: Math.round(it.qty) })),
    credit_card: { secure: true },
    callbacks: { finish: `${origin}/thanks?order=${encodeURIComponent(orderId)}` },
    custom_field1: tier,
  };

  try {
    const r = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json({ ok:true, token: data.token, redirect_url: data.redirect_url, server_total: total, tier_used: tier });
  } catch (e) {
    return res.status(500).json({ error: 'Midtrans error', details: e.message });
  }
}
