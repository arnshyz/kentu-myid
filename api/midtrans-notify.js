// Payment Notification webhook (set this URL in Midtrans Dashboard)
import crypto from 'crypto';

function validSignature(body, serverKey) {
  const raw = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
  const sig = crypto.createHash('sha512').update(raw).digest('hex');
  return sig === body.signature_key;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) return res.status(500).json({ error: 'MIDTRANS_SERVER_KEY missing' });

    if (!validSignature(body, serverKey)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const orderId = body.order_id;
    const status = body.transaction_status;
    let mapped = 'PENDING';
    if (status === 'settlement' || status === 'capture') mapped = 'PAID';
    if (status === 'cancel' || status === 'expire' || status === 'deny') mapped = 'CLOSED';

    // TODO: update order di CRM / database
    console.log('Order update:', orderId, mapped);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Notify error', e);
    return res.status(200).json({ ok: true, note: 'handled with warnings' });
  }
}
