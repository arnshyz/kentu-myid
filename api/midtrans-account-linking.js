// Account Linking Notification handler
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    // Contoh field yang dikirim Midtrans:
    // account_id, status, customer_id, channel_response, dll.

    const accountId = body.account_id;
    const status = body.status; // e.g. "linked", "unlinked", "failed"

    // TODO: Simpan status ke database/CRM kamu
    console.log("Account linking update:", accountId, status);

    // (Opsional) kirim notifikasi ke user/admin
    // await sendEmail(user.email, `Akun ${status}`);
    // await sendWA(user.phone, `Status akun: ${status}`);

    // Penting: balas 200 agar Midtrans berhenti retry
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Account linking notify error", e);
    // Tetap balas 200 agar Midtrans tidak spam retry
    return res.status(200).json({ ok: true, note: 'handled with warnings' });
  }
}
