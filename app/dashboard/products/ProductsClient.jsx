// app/dashboard/products/ProductsClient.jsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/data/Badge";
import Avatar from "@/components/ui/data/Avatar";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Tooltip from "@/components/ui/data/Tooltip";
import EmptyState from "@/components/ui/data/EmptyState";
import { Skeleton } from "@/components/ui/data/Skeleton";
import Button from "@/components/ui/button/Button";
import ButtonGroup from "@/components/ui/button/ButtonGroup";
import IconButton from "@/components/ui/button/IconButton";
import ConfirmDialog from "@/components/ui/feedback/ConfirmDialog";
import Modal from "@/components/ui/feedback/Modal";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import FilterBar from "@/components/ui/form/FilterBar";
import SearchInput from "@/components/ui/form/SearchInput";
import Input from "@/components/ui/form/Input";
import Select from "@/components/ui/form/Select";
import Textarea from "@/components/ui/form/Textarea";
import Toggle from "@/components/ui/form/Toggle";
import ImageUpload from "@/components/ui/form/ImageUpload";
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import ProgressBar from "@/components/ui/feedback/ProgressBar";
import { RatingDisplay } from "@/components/ui/form/RatingInput";

// ─── DUMMY DATA ───────────────────────────────────────────────────
const CATEGORIES = [
  { value: "kecantikan", label: "Kecantikan" },
  { value: "perawatan", label: "Perawatan Tubuh" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "bayi", label: "Produk Bayi" },
  { value: "fashion", label: "Fashion & Aksesoris" },
  { value: "makanan", label: "Makanan & Minuman" },
];

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Lipstik Matte Wardah No.20",
    sku: "LPS-001",
    category: "kecantikan",
    price: 45000,
    cost: 28000,
    stock: 24,
    minStock: 10,
    sold: 48,
    status: "aktif",
    image: "https://picsum.photos/seed/lip/200",
    rating: 4.5,
    reviews: 32,
  },
  {
    id: 2,
    name: "Bedak Bayi Johnson's 50gr",
    sku: "BBY-002",
    category: "bayi",
    price: 22000,
    cost: 14000,
    stock: 5,
    minStock: 10,
    sold: 41,
    status: "aktif",
    image: "https://picsum.photos/seed/baby/200",
    rating: 4.8,
    reviews: 56,
  },
  {
    id: 3,
    name: "Sabun Muka Pond's Age Miracle",
    sku: "SBN-003",
    category: "perawatan",
    price: 32000,
    cost: 19000,
    stock: 18,
    minStock: 5,
    sold: 37,
    status: "aktif",
    image: "https://picsum.photos/seed/ponds/200",
    rating: 4.2,
    reviews: 28,
  },
  {
    id: 4,
    name: "Masker Wajah Mughnii 20s",
    sku: "MSK-004",
    category: "kecantikan",
    price: 28000,
    cost: 16000,
    stock: 0,
    minStock: 5,
    sold: 29,
    status: "habis",
    image: "https://picsum.photos/seed/mask/200",
    rating: 4.0,
    reviews: 19,
  },
  {
    id: 5,
    name: "Serum Vit C Scarlett 40ml",
    sku: "SRM-005",
    category: "perawatan",
    price: 75000,
    cost: 45000,
    stock: 12,
    minStock: 5,
    sold: 22,
    status: "aktif",
    image: "https://picsum.photos/seed/serum/200",
    rating: 4.7,
    reviews: 41,
  },
  {
    id: 6,
    name: "Toner Somethinc Niacinamide",
    sku: "TNR-006",
    category: "perawatan",
    price: 89000,
    cost: 55000,
    stock: 8,
    minStock: 5,
    sold: 19,
    status: "aktif",
    image: "https://picsum.photos/seed/toner/200",
    rating: 4.6,
    reviews: 23,
  },
  {
    id: 7,
    name: "Pelembab Cetaphil 250ml",
    sku: "PLB-007",
    category: "perawatan",
    price: 125000,
    cost: 82000,
    stock: 3,
    minStock: 5,
    sold: 15,
    status: "aktif",
    image: "https://picsum.photos/seed/cetaphil/200",
    rating: 4.9,
    reviews: 67,
  },
  {
    id: 8,
    name: "Sunscreen Azarine SPF 45",
    sku: "SUN-008",
    category: "kecantikan",
    price: 35000,
    cost: 21000,
    stock: 30,
    minStock: 10,
    sold: 55,
    status: "aktif",
    image: "https://picsum.photos/seed/sunscreen/200",
    rating: 4.4,
    reviews: 88,
  },
  {
    id: 9,
    name: "Shampo Dove Moisture 170ml",
    sku: "SHP-009",
    category: "perawatan",
    price: 18000,
    cost: 11000,
    stock: 45,
    minStock: 10,
    sold: 62,
    status: "aktif",
    image: "https://picsum.photos/seed/dove/200",
    rating: 4.3,
    reviews: 45,
  },
  {
    id: 10,
    name: "Vitamin C Blackmores 60s",
    sku: "VIT-010",
    category: "kesehatan",
    price: 185000,
    cost: 128000,
    stock: 7,
    minStock: 5,
    sold: 11,
    status: "aktif",
    image: "https://picsum.photos/seed/vit/200",
    rating: 4.7,
    reviews: 34,
  },
  {
    id: 11,
    name: "Minyak Telon Lang 60ml",
    sku: "MTL-011",
    category: "bayi",
    price: 15000,
    cost: 9000,
    stock: 22,
    minStock: 10,
    sold: 33,
    status: "aktif",
    image: "https://picsum.photos/seed/telon/200",
    rating: 4.6,
    reviews: 52,
  },
  {
    id: 12,
    name: "Krim BB Garnier Light",
    sku: "BBK-012",
    category: "kecantikan",
    price: 42000,
    cost: 27000,
    stock: 0,
    minStock: 5,
    sold: 8,
    status: "nonaktif",
    image: "https://picsum.photos/seed/garnier/200",
    rating: 3.9,
    reviews: 12,
  },
];

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "",
  price: "",
  cost: "",
  stock: "",
  minStock: "",
  description: "",
  status: true,
};

const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const getStockStatus = (stock, min) => {
  if (stock === 0) return { label: "Habis", variant: "danger", pct: 0 };
  if (stock <= min)
    return {
      label: "Menipis",
      variant: "warning",
      pct: Math.round((stock / min) * 50),
    };
  return { label: "Tersedia", variant: "success", pct: 100 };
};

// ─── PRODUCT FORM MODAL ───────────────────────────────────────────
function ProductFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((v) => ({ ...v, [key]: val }));
    setErrors((v) => ({ ...v, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (!form.sku.trim()) e.sku = "SKU wajib diisi";
    if (!form.category) e.category = "Pilih kategori";
    if (!form.price) e.price = "Harga jual wajib diisi";
    if (!form.stock && form.stock !== 0) e.stock = "Stok wajib diisi";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave?.({ ...form, id: initial?.id ?? Date.now() });
    setLoading(false);
    onClose();
  };

  const isEdit = !!initial?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Produk" : "Tambah Produk Baru"}
      size='lg'
      closeable={!loading}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant='primary'
            loading={loading}
            onClick={handleSave}
            leftIcon={!loading && <i className='fa-solid fa-floppy-disk' />}
          >
            {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* foto */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div>
            <div className='form-label' style={{ marginBottom: 6 }}>
              Foto Produk
            </div>
            <ImageUpload aspectRatio='1/1' hint='JPG, PNG · Maks 2MB' />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <Input
              label='Nama Produk'
              required
              placeholder='Contoh: Lipstik Matte Wardah No.20'
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Input
                label='SKU / Kode Produk'
                required
                placeholder='Contoh: LPS-001'
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                error={errors.sku}
              />
              <Select
                label='Kategori'
                required
                options={CATEGORIES}
                placeholder='Pilih kategori...'
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                error={errors.category}
              />
            </div>
          </div>
        </div>

        {/* harga & stok */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          <Input
            label='Harga Jual'
            required
            prefix='Rp'
            type='number'
            placeholder='0'
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            error={errors.price}
          />
          <Input
            label='Harga Modal'
            prefix='Rp'
            type='number'
            placeholder='0'
            value={form.cost}
            onChange={(e) => set("cost", e.target.value)}
            hint={
              form.price && form.cost
                ? `Margin: Rp ${Number(form.price - form.cost).toLocaleString("id-ID")} (${Math.round(((form.price - form.cost) / form.price) * 100)}%)`
                : ""
            }
          />
          <Input
            label='Stok Awal'
            required
            type='number'
            placeholder='0'
            leftIcon={<i className='fa-solid fa-boxes-stacked' />}
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            error={errors.stock}
          />
          <Input
            label='Stok Minimum'
            type='number'
            placeholder='5'
            leftIcon={<i className='fa-solid fa-triangle-exclamation' />}
            value={form.minStock}
            onChange={(e) => set("minStock", e.target.value)}
            hint='Notifikasi akan muncul jika stok ≤ nilai ini'
          />
        </div>

        {/* deskripsi */}
        <Textarea
          label='Deskripsi Produk'
          placeholder='Jelaskan keunggulan produk ini...'
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
        />

        {/* status */}
        <Toggle
          label='Produk Aktif'
          hint='Produk nonaktif tidak akan muncul di kasir'
          checked={form.status}
          onChange={(e) => set("status", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── PRODUCT CARD (grid view) ─────────────────────────────────────
function ProductCard({ product, onEdit, onDelete, onToggleStatus }) {
  const stock = getStockStatus(product.stock, product.minStock);
  const margin = product.price - product.cost;
  const marginPct = Math.round((margin / product.price) * 100);

  return (
    <div
      style={{
        background: "var(--color-bg-primary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        // overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .2s, transform .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(233,30,140,.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          background: "var(--color-bg-muted)",
          //   overflow: "hidden",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform .3s",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />
        {/* badges */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {product.stock === 0 && (
            <Badge variant='danger' size='sm'>
              Habis
            </Badge>
          )}
          {product.stock > 0 && product.stock <= product.minStock && (
            <Badge variant='warning' size='sm'>
              Menipis
            </Badge>
          )}
          {product.status === "nonaktif" && (
            <Badge variant='secondary' size='sm'>
              Nonaktif
            </Badge>
          )}
        </div>
        {/* actions overlay */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            opacity: 0,
            transition: "opacity .2s",
          }}
          className='product-card-actions'
        >
          <Tooltip content='Edit' placement='left'>
            <button
              type='button'
              onClick={() => onEdit(product)}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "var(--color-primary)",
                boxShadow: "0 2px 8px rgba(0,0,0,.15)",
              }}
            >
              <i className='fa-solid fa-pen' />
            </button>
          </Tooltip>
          <Tooltip content='Hapus' placement='left'>
            <button
              type='button'
              onClick={() => onDelete(product)}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "var(--color-danger)",
                boxShadow: "0 2px 8px rgba(0,0,0,.15)",
              }}
            >
              <i className='fa-solid fa-trash' />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* content */}
      <div
        style={{
          padding: "14px 14px 12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: "var(--color-primary)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: 3,
            }}
          >
            {CATEGORIES.find((c) => c.value === product.category)?.label ??
              product.category}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              //   overflow: "hidden",
            }}
          >
            {product.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 2,
            }}
          >
            {product.sku}
          </div>
        </div>

        {/* rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <RatingDisplay value={Math.round(product.rating)} size='sm' />
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            ({product.reviews})
          </span>
        </div>

        {/* price */}
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-primary)",
            }}
          >
            {formatRupiah(product.price)}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            Modal {formatRupiah(product.cost)} · Margin {marginPct}%
          </div>
        </div>

        {/* stock */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              Stok
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Badge variant={stock.variant} size='sm' dot>
                {stock.label}
              </Badge>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {product.stock}
              </span>
            </div>
          </div>
          <ProgressBar
            value={Math.min(
              (product.stock / (product.minStock * 3)) * 100,
              100,
            )}
            size='xs'
            variant={
              product.stock === 0
                ? "danger"
                : product.stock <= product.minStock
                  ? "warning"
                  : "success"
            }
          />
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 2,
            paddingTop: 8,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            <i
              className='fa-solid fa-bag-shopping'
              style={{ marginRight: 4 }}
            />
            {product.sold} terjual
          </span>
          <Dropdown
            trigger={
              <IconButton
                icon={<i className='fa-solid fa-ellipsis-vertical' />}
                size='sm'
                label='Opsi'
                variant='ghost'
              />
            }
            align='right'
            items={[
              {
                label: "Edit produk",
                icon: <i className='fa-solid fa-pen' />,
                onClick: () => onEdit(product),
              },
              {
                label: "Tambah stok",
                icon: <i className='fa-solid fa-plus' />,
                onClick: () => {},
              },
              {
                label: product.status === "aktif" ? "Nonaktifkan" : "Aktifkan",
                icon: (
                  <i
                    className={`fa-solid ${product.status === "aktif" ? "fa-eye-slash" : "fa-eye"}`}
                  />
                ),
                onClick: () => onToggleStatus(product.id),
              },
              { divider: true },
              {
                label: "Hapus produk",
                icon: <i className='fa-solid fa-trash' />,
                onClick: () => onDelete(product),
                danger: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ─── TABLE ROW (list view) ────────────────────────────────────────
function ProductTableRow({ product, onEdit, onDelete, onToggleStatus }) {
  const stock = getStockStatus(product.stock, product.minStock);
  const margin = product.price - product.cost;
  const marginPct = Math.round((margin / product.price) * 100);

  return (
    <tr className='product-table-row'>
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid var(--color-border)",
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
              {product.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {product.sku}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <Badge variant='secondary' size='sm'>
          {CATEGORIES.find((c) => c.value === product.category)?.label ??
            product.category}
        </Badge>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "right" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          {formatRupiah(product.price)}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Margin {marginPct}%
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Badge variant={stock.variant} size='sm' dot>
            {product.stock} unit
          </Badge>
          {product.stock <= product.minStock && product.stock > 0 && (
            <span style={{ fontSize: 10, color: "var(--color-warning)" }}>
              min: {product.minStock}
            </span>
          )}
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            justifyContent: "center",
          }}
        >
          <RatingDisplay value={Math.round(product.rating)} size='sm' />
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            ({product.reviews})
          </span>
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {product.sold}×
        </span>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <Badge
          variant={
            product.status === "aktif"
              ? "success"
              : product.status === "habis"
                ? "danger"
                : "secondary"
          }
          size='sm'
          dot
        >
          {product.status === "aktif"
            ? "Aktif"
            : product.status === "habis"
              ? "Habis"
              : "Nonaktif"}
        </Badge>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "flex-end",
          }}
        >
          <Tooltip content='Edit' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-pen' />}
              size='sm'
              variant='ghost'
              label='Edit'
              onClick={() => onEdit(product)}
            />
          </Tooltip>
          <Tooltip content='Hapus' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-trash' />}
              size='sm'
              variant='ghost'
              label='Hapus'
              onClick={() => onDelete(product)}
              style={{ color: "var(--color-danger)" }}
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
                label: "Tambah stok",
                icon: <i className='fa-solid fa-plus' />,
                onClick: () => {},
              },
              {
                label: product.status === "aktif" ? "Nonaktifkan" : "Aktifkan",
                icon: (
                  <i
                    className={`fa-solid ${product.status === "aktif" ? "fa-eye-slash" : "fa-eye"}`}
                  />
                ),
                onClick: () => onToggleStatus(product.id),
              },
              {
                label: "Duplikat",
                icon: <i className='fa-solid fa-copy' />,
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
export default function ProductsClient({ user }) {
  const toast = useToast();
  const router = useRouter();

  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [view, setView] = useState("grid"); // 'grid' | 'list'
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

  // modals
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── filter & sort ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    if (filterCat) arr = arr.filter((p) => p.category === filterCat);
    if (filterStock === "low")
      arr = arr.filter((p) => p.stock > 0 && p.stock <= p.minStock);
    if (filterStock === "out") arr = arr.filter((p) => p.stock === 0);
    if (filterStatus) arr = arr.filter((p) => p.status === filterStatus);

    arr.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock") return a.stock - b.stock;
      if (sortBy === "sold") return b.sold - a.sold;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return arr;
  }, [products, search, filterCat, filterStock, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── active filters ────────────────────────────────────────────
  const activeFilters = [
    filterCat && {
      key: "cat",
      label: "Kategori",
      value: CATEGORIES.find((c) => c.value === filterCat)?.label,
    },
    filterStock && {
      key: "stock",
      label: "Stok",
      value: filterStock === "low" ? "Menipis" : "Habis",
    },
    filterStatus && {
      key: "status",
      label: "Status",
      value:
        filterStatus === "aktif"
          ? "Aktif"
          : filterStatus === "habis"
            ? "Habis"
            : "Nonaktif",
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "cat") setFilterCat("");
    if (key === "stock") setFilterStock("");
    if (key === "status") setFilterStatus("");
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilterCat("");
    setFilterStock("");
    setFilterStatus("");
    setPage(1);
  };

  // ── handlers ──────────────────────────────────────────────────
  const handleSave = (data) => {
    if (data.id && products.find((p) => p.id === data.id)) {
      setProducts((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)),
      );
      toast.add({
        variant: "success",
        title: "Tersimpan",
        message: `${data.name} berhasil diperbarui.`,
      });
    } else {
      setProducts((prev) => [
        {
          ...data,
          sold: 0,
          rating: 0,
          reviews: 0,
          image: "https://picsum.photos/seed/new/200",
          status: data.status ? "aktif" : "nonaktif",
        },
        ...prev,
      ]);
      toast.add({
        variant: "success",
        title: "Ditambahkan",
        message: `${data.name} berhasil ditambahkan.`,
      });
    }
    setEditProduct(null);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    const target = deleteTarget; // snapshot (important)

    await new Promise((r) => setTimeout(r, 700));

    setProducts((prev) => prev.filter((p) => p.id !== target.id));

    toast.add({
      variant: "success",
      message: `${target.name} dihapus.`,
    });

    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleToggleStatus = (id) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = p.status === "aktif" ? "nonaktif" : "aktif";
        toast.add({ variant: "info", message: `${p.name} → ${next}` });
        return { ...p, status: next };
      }),
    );
  };

  // ── stats ─────────────────────────────────────────────────────
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "aktif").length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= p.minStock,
  ).length;

  return (
    <DashboardLayout activeKey='products'>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* page header */}
        <div>
          <Breadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/dashboard",
                icon: <i className='fa-solid fa-house' />,
              },
              { label: "Produk" },
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
                Manajemen Produk
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {totalProducts} produk terdaftar · {activeProducts} aktif
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
                leftIcon={<i className='fa-solid fa-upload' />}
              >
                Import
              </Button>
              <Button
                variant='primary'
                size='sm'
                leftIcon={<i className='fa-solid fa-plus' />}
                onClick={() => {
                  setEditProduct(null);
                  setFormOpen(true);
                }}
              >
                Tambah Produk
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
            value={totalProducts}
            icon={<i className='fa-solid fa-box' />}
            color='primary'
          />
          <StatCard
            label='Produk Aktif'
            value={activeProducts}
            icon={<i className='fa-solid fa-circle-check' />}
            color='success'
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
                    setFilterStock("low");
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
                    setFilterStock("out");
                    setPage(1);
                  }}
                >
                  Lihat produk →
                </button>
              ) : null
            }
          />
        </div>

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
            {/* search */}
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

            {/* category filter */}
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

            {/* stock filter */}
            <select
              className='input-base input-default input-sm select-base'
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value);
                setPage(1);
              }}
              style={{ width: 140, paddingRight: 32 }}
            >
              <option value=''>Semua Stok</option>
              <option value='low'>Stok Menipis</option>
              <option value='out'>Stok Habis</option>
            </select>

            {/* status filter */}
            <select
              className='input-base input-default input-sm select-base'
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: 130, paddingRight: 32 }}
            >
              <option value=''>Semua Status</option>
              <option value='aktif'>Aktif</option>
              <option value='nonaktif'>Nonaktif</option>
              <option value='habis'>Habis</option>
            </select>

            {/* sort */}
            <select
              className='input-base input-default input-sm select-base'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 150, paddingRight: 32 }}
            >
              <option value='name'>Nama A–Z</option>
              <option value='price_asc'>Harga Termurah</option>
              <option value='price_desc'>Harga Termahal</option>
              <option value='stock'>Stok Terendah</option>
              <option value='sold'>Terlaris</option>
            </select>

            {/* view toggle */}
            <ButtonGroup
              mode='toggle'
              size='sm'
              value={view}
              onChange={setView}
              items={[
                { value: "grid", icon: <i className='fa-solid fa-grip' /> },
                { value: "list", icon: <i className='fa-solid fa-list' /> },
              ]}
            />
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
            gap: 10,
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

        {/* content */}
        {paginated.length === 0 ? (
          <Card padding='lg'>
            <EmptyState
              icon={<i className='fa-solid fa-box-open' />}
              title='Tidak ada produk'
              description={
                search || activeFilters.length > 0
                  ? "Tidak ada produk yang cocok dengan filter atau pencarian kamu."
                  : 'Belum ada produk yang ditambahkan. Klik "Tambah Produk" untuk mulai.'
              }
              action={
                search || activeFilters.length > 0 ? (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setSearch("");
                      clearAllFilters();
                    }}
                  >
                    Reset Filter
                  </Button>
                ) : (
                  <Button
                    variant='primary'
                    leftIcon={<i className='fa-solid fa-plus' />}
                    onClick={() => {
                      setEditProduct(null);
                      setFormOpen(true);
                    }}
                  >
                    Tambah Produk Pertama
                  </Button>
                )
              }
            />
          </Card>
        ) : view === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {paginated.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
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
                      "Harga",
                      "Stok",
                      "Rating",
                      "Terjual",
                      "Status",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          textAlign:
                            i >= 2 && i <= 5
                              ? "center"
                              : i === 7
                                ? "right"
                                : "left",
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
                  {paginated.map((p) => (
                    <ProductTableRow
                      key={p.id}
                      product={p}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                      onToggleStatus={handleToggleStatus}
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

      {/* form modal */}
      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditProduct(null);
        }}
        onSave={handleSave}
        initial={editProduct}
      />

      {/* delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Hapus Produk'
        message={`Produk "${deleteTarget?.name}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </DashboardLayout>
  );
}
