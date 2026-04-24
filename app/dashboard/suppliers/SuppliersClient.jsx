// app/dashboard/suppliers/SuppliersClient.jsx
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
import ConfirmDialog from "@/components/ui/feedback/ConfirmDialog";
import Modal from "@/components/ui/feedback/Modal";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import SearchInput from "@/components/ui/form/SearchInput";
import Input from "@/components/ui/form/Input";
import Select from "@/components/ui/form/Select";
import Textarea from "@/components/ui/form/Textarea";
import Toggle from "@/components/ui/form/Toggle";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import Pagination from "@/components/ui/navigation/Pagination";

const PROVINSI = [
  { value: "dki-jakarta", label: "DKI Jakarta" },
  { value: "jawa-barat", label: "Jawa Barat" },
  { value: "jawa-tengah", label: "Jawa Tengah" },
  { value: "jawa-timur", label: "Jawa Timur" },
  { value: "sumatera-utara", label: "Sumatera Utara" },
  { value: "sumatera-barat", label: "Sumatera Barat" },
  { value: "sulawesi-selatan", label: "Sulawesi Selatan" },
  { value: "kalimantan-timur", label: "Kalimantan Timur" },
  { value: "bali", label: "Bali" },
  { value: "lampung", label: "Lampung" },
  { value: "yogyakarta", label: "Yogyakarta" },
];

const DUMMY_SUPPLIERS = [
  {
    id: 1,
    name: "PT Makmur Sentosa Abadi",
    contact: "Bpk. Hendra Wijaya",
    phone: "0812-9876-5432",
    email: "hendra@makmursentosa.co.id",
    alamat: "Jl. Industri Raya No. 12, Jakarta Timur",
    provinsi: "dki-jakarta",
    produk: 18,
    totalOrder: 42,
    lastOrder: "2026-04-18",
    rating: 4.8,
    status: true,
    tags: ["kecantikan", "perawatan"],
  },
  {
    id: 2,
    name: "CV Sumber Sehat Farmasi",
    contact: "Ibu. Rina Marlina",
    phone: "0813-4455-6677",
    email: "rina@sumbersehat.co.id",
    alamat: "Jl. PUSPIPTEK Blok F-15, Banten",
    provinsi: "jawa-barat",
    produk: 9,
    totalOrder: 27,
    lastOrder: "2026-04-10",
    rating: 4.5,
    status: true,
    tags: ["kesehatan"],
  },
  {
    id: 3,
    name: "UD Bayi Sejahtera",
    contact: "Bpk. Agus Pratomo",
    phone: "0856-1122-3344",
    email: "agus@bayasj.co.id",
    alamat: "Jl. Surabaya No. 88, Bandung",
    provinsi: "jawa-barat",
    produk: 12,
    totalOrder: 19,
    lastOrder: "2026-04-02",
    rating: 4.2,
    status: true,
    tags: ["bayi"],
  },
  {
    id: 4,
    name: "PT Bright Commerce Indonesia",
    contact: "Bpk. Darwin Tanoto",
    phone: "0821-3344-5566",
    email: "darwin@brightcommerce.id",
    alamat: "Jl. Rungkut Industri Barat III No. 45, Surabaya",
    provinsi: "jawa-timur",
    produk: 7,
    totalOrder: 14,
    lastOrder: "2026-03-28",
    rating: 3.9,
    status: false,
    tags: ["kecantikan", "perawatan"],
  },
  {
    id: 5,
    name: "Toko Obat Alami Sehat",
    contact: "Ibu. Lisa Hartati",
    phone: "0878-9900-1122",
    email: "lisa@alamisehat.com",
    alamat: "Jl. Melaka No. 3, Medan",
    provinsi: "sumatera-utara",
    produk: 5,
    totalOrder: 8,
    lastOrder: "2026-03-15",
    rating: 4.6,
    status: true,
    tags: ["kesehatan"],
  },
  {
    id: 6,
    name: "PTDistribus Indonesia",
    contact: "Bpk. Fajar Nugroho",
    phone: "0899-2233-4455",
    email: "fajar@distribus.co.id",
    alamat: "Jl. Pall Mall No. 7, Jakarta Pusat",
    provinsi: "dki-jakarta",
    produk: 3,
    totalOrder: 5,
    lastOrder: "2026-02-20",
    rating: 3.5,
    status: false,
    tags: ["fashion", "makanan"],
  },
];

const EMPTY_FORM = {
  name: "",
  contact: "",
  phone: "",
  email: "",
  alamat: "",
  provinsi: "",
  produk: "",
  status: true,
  tags: [],
};

const PAGE_SIZE = 8;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── SUPPLIER FORM MODAL ────────────────────────────────────────────
function SupplierFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((v) => ({ ...v, [key]: val }));
    setErrors((v) => ({ ...v, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama supplier wajib diisi";
    if (!form.contact.trim()) e.contact = "Nama kontak wajib diisi";
    if (!form.phone.trim()) e.phone = "Nomor HP wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    onSave?.({ ...form, id: initial?.id ?? Date.now() });
    setLoading(false);
    onClose();
  };

  const isEdit = !!initial?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Supplier" : "Tambah Supplier Baru"}
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
            {isEdit ? "Simpan Perubahan" : "Tambah Supplier"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          label='Nama Supplier / Perusahaan'
          required
          placeholder='Contoh: PT Makmur Sentosa Abadi'
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
            label='Nama Kontak'
            required
            placeholder='Contoh: Bpk. Hendra Wijaya'
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            error={errors.contact}
          />
          <Input
            label='Nomor HP'
            required
            placeholder='0812-XXXX-XXXX'
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            error={errors.phone}
            leftIcon={<i className='fa-solid fa-phone' />}
          />
        </div>

        <Input
          label='Email'
          required
          type='email'
          placeholder='contoh@email.com'
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          leftIcon={<i className='fa-solid fa-envelope' />}
        />

        <Textarea
          label='Alamat Lengkap'
          placeholder='Jl. Nama Jalan No. XX, Kota/Kabupaten...'
          value={form.alamat}
          onChange={(e) => set("alamat", e.target.value)}
          rows={2}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Select
            label='Provinsi'
            options={PROVINSI}
            placeholder='Pilih provinsi...'
            value={form.provinsi}
            onChange={(e) => set("provinsi", e.target.value)}
          />
          <Input
            label='Jumlah Produk Disediakan'
            type='number'
            placeholder='0'
            value={form.produk}
            onChange={(e) => set("produk", e.target.value)}
            leftIcon={<i className='fa-solid fa-box' />}
          />
        </div>

        <Toggle
          label='Supplier Aktif'
          hint='Supplier nonaktif tidak akan muncul saat input pembelian'
          checked={form.status}
          onChange={(e) => set("status", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── SUPPLIER CARD ─────────────────────────────────────────────────
function SupplierCard({ supplier, onEdit, onDelete, onToggleStatus }) {
  const statusVariant = supplier.status ? "success" : "secondary";

  return (
    <div
      style={{
        background: "var(--color-bg-primary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
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
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px 0",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "var(--color-primary)",
            flexShrink: 0,
          }}
        >
          <i className='fa-solid fa-truck' />
        </div>
        <Badge variant={statusVariant} size='sm' dot>
          {supplier.status ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>

      <div
        style={{ padding: "10px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
      >
        {/* name & rating */}
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              lineHeight: 1.3,
            }}
          >
            {supplier.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 3,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <i
                  key={s}
                  className='fa-solid fa-star'
                  style={{
                    fontSize: 10,
                    color:
                      s <= Math.round(supplier.rating)
                        ? "#f59e0b"
                        : "var(--color-border)",
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {supplier.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <i
              className='fa-solid fa-user'
              style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                width: 12,
              }}
            />
            {supplier.contact}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <i
              className='fa-solid fa-phone'
              style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                width: 12,
              }}
            />
            {supplier.phone}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <i
              className='fa-solid fa-envelope'
              style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                width: 12,
              }}
            />
            {supplier.email}
          </div>
        </div>

        {/* address */}
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            lineHeight: 1.4,
          }}
        >
          <i className='fa-solid fa-location-dot' style={{ marginRight: 4 }} />
          {supplier.alamat}
        </div>

        {/* tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {supplier.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: "var(--color-bg-subtle)",
                border: "1px solid var(--color-border)",
                fontSize: 10,
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* stats row */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            marginTop: 2,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 0",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {supplier.produk}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
              Produk
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 0",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {supplier.totalOrder}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
              Order
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {formatDate(supplier.lastOrder).split(" ").slice(1).join(" ")}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
              Terakhir
            </div>
          </div>
        </div>

        {/* actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            <i className='fa-solid fa-receipt' style={{ marginRight: 4 }} />
            {supplier.totalOrder} order · terakhir {formatDate(supplier.lastOrder)}
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
                label: "Edit supplier",
                icon: <i className='fa-solid fa-pen' />,
                onClick: () => onEdit(supplier),
              },
              {
                label: supplier.status ? "Nonaktifkan" : "Aktifkan",
                icon: (
                  <i
                    className={`fa-solid ${supplier.status ? "fa-eye-slash" : "fa-eye"}`}
                  />
                ),
                onClick: () => onToggleStatus(supplier.id),
              },
              { divider: true },
              {
                label: "Hapus supplier",
                icon: <i className='fa-solid fa-trash' />,
                onClick: () => onDelete(supplier),
                danger: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN CLIENT ───────────────────────────────────────────────────
export default function SuppliersClient({ user }) {
  const toast = useToast();

  const [suppliers, setSuppliers] = useState(DUMMY_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── filter & sort ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = [...suppliers];

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.contact.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }
    if (filterStatus === "aktif") arr = arr.filter((s) => s.status);
    if (filterStatus === "nonaktif") arr = arr.filter((s) => !s.status);

    arr.sort((a, b) => {
      if (sortBy === "produk") return b.produk - a.produk;
      if (sortBy === "order") return b.totalOrder - a.totalOrder;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return arr;
  }, [suppliers, search, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── stats ─────────────────────────────────────────────────────────
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status).length;
  const totalProducts = suppliers.reduce((s, c) => s + c.produk, 0);
  const totalOrders = suppliers.reduce((s, c) => s + c.totalOrder, 0);

  // ── handlers ──────────────────────────────────────────────────────
  const handleSave = (data) => {
    if (data.id && suppliers.find((s) => s.id === data.id)) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s)),
      );
      toast.add({
        variant: "success",
        title: "Tersimpan",
        message: `Supplier "${data.name}" berhasil diperbarui.`,
      });
    } else {
      setSuppliers((prev) => [
        { ...data, totalOrder: 0, lastOrder: new Date().toISOString().split("T")[0], rating: 0, id: Date.now() },
        ...prev,
      ]);
      toast.add({
        variant: "success",
        title: "Ditambahkan",
        message: `Supplier "${data.name}" berhasil ditambahkan.`,
      });
    }
    setEditSupplier(null);
  };

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const target = deleteTarget;
    await new Promise((r) => setTimeout(r, 700));

    setSuppliers((prev) => prev.filter((s) => s.id !== target.id));
    toast.add({
      variant: "success",
      message: `Supplier "${target.name}" dihapus.`,
    });

    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleToggleStatus = (id) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = s.status ? "nonaktif" : "aktif";
        toast.add({ variant: "info", message: `${s.name} → ${next}` });
        return { ...s, status: !s.status };
      }),
    );
  };

  return (
    <DashboardLayout activeKey='suppliers'>
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
              { label: "Supplier" },
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
                Manajemen Supplier
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {totalSuppliers} supplier · {activeSuppliers} aktif ·{" "}
                {totalOrders} total order
              </p>
            </div>
            <Button
              variant='primary'
              size='sm'
              leftIcon={<i className='fa-solid fa-plus' />}
              onClick={() => {
                setEditSupplier(null);
                setFormOpen(true);
              }}
            >
              Tambah Supplier
            </Button>
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
            label='Total Supplier'
            value={totalSuppliers}
            icon={<i className='fa-solid fa-truck' />}
            color='primary'
          />
          <StatCard
            label='Supplier Aktif'
            value={activeSuppliers}
            icon={<i className='fa-solid fa-circle-check' />}
            color='success'
          />
          <StatCard
            label='Total Produk'
            value={totalProducts}
            icon={<i className='fa-solid fa-box' />}
            color='warning'
          />
          <StatCard
            label='Total Order'
            value={totalOrders}
            icon={<i className='fa-solid fa-receipt' />}
            color='secondary'
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
            <div style={{ flex: 1, minWidth: 220 }}>
              <SearchInput
                placeholder='Cari nama, kontak, atau email supplier...'
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
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: 140, paddingRight: 32 }}
            >
              <option value=''>Semua Status</option>
              <option value='aktif'>Aktif</option>
              <option value='nonaktif'>Nonaktif</option>
            </select>

            <select
              className='input-base input-default input-sm select-base'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 180, paddingRight: 32 }}
            >
              <option value='name'>Nama A–Z</option>
              <option value='rating'>Rating Tertinggi</option>
              <option value='produk'>Produk Terbanyak</option>
              <option value='order'>Order Terbanyak</option>
            </select>
          </div>
        </Card>

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
            supplier
            {search || filterStatus ? " (difilter)" : ""}
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
              icon={<i className='fa-solid fa-truck' />}
              title='Tidak ada supplier'
              description={
                search || filterStatus
                  ? "Tidak ada supplier yang cocok dengan filter atau pencarian kamu."
                  : 'Belum ada supplier. Klik "Tambah Supplier" untuk mulai.'
              }
              action={
                search || filterStatus ? (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setSearch("");
                      setFilterStatus("");
                      setPage(1);
                    }}
                  >
                    Reset Filter
                  </Button>
                ) : (
                  <Button
                    variant='primary'
                    leftIcon={<i className='fa-solid fa-plus' />}
                    onClick={() => {
                      setEditSupplier(null);
                      setFormOpen(true);
                    }}
                  >
                    Tambah Supplier Pertama
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {paginated.map((s) => (
              <SupplierCard
                key={s.id}
                supplier={s}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
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
      <SupplierFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditSupplier(null);
        }}
        onSave={handleSave}
        initial={editSupplier}
      />

      {/* delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Hapus Supplier'
        message={`Supplier "${deleteTarget?.name}" akan dihapus. Semua data order terkait supplier ini tidak ikut terhapus.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </DashboardLayout>
  );
}
