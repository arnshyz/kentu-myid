
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { orderId, amount, customer } = req.body || {};
  if (!orderId || !amount) return res.status(400).json({ error: 'Missing orderId/amount' });
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const baseUrl = process.env.MIDTRANS_BASE_URL || 'https://api.sandbox.midtrans.com';
  if (!serverKey) return res.status(400).json({ error: 'MIDTRANS_SERVER_KEY missing' });
  const auth = Buffer.from(serverKey + ':').toString('base64');
  const origin = `${(req.headers['x-forwarded-proto']||'https')}://${(req.headers['x-forwarded-host']||req.headers.host)}`;
  const payload = {
    transaction_details: { order_id: orderId, gross_amount: Math.round(amount) },
    customer_details: customer || {},
    credit_card: { secure: true },
    callbacks: { finish: `${origin}/thanks?order=${encodeURIComponent(orderId)}` }
  };
  try {
    const r = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json({ ok: true, token: data.token, redirect_url: data.redirect_url });
  } catch (e) {
    return res.status(500).json({ error: 'Midtrans error', details: e.message });
  }
}
