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
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import FilterBar from "@/components/ui/form/FilterBar";

// ─── CONSTANTS ────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const INCOME_CATEGORIES = [
  { value: "penjualan", label: "Penjualan Produk" },
  { value: "jasa", label: "Jasa / Layanan" },
  { value: "investasi", label: "Hasil Investasi" },
  { value: "lainnya", label: "Lain-lain" },
];

const PAYMENT_METHODS = [
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer Bank" },
  { value: "qris", label: "QRIS" },
  { value: "kartu", label: "Kartu Debit/Kredit" },
];

const DUMMY_INCOME = [
  {
    id: 1,
    date: "2025-01-22",
    ref: "INC-0001",
    description: "Penjualan kasir – sesi pagi",
    category: "penjualan",
    method: "tunai",
    amount: 875000,
    note: "",
    status: "selesai",
  },
  {
    id: 2,
    date: "2025-01-22",
    ref: "INC-0002",
    description: "Penjualan kasir – sesi siang",
    category: "penjualan",
    method: "qris",
    amount: 1240000,
    note: "",
    status: "selesai",
  },
  {
    id: 3,
    date: "2025-01-21",
    ref: "INC-0003",
    description: "Transfer pelanggan grosir",
    category: "penjualan",
    method: "transfer",
    amount: 3500000,
    note: "Toko Maju Jaya",
    status: "selesai",
  },
  {
    id: 4,
    date: "2025-01-21",
    ref: "INC-0004",
    description: "Jasa konsultasi kecantikan",
    category: "jasa",
    method: "transfer",
    amount: 250000,
    note: "",
    status: "selesai",
  },
  {
    id: 5,
    date: "2025-01-20",
    ref: "INC-0005",
    description: "Penjualan kasir – sesi pagi",
    category: "penjualan",
    method: "tunai",
    amount: 660000,
    note: "",
    status: "selesai",
  },
  {
    id: 6,
    date: "2025-01-20",
    ref: "INC-0006",
    description: "Penjualan online Tokopedia",
    category: "penjualan",
    method: "transfer",
    amount: 1875000,
    note: "Order batch Jan W3",
    status: "selesai",
  },
  {
    id: 7,
    date: "2025-01-19",
    ref: "INC-0007",
    description: "Penjualan kasir – sesi sore",
    category: "penjualan",
    method: "qris",
    amount: 945000,
    note: "",
    status: "selesai",
  },
  {
    id: 8,
    date: "2025-01-19",
    ref: "INC-0008",
    description: "Pendapatan bunga deposito",
    category: "investasi",
    method: "transfer",
    amount: 412500,
    note: "Deposito BCA Jan 2025",
    status: "selesai",
  },
  {
    id: 9,
    date: "2025-01-18",
    ref: "INC-0009",
    description: "Penjualan kasir – sesi pagi",
    category: "penjualan",
    method: "tunai",
    amount: 520000,
    note: "",
    status: "selesai",
  },
  {
    id: 10,
    date: "2025-01-18",
    ref: "INC-0010",
    description: "Retur vendor –elebihan bayar",
    category: "lainnya",
    method: "transfer",
    amount: 175000,
    note: "PT Unilever",
    status: "selesai",
  },
  {
    id: 11,
    date: "2025-01-17",
    ref: "INC-0011",
    description: "Penjualan kasir – sesi pagi",
    category: "penjualan",
    method: "tunai",
    amount: 710000,
    note: "",
    status: "selesai",
  },
  {
    id: 12,
    date: "2025-01-17",
    ref: "INC-0012",
    description: "Penjualan kasir – sesi siang",
    category: "penjualan",
    method: "kartu",
    amount: 990000,
    note: "",
    status: "selesai",
  },
  {
    id: 13,
    date: "2025-01-16",
    ref: "INC-0013",
    description: "Penjualan online Shopee",
    category: "penjualan",
    method: "transfer",
    amount: 2100000,
    note: "Order batch Jan W3",
    status: "selesai",
  },
  {
    id: 14,
    date: "2025-01-15",
    ref: "INC-0014",
    description: "Jasa pelatihan karyawan baru",
    category: "jasa",
    method: "transfer",
    amount: 500000,
    note: "",
    status: "pending",
  },
  {
    id: 15,
    date: "2025-01-15",
    ref: "INC-0015",
    description: "Penjualan kasir – sesi pagi",
    category: "penjualan",
    method: "tunai",
    amount: 430000,
    note: "",
    status: "selesai",
  },
];

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  category: "",
  method: "",
  amount: "",
  note: "",
};

const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const methodConfig = {
  tunai: { label: "Tunai", icon: "fa-money-bill-wave", variant: "success" },
  transfer: { label: "Transfer", icon: "fa-building-columns", variant: "info" },
  qris: { label: "QRIS", icon: "fa-qrcode", variant: "primary" },
  kartu: { label: "Kartu", icon: "fa-credit-card", variant: "secondary" },
};

const catConfig = {
  penjualan: { label: "Penjualan Produk", variant: "primary" },
  jasa: { label: "Jasa / Layanan", variant: "info" },
  investasi: { label: "Hasil Investasi", variant: "success" },
  lainnya: { label: "Lain-lain", variant: "secondary" },
};

// ─── INCOME FORM MODAL ────────────────────────────────────────────
function IncomeFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((v) => ({ ...v, [key]: val }));
    setErrors((v) => ({ ...v, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.date) e.date = "Tanggal wajib diisi";
    if (!form.description.trim()) e.description = "Keterangan wajib diisi";
    if (!form.category) e.category = "Pilih kategori";
    if (!form.method) e.method = "Pilih metode pembayaran";
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = "Jumlah harus lebih dari 0";
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
      title={isEdit ? "Edit Pemasukan" : "Tambah Pemasukan"}
      size='md'
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
            {isEdit ? "Simpan Perubahan" : "Tambah Pemasukan"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Input
            label='Tanggal'
            required
            type='date'
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            error={errors.date}
          />
          <Input
            label='Jumlah'
            required
            type='number'
            prefix='Rp'
            placeholder='0'
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            error={errors.amount}
          />
        </div>
        <Input
          label='Keterangan'
          required
          placeholder='Contoh: Penjualan kasir sesi pagi'
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          error={errors.description}
        />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Select
            label='Kategori'
            required
            options={INCOME_CATEGORIES}
            placeholder='Pilih kategori...'
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            error={errors.category}
          />
          <Select
            label='Metode Pembayaran'
            required
            options={PAYMENT_METHODS}
            placeholder='Pilih metode...'
            value={form.method}
            onChange={(e) => set("method", e.target.value)}
            error={errors.method}
          />
        </div>
        <Textarea
          label='Catatan'
          placeholder='Catatan tambahan (opsional)'
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}

// ─── TABLE ROW ────────────────────────────────────────────────────
function IncomeTableRow({ item, onEdit, onDelete }) {
  const method = methodConfig[item.method] ?? {
    label: item.method,
    icon: "fa-circle",
    variant: "secondary",
  };
  const cat = catConfig[item.category] ?? {
    label: item.category,
    variant: "secondary",
  };

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
      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {formatDate(item.date)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          {item.ref}
        </div>
      </td>
      <td style={{ padding: "10px 14px", maxWidth: 260 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            lineHeight: 1.35,
          }}
        >
          {item.description}
        </div>
        {item.note && (
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 2,
            }}
          >
            {item.note}
          </div>
        )}
      </td>
      <td style={{ padding: "10px 14px" }}>
        <Badge variant={cat.variant} size='sm'>
          {cat.label}
        </Badge>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i
            className={`fa-solid ${method.icon}`}
            style={{ fontSize: 11, color: "var(--color-text-muted)" }}
          />
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {method.label}
          </span>
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "right" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-success)",
          }}
        >
          {formatRupiah(item.amount)}
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <Badge
          variant={item.status === "selesai" ? "success" : "warning"}
          size='sm'
          dot
        >
          {item.status === "selesai" ? "Selesai" : "Pending"}
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
              onClick={() => onEdit(item)}
            />
          </Tooltip>
          <Tooltip content='Hapus' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-trash' />}
              size='sm'
              variant='ghost'
              label='Hapus'
              onClick={() => onDelete(item)}
              style={{ color: "var(--color-danger)" }}
            />
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function IncomeClient({ user }) {
  const toast = useToast();
  const [items, setItems] = useState(DUMMY_INCOME);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.description.toLowerCase().includes(q) ||
          i.ref.toLowerCase().includes(q),
      );
    }
    if (filterCat) arr = arr.filter((i) => i.category === filterCat);
    if (filterMethod) arr = arr.filter((i) => i.method === filterMethod);
    if (filterStatus) arr = arr.filter((i) => i.status === filterStatus);
    arr.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date_asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      return 0;
    });
    return arr;
  }, [items, search, filterCat, filterMethod, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters = [
    filterCat && {
      key: "cat",
      label: "Kategori",
      value: INCOME_CATEGORIES.find((c) => c.value === filterCat)?.label,
    },
    filterMethod && {
      key: "method",
      label: "Metode",
      value: PAYMENT_METHODS.find((m) => m.value === filterMethod)?.label,
    },
    filterStatus && {
      key: "status",
      label: "Status",
      value: filterStatus === "selesai" ? "Selesai" : "Pending",
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "cat") setFilterCat("");
    if (key === "method") setFilterMethod("");
    if (key === "status") setFilterStatus("");
    setPage(1);
  };
  const clearAllFilters = () => {
    setFilterCat("");
    setFilterMethod("");
    setFilterStatus("");
    setPage(1);
  };

  const totalAmount = items.reduce((s, i) => s + i.amount, 0);
  const selesaiAmount = items
    .filter((i) => i.status === "selesai")
    .reduce((s, i) => s + i.amount, 0);
  const pendingAmount = items
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.amount, 0);
  const todayAmount = items
    .filter((i) => i.date === new Date().toISOString().slice(0, 10))
    .reduce((s, i) => s + i.amount, 0);

  const handleSave = (data) => {
    const isEdit = items.find((i) => i.id === data.id);
    if (isEdit) {
      setItems((prev) =>
        prev.map((i) => (i.id === data.id ? { ...i, ...data } : i)),
      );
      toast.add({
        variant: "success",
        title: "Tersimpan",
        message: "Pemasukan berhasil diperbarui.",
      });
    } else {
      const ref = "INC-" + String(items.length + 1).padStart(4, "0");
      setItems((prev) => [{ ...data, ref, status: "selesai" }, ...prev]);
      toast.add({
        variant: "success",
        title: "Ditambahkan",
        message: "Pemasukan berhasil dicatat.",
      });
    }
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const target = deleteTarget;
    await new Promise((r) => setTimeout(r, 600));
    setItems((prev) => prev.filter((i) => i.id !== target.id));
    toast.add({ variant: "success", message: `${target.ref} dihapus.` });
    setDeleteTarget(null);
    setDeleting(false);
  };

  return (
    <DashboardLayout activeKey='finance'>
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
              { label: "Keuangan", href: "/dashboard/finance" },
              { label: "Pemasukan" },
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
                Pemasukan
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {items.length} transaksi · Total {formatRupiah(totalAmount)}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-download' />}
              >
                Export
              </Button>
              <Button
                variant='primary'
                size='sm'
                leftIcon={<i className='fa-solid fa-plus' />}
                onClick={() => {
                  setEditItem(null);
                  setFormOpen(true);
                }}
              >
                Tambah Pemasukan
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
            label='Total Pemasukan'
            value={formatRupiah(totalAmount)}
            icon={<i className='fa-solid fa-arrow-trend-up' />}
            color='success'
          />
          <StatCard
            label='Sudah Diterima'
            value={formatRupiah(selesaiAmount)}
            icon={<i className='fa-solid fa-circle-check' />}
            color='primary'
          />
          <StatCard
            label='Pending'
            value={formatRupiah(pendingAmount)}
            icon={<i className='fa-solid fa-clock' />}
            color='warning'
          />
          <StatCard
            label='Hari Ini'
            value={formatRupiah(todayAmount)}
            icon={<i className='fa-solid fa-calendar-day' />}
            color='info'
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
                placeholder='Cari keterangan atau nomor ref...'
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
              style={{ width: 170, paddingRight: 32 }}
            >
              <option value=''>Semua Kategori</option>
              {INCOME_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className='input-base input-default input-sm select-base'
              value={filterMethod}
              onChange={(e) => {
                setFilterMethod(e.target.value);
                setPage(1);
              }}
              style={{ width: 160, paddingRight: 32 }}
            >
              <option value=''>Semua Metode</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
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
              <option value='selesai'>Selesai</option>
              <option value='pending'>Pending</option>
            </select>
            <select
              className='input-base input-default input-sm select-base'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 160, paddingRight: 32 }}
            >
              <option value='date_desc'>Terbaru</option>
              <option value='date_asc'>Terlama</option>
              <option value='amount_desc'>Jumlah Terbesar</option>
              <option value='amount_asc'>Jumlah Terkecil</option>
            </select>
          </div>
        </Card>

        {activeFilters.length > 0 && (
          <FilterBar
            filters={activeFilters}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        )}

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
            transaksi
            {(search || activeFilters.length > 0) && " (difilter)"}
            {filtered.length > 0 && (
              <>
                {" "}
                · Total{" "}
                <strong style={{ color: "var(--color-success)" }}>
                  {formatRupiah(filtered.reduce((s, i) => s + i.amount, 0))}
                </strong>
              </>
            )}
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
              icon={<i className='fa-solid fa-arrow-trend-up' />}
              title='Tidak ada pemasukan'
              description={
                search || activeFilters.length > 0
                  ? "Tidak ada transaksi yang cocok dengan filter."
                  : 'Belum ada pemasukan yang dicatat. Klik "Tambah Pemasukan" untuk mulai.'
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
                      setEditItem(null);
                      setFormOpen(true);
                    }}
                  >
                    Tambah Pemasukan
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
                      "Tanggal / Ref",
                      "Keterangan",
                      "Kategori",
                      "Metode",
                      "Jumlah",
                      "Status",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          textAlign:
                            i === 4
                              ? "right"
                              : i === 5
                                ? "center"
                                : i === 6
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
                  {paginated.map((item) => (
                    <IncomeTableRow
                      key={item.id}
                      item={item}
                      onEdit={(i) => {
                        setEditItem(i);
                        setFormOpen(true);
                      }}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      borderTop: "2px solid var(--color-border)",
                      background: "var(--color-bg-subtle)",
                    }}
                  >
                    <td
                      colSpan={4}
                      style={{
                        padding: "10px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Total halaman ini ({paginated.length} transaksi)
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--color-success)",
                      }}
                    >
                      {formatRupiah(
                        paginated.reduce((s, i) => s + i.amount, 0),
                      )}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}

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

      <IncomeFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        initial={editItem}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Hapus Pemasukan'
        message={`Transaksi "${deleteTarget?.ref} – ${deleteTarget?.description}" akan dihapus permanen.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </DashboardLayout>
  );
}
