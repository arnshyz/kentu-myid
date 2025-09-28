import React, { useEffect, useMemo, useState } from "react";
/** @typedef {{ id:string; name:string; price:number; category:string; image:string; stock:number; description?:string; }} Product */
const initialProducts = [
  { id: "p-001", name: "Sandal Jepit JND Classic", price: 19000, category: "Sandal", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1480&auto=format&fit=crop", stock: 42, description: "Sandal jepit harian empuk, anti slip, ringan." },
  { id: "p-002", name: "Sandal Jepit JND Premium", price: 29000, category: "Sandal", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1480&auto=format&fit=crop", stock: 36, description: "Material tebal, bandul kuat, nyaman outdoor." },
  { id: "p-003", name: "T-Shirt KENTU Oversize", price: 59000, category: "Apparel", image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1480&auto=format&fit=crop", stock: 25, description: "Katun 24s, breathable, sablon plastisol." },
  { id: "p-004", name: "Topi Trucker KENTU", price: 39000, category: "Aksesoris", image: "https://images.unsplash.com/photo-1520975682031-9240dad70b12?q=80&w=1480&auto=format&fit=crop", stock: 18, description: "Jaring belakang, nyaman harian." },
  { id: "p-005", name: "Tas Selempang KENTU", price: 99000, category: "Aksesoris", image: "https://images.unsplash.com/photo-1593034098168-6b8c8ef6609a?q=80&w=1480&auto=format&fit=crop", stock: 12, description: "Kompak, banyak kompartemen, water resistant." },
];
const currency = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const saveLocal = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const readLocal = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const TIERS = [
  { key: "GUEST", label: "Guest", discount: 0 },
  { key: "SILVER", label: "Silver", discount: 0.05 },
  { key: "GOLD", label: "Gold", discount: 0.10 },
  { key: "PLATINUM", label: "Platinum", discount: 0.15 },
];
function Header({ onOpenCart, user, onOpenAccount }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="KENTU" className="w-8 h-8 rounded-xl object-contain"/>
          <span className="font-semibold tracking-wide">KENTU</span>
          {user && (<span className="ml-3 text-xs rounded-full border px-2 py-0.5">{user.tierLabel}</span>)}
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
          <a href="#produk" className="hover:text-black">Produk</a>
          <a href="#tentang" className="hover:text-black">Tentang</a>
          <a href="#kontak" className="hover:text-black">Kontak</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onOpenAccount} className="rounded-2xl border px-3 py-1.5 text-sm hover:shadow">
            {user ? user.name.split(" ")[0] : "Masuk"}
          </button>
          <button onClick={onOpenCart} className="relative rounded-2xl border px-3 py-1.5 text-sm hover:shadow">
            Keranjang
          </button>
        </div>
      </div>
    </header>
  );
}
function Hero({ onShopNow }) {
  return (
    <section className="bg-gradient-to-b from-neutral-50 to-white border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Belanja Simple di <span className="underline decoration-black">KENTU</span></h1>
          <p className="mt-4 text-neutral-700">Sekarang dengan <b>Membership</b> — harga khusus untuk Silver, Gold, Platinum.</p>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={onShopNow} className="rounded-2xl bg-black text-white px-5 py-2.5 text-sm hover:opacity-90">Belanja Sekarang</button>
            <a href="#membership" className="rounded-2xl border px-5 py-2.5 text-sm hover:shadow">Lihat Benefit</a>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border shadow-sm">
          <img src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1880&auto=format&fit=crop" alt="Hero" className="w-full h-72 md:h-full object-cover"/>
        </div>
      </div>
    </section>
  );
}
function SearchBar({ query, setQuery, category, setCategory, categories }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk..." className="w-full md:flex-1 rounded-2xl border px-4 py-2 outline-none focus:ring-2 focus:ring-black" />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border px-4 py-2">
        <option value="">Semua Kategori</option>
        {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
      </select>
    </div>
  );
}
function Price({ price, discount }) {
  if (!discount) return <div className="font-semibold">{currency(price)}</div>;
  const d = Math.round(discount * 100);
  const after = Math.round(price * (1 - discount));
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-neutral-400 line-through text-sm">{currency(price)}</span>
      <span className="font-semibold">{currency(after)}</span>
      <span className="text-xs rounded-full border px-2 py-0.5">-{d}% member</span>
    </div>
  );
}
function ProductCard({ p, onAdd, memberDiscount }) {
  return (
    <div className="group rounded-3xl border overflow-hidden hover:shadow-sm transition">
      <div className="relative">
        <img src={p.image} alt={p.name} className="w-full h-52 object-cover"/>
        {p.stock <= 0 && (<span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-full border">Stok Habis</span>)}
      </div>
      <div className="p-4 space-y-2">
        <div className="text-sm text-neutral-500">{p.category}</div>
        <h3 className="font-semibold leading-tight">{p.name}</h3>
        <p className="text-neutral-600 text-sm min-h-10">{p.description}</p>
        <div className="flex items-center justify-between pt-2">
          <Price price={p.price} discount={memberDiscount} />
          <button disabled={p.stock <= 0} onClick={() => onAdd(p)} className="rounded-xl border px-3 py-1.5 text-sm hover:shadow disabled:opacity-50">Tambah</button>
        </div>
      </div>
    </div>
  );
}
function CartDrawer({ open, items, onClose, onInc, onDec, onRemove, onCheckout, user, memberDiscount }) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const pot = Math.round(subtotal * (memberDiscount || 0));
  const total = subtotal - pot;
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Keranjang</h2>
          <button onClick={onClose} className="rounded-xl border px-3 py-1.5 text-sm">Tutup</button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-200px)]">
          {items.length === 0 ? (
            <p className="text-sm text-neutral-600">Belum ada item. Tambahkan produk ke keranjang.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex gap-3 items-center border rounded-2xl p-2">
                <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded-xl"/>
                <div className="flex-1">
                  <div className="text-sm font-medium leading-tight">{it.name}</div>
                  <div className="text-xs text-neutral-500">{currency(it.price)} × {it.qty}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => onDec(it.id)} className="rounded-lg border w-7 h-7">-</button>
                    <span className="w-6 text-center text-sm">{it.qty}</span>
                    <button onClick={() => onInc(it.id)} className="rounded-lg border w-7 h-7">+</button>
                    <button onClick={() => onRemove(it.id)} className="ml-auto rounded-lg border px-2 py-1 text-xs">Hapus</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t space-y-1 text-sm">
          <div className="flex items-center justify-between"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
          <div className="flex items-center justify-between"><span>Diskon {user?.tierLabel || 'Guest'}</span><span>-{currency(pot)}</span></div>
          <div className="flex items-center justify-between font-semibold text-base pt-1"><span>Total</span><span>{currency(total)}</span></div>
          <button onClick={() => onCheckout(total)} disabled={items.length===0} className="mt-3 w-full rounded-2xl bg-black text-white px-4 py-2.5 text-sm hover:opacity-90 disabled:opacity-50">Checkout</button>
        </div>
      </aside>
    </div>
  );
}
function AccountModal({ open, onClose, user, onSave, onLogout }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [tier, setTier] = useState(user?.tier || "GUEST");
  React.useEffect(() => { if (open) { setName(user?.name || ""); setEmail(user?.email || ""); setTier(user?.tier || "GUEST"); } }, [open]);
  const TIERS_LOCAL = [
    { key: "GUEST", label: "Guest" },
    { key: "SILVER", label: "Silver" },
    { key: "GOLD", label: "Gold" },
    { key: "PLATINUM", label: "Platinum" },
  ];
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white border rounded-3xl shadow-xl ${open ? 'scale-100' : 'scale-95'} transition-transform`}>
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold">Akun & Membership</h3>
          <button onClick={onClose} className="rounded-xl border px-3 py-1.5 text-sm">Tutup</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="text-sm text-neutral-600">Daftar/masuk sederhana. Data disimpan di perangkat (localStorage).</div>
          <label className="block text-sm">Nama
            <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full rounded-2xl border px-3 py-2" placeholder="Nama kamu"/>
          </label>
          <label className="block text-sm">Email
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border px-3 py-2" placeholder="email@contoh.com"/>
          </label>
          <label className="block text-sm">Tier
            <select value={tier} onChange={(e)=>setTier(e.target.value)} className="mt-1 w-full rounded-2xl border px-3 py-2">
              {TIERS_LOCAL.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-2 pt-2">
            <button onClick={() => onSave({ name, email, tier })} className="rounded-2xl bg-black text-white px-4 py-2 text-sm">Simpan</button>
            {user && <button onClick={onLogout} className="rounded-2xl border px-4 py-2 text-sm">Keluar</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
function Footer() {
  return (
    <footer id="kontak" className="border-t mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-semibold mb-2">KENTU</div>
          <p className="text-neutral-600">Toko sederhana untuk jualan cepat. Sekarang mendukung Membership & harga khusus.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Kontak</div>
          <ul className="space-y-1 text-neutral-700">
            <li>WhatsApp: 082213316764</li>
            <li>Email: halo@kentu.my.id</li>
            <li>Alamat: Surabaya, Indonesia</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Info</div>
          <ul className="space-y-1 text-neutral-700">
            <li><a href="#tentang" className="hover:underline">Tentang Kami</a></li>
            <li><a href="#produk" className="hover:underline">Katalog</a></li>
            <li><a href="#membership" className="hover:underline">Membership</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-neutral-500 pb-8">© {new Date().getFullYear()} KENTU — kentu.my.id</div>
    </footer>
  );
}
export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cart, setCart] = useState(() => readLocal("kentu_cart", []));
  const [user, setUser] = useState(() => readLocal("kentu_user", null));
  useEffect(() => { saveLocal("kentu_cart", cart); }, [cart]);
  useEffect(() => { saveLocal("kentu_user", user); }, [user]);
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
  const filtered = useMemo(() => products.filter(p => ((!category || p.category === category) && (p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())))), [products, query, category]);
  const TIERS_META = { GUEST:0, SILVER:0.05, GOLD:0.10, PLATINUM:0.15 };
  const tier = user?.tier || "GUEST";
  const memberDiscount = TIERS_META[tier] || 0;
  const addToCart = (p) => {
    setCart((prev) => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i);
      return [...prev, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  };
  const inc = (id) => setCart((prev) => prev.map(i => i.id === id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i));
  const dec = (id) => setCart((prev) => prev.map(i => i.id === id ? { ...i, qty: Math.max(i.qty - 1, 1) } : i));
  const remove = (id) => setCart((prev) => prev.filter(i => i.id !== id));
  const handleCheckout = (total) => {
    if (!user) { setAccountOpen(true); return; }
    const rows = cart.map((it, idx) => `${idx+1}. ${it.name} x ${it.qty} = ${currency(it.price*it.qty)}`).join("%0A");
    const label = user?.tierLabel || tier;
    const text = `Halo KENTU,%0ASaya ingin memesan:%0A${rows}%0A%0ATier: ${label}%0ATotal setelah diskon: ${currency(total)}%0A%0ANama: ${encodeURIComponent(user.name)}%0AEmail: ${encodeURIComponent(user.email)}%0AAlamat:%0AMetode Bayar: Transfer/COD`;
    const phone = "62812xxxxxxx";
    const waUrl = `https://wa.me/${phone}?text=${text}`;
    window.open(waUrl, "_blank");
  };
  const saveAccount = ({ name, email, tier }) => {
    const labelMap = {GUEST:"Guest",SILVER:"Silver",GOLD:"Gold",PLATINUM:"Platinum"};
    setUser({ name, email, tier, tierLabel: labelMap[tier] });
    setAccountOpen(false);
  };
  const logout = () => { setUser(null); setAccountOpen(false); };
  return (
    <div className="min-h-screen bg-white text-black">
      <Header onOpenCart={() => setCartOpen(true)} user={user} onOpenAccount={() => setAccountOpen(true)} />
      <Hero onShopNow={() => { document.getElementById("produk")?.scrollIntoView({ behavior: "smooth" }); }} />
      <main id="produk" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold">Produk Pilihan</h2>
            <p className="text-sm text-neutral-600">Login untuk dapat harga member hingga 15%.</p>
          </div>
          <SearchBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (<ProductCard key={p.id} p={p} onAdd={addToCart} memberDiscount={memberDiscount} />))}
        </div>
        <section id="membership" className="mt-16 rounded-3xl border p-6 md:p-8 bg-neutral-50">
          <h3 className="text-lg font-semibold mb-2">Membership KENTU</h3>
          <div className="text-sm text-neutral-700 leading-relaxed">
            <p>Gabung sebagai member untuk mendapatkan diskon otomatis di setiap produk.</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li><b>Silver</b>: 5% off</li>
              <li><b>Gold</b>: 10% off</li>
              <li><b>Platinum</b>: 15% off</li>
            </ul>
          </div>
          <div className="mt-4">
            <button onClick={() => setAccountOpen(true)} className="rounded-2xl bg-black text-white px-4 py-2 text-sm">Daftar / Kelola Akun</button>
          </div>
        </section>
        <section id="tentang" className="mt-8 rounded-3xl border p-6 md:p-8">
          <h3 className="text-lg font-semibold mb-2">Tentang KENTU</h3>
          <p className="text-neutral-700 text-sm leading-relaxed">KENTU adalah toko online sederhana untuk UMKM. Website ini statis (tanpa backend) dengan checkout via WhatsApp. Membership bersifat client-side (untuk demo), dan dapat diintegrasikan ke payment gateway/CRM di tahap lanjut.</p>
        </section>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onInc={id=>inc(id)} onDec={id=>dec(id)} onRemove={id=>remove(id)} onCheckout={handleCheckout} user={user} memberDiscount={memberDiscount} />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} user={user} onSave={saveAccount} onLogout={logout} />
    </div>
  );
}
