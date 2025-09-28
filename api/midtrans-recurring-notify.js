// Recurring (Subscription) HTTP Notification handler
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    // Contoh field yang biasa muncul (cek docs Midtrans Subscription HTTP Notification)
    // body.subscription_id, body.status, body.schedule, body.saved_token_id, dll.

    const subscriptionId = body.subscription_id;
    const status = body.status; // e.g. "active" | "inactive" | "expire" | "failed" | "success"
    const orderId = body.order_id; // untuk payment attempt-nya (jika ada)
    const txStatus = body.transaction_status; // e.g. "settlement", "pending", "deny" (jika ada)

    // TODO: mapping & handling sesuai kebutuhan sistem kamu
    // Misal: jika txStatus === 'settlement' → tandai invoice berlangganan bulan ini = PAID
    //        jika status === 'failed' → catat kegagalan & notifikasi user/admin

    // (opsional) sinkronkan ke CRM atau DB kamu
    // await fetch(process.env.CRM_WEBHOOK_URL, { ... });

    // Penting: balas 200 agar Midtrans tidak retry terus
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Recurring notify error', e);
    // tetap balas 200 agar tidak banjir retry; log untuk investigasi
    return res.status(200).json({ ok: true, note: 'handled with warnings' });
  }
}
