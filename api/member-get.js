// api/member-get.js
import fs from 'fs';
const TMP_FILE = '/tmp/kentu_members.json';

async function readLocal(){ try { return JSON.parse(fs.readFileSync(TMP_FILE,'utf8')); } catch { return []; } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  const crm = process.env.CRM_WEBHOOK_URL;
  if (crm) {
    try {
      const r = await fetch(crm, { method: 'POST', headers: { 'Content-Type':'application/json', 'X-CRM-Token': process.env.CRM_WEBHOOK_TOKEN || '' }, body: JSON.stringify({ admin_action:'LIST_MEMBERS' }) });
      const data = await r.json().catch(()=>({ members:[] }));
      const m = (data.members || []).find(x => (x.email||'').toLowerCase() === email.toLowerCase());
      return res.status(200).json({ ok:true, member: m || null, source:'crm' });
    } catch {}
  }
  const list = await readLocal();
  const m = list.find(x => (x.email||'').toLowerCase() === email.toLowerCase()) || null;
  return res.status(200).json({ ok:true, member: m, source:'local' });
}
