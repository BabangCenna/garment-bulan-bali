// app/dashboard/customers/CustomersClient.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/data/Badge";
import Avatar from "@/components/ui/data/Avatar";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Tooltip from "@/components/ui/data/Tooltip";
import EmptyState from "@/components/ui/data/EmptyState";
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
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import ProgressBar from "@/components/ui/feedback/ProgressBar";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
} from "@/app/actions/customers";

const PAGE_SIZE = 8;

const CUSTOMER_GROUPS = [
  { value: "reguler", label: "Reguler" },
  { value: "member", label: "Member" },
  { value: "vip", label: "VIP" },
  { value: "reseller", label: "Reseller" },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  group: "reguler",
  notes: "",
  status: "aktif",
};

const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getGroupConfig = (group) => {
  switch (group) {
    case "vip":
      return { variant: "warning", icon: "fa-crown", label: "VIP" };
    case "reseller":
      return { variant: "primary", icon: "fa-store", label: "Reseller" };
    case "member":
      return { variant: "success", icon: "fa-id-card", label: "Member" };
    default:
      return { variant: "secondary", icon: "fa-user", label: "Reguler" };
  }
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  "#E91E8C",
  "#9C27B0",
  "#2196F3",
  "#4CAF50",
  "#FF9800",
  "#F44336",
  "#00BCD4",
  "#607D8B",
];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// ─── CUSTOMER FORM MODAL ──────────────────────────────────────────
function CustomerFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens or initial changes
  useEffect(() => {
    setForm(
      initial
        ? {
            ...initial,
            // group_type from DB is mapped to group in getCustomers,
            // but guard here just in case
            group: initial.group ?? initial.group_type ?? "reguler",
            status: initial.status ?? "aktif",
          }
        : EMPTY_FORM,
    );
    setErrors({});
  }, [initial, open]);

  const set = (key, val) => {
    setForm((v) => ({ ...v, [key]: val }));
    setErrors((v) => ({ ...v, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama pelanggan wajib diisi";
    if (!form.phone.trim()) e.phone = "Nomor telepon wajib diisi";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
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
    await new Promise((r) => setTimeout(r, 600));
    onSave?.({ ...form, id: initial?.id ?? null });
    setLoading(false);
    onClose();
  };

  const isEdit = !!initial?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
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
            {isEdit ? "Simpan Perubahan" : "Tambah Pelanggan"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: getAvatarColor(initial?.id ?? 0),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {form.name ? (
              getInitials(form.name)
            ) : (
              <i className='fa-solid fa-user' style={{ fontSize: 20 }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label='Nama Lengkap'
              required
              placeholder='Contoh: Siti Rahayu'
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
            />
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Input
            label='Nomor Telepon / WhatsApp'
            required
            placeholder='08xxxxxxxxxx'
            leftIcon={<i className='fa-solid fa-phone' />}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            error={errors.phone}
          />
          <Input
            label='Email'
            type='email'
            placeholder='contoh@email.com'
            leftIcon={<i className='fa-solid fa-envelope' />}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
          />
        </div>

        <Select
          label='Kelompok Pelanggan'
          options={CUSTOMER_GROUPS}
          value={form.group}
          onChange={(e) => set("group", e.target.value)}
          hint='Menentukan harga dan diskon yang berlaku'
        />

        <Textarea
          label='Alamat'
          placeholder='Jl. Contoh No. 1, Kota...'
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          rows={2}
        />

        <Textarea
          label='Catatan'
          placeholder='Catatan khusus tentang pelanggan ini...'
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
        />

        <Toggle
          label='Pelanggan Aktif'
          hint='Pelanggan nonaktif tidak akan muncul di kasir'
          checked={form.status === "aktif" || form.status === true}
          onChange={(e) =>
            set("status", e.target.checked ? "aktif" : "nonaktif")
          }
        />
      </div>
    </Modal>
  );
}

// ─── CUSTOMER DETAIL MODAL ────────────────────────────────────────
function CustomerDetailModal({ open, onClose, customer, onEdit }) {
  if (!customer) return null;
  const group = getGroupConfig(customer.group);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Detail Pelanggan'
      size='md'
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant='primary'
            leftIcon={<i className='fa-solid fa-pen' />}
            onClick={() => {
              onClose();
              onEdit(customer);
            }}
          >
            Edit Pelanggan
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: getAvatarColor(customer.id),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(customer.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                lineHeight: 1.2,
              }}
            >
              {customer.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 6,
              }}
            >
              <Badge variant={group.variant} size='sm' dot>
                <i
                  className={`fa-solid ${group.icon}`}
                  style={{ marginRight: 4 }}
                />
                {group.label}
              </Badge>
              <Badge
                variant={customer.status === "aktif" ? "success" : "secondary"}
                size='sm'
                dot
              >
                {customer.status === "aktif" ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
          </div>
        </div>

        {/* stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {[
            {
              label: "Total Transaksi",
              value: customer.totalOrders,
              suffix: "×",
              icon: "fa-receipt",
              color: "var(--color-primary)",
            },
            {
              label: "Total Belanja",
              value: formatRupiah(customer.totalSpent),
              icon: "fa-wallet",
              color: "var(--color-success)",
            },
            {
              label: "Poin",
              value: customer.points.toLocaleString("id-ID"),
              icon: "fa-star",
              color: "var(--color-warning)",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                textAlign: "center",
              }}
            >
              <i
                className={`fa-solid ${s.icon}`}
                style={{
                  color: s.color,
                  fontSize: 16,
                  marginBottom: 6,
                  display: "block",
                }}
              />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {s.value}
                {s.suffix}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              icon: "fa-phone",
              label: "Telepon",
              value: customer.phone,
            },
            {
              icon: "fa-envelope",
              label: "Email",
              value: customer.email || "-",
            },
            {
              icon: "fa-location-dot",
              label: "Alamat",
              value: customer.address || "-",
            },
            {
              icon: "fa-clock",
              label: "Transaksi Terakhir",
              value: formatDate(customer.lastOrder),
            },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "8px 0",
                borderBottom: i < 3 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <i
                className={`fa-solid ${row.icon}`}
                style={{
                  width: 16,
                  color: "var(--color-primary)",
                  marginTop: 1,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginBottom: 2,
                  }}
                >
                  {row.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {row.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* notes */}
        {customer.notes && (
          <div
            style={{
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              borderLeft: "3px solid var(--color-primary)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginBottom: 4,
              }}
            >
              <i
                className='fa-solid fa-note-sticky'
                style={{ marginRight: 5 }}
              />
              Catatan
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
              {customer.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── CUSTOMER CARD (grid view) ────────────────────────────────────
function CustomerCard({ customer, onEdit, onDelete, onToggleStatus, onView }) {
  const group = getGroupConfig(customer.group);

  return (
    <div
      style={{
        background: "var(--color-bg-primary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "pointer",
        transition: "box-shadow .2s, transform .2s",
      }}
      onClick={() => onView(customer)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(233,30,140,.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: getAvatarColor(customer.id),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
          }}
        >
          {getInitials(customer.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {customer.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 2,
            }}
          >
            {customer.phone}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
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
                label: "Lihat detail",
                icon: <i className='fa-solid fa-eye' />,
                onClick: () => onView(customer),
              },
              {
                label: "Edit pelanggan",
                icon: <i className='fa-solid fa-pen' />,
                onClick: () => onEdit(customer),
              },
              {
                label: customer.status === "aktif" ? "Nonaktifkan" : "Aktifkan",
                icon: (
                  <i
                    className={`fa-solid ${customer.status === "aktif" ? "fa-eye-slash" : "fa-eye"}`}
                  />
                ),
                onClick: () => onToggleStatus(customer.id),
              },
              { divider: true },
              {
                label: "Hapus pelanggan",
                icon: <i className='fa-solid fa-trash' />,
                onClick: () => onDelete(customer),
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      {/* group & status */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Badge variant={group.variant} size='sm' dot>
          <i className={`fa-solid ${group.icon}`} style={{ marginRight: 4 }} />
          {group.label}
        </Badge>
        {customer.status === "nonaktif" && (
          <Badge variant='secondary' size='sm'>
            Nonaktif
          </Badge>
        )}
      </div>

      {/* stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <div
          style={{
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginBottom: 2,
            }}
          >
            Total Belanja
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-primary)",
            }}
          >
            {formatRupiah(customer.totalSpent)}
          </div>
        </div>
        <div
          style={{
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginBottom: 2,
            }}
          >
            Transaksi
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {customer.totalOrders}×
          </div>
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <i
            className='fa-solid fa-star'
            style={{ fontSize: 10, color: "var(--color-warning)" }}
          />
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            {customer.points.toLocaleString("id-ID")} poin
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          <i className='fa-solid fa-clock' style={{ marginRight: 4 }} />
          {formatDate(customer.lastOrder)}
        </span>
      </div>
    </div>
  );
}

// ─── TABLE ROW (list view) ────────────────────────────────────────
function CustomerTableRow({
  customer,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
}) {
  const group = getGroupConfig(customer.group);

  return (
    <tr
      className='product-table-row'
      style={{ cursor: "pointer" }}
      onClick={() => onView(customer)}
    >
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: getAvatarColor(customer.id),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(customer.name)}
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                lineHeight: 1.3,
              }}
            >
              {customer.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {customer.phone}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <Badge variant={group.variant} size='sm' dot>
          <i className={`fa-solid ${group.icon}`} style={{ marginRight: 4 }} />
          {group.label}
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
          {formatRupiah(customer.totalSpent)}
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {customer.totalOrders}×
        </span>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "center",
          }}
        >
          <i
            className='fa-solid fa-star'
            style={{ fontSize: 10, color: "var(--color-warning)" }}
          />
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {customer.points.toLocaleString("id-ID")}
          </span>
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          {formatDate(customer.lastOrder)}
        </span>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <Badge
          variant={customer.status === "aktif" ? "success" : "secondary"}
          size='sm'
          dot
        >
          {customer.status === "aktif" ? "Aktif" : "Nonaktif"}
        </Badge>
      </td>
      <td style={{ padding: "10px 14px" }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "flex-end",
          }}
        >
          <Tooltip content='Detail' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-eye' />}
              size='sm'
              variant='ghost'
              label='Detail'
              onClick={() => onView(customer)}
            />
          </Tooltip>
          <Tooltip content='Edit' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-pen' />}
              size='sm'
              variant='ghost'
              label='Edit'
              onClick={() => onEdit(customer)}
            />
          </Tooltip>
          <Tooltip content='Hapus' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-trash' />}
              size='sm'
              variant='ghost'
              label='Hapus'
              onClick={() => onDelete(customer)}
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
                label: customer.status === "aktif" ? "Nonaktifkan" : "Aktifkan",
                icon: (
                  <i
                    className={`fa-solid ${customer.status === "aktif" ? "fa-eye-slash" : "fa-eye"}`}
                  />
                ),
                onClick: () => onToggleStatus(customer.id),
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
export default function CustomersClient({ user, initialCustomers }) {
  const toast = useToast();

  const [customers, setCustomers] = useState(initialCustomers);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = [...customers];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email || "").toLowerCase().includes(q),
      );
    }
    if (filterGroup) arr = arr.filter((c) => c.group === filterGroup);
    if (filterStatus) arr = arr.filter((c) => c.status === filterStatus);
    arr.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "spent_desc") return b.totalSpent - a.totalSpent;
      if (sortBy === "spent_asc") return a.totalSpent - b.totalSpent;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      if (sortBy === "recent")
        return new Date(b.lastOrder) - new Date(a.lastOrder);
      if (sortBy === "points") return b.points - a.points;
      return 0;
    });
    return arr;
  }, [customers, search, filterGroup, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters = [
    filterGroup && {
      key: "group",
      label: "Kelompok",
      value: CUSTOMER_GROUPS.find((g) => g.value === filterGroup)?.label,
    },
    filterStatus && {
      key: "status",
      label: "Status",
      value: filterStatus === "aktif" ? "Aktif" : "Nonaktif",
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "group") setFilterGroup("");
    if (key === "status") setFilterStatus("");
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilterGroup("");
    setFilterStatus("");
    setPage(1);
  };

  // ── handlers ──────────────────────────────────────────────────
  const handleSave = async (data) => {
    try {
      if (data.id && customers.find((c) => c.id === data.id)) {
        await updateCustomer(data);
        setCustomers((prev) =>
          prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)),
        );
        toast.add({
          variant: "success",
          message: `${data.name} berhasil diperbarui.`,
        });
      } else {
        await createCustomer(data);
        setCustomers((prev) => [
          {
            ...data,
            id: Date.now(), // temp; page will refresh with real id on next load
            totalOrders: 0,
            totalSpent: 0,
            lastOrder: null,
            points: 0,
          },
          ...prev,
        ]);
        toast.add({
          variant: "success",
          message: `${data.name} berhasil ditambahkan.`,
        });
      }
    } catch {
      toast.add({ variant: "danger", message: "Gagal menyimpan pelanggan." });
    }
    setEditCustomer(null);
  };

  const handleEdit = (customer) => {
    setEditCustomer(customer);
    setFormOpen(true);
  };

  const handleView = (customer) => {
    setDetailCustomer(customer);
    setDetailOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const target = deleteTarget;
    try {
      await deleteCustomer(target.id);
      setCustomers((prev) => prev.filter((c) => c.id !== target.id));
      toast.add({ variant: "success", message: `${target.name} dihapus.` });
    } catch {
      toast.add({ variant: "danger", message: "Gagal menghapus pelanggan." });
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleToggleStatus = async (id) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    try {
      await toggleCustomerStatus(id, customer.status);
      const next = customer.status === "aktif" ? "nonaktif" : "aktif";
      setCustomers((prev) =>
        prev.map((c) => (c.id !== id ? c : { ...c, status: next })),
      );
      toast.add({ variant: "info", message: `${customer.name} → ${next}` });
    } catch {
      toast.add({ variant: "danger", message: "Gagal mengubah status." });
    }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "aktif").length;
  const vipCustomers = customers.filter((c) => c.group === "vip").length;
  const resellerCustomers = customers.filter(
    (c) => c.group === "reseller",
  ).length;

  return (
    <DashboardLayout activeKey='customers' user={user}>
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
              { label: "Pelanggan" },
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
                Manajemen Pelanggan
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {totalCustomers} pelanggan terdaftar · {activeCustomers} aktif
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
                  setEditCustomer(null);
                  setFormOpen(true);
                }}
              >
                Tambah Pelanggan
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
            label='Total Pelanggan'
            value={totalCustomers}
            icon={<i className='fa-solid fa-users' />}
            color='primary'
          />
          <StatCard
            label='Pelanggan Aktif'
            value={activeCustomers}
            icon={<i className='fa-solid fa-circle-check' />}
            color='success'
          />
          <StatCard
            label='Pelanggan VIP'
            value={vipCustomers}
            icon={<i className='fa-solid fa-crown' />}
            color='warning'
            footer={
              vipCustomers > 0 ? (
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
                    setFilterGroup("vip");
                    setPage(1);
                  }}
                >
                  Lihat pelanggan →
                </button>
              ) : null
            }
          />
          <StatCard
            label='Reseller'
            value={resellerCustomers}
            icon={<i className='fa-solid fa-store' />}
            color='danger'
            footer={
              resellerCustomers > 0 ? (
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
                    setFilterGroup("reseller");
                    setPage(1);
                  }}
                >
                  Lihat pelanggan →
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
            <div style={{ flex: 1, minWidth: 220 }}>
              <SearchInput
                placeholder='Cari nama, nomor telepon, atau email...'
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
              value={filterGroup}
              onChange={(e) => {
                setFilterGroup(e.target.value);
                setPage(1);
              }}
              style={{ width: 160, paddingRight: 32 }}
            >
              <option value=''>Semua Kelompok</option>
              {CUSTOMER_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
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
              <option value='aktif'>Aktif</option>
              <option value='nonaktif'>Nonaktif</option>
            </select>
            <select
              className='input-base input-default input-sm select-base'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 170, paddingRight: 32 }}
            >
              <option value='name'>Nama A–Z</option>
              <option value='spent_desc'>Belanja Terbanyak</option>
              <option value='spent_asc'>Belanja Tersedikit</option>
              <option value='orders'>Transaksi Terbanyak</option>
              <option value='recent'>Transaksi Terbaru</option>
              <option value='points'>Poin Tertinggi</option>
            </select>
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
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Menampilkan{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {filtered.length}
            </strong>{" "}
            pelanggan
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
              icon={<i className='fa-solid fa-users-slash' />}
              title='Tidak ada pelanggan'
              description={
                search || activeFilters.length > 0
                  ? "Tidak ada pelanggan yang cocok dengan filter atau pencarian kamu."
                  : 'Belum ada pelanggan. Klik "Tambah Pelanggan" untuk mulai.'
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
                      setEditCustomer(null);
                      setFormOpen(true);
                    }}
                  >
                    Tambah Pelanggan Pertama
                  </Button>
                )
              }
            />
          </Card>
        ) : view === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {paginated.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onToggleStatus={handleToggleStatus}
                onView={handleView}
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
                      "Pelanggan",
                      "Kelompok",
                      "Total Belanja",
                      "Transaksi",
                      "Poin",
                      "Terakhir Beli",
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
                  {paginated.map((c) => (
                    <CustomerTableRow
                      key={c.id}
                      customer={c}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                      onToggleStatus={handleToggleStatus}
                      onView={handleView}
                    />
                  ))}
                </tbody>
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

      <CustomerFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCustomer(null);
        }}
        onSave={handleSave}
        initial={editCustomer}
      />

      <CustomerDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        customer={detailCustomer}
        onEdit={handleEdit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Hapus Pelanggan'
        message={`Pelanggan "${deleteTarget?.name}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </DashboardLayout>
  );
}
