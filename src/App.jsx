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
    <header className="stick
