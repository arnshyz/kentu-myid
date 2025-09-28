import React, { useEffect, useMemo, useState } from "react";

// KENTU — Simple E‑Commerce Frontend (Vite + React + Tailwind)
// - Data lokal (tanpa backend). Keranjang tersimpan di localStorage.
// - Checkout ke WhatsApp: cocok untuk COD/transfer.
// - Edit katalog di array initialProducts.
// - Ganti nomor WhatsApp admin di handleCheckout().

// ---- Types ----
// JSDoc saja untuk editor hints
/** @typedef {{ id:string; name:string; price:number; category:string; image:string; stock:number; description?:string; }} Product */

// ---- Sample Products ----
/** @type {Product[]} */
const initialProducts = [
  {
    id: "p-001",
    name: "Sandal Jepit JND Classic",
    price: 19000,
    category: "Sandal",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1480&auto=format&fit=crop",
    stock: 42,
    description: "Sandal jepit harian empuk, anti slip, ringan dipakai."
  },
  {
    id: "p-002",
    name: "Sandal Jepit JND Premium",
    price: 29000,
    category: "Sandal",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1480&auto=format&fit=crop",
    stock: 36,
    description: "Material tebal, bandul kuat, nyaman untuk kegiatan outdoor."
  },
  {
    id: "p-003",
    name: "T-Shirt KENTU Oversize",
    price: 59000,
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1480&auto=format&fit=crop",
    stock: 25,
    description: "Katun 24s, breathable, sablon plastisol."
  },
  {
    id: "p-004",
    name: "Topi Trucker KENTU",
    price: 39000,
    category: "Aksesoris",
    image: "https://images.unsplash.com/photo-1520975682031-9240dad70b12?q=80&w=1480&auto=format&fit=crop",
    stock: 18,
    description: "Jaring belakang, nyaman dipakai harian."
  },
  {
    id: "p-005",
    name: "Tas Selempang KENTU",
    price: 99000,
    category: "Aksesoris",
    image: "https://images.unsplash.com/photo-1593034098168-6b8c8ef6609a?q=80&w=1480&auto=format&fit=crop",
    stock: 12,
    description: "Kompak, banyak kompartemen, bahan water resistant."
  },
];

// ---- Utils ----
const currency = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const saveLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const readLocal = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

function Header({ onOpenCart }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black text-white grid place-items-center font-bold">K</div>
          <span className="font-semibold tracking-wide">KENTU</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
          <a href="#produk" className="hover:text-black">Produk</a>
          <a href="#tentang" className="hover:text-black">Tentang</a>
          <a href="#kontak" className="hover:text-black">Kontak</a>
        </nav>
        <button onClick={onOpenCart} className="relative rounded-2xl border px-3 py-1.5 text-sm hover:shadow">
          Keranjang
        </button>
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
          <p className="mt-4 text-neutral-700">Toko e‑commerce ringan untuk UMKM. Pesan via keranjang, lanjut bayar lewat WhatsApp/transfer. Cocok untuk katalog cepat dan order harian.</p>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={onShopNow} className="rounded-2xl bg-black text-white px-5 py-2.5 text-sm hover:opacity-90">Belanja Sekarang</button>
            <a href="#tentang" className="rounded-2xl border px-5 py-2.5 text-sm hover:shadow">Pelajari</a>
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
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari produk..."
        className="w-full md:flex-1 rounded-2xl border px-4 py-2 outline-none focus:ring-2 focus:ring-black"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border px-4 py-2">
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

function ProductCard({ p, onAdd }) {
  return (
    <div className="group rounded-3xl border overflow-hidden hover:shadow-sm transition">
      <div className="relative">
        <img src={p.image} alt={p.name} className="w-full h-52 object-cover"/>
        {p.stock <= 0 && (
          <span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-full border">Stok Habis</span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="text-sm text-neutral-500">{p.category}</div>
        <h3 className="font-semibold leading-tight">{p.name}</h3>
        <p className="text-neutral-600 text-sm min-h-10">{p.description}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="font-semibold">{currency(p.price)}</div>
          <button
            disabled={p.stock <= 0}
            onClick={() => onAdd(p)}
            className="rounded-xl border px-3 py-1.5 text-sm hover:shadow disabled:opacity-50"
          >Tambah</button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, items, onClose, onInc, onDec, onRemove, onCheckout }) {
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Keranjang</h2>
          <button onClick={onClose} className="rounded-xl border px-3 py-1.5 text-sm">Tutup</button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-160px)]">
          {items.length === 0 ? (
            <p className="text-sm text-neutral-600">Belum ada item. Tambahkan produk ke keranjang.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex gap-3 items-center border rounded-2xl p-2">
                <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded-xl"/>
                <div className="flex-1">
                  <div className="text-sm font-medium leading-tight">{it.name}</div>
                  <div className="text-xs text-neutral-500">{currency(it.price)}</div>
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
        <div className="p-4 border-t">
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{currency(total)}</span>
          </div>
          <button onClick={onCheckout} disabled={items.length===0} className="mt-3 w-full rounded-2xl bg-black text-white px-4 py-2.5 text-sm hover:opacity-90 disabled:opacity-50">Checkout</button>
        </div>
      </aside>
    </div>
  );
}

function Footer() {
  return (
    <footer id="kontak" className="border-t mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-semibold mb-2">KENTU</div>
          <p className="text-neutral-600">Toko sederhana untuk jualan cepat. Tanpa ribet server, tinggal sebar link.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Kontak</div>
          <ul className="space-y-1 text-neutral-700">
            <li>WhatsApp: 08xx-xxxx-xxxx</li>
            <li>Email: halo@kentu.my.id</li>
            <li>Alamat: Surabaya, Indonesia</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Info</div>
          <ul className="space-y-1 text-neutral-700">
            <li><a href="#tentang" className="hover:underline">Tentang Kami</a></li>
            <li><a href="#produk" className="hover:underline">Katalog</a></li>
            <li><a href="#" className="hover:underline">Kebijakan Privasi</a></li>
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
  const [cart, setCart] = useState(() => readLocal("kentu_cart", []));

  useEffect(() => { saveLocal("kentu_cart", cart); }, [cart]);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  const filtered = useMemo(() =>
    products.filter(p => (
      (!category || p.category === category) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
       p.category.toLowerCase().includes(query.toLowerCase()))
    )), [products, query, category]
  );

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

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  const handleCheckout = () => {
    const rows = cart.map((it, idx) => `${idx+1}. ${it.name} x ${it.qty} = ${currency(it.price*it.qty)}`).join("%0A");
    const text = `Halo KENTU,%0ASaya ingin memesan:%0A${rows}%0A%0ATotal: ${currency(total)}%0A%0ANama:%0AAlamat:%0AMetode Bayar: Transfer/COD`;
    const phone = "6282213316764"; // ganti ke nomor WA admin tanpa +
    const waUrl = `https://wa.me/${phone}?text=${text}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header onOpenCart={() => setCartOpen(true)} />
      <Hero onShopNow={() => {
        document.getElementById("produk")?.scrollIntoView({ behavior: "smooth" });
      }} />

      <main id="produk" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold">Produk Pilihan</h2>
            <p className="text-sm text-neutral-600">Filter dan cari produk di bawah ini.</p>
          </div>
          <SearchBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} onAdd={addToCart} />
          ))}
        </div>

        <section id="tentang" className="mt-16 rounded-3xl border p-6 md:p-8 bg-neutral-50">
          <h3 className="text-lg font-semibold mb-2">Tentang KENTU</h3>
          <p className="text-neutral-700 text-sm leading-relaxed">
            KENTU adalah toko online sederhana untuk memudahkan UMKM memamerkan produk dan menerima pesanan tanpa setup rumit. Website ini statis (tanpa backend).
            Pembayaran dilakukan manual melalui WhatsApp/transfer sehingga cocok untuk skala kecil hingga menengah.
          </p>
          <ul className="list-disc pl-5 mt-3 text-sm text-neutral-700 space-y-1">
            <li>Ringan, cepat, biaya hosting nyaris nol (cocok di Vercel/Netlify).</li>
            <li>Keranjang tersimpan di perangkat pelanggan (localStorage).</li>
            <li>Checkout via WhatsApp untuk konfirmasi dan pembayaran.</li>
          </ul>
        </section>
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
