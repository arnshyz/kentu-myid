# KENTU — kentu.my.id

Simple e‑commerce (React + Vite + Tailwind). Cart in localStorage, checkout via WhatsApp.

## Quick Start (Local)
```bash
npm i
npm run dev
```

## Deploy to Vercel
1. Push folder ini ke GitHub (atau import langsung di Vercel).
2. Di Vercel → **New Project** → pilih repo → deploy. Vercel akan autodetect `vite`.
3. Setelah live (domain *.vercel.app), buka **Settings → Domains → Add** dan masukkan `kentu.my.id`.
4. Di panel domain (registrar my.id), arahkan:
   - **Cara 1 (nameserver)**: ganti nameserver ke milik Vercel (ditampilkan di panel Vercel).
   - **Cara 2 (DNS manual)**: buat CNAME `kentu.my.id` → target ke domain *.vercel.app proyek Anda.

> Tunggu propagasi DNS beberapa menit.

## Kustomisasi
- Edit katalog di `src/App.jsx` (array `initialProducts`).
- Ganti nomor WhatsApp admin di fungsi `handleCheckout()` (format 62, tanpa +).
- Ubah teks footer (WA, email, alamat).

## Tambahan
- Ingin payment gateway? Tambahkan serverless function (Vercel) untuk membuat invoice/VA dari Midtrans/Xendit, dan panggil setelah checkout.
