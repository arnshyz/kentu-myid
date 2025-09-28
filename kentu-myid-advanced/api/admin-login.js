
import crypto from 'crypto';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password } = req.body || {};
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return res.status(500).json({ error: 'ADMIN_PASSWORD not set' });
  if (!password) return res.status(400).json({ error: 'Missing password' });
  if (password !== adminPw) return res.status(401).json({ error: 'Invalid password' });
  const ts = Date.now();
  const sig = crypto.createHmac('sha256', adminPw).update(String(ts)).digest('hex');
  const token = Buffer.from(JSON.stringify({ ts, sig })).toString('base64url');
  return res.status(200).json({ ok: true, token, exp: ts + 12*60*60*1000 });
}
