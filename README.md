
# KENTU Advanced — kentu.my.id

Fitur: Membership + OTP (email/WA), Payment Gateway (Midtrans Snap), CRM webhook, halaman Thanks, dan Admin Panel.

## Jalankan Lokal
```bash
npm i
npm run dev
```

## Deploy ke Vercel
Tambahkan Environment Variables:
- MIDTRANS_SERVER_KEY (sandbox/production)
- MIDTRANS_BASE_URL = https://api.sandbox.midtrans.com
- RESEND_API_KEY (opsional)
- WHATSAPP_WEBHOOK_URL, WHATSAPP_TOKEN (opsional untuk OTP via WA)
- CRM_WEBHOOK_URL (opsional), CRM_WEBHOOK_TOKEN (opsional)
- ADMIN_PASSWORD (untuk login /admin)

## Routes
- `/` — toko utama
- `/thanks?order=...` — halaman terima kasih (redirect dari Snap)
- `/admin` — Admin Panel (login required)
