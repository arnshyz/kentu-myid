import BackgroundParticles from "./components/BackgroundParticles";

import React from 'react';

const currency = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

const saveLocal = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const readLocal = (k, fb) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fb;
  } catch {
    return fb;
  }
};

const initialProducts = [
  {
    id: 'p-001',
    name: 'Sandal Jepit JND Classic',
    price: 19000,
    category: 'Sandal',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1480&auto=format&fit=crop',
    stock: 42,
    description: 'Empuk, anti slip, ringan.',
  },
  {
    id: 'p-002',
    name: 'Sandal Jepit JND Premium',
    price: 29000,
    category: 'Sandal',
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1480&auto=format&fit=crop',
    stock: 36,
    description: 'Tebal, kuat, nyaman outdoor.',
  },
  {
    id: 'p-003',
    name: 'T-Shirt KENTU Oversize',
    price: 59000,
    category: 'Apparel',
    image:
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1480&auto=format&fit=crop',
    stock: 25,
    description: 'Katun 24s, breathable.',
  },
];

const TIERS_META = { GUEST: 0, SILVER: 0.05, GOLD: 0.1, PLATINUM: 0.15 };
const TIER_LABEL = {
  GUEST: 'Guest',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
};

/* ---------------- Header ---------------- */
function Header({ onOpenCart, user, onOpenAccount }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="KENTU"
            className="w-8 h-8 rounded-xl object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
          <a href="#produk" className="hover:text-black">Katalog Produk</a>
          <a href="#membership" className="hover:text-black">Membership</a>
          <a href="#kontak" className="hover:text-black">Kontak</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAccount}
            className="rounded-2xl border px-3 py-1.5 text-sm hover:shadow"
          >
            {user ? user.name.split(' ')[0] : 'Masuk'}
          </button>
          <span className="rounded-full border px-2 py-0.5 text-xs">
            {user?.tierLabel || 'Guest'}
          </span>
          <button
            onClick={onOpenCart}
            className="rounded-2xl border px-3 py-1.5 text-sm hover:shadow"
          >
            Keranjang
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Price ---------------- */
function Price({ price, discount }) {
  if (!discount) return <div className="font-semibold">{currency(price)}</div>;
  const d = Math.round(discount * 100);
  const after = Math.round(price * (1 - discount));
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-neutral-400 line-through text-sm">
        {currency(price)}
      </span>
      <span className="font-semibold">{currency(after)}</span>
      <span className="text-xs rounded-full border px-2 py-0.5">
        -{d}% member
      </span>
    </div>
  );
}

/* ---------------- Product Card ---------------- */
function ProductCard({ p, onAdd, memberDiscount }) {
  return (
    <div className="group rounded-3xl border overflow-hidden hover:shadow-sm transition">
      <img src={p.image} alt={p.name} className="w-full h-52 object-cover" />
      <div className="p-4 space-y-2">
        <div className="text-sm text-neutral-500">{p.category}</div>
        <h3 className="font-semibold leading-tight">{p.name}</h3>
        <p className="text-neutral-600 text-sm min-h-10">{p.description}</p>
        <div className="flex items-center justify-between pt-2">
          <Price price={p.price} discount={memberDiscount} />
          <button
            onClick={() => onAdd(p)}
            className="rounded-xl border px-3 py-1.5 text-sm hover:shadow"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Account Modal (membership locked) ---------------- */
function AccountModal({ open, onClose, user, onSave, onLogout }) {
  if (!open) return null;

  const [name, setName] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [otpToken, setOtpToken] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [verified, setVerified] = React.useState(!!user?.verified);

  React.useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setVerified(!!user?.verified);
  }, [open]);

// CartDrawer
  function CartDrawer({ open, onClose, items, inc, dec, remove, onCheckout }) {
  if (!open) return null;
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white border-l rounded-l-3xl shadow-xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Keranjang</h3>
          <button onClick={onClose} className="rounded-xl border px-3 py-1.5 text-sm">Tutup</button>
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-neutral-600">Keranjang masih kosong.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3 items-center border rounded-2xl p-3">
                <img src={it.image} alt={it.name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-neutral-500">{it.category}</div>
                  <div className="text-sm mt-1">Rp {it.price.toLocaleString('id-ID')}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => dec(it.id)} className="rounded-lg border px-2">-</button>
                    <span className="w-8 text-center">{it.qty}</span>
                    <button onClick={() => inc(it.id)} className="rounded-lg border px-2">+</button>
                    <button onClick={() => remove(it.id)} className="ml-2 text-xs text-red-600 hover:underline">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-700">Subtotal</span>
            <span className="font-semibold">{new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(subtotal)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={!items.length}
            className="mt-3 w-full rounded-2xl bg-neutral-900 text-white px-4 py-2 text-sm disabled:opacity-50"
          >
            Bayar via Midtrans
          </button>
        </div>
      </div>
    </div>
  );
}

  
  // ESC to close
  React.useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // OPTIONAL: fetch tier from server (ensures correct tier display)
  React.useEffect(() => {
    if (!email) return;
    (async () => {
      try {
        const r = await fetch('/api/member-get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await r.json();
        if (data?.member?.tier) {
          onSave({
            name,
            email,
            phone,
            verified,
            // tier locked from server
          });
        }
      } catch {}
    })();
    // eslint-disable-next-line
  }, [email]);

  const requestOTP = async (channel) => {
    setSending(true);
    try {
      const body =
        channel === 'whatsapp' ? { channel, to: phone } : { channel: 'email', to: email };
      const r = await fetch('/api/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (data.ok) {
        setOtpToken(data.token);
        alert(
          'Kode OTP dikirim. Cek Email / WA Kamu'
        );
      } else alert('Gagal kirim OTP');
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    setVerifying(true);
    try {
      const r = await fetch('/api/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpToken, code: otpCode }),
      });
      const data = await r.json();
      if (data.ok) {
        setVerified(true);
        alert('Verifikasi berhasil');
      } else alert(data.error || 'Verifikasi gagal');
    } finally {
      setVerifying(false);
    }
  };

  const lockedTier = user?.tier || 'GUEST';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white border rounded-3xl shadow-xl">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold">Akun & Verifikasi</h3>
          <button onClick={onClose} className="rounded-xl border px-3 py-1.5 text-sm">
            Tutup
          </button>
        </div>

        <div className="p-5 space-y-3 text-sm">
          <label className="block">
            Nama
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-2xl border px-3 py-2"
              placeholder="Nama"
            />
          </label>

          <label className="block">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border px-3 py-2"
              placeholder="email@kamu.com"
            />
          </label>

          <label className="block">
            WhatsApp
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-2xl border px-3 py-2"
              placeholder="628xx..."
            />
          </label>

          {/* Tier: read-only */}
          <div className="block">
            <div className="text-[13px] text-neutral-600 mb-1">Tier</div>
            <div className="w-full rounded-2xl border px-3 py-2 bg-neutral-100">
              {lockedTier}
              <span className="ml-2 text-xs text-neutral-500">(hubungi admin untuk upgrade)</span>
            </div>
          </div>

          <div className="rounded-2xl border p-3">
            <div className="font-medium mb-2">Verifikasi OTP</div>
            <div className="flex gap-2">
              <button
                disabled={sending || !email}
                onClick={() => requestOTP('email')}
                className="rounded-2xl border px-3 py-1.5"
              >
                Kirim ke Email
              </button>
              <button
                disabled={sending || !phone}
                onClick={() => requestOTP('whatsapp')}
                className="rounded-2xl border px-3 py-1.5"
              >
                Kirim ke WhatsApp
              </button>
            </div>
            <div className="flex gap-2 mt-3 items-center">
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Masukkan OTP"
                className="flex-1 rounded-2xl border px-3 py-2"
              />
              <button
                disabled={verifying || !otpToken || !otpCode}
                onClick={verifyOTP}
                className="rounded-2xl bg-neutral-900 text-white px-4 py-2"
              >
                Verifikasi
              </button>
            </div>
            {verified && <div className="text-green-600 mt-2">✅ Akun terverifikasi</div>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onSave({ name, email, phone, verified })}
              className="rounded-2xl bg-neutral-900 text-white px-4 py-2"
            >
              Simpan
            </button>
            {user && (
              <button onClick={onLogout} className="rounded-2xl border px-4 py-2">
                Keluar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Thanks Page ---------------- */
function Thanks() {
  const params = new URLSearchParams(window.location.search);
  const order = params.get('order');
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <img src="/logo.png" alt="KENTU" className="mx-auto w-14 h-14 mb-4" />
      <h1 className="text-2xl md:text-3xl font-extrabold">
        Terima kasih! Pembayaran kamu sedang diproses.
      </h1>
      <p className="mt-3 text-neutral-700">
        {order ? `ID Pesanan: ${order}` : 'Cek email/WhatsApp untuk status terbaru.'}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <a
          href="/"
          className="rounded-2xl bg-neutral-900 text-white px-5 py-2.5 text-sm hover:opacity-90 hover:ring-2 hover:ring-neutral-900/30"
        >
          Kembali ke Beranda
        </a>
        <a
          href="#membership"
          className="rounded-2xl border px-5 py-2.5 text-sm hover:shadow hover:border-neutral-900"
        >
          Membership
        </a>
      </div>
    </div>
  );
}

/* ---------------- Admin ---------------- */
function AdminLogin({ onAuthed }) {
  const [pw, setPw] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await r.json();
      if (data.ok) {
        localStorage.setItem('kentu_admin_token', data.token);
        onAuthed();
      } else alert(data.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <img src="/logo.png" className="w-12 h-12 mb-4" alt="logo" />
      <h1 className="text-xl font-bold mb-2">Admin KENTU</h1>
      <p className="text-neutral-600 text-sm mb-4">
        Masukkan password admin untuk melanjutkan.
      </p>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        className="w-full rounded-2xl border px-3 py-2"
        placeholder="Admin password"
      />
      <button
        onClick={submit}
        disabled={loading || !pw}
        className="mt-3 w-full rounded-2xl bg-neutral-900 text-white px-4 py-2 text-sm"
      >
        Masuk
      </button>
    </div>
  );
}

function AdminPanel() {
  const token = localStorage.getItem('kentu_admin_token') || '';
  const [tab, setTab] = React.useState('orders');
  const [orders, setOrders] = React.useState([]);
  const [members, setMembers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin-orders', {
        headers: { 'X-Admin-Token': token },
      });
      const data = await r.json();
      const arr = data.data?.orders || data.data || [];
      setOrders(arr);
    } finally {
      setLoading(false);
    }
  };
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin-members', {
        headers: { 'X-Admin-Token': token },
      });
      const data = await r.json();
      const arr = data.data?.members || data.data || [];
      setMembers(arr);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (tab === 'orders') fetchOrders();
    else fetchMembers();
    // eslint-disable-next-line
  }, [tab]);

  const updateOrder = async (orderId, status) => {
    await fetch('/api/admin-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
      },
      body: JSON.stringify({ orderId, status }),
    });
    fetchOrders();
  };
  const updateMember = async (email, tier, verified) => {
    await fetch('/api/admin-members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
      },
      body: JSON.stringify({ email, tier, verified }),
    });
    fetchMembers();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('orders')}
            className={`rounded-2xl border px-3 py-1.5 text-sm ${
              tab === 'orders' ? 'bg-neutral-900 text-white' : ''
            }`}
          >
            Pesanan
          </button>
          <button
            onClick={() => setTab('members')}
            className={`rounded-2xl border px-3 py-1.5 text-sm ${
              tab === 'members' ? 'bg-neutral-900 text-white' : ''
            }`}
          >
            Membership
          </button>
        </div>
      </div>

      {tab === 'orders' ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-neutral-50">
              <tr>
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td className="p-3 text-center" colSpan="5">
                    {loading ? 'Memuat...' : 'Belum ada data'}
                  </td>
                </tr>
              ) : (
                orders.map((o, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{o.orderId}</td>
                    <td className="p-2 border">
                      {o.user?.name || '-'}
                      <div className="text-xs text-neutral-500">
                        {o.user?.email}
                      </div>
                    </td>
                    <td className="p-2 border">
                      {currency(o.total || 0)}
                    </td>
                    <td className="p-2 border">{o.status || 'NEW'}</td>
                    <td className="p-2 border">
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateOrder(o.orderId, 'PAID')}
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => updateOrder(o.orderId, 'SHIPPED')}
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          Shipped
                        </button>
                        <button
                          onClick={() => updateOrder(o.orderId, 'CLOSED')}
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-neutral-50">
              <tr>
                <th className="p-2 border">Nama</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Tier</th>
                <th className="p-2 border">Verified</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td className="p-3 text-center" colSpan="5">
                    {loading ? 'Memuat...' : 'Belum ada data'}
                  </td>
                </tr>
              ) : (
                members.map((m, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{m.name || '-'}</td>
                    <td className="p-2 border">{m.email || '-'}</td>
                    <td className="p-2 border">{m.tier || 'GUEST'}</td>
                    <td className="p-2 border">{m.verified ? 'Yes' : 'No'}</td>
                    <td className="p-2 border">
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            updateMember(m.email, 'SILVER', m.verified)
                          }
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          Silver
                        </button>
                        <button
                          onClick={() =>
                            updateMember(m.email, 'GOLD', m.verified)
                          }
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          Gold
                        </button>
                        <button
                          onClick={() =>
                            updateMember(m.email, 'PLATINUM', m.verified)
                          }
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          Platinum
                        </button>
                        <button
                          onClick={() =>
                            updateMember(m.email, m.tier, !m.verified)
                          }
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          {m.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Main App ---------------- */
function App() {
  // Route: Admin
  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
    const [authed, setAuthed] = React.useState(
      !!localStorage.getItem('kentu_admin_token')
    );
    return authed ? (
      <AdminPanel />
    ) : (
      <AdminLogin onAuthed={() => setAuthed(true)} />
    );
  }
  // Route: Thanks
  if (typeof window !== 'undefined' && window.location.pathname === '/thanks') {
    return <Thanks />;
  }

  const [products] = React.useState(initialProducts);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [cartOpen, setCartOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [cart, setCart] = React.useState(() => readLocal('kentu_cart', []));
  const [user, setUser] = React.useState(() => readLocal('kentu_user', null));

  React.useEffect(() => {
    saveLocal('kentu_cart', cart);
  }, [cart]);
  React.useEffect(() => {
    saveLocal('kentu_user', user);
  }, [user]);

  const categories = React.useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );
  const filtered = React.useMemo(
    () =>
      products.filter(
        (p) =>
          (!category || p.category === category) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()))
      ),
    [products, query, category]
  );

  const memberDiscount = TIERS_META[user?.tier || 'GUEST'] || 0;

  const addToCart = (p) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex)
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i
        );
      return [...prev, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  };
  const inc = (id) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i
      )
    );
  const dec = (id) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(i.qty - 1, 1)} : i
      )
    );
  const remove = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const checkout = async () => {
    const items = cart.map((it) => ({
      id: it.id,
      name: it.name,
      qty: it.qty,
      price: it.price,
    }));
    const orderId = 'KENTU-' + Date.now();
    try {
      const r = await fetch('/api/midtrans-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items, // kirim detail, bukan total
          customer: {
            first_name: user?.name,
            email: user?.email,
            phone: user?.phone,
          },
        }),
      });
      const data = await r.json();
      if (!data.ok) {
        alert('Gagal membuat transaksi: ' + (data.error || data.status_message));
        return;
      }
      window.open(data.redirect_url, '_blank');
    } catch (e) {
      alert('Error Midtrans: ' + e.message);
    }
    try {
      await fetch('/api/crm-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ORDER_CREATED',
          orderId,
          total: cart.reduce((s, it) => s + it.price * it.qty, 0), // info awal
          items,
          user: {
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
            tier: user?.tier || 'GUEST',
            verified: !!user?.verified,
          },
          ts: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.warn('CRM forward failed', e);
    }
  };

  const saveAccount = ({ name, email, phone, verified }) => {
    const lockedTier = user?.tier || 'GUEST';
    setUser({
      name,
      email,
      phone,
      tier: lockedTier,
      verified,
      tierLabel: TIER_LABEL[lockedTier] || 'Guest',
    });
    setAccountOpen(false);
  };

  return (
    <div className="min-h-screen">
      <BackgroundParticles count={70} />
      <Header
        onOpenCart={() => setCartOpen(true)}
        user={user}
        onOpenAccount={() => setAccountOpen(true)}
      />

      <main id="produk" className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold">Katalog Produk</h2>
            <p className="text-sm text-neutral-600">
              Login & verifikasi untuk harga member.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full md:flex-1 rounded-2xl border px-4 py-2"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border px-4 py-2"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              onAdd={addToCart}
              memberDiscount={TIERS_META[user?.tier || 'GUEST'] || 0}
            />
          ))}
        </div>

        <section id="membership" className="mt-10 rounded-3xl border p-6 bg-neutral-50">
          <h3 className="text-lg font-semibold mb-2">Membership & Verifikasi</h3>
          <p className="text-sm text-neutral-700">
            Tier: Silver (5%), Gold (10%), Platinum (15%). Verifikasi via email/WhatsApp OTP.
          </p>
          <button
            onClick={() => setAccountOpen(true)}
            className="mt-3 rounded-2xl bg-neutral-900 text-white px-4 py-2 text-sm"
          >
            Daftar / Kelola Akun
          </button>
        </section>

        <section className="mt-6 rounded-3xl border p-6">
          <h3 className="text-lg font-semibold mb-2">Checkout</h3>
          <div className="text-sm text-neutral-700">
            Subtotal: {currency(cart.reduce((s, it) => s + it.price * it.qty, 0))}{' '}
            — Diskon member (estimasi):{' '}
            {currency(
              Math.round(
                cart.reduce((s, it) => s + it.price * it.qty, 0) *
                  (TIERS_META[user?.tier || 'GUEST'] || 0)
              )
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={checkout}
              disabled={!cart.length}
              className="rounded-2xl bg-neutral-900 text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              Bayar via Midtrans
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="rounded-2xl border px-4 py-2 text-sm"
            >
              Lihat Keranjang
            </button>
          </div>
        </section>
      </main>

      <footer id="kontak" className="border-t mt-16">
        <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold mb-2">KENTU</div>
            <p className="text-neutral-600">
              E-commerce ringan untuk UMKM — verifikasi OTP, pembayaran Midtrans, & integrasi CRM.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">Kontak</div>
            <ul className="space-y-1">
              <li>WA: 082213316764</li>
              <li>Email: halo@kentu.my.id</li>
              <li>Surabaya, Indonesia</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Info</div>
            <ul className="space-y-1">
              <li><a href="#membership" className="hover:underline">Membership</a></li>
              <li><a href="#produk" className="hover:underline">Katalog</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-neutral-500 pb-8">
          © {new Date().getFullYear()} KENTU — kentu.my.id
        </div>
      </footer>

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={user}
        onSave={saveAccount}
        onLogout={() => {
          setUser(null);
          setAccountOpen(false);
        }}
      />
    </div>
  );
}

export default App;
