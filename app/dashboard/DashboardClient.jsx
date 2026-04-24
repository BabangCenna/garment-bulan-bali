"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Badge from "@/components/ui/data/Badge";
import Avatar from "@/components/ui/data/Avatar";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import ProgressBar from "@/components/ui/feedback/ProgressBar";
import { RatingDisplay } from "@/components/ui/form/RatingInput";

// ─── DUMMY DATA ───────────────────────────────────────────────────
const RECENT_TRANSACTIONS = [
  {
    id: "TRX-001",
    customer: "Siti Aminah",
    total: 87000,
    items: 3,
    status: "selesai",
    time: "10 menit lalu",
  },
  {
    id: "TRX-002",
    customer: "Budi Santoso",
    total: 45000,
    items: 1,
    status: "selesai",
    time: "25 menit lalu",
  },
  {
    id: "TRX-003",
    customer: "Dewi Lestari",
    total: 210000,
    items: 5,
    status: "proses",
    time: "32 menit lalu",
  },
  {
    id: "TRX-004",
    customer: "Agus Wahyudi",
    total: 32000,
    items: 2,
    status: "selesai",
    time: "1 jam lalu",
  },
  {
    id: "TRX-005",
    customer: "Rina Susanti",
    total: 125000,
    items: 4,
    status: "batal",
    time: "1 jam lalu",
  },
];

const TOP_PRODUCTS = [
  {
    name: "Sunscreen Azarine SPF 45",
    category: "Kecantikan",
    sold: 55,
    stock: 30,
    revenue: 1925000,
    image: "https://picsum.photos/seed/sunscreen/200",
  },
  {
    name: "Shampo Dove Moisture 170ml",
    category: "Perawatan",
    sold: 62,
    stock: 45,
    revenue: 1116000,
    image: "https://picsum.photos/seed/dove/200",
  },
  {
    name: "Lipstik Matte Wardah No.20",
    category: "Kecantikan",
    sold: 48,
    stock: 24,
    revenue: 2160000,
    image: "https://picsum.photos/seed/lip/200",
  },
  {
    name: "Bedak Bayi Johnson's 50gr",
    category: "Bayi",
    sold: 41,
    stock: 5,
    revenue: 902000,
    image: "https://picsum.photos/seed/baby/200",
  },
  {
    name: "Serum Vit C Scarlett 40ml",
    category: "Perawatan",
    sold: 37,
    stock: 12,
    revenue: 2775000,
    image: "https://picsum.photos/seed/serum/200",
  },
];

const LOW_STOCK_ALERTS = [
  { name: "Bedak Bayi Johnson's 50gr", stock: 5, minStock: 10, sku: "BBY-002" },
  { name: "Pelembab Cetaphil 250ml", stock: 3, minStock: 5, sku: "PLB-007" },
  { name: "Vitamin C Blackmores 60s", stock: 7, minStock: 5, sku: "VIT-010" },
  {
    name: "Toner Somethinc Niacinamide",
    stock: 8,
    minStock: 5,
    sku: "TNR-006",
  },
];

const SALES_BY_CATEGORY = [
  { label: "Kecantikan", value: 6161000, pct: 38 },
  { label: "Perawatan Tubuh", value: 5225000, pct: 32 },
  { label: "Bayi", value: 2398000, pct: 15 },
  { label: "Kesehatan", value: 2035000, pct: 13 },
  { label: "Lainnya", value: 323000, pct: 2 },
];

const CATEGORY_COLORS = [
  "primary",
  "success",
  "warning",
  "danger",
  "secondary",
];

const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const STATUS_MAP = {
  selesai: { label: "Selesai", variant: "success" },
  proses: { label: "Proses", variant: "warning" },
  batal: { label: "Batal", variant: "danger" },
};

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function DashboardClient({ user }) {
  const router = useRouter();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, []);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout activeKey='home'>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ── Header ── */}
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", icon: <i className='fa-solid fa-house' /> },
            ]}
          />
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: "0 0 4px",
                  letterSpacing: "-.3px",
                }}
              >
                {greeting}, {user?.name ?? "Admin"} 👋
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {today}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => router.push("/dashboard/products")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <i className='fa-solid fa-plus' /> Tambah Produk
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          <StatCard
            label='Pendapatan Hari Ini'
            value={formatRupiah(499000)}
            icon={<i className='fa-solid fa-sack-dollar' />}
            color='primary'
            footer={
              <span style={{ fontSize: 11, color: "var(--color-success)" }}>
                ↑ 12% vs kemarin
              </span>
            }
          />
          <StatCard
            label='Transaksi Hari Ini'
            value={14}
            icon={<i className='fa-solid fa-receipt' />}
            color='success'
            footer={
              <span style={{ fontSize: 11, color: "var(--color-success)" }}>
                ↑ 3 transaksi
              </span>
            }
          />
          <StatCard
            label='Produk Terjual'
            value={38}
            icon={<i className='fa-solid fa-bag-shopping' />}
            color='warning'
            footer={
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                dari 12 produk
              </span>
            }
          />
          <StatCard
            label='Stok Perlu Diisi'
            value={4}
            icon={<i className='fa-solid fa-triangle-exclamation' />}
            color='danger'
            footer={
              <button
                type='button'
                onClick={() => router.push("/dashboard/products")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-danger)",
                  fontSize: 11,
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Lihat produk →
              </button>
            }
          />
        </div>

        {/* ── Middle Row: Transactions + Low Stock ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}
        >
          {/* Recent Transactions */}
          <Card padding='none'>
            <div
              style={{
                padding: "16px 18px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                <i
                  className='fa-solid fa-clock-rotate-left'
                  style={{ marginRight: 8, color: "var(--color-primary)" }}
                />
                Transaksi Terbaru
              </h2>
              <button
                type='button'
                onClick={() => router.push("/dashboard/transactions")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Lihat semua →
              </button>
            </div>
            <div>
              {RECENT_TRANSACTIONS.map((trx, i) => (
                <div
                  key={trx.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 18px",
                    borderBottom:
                      i < RECENT_TRANSACTIONS.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--color-bg-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <i className='fa-solid fa-user' />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {trx.customer}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                    >
                      {trx.id} · {trx.items} item · {trx.time}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {formatRupiah(trx.total)}
                    </div>
                    <Badge
                      variant={STATUS_MAP[trx.status].variant}
                      size='sm'
                      dot
                    >
                      {STATUS_MAP[trx.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Low Stock Alerts */}
          <Card padding='none'>
            <div
              style={{
                padding: "16px 18px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                <i
                  className='fa-solid fa-bell'
                  style={{ marginRight: 8, color: "var(--color-warning)" }}
                />
                Peringatan Stok
              </h2>
              <Badge variant='warning' size='sm'>
                {LOW_STOCK_ALERTS.length} produk
              </Badge>
            </div>
            <div>
              {LOW_STOCK_ALERTS.map((item, i) => {
                const pct = Math.round(
                  (item.stock / (item.minStock * 2)) * 100,
                );
                const isOut = item.stock === 0;
                const variant = isOut
                  ? "danger"
                  : item.stock <= item.minStock
                    ? "warning"
                    : "success";
                return (
                  <div
                    key={item.sku}
                    style={{
                      padding: "12px 18px",
                      borderBottom:
                        i < LOW_STOCK_ALERTS.length - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {item.sku}
                        </div>
                      </div>
                      <Badge variant={variant} size='sm' dot>
                        {item.stock} unit
                      </Badge>
                    </div>
                    <ProgressBar
                      value={Math.min(pct, 100)}
                      size='xs'
                      variant={variant}
                    />
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-muted)",
                        marginTop: 3,
                      }}
                    >
                      Minimum stok: {item.minStock} unit
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Bottom Row: Top Products + Sales by Category ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}
        >
          {/* Top Products */}
          <Card padding='none'>
            <div
              style={{
                padding: "16px 18px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                <i
                  className='fa-solid fa-fire'
                  style={{ marginRight: 8, color: "var(--color-primary)" }}
                />
                Produk Terlaris
              </h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      background: "var(--color-bg-subtle)",
                    }}
                  >
                    {["#", "Produk", "Kategori", "Terjual", "Pendapatan"].map(
                      (h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "9px 14px",
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                            color: "var(--color-text-muted)",
                            whiteSpace: "nowrap",
                            textAlign:
                              i >= 3 ? "right" : i === 0 ? "center" : "left",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {TOP_PRODUCTS.map((p, i) => (
                    <tr
                      key={p.name}
                      style={{
                        borderBottom:
                          i < TOP_PRODUCTS.length - 1
                            ? "1px solid var(--color-border)"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background:
                              i < 3
                                ? "var(--color-primary)"
                                : "var(--color-bg-subtle)",
                            color: i < 3 ? "white" : "var(--color-text-muted)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "var(--radius-md)",
                              objectFit: "cover",
                              border: "1px solid var(--color-border)",
                              flexShrink: 0,
                            }}
                          />
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                              lineHeight: 1.3,
                            }}
                          >
                            {p.name}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <Badge variant='secondary' size='sm'>
                          {p.category}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "right",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {p.sold}×
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          textAlign: "right",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--color-primary)",
                        }}
                      >
                        {formatRupiah(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Sales by Category */}
          <Card padding='none'>
            <div
              style={{
                padding: "16px 18px 12px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                <i
                  className='fa-solid fa-chart-pie'
                  style={{ marginRight: 8, color: "var(--color-primary)" }}
                />
                Penjualan per Kategori
              </h2>
            </div>
            <div
              style={{
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {SALES_BY_CATEGORY.map((cat, i) => (
                <div key={cat.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {cat.label}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {cat.pct}%
                      </span>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {formatRupiah(cat.value)}
                      </div>
                    </div>
                  </div>
                  <ProgressBar
                    value={cat.pct}
                    size='sm'
                    variant={CATEGORY_COLORS[i]}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
