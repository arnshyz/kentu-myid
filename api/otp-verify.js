
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { token, code } = req.body || {};
  if (!token || !code) return res.status(400).json({ error: 'Missing token/code' });
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    const fresh = Date.now() - payload.ts < 10 * 60 * 1000;
    if (!fresh) return res.status(400).json({ error: 'OTP expired' });
    if (payload.code !== code) return res.status(400).json({ error: 'Invalid OTP' });
    return res.status(200).json({ ok: true, verified: true, to: payload.to });
  } catch (e) {
    return res.status(400).json({ error: 'Invalid token' });
  }
}
