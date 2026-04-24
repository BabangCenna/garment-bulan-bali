// app/dashboard/stock/StockClient.jsx
"use client";
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/data/Badge";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Tooltip from "@/components/ui/data/Tooltip";
import EmptyState from "@/components/ui/data/EmptyState";
import Button from "@/components/ui/button/Button";
import IconButton from "@/components/ui/button/IconButton";
import ButtonGroup from "@/components/ui/button/ButtonGroup";
import ConfirmDialog from "@/components/ui/feedback/ConfirmDialog";
import Modal from "@/components/ui/feedback/Modal";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import SearchInput from "@/components/ui/form/SearchInput";
import Input from "@/components/ui/form/Input";
import Select from "@/components/ui/form/Select";
import Textarea from "@/components/ui/form/Textarea";
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import ProgressBar from "@/components/ui/feedback/ProgressBar";
import FilterBar from "@/components/ui/form/FilterBar";

// ─── CONSTANTS ────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const CATEGORIES = [
  { value: "kecantikan", label: "Kecantikan" },
  { value: "perawatan", label: "Perawatan Tubuh" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "bayi", label: "Produk Bayi" },
  { value: "fashion", label: "Fashion & Aksesoris" },
  { value: "makanan", label: "Makanan & Minuman" },
];

const MOVEMENT_TYPES = [
  { value: "masuk", label: "Stok Masuk" },
  { value: "keluar", label: "Stok Keluar" },
  { value: "penyesuaian", label: "Penyesuaian" },
  { value: "retur", label: "Retur" },
];

const DUMMY_STOCK = [
  {
    id: 1,
    name: "Lipstik Matte Wardah No.20",
    sku: "LPS-001",
    category: "kecantikan",
    stock: 24,
    minStock: 10,
    maxStock: 100,
    unit: "pcs",
    image: "https://picsum.photos/seed/lip/200",
    lastUpdated: "2025-01-20",
    supplier: "PT Wardah Kosmetik",
    location: "Rak A-01",
  },
  {
    id: 2,
    name: "Bedak Bayi Johnson's 50gr",
    sku: "BBY-002",
    category: "bayi",
    stock: 5,
    minStock: 10,
    maxStock: 80,
    unit: "pcs",
    image: "https://picsum.photos/seed/baby/200",
    lastUpdated: "2025-01-19",
    supplier: "PT Johnson Indonesia",
    location: "Rak B-03",
  },
  {
    id: 3,
    name: "Sabun Muka Pond's Age Miracle",
    sku: "SBN-003",
    category: "perawatan",
    stock: 18,
    minStock: 5,
    maxStock: 60,
    unit: "pcs",
    image: "https://picsum.photos/seed/ponds/200",
    lastUpdated: "2025-01-18",
    supplier: "PT Unilever Indonesia",
    location: "Rak C-02",
  },
  {
    id: 4,
    name: "Masker Wajah Mughnii 20s",
    sku: "MSK-004",
    category: "kecantikan",
    stock: 0,
    minStock: 5,
    maxStock: 50,
    unit: "box",
    image: "https://picsum.photos/seed/mask/200",
    lastUpdated: "2025-01-15",
    supplier: "PT Mughnii Beauty",
    location: "Rak A-04",
  },
  {
    id: 5,
    name: "Serum Vit C Scarlett 40ml",
    sku: "SRM-005",
    category: "perawatan",
    stock: 12,
    minStock: 5,
    maxStock: 60,
    unit: "pcs",
    image: "https://picsum.photos/seed/serum/200",
    lastUpdated: "2025-01-21",
    supplier: "PT Scarlett Whitening",
    location: "Rak C-01",
  },
  {
    id: 6,
    name: "Toner Somethinc Niacinamide",
    sku: "TNR-006",
    category: "perawatan",
    stock: 8,
    minStock: 5,
    maxStock: 50,
    unit: "pcs",
    image: "https://picsum.photos/seed/toner/200",
    lastUpdated: "2025-01-20",
    supplier: "PT Somethinc Indonesia",
    location: "Rak C-03",
  },
  {
    id: 7,
    name: "Pelembab Cetaphil 250ml",
    sku: "PLB-007",
    category: "perawatan",
    stock: 3,
    minStock: 5,
    maxStock: 40,
    unit: "pcs",
    image: "https://picsum.photos/seed/cetaphil/200",
    lastUpdated: "2025-01-17",
    supplier: "PT Galderma Indonesia",
    location: "Rak C-04",
  },
  {
    id: 8,
    name: "Sunscreen Azarine SPF 45",
    sku: "SUN-008",
    category: "kecantikan",
    stock: 30,
    minStock: 10,
    maxStock: 100,
    unit: "pcs",
    image: "https://picsum.photos/seed/sunscreen/200",
    lastUpdated: "2025-01-22",
    supplier: "PT Azarine Cosmetic",
    location: "Rak A-02",
  },
  {
    id: 9,
    name: "Shampo Dove Moisture 170ml",
    sku: "SHP-009",
    category: "perawatan",
    stock: 45,
    minStock: 10,
    maxStock: 120,
    unit: "pcs",
    image: "https://picsum.photos/seed/dove/200",
    lastUpdated: "2025-01-21",
    supplier: "PT Unilever Indonesia",
    location: "Rak D-01",
  },
  {
    id: 10,
    name: "Vitamin C Blackmores 60s",
    sku: "VIT-010",
    category: "kesehatan",
    stock: 7,
    minStock: 5,
    maxStock: 40,
    unit: "box",
    image: "https://picsum.photos/seed/vit/200",
    lastUpdated: "2025-01-19",
    supplier: "PT Blackmores Indonesia",
    location: "Rak E-01",
  },
  {
    id: 11,
    name: "Minyak Telon Lang 60ml",
    sku: "MTL-011",
    category: "bayi",
    stock: 22,
    minStock: 10,
    maxStock: 80,
    unit: "pcs",
    image: "https://picsum.photos/seed/telon/200",
    lastUpdated: "2025-01-20",
    supplier: "PT Cap Lang",
    location: "Rak B-02",
  },
  {
    id: 12,
    name: "Krim BB Garnier Light",
    sku: "BBK-012",
    category: "kecantikan",
    stock: 0,
    minStock: 5,
    maxStock: 50,
    unit: "pcs",
    image: "https://picsum.photos/seed/garnier/200",
    lastUpdated: "2025-01-10",
    supplier: "PT L'Oreal Indonesia",
    location: "Rak A-03",
  },
];

// Riwayat mutasi stok dummy
const DUMMY_HISTORY = [
  {
    id: 1,
    productId: 8,
    type: "masuk",
    qty: 15,
    before: 15,
    after: 30,
    note: "Restock dari supplier",
    date: "2025-01-22",
    user: "Admin",
  },
  {
    id: 2,
    productId: 5,
    type: "keluar",
    qty: 3,
    before: 15,
    after: 12,
    note: "Penjualan kasir",
    date: "2025-01-21",
    user: "Kasir 1",
  },
  {
    id: 3,
    productId: 9,
    type: "masuk",
    qty: 20,
    before: 25,
    after: 45,
    note: "Restock bulanan",
    date: "2025-01-21",
    user: "Admin",
  },
  {
    id: 4,
    productId: 3,
    type: "penyesuaian",
    qty: 2,
    before: 16,
    after: 18,
    note: "Koreksi stok fisik",
    date: "2025-01-18",
    user: "Admin",
  },
  {
    id: 5,
    productId: 2,
    type: "keluar",
    qty: 5,
    before: 10,
    after: 5,
    note: "Penjualan kasir",
    date: "2025-01-19",
    user: "Kasir 2",
  },
  {
    id: 6,
    productId: 7,
    type: "keluar",
    qty: 2,
    before: 5,
    after: 3,
    note: "Penjualan kasir",
    date: "2025-01-17",
    user: "Kasir 1",
  },
  {
    id: 7,
    productId: 1,
    type: "masuk",
    qty: 10,
    before: 14,
    after: 24,
    note: "Restock dari supplier",
    date: "2025-01-20",
    user: "Admin",
  },
  {
    id: 8,
    productId: 10,
    type: "retur",
    qty: 2,
    before: 5,
    after: 7,
    note: "Retur dari pelanggan",
    date: "2025-01-19",
    user: "Kasir 1",
  },
];

const getStockLevel = (stock, min, max) => {
  if (stock === 0) return { label: "Habis", variant: "danger", pct: 0 };
  if (stock <= min)
    return {
      label: "Menipis",
      variant: "warning",
      pct: Math.round((stock / max) * 100),
    };
  return {
    label: "Normal",
    variant: "success",
    pct: Math.round((stock / max) * 100),
  };
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── ADJUSTMENT MODAL ─────────────────────────────────────────────
function AdjustStockModal({ open, onClose, onSave, product }) {
  const [type, setType] = useState("masuk");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const previewStock = useMemo(() => {
    if (!qty || !product) return product?.stock ?? 0;
    const n = Number(qty);
    if (type === "masuk" || type === "retur") return product.stock + n;
    if (type === "keluar" || type === "penyesuaian")
      return Math.max(0, product.stock - n);
    return product.stock;
  }, [qty, type, product]);

  const handleSave = async () => {
    const e = {};
    if (!qty || Number(qty) <= 0) e.qty = "Jumlah harus lebih dari 0";
    if (!note.trim()) e.note = "Keterangan wajib diisi";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    onSave?.({ type, qty: Number(qty), note, previewStock });
    setLoading(false);
    setQty("");
    setNote("");
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setQty("");
    setNote("");
    setErrors({});
    setType("masuk");
    onClose();
  };

  if (!product) return null;

  const isOut = type === "keluar" || type === "penyesuaian";
  const stockDiff = qty ? (isOut ? -Number(qty) : Number(qty)) : 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title='Penyesuaian Stok'
      size='md'
      closeable={!loading}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant='primary'
            loading={loading}
            onClick={handleSave}
            leftIcon={!loading && <i className='fa-solid fa-floppy-disk' />}
          >
            Simpan
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* product info */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "10px 14px",
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              objectFit: "cover",
              border: "1px solid var(--color-border)",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {product.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {product.sku} · {product.location}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {product.stock}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {product.unit} saat ini
            </div>
          </div>
        </div>

        {/* type */}
        <Select
          label='Jenis Perubahan'
          required
          options={MOVEMENT_TYPES}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        {/* qty */}
        <Input
          label='Jumlah'
          required
          type='number'
          placeholder='0'
          min='1'
          leftIcon={
            <i
              className={`fa-solid ${isOut ? "fa-minus" : "fa-plus"}`}
              style={{
                color: isOut ? "var(--color-danger)" : "var(--color-success)",
              }}
            />
          }
          suffix={product.unit}
          value={qty}
          onChange={(e) => {
            setQty(e.target.value);
            setErrors((v) => ({ ...v, qty: "" }));
          }}
          error={errors.qty}
          hint={
            qty && Number(qty) > 0
              ? `Stok setelah perubahan: ${previewStock} ${product.unit} (${stockDiff >= 0 ? "+" : ""}${stockDiff})`
              : ""
          }
        />

        {/* note */}
        <Textarea
          label='Keterangan'
          required
          placeholder='Contoh: Restock dari supplier, Penjualan offline, dll.'
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setErrors((v) => ({ ...v, note: "" }));
          }}
          error={errors.note}
          rows={3}
        />

        {/* preview */}
        {qty && Number(qty) > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: isOut
                ? "var(--color-danger-subtle, #fff1f0)"
                : "var(--color-success-subtle, #f0fff4)",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${isOut ? "var(--color-danger)" : "var(--color-success)"}`,
              opacity: 0.85,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginBottom: 2,
                }}
              >
                Stok Sebelum → Sesudah
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {product.stock} → {previewStock} {product.unit}
              </div>
            </div>
            <Badge variant={isOut ? "danger" : "success"} size='sm'>
              {stockDiff >= 0 ? "+" : ""}
              {stockDiff} {product.unit}
            </Badge>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── HISTORY MODAL ────────────────────────────────────────────────
function StockHistoryModal({ open, onClose, product, history }) {
  if (!product) return null;
  const rows = history.filter((h) => h.productId === product.id);

  const typeConfig = {
    masuk: { label: "Masuk", variant: "success", icon: "fa-arrow-down" },
    keluar: { label: "Keluar", variant: "danger", icon: "fa-arrow-up" },
    penyesuaian: {
      label: "Penyesuaian",
      variant: "warning",
      icon: "fa-arrows-rotate",
    },
    retur: { label: "Retur", variant: "info", icon: "fa-rotate-left" },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Riwayat Mutasi Stok'
      size='lg'
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* product info */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "10px 14px",
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              objectFit: "cover",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {product.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {product.sku}
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 13,
            }}
          >
            <i
              className='fa-solid fa-clock-rotate-left'
              style={{
                fontSize: 28,
                marginBottom: 10,
                display: "block",
                opacity: 0.3,
              }}
            />
            Belum ada riwayat mutasi untuk produk ini.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--color-border)",
                    background: "var(--color-bg-subtle)",
                  }}
                >
                  {[
                    "Tanggal",
                    "Jenis",
                    "Qty",
                    "Sebelum",
                    "Sesudah",
                    "Keterangan",
                    "Operator",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "8px 12px",
                        textAlign: i >= 2 && i <= 4 ? "center" : "left",
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                        color: "var(--color-text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const cfg = typeConfig[r.type] ?? typeConfig.masuk;
                  const isOut = r.type === "keluar" || r.type === "penyesuaian";
                  return (
                    <tr
                      key={r.id}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <td
                        style={{
                          padding: "9px 12px",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(r.date)}
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <Badge variant={cfg.variant} size='sm'>
                          <i
                            className={`fa-solid ${cfg.icon}`}
                            style={{ marginRight: 4 }}
                          />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          fontWeight: 700,
                          color: isOut
                            ? "var(--color-danger)"
                            : "var(--color-success)",
                        }}
                      >
                        {isOut ? "-" : "+"}
                        {r.qty}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {r.before}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {r.after}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          color: "var(--color-text-primary)",
                          maxWidth: 160,
                        }}
                      >
                        {r.note}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.user}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── STOCK TABLE ROW ──────────────────────────────────────────────
function StockTableRow({ item, onAdjust, onHistory }) {
  const level = getStockLevel(item.stock, item.minStock, item.maxStock);
  const pct = Math.min(Math.round((item.stock / item.maxStock) * 100), 100);

  return (
    <tr
      style={{
        borderBottom: "1px solid var(--color-border)",
        transition: "background .15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--color-bg-subtle)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* produk */}
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-md)",
              objectFit: "cover",
              border: "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                lineHeight: 1.3,
              }}
            >
              {item.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {item.sku}
            </div>
          </div>
        </div>
      </td>
      {/* kategori */}
      <td style={{ padding: "10px 14px" }}>
        <Badge variant='secondary' size='sm'>
          {CATEGORIES.find((c) => c.value === item.category)?.label ??
            item.category}
        </Badge>
      </td>
      {/* lokasi */}
      <td style={{ padding: "10px 14px" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          <i
            className='fa-solid fa-location-dot'
            style={{ marginRight: 5, color: "var(--color-primary)" }}
          />
          {item.location}
        </span>
      </td>
      {/* stok */}
      <td style={{ padding: "10px 14px", minWidth: 160 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {item.stock}{" "}
            <span
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: "var(--color-text-muted)",
              }}
            >
              {item.unit}
            </span>
          </span>
          <Badge variant={level.variant} size='sm' dot>
            {level.label}
          </Badge>
        </div>
        <ProgressBar
          value={pct}
          size='xs'
          variant={
            item.stock === 0
              ? "danger"
              : item.stock <= item.minStock
                ? "warning"
                : "success"
          }
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 3,
          }}
        >
          <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
            min: {item.minStock}
          </span>
          <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
            maks: {item.maxStock}
          </span>
        </div>
      </td>
      {/* supplier */}
      <td style={{ padding: "10px 14px" }}>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            lineHeight: 1.4,
          }}
        >
          {item.supplier}
        </span>
      </td>
      {/* update terakhir */}
      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {formatDate(item.lastUpdated)}
        </span>
      </td>
      {/* actions */}
      <td style={{ padding: "10px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "flex-end",
          }}
        >
          <Tooltip content='Sesuaikan stok' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-sliders' />}
              size='sm'
              variant='ghost'
              label='Adjust'
              onClick={() => onAdjust(item)}
            />
          </Tooltip>
          <Tooltip content='Riwayat mutasi' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-clock-rotate-left' />}
              size='sm'
              variant='ghost'
              label='History'
              onClick={() => onHistory(item)}
            />
          </Tooltip>
          <Dropdown
            trigger={
              <IconButton
                icon={<i className='fa-solid fa-ellipsis-vertical' />}
                size='sm'
                variant='ghost'
                label='More'
              />
            }
            align='right'
            items={[
              {
                label: "Stok masuk",
                icon: <i className='fa-solid fa-arrow-down' />,
                onClick: () => onAdjust(item),
              },
              {
                label: "Stok keluar",
                icon: <i className='fa-solid fa-arrow-up' />,
                onClick: () => onAdjust(item),
              },
              {
                label: "Riwayat mutasi",
                icon: <i className='fa-solid fa-clock-rotate-left' />,
                onClick: () => onHistory(item),
              },
              { divider: true },
              {
                label: "Lihat produk",
                icon: <i className='fa-solid fa-box' />,
                onClick: () => {},
              },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function StockClient({ user }) {
  const toast = useToast();

  const [stockItems, setStockItems] = useState(DUMMY_STOCK);
  const [history, setHistory] = useState(DUMMY_HISTORY);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

  // modals
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  // ── filter & sort ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = [...stockItems];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    if (filterCat) arr = arr.filter((p) => p.category === filterCat);
    if (filterLevel === "out") arr = arr.filter((p) => p.stock === 0);
    if (filterLevel === "low")
      arr = arr.filter((p) => p.stock > 0 && p.stock <= p.minStock);
    if (filterLevel === "normal") arr = arr.filter((p) => p.stock > p.minStock);

    arr.sort((a, b) => {
      if (sortBy === "stock_asc") return a.stock - b.stock;
      if (sortBy === "stock_desc") return b.stock - a.stock;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "updated")
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      return 0;
    });
    return arr;
  }, [stockItems, search, filterCat, filterLevel, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters = [
    filterCat && {
      key: "cat",
      label: "Kategori",
      value: CATEGORIES.find((c) => c.value === filterCat)?.label,
    },
    filterLevel && {
      key: "level",
      label: "Level Stok",
      value:
        filterLevel === "out"
          ? "Habis"
          : filterLevel === "low"
            ? "Menipis"
            : "Normal",
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "cat") setFilterCat("");
    if (key === "level") setFilterLevel("");
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilterCat("");
    setFilterLevel("");
    setPage(1);
  };

  // ── handlers ──────────────────────────────────────────────────
  const handleAdjustSave = ({ type, qty, note, previewStock }) => {
    if (!adjustTarget) return;
    const target = adjustTarget;

    setStockItems((prev) =>
      prev.map((p) =>
        p.id === target.id
          ? {
              ...p,
              stock: previewStock,
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : p,
      ),
    );

    const isOut = type === "keluar" || type === "penyesuaian";
    setHistory((prev) => [
      {
        id: Date.now(),
        productId: target.id,
        type,
        qty,
        before: target.stock,
        after: previewStock,
        note,
        date: new Date().toISOString().slice(0, 10),
        user: user?.name ?? "Admin",
      },
      ...prev,
    ]);

    toast.add({
      variant: "success",
      title: "Stok Diperbarui",
      message: `${target.name}: ${target.stock} → ${previewStock} ${target.unit}`,
    });
    setAdjustTarget(null);
  };

  // ── stats ─────────────────────────────────────────────────────
  const totalItems = stockItems.length;
  const outOfStock = stockItems.filter((p) => p.stock === 0).length;
  const lowStock = stockItems.filter(
    (p) => p.stock > 0 && p.stock <= p.minStock,
  ).length;
  const totalUnits = stockItems.reduce((s, p) => s + p.stock, 0);

  return (
    <DashboardLayout activeKey='stock'>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* header */}
        <div>
          <Breadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/dashboard",
                icon: <i className='fa-solid fa-house' />,
              },
              { label: "Manajemen Stok" },
            ]}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginTop: 12,
              gap: 12,
              flexWrap: "wrap",
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
                Manajemen Stok
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {totalItems} produk terdaftar · {totalUnits} total unit tersedia
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-download' />}
              >
                Export
              </Button>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-print' />}
              >
                Cetak
              </Button>
            </div>
          </div>
        </div>

        {/* stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          <StatCard
            label='Total Produk'
            value={totalItems}
            icon={<i className='fa-solid fa-boxes-stacked' />}
            color='primary'
          />
          <StatCard
            label='Total Unit'
            value={totalUnits}
            icon={<i className='fa-solid fa-cubes' />}
            color='info'
          />
          <StatCard
            label='Stok Menipis'
            value={lowStock}
            icon={<i className='fa-solid fa-triangle-exclamation' />}
            color='warning'
            footer={
              lowStock > 0 ? (
                <button
                  type='button'
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-warning)",
                    fontSize: 11,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                  onClick={() => {
                    setFilterLevel("low");
                    setPage(1);
                  }}
                >
                  Lihat produk →
                </button>
              ) : null
            }
          />
          <StatCard
            label='Stok Habis'
            value={outOfStock}
            icon={<i className='fa-solid fa-ban' />}
            color='danger'
            footer={
              outOfStock > 0 ? (
                <button
                  type='button'
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-danger)",
                    fontSize: 11,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                  onClick={() => {
                    setFilterLevel("out");
                    setPage(1);
                  }}
                >
                  Lihat produk →
                </button>
              ) : null
            }
          />
        </div>

        {/* low stock alert banner */}
        {(lowStock > 0 || outOfStock > 0) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "var(--color-warning-subtle, #fffbeb)",
              border: "1px solid var(--color-warning)",
              borderRadius: "var(--radius-md)",
              borderLeft: "4px solid var(--color-warning)",
            }}
          >
            <i
              className='fa-solid fa-triangle-exclamation'
              style={{ color: "var(--color-warning)", fontSize: 16 }}
            />
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                Perhatian Stok!{" "}
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                {outOfStock > 0 && `${outOfStock} produk habis`}
                {outOfStock > 0 && lowStock > 0 && " dan "}
                {lowStock > 0 && `${lowStock} produk hampir habis`}. Segera
                lakukan restock.
              </span>
            </div>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => {
                setFilterLevel("low");
                setPage(1);
              }}
            >
              Lihat Sekarang
            </Button>
          </div>
        )}

        {/* toolbar */}
        <Card padding='sm'>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              padding: "6px 8px",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <SearchInput
                placeholder='Cari nama produk atau SKU...'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                size='sm'
              />
            </div>

            <select
              className='input-base input-default input-sm select-base'
              value={filterCat}
              onChange={(e) => {
                setFilterCat(e.target.value);
                setPage(1);
              }}
              style={{ width: 160, paddingRight: 32 }}
            >
              <option value=''>Semua Kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              className='input-base input-default input-sm select-base'
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setPage(1);
              }}
              style={{ width: 150, paddingRight: 32 }}
            >
              <option value=''>Semua Level Stok</option>
              <option value='out'>Stok Habis</option>
              <option value='low'>Stok Menipis</option>
              <option value='normal'>Stok Normal</option>
            </select>

            <select
              className='input-base input-default input-sm select-base'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 170, paddingRight: 32 }}
            >
              <option value='name'>Nama A–Z</option>
              <option value='stock_asc'>Stok Terendah</option>
              <option value='stock_desc'>Stok Tertinggi</option>
              <option value='updated'>Update Terbaru</option>
            </select>
          </div>
        </Card>

        {/* active filters */}
        {activeFilters.length > 0 && (
          <FilterBar
            filters={activeFilters}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        )}

        {/* results count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Menampilkan{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {filtered.length}
            </strong>{" "}
            produk
            {(search || activeFilters.length > 0) && " (difilter)"}
          </span>
          {filtered.length > PAGE_SIZE && (
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Halaman {page} dari {totalPages}
            </span>
          )}
        </div>

        {/* table */}
        {paginated.length === 0 ? (
          <Card padding='lg'>
            <EmptyState
              icon={<i className='fa-solid fa-boxes-stacked' />}
              title='Tidak ada data stok'
              description={
                search || activeFilters.length > 0
                  ? "Tidak ada produk yang cocok dengan filter atau pencarian kamu."
                  : "Belum ada produk yang terdaftar di inventaris."
              }
              action={
                (search || activeFilters.length > 0) && (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setSearch("");
                      clearAllFilters();
                    }}
                  >
                    Reset Filter
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <Card padding='none'>
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
                      borderBottom: "2px solid var(--color-border)",
                      background: "var(--color-bg-subtle)",
                    }}
                  >
                    {[
                      "Produk",
                      "Kategori",
                      "Lokasi",
                      "Level Stok",
                      "Supplier",
                      "Update Terakhir",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          textAlign: i === 6 ? "right" : "left",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item) => (
                    <StockTableRow
                      key={item.id}
                      item={item}
                      onAdjust={setAdjustTarget}
                      onHistory={setHistoryTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </div>

      {/* adjust modal */}
      <AdjustStockModal
        open={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onSave={handleAdjustSave}
        product={adjustTarget}
      />

      {/* history modal */}
      <StockHistoryModal
        open={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        product={historyTarget}
        history={history}
      />
    </DashboardLayout>
  );
}
