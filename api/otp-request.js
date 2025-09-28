
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { channel = 'email', to } = req.body || {};
  if (!to) return res.status(400).json({ error: 'Missing recipient' });
  const code = ('' + Math.floor(100000 + Math.random() * 900000));
  const token = Buffer.from(JSON.stringify({ to, code, ts: Date.now() })).toString('base64url');
  try {
    if (channel === 'email') {
      const key = process.env.RESEND_API_KEY;
      if (!key) return res.status(200).json({ ok: true, token, demo: true });
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ from: 'KENTU <no-reply@kentu.my.id>', to: [to], subject: 'Kode OTP KENTU', text: `Kode OTP Anda: ${code}` })
      });
    } else if (channel === 'whatsapp') {
      const url = process.env.WHATSAPP_WEBHOOK_URL;
      const tokenWa = process.env.WHATSAPP_TOKEN;
      if (!url || !tokenWa) return res.status(200).json({ ok: true, token, demo: true });
      await fetch(url, { method: 'POST', headers: { 'Authorization': tokenWa, 'Content-Type':'application/json' }, body: JSON.stringify({ target: to, message: `Kode OTP Anda: ${code}` }) });
    }
    return res.status(200).json({ ok: true, token });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to send OTP', details: e.message });
  }
}
