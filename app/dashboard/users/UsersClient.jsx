// app/dashboard/users/UsersClient.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Badge from "@/components/ui/data/Badge";
import Tooltip from "@/components/ui/data/Tooltip";
import EmptyState from "@/components/ui/data/EmptyState";
import Button from "@/components/ui/button/Button";
import IconButton from "@/components/ui/button/IconButton";
import Modal from "@/components/ui/feedback/Modal";
import ConfirmDialog from "@/components/ui/feedback/ConfirmDialog";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import Input from "@/components/ui/form/Input";
import Select from "@/components/ui/form/Select";
import Toggle from "@/components/ui/form/Toggle";
import SearchInput from "@/components/ui/form/SearchInput";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import Pagination from "@/components/ui/navigation/Pagination";
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
} from "@/app/actions/users";

const PAGE_SIZE = 10;

const ROLE_CONFIG = {
  owner: { variant: "warning", icon: "fa-crown", label: "Owner" },
  admin: { variant: "primary", icon: "fa-shield-halved", label: "Admin" },
  staff: { variant: "secondary", icon: "fa-user", label: "Staff" },
};

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
const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const formatDateTime = (d) => {
  if (!d) return "Belum pernah";
  return new Date(d).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EMPTY_FORM = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  roleId: "",
  isActive: true,
};

// ─── USER FORM MODAL ──────────────────────────────────────────────
function UserFormModal({ open, onClose, onSave, initial, roles }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              username: initial.username,
              fullName: initial.full_name || "",
              email: initial.email || "",
              password: "",
              confirmPassword: "",
              roleId: String(initial.role.id),
              isActive: initial.isActive,
            }
          : { ...EMPTY_FORM, roleId: roles[1]?.id ? String(roles[1].id) : "" },
      );
      setErrors({});
      setShowPass(false);
    }
  }, [open, initial]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username wajib diisi";
    if (form.username.length < 3) e.username = "Username minimal 3 karakter";
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = "Username hanya boleh huruf, angka, dan underscore";
    if (!form.roleId) e.roleId = "Role wajib dipilih";
    if (!initial) {
      if (!form.password) e.password = "Password wajib diisi";
      if (form.password.length < 6) e.password = "Password minimal 6 karakter";
      if (form.password !== form.confirmPassword)
        e.confirmPassword = "Password tidak cocok";
    }
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
    try {
      await onSave({ ...form, id: initial?.id });
    } catch (err) {
      setErrors({ username: err.message });
    }
    setLoading(false);
  };

  const isEdit = !!initial?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}
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
            {isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* avatar preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: getAvatarColor(initial?.id ?? 0),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {form.fullName ? (
              getInitials(form.fullName)
            ) : (
              <i className='fa-solid fa-user' />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label='Nama Lengkap'
              placeholder='Nama lengkap pengguna'
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Input
            label='Username'
            required
            placeholder='username_unik'
            value={form.username}
            onChange={(e) => set("username", e.target.value.toLowerCase())}
            error={errors.username}
            hint='Huruf kecil, angka, underscore'
          />
          <Input
            label='Email'
            type='email'
            placeholder='email@contoh.com'
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
          />
        </div>

        <Select
          label='Role'
          required
          options={roles.map((r) => ({ value: String(r.id), label: r.name }))}
          value={form.roleId}
          onChange={(e) => set("roleId", e.target.value)}
          error={errors.roleId}
          hint='Menentukan hak akses pengguna'
        />

        {/* password — always show on create, optional on edit */}
        {!isEdit ? (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Input
              label='Password'
              required
              type={showPass ? "text" : "password"}
              placeholder='Min. 6 karakter'
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              error={errors.password}
              rightIcon={
                <button
                  type='button'
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                    padding: 0,
                  }}
                >
                  <i
                    className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              }
            />
            <Input
              label='Konfirmasi Password'
              required
              type={showPass ? "text" : "password"}
              placeholder='Ulangi password'
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />
          </div>
        ) : (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              fontSize: 12,
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i
              className='fa-solid fa-lock'
              style={{ color: "var(--color-primary)" }}
            />
            Password tidak diubah di sini. Gunakan "Reset Password" untuk
            menggantinya.
          </div>
        )}

        <Toggle
          label='Pengguna Aktif'
          hint='Pengguna nonaktif tidak bisa login'
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── RESET PASSWORD MODAL ─────────────────────────────────────────
function ResetPasswordModal({ open, onClose, user }) {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm({ password: "", confirm: "" });
      setErrors({});
    }
  }, [open]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleSave = async () => {
    const e = {};
    if (!form.password) e.password = "Password wajib diisi";
    if (form.password.length < 6) e.password = "Password minimal 6 karakter";
    if (form.password !== form.confirm) e.confirm = "Password tidak cocok";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ id: user.id, newPassword: form.password });
      toast.add({
        variant: "success",
        message: `Password ${user.username} berhasil direset.`,
      });
      onClose();
    } catch {
      toast.add({ variant: "danger", message: "Gagal mereset password." });
    }
    setLoading(false);
  };

  if (!user) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Reset Password · ${user.username}`}
      size='sm'
      closeable={!loading}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant='danger'
            loading={loading}
            onClick={handleSave}
            leftIcon={!loading && <i className='fa-solid fa-key' />}
          >
            Reset Password
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            fontSize: 12,
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <i
            className='fa-solid fa-triangle-exclamation'
            style={{ color: "var(--color-warning)" }}
          />
          Password {user.username} akan diubah. Pastikan pengguna mengetahuinya.
        </div>
        <Input
          label='Password Baru'
          required
          type={showPass ? "text" : "password"}
          placeholder='Min. 6 karakter'
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          error={errors.password}
          rightIcon={
            <button
              type='button'
              onClick={() => setShowPass((p) => !p)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                padding: 0,
              }}
            >
              <i
                className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}
              />
            </button>
          }
        />
        <Input
          label='Konfirmasi Password Baru'
          required
          type={showPass ? "text" : "password"}
          placeholder='Ulangi password baru'
          value={form.confirm}
          onChange={(e) => set("confirm", e.target.value)}
          error={errors.confirm}
        />
      </div>
    </Modal>
  );
}

// ─── USER DETAIL MODAL ────────────────────────────────────────────
function UserDetailModal({ open, onClose, user, onEdit, onResetPassword }) {
  if (!user) return null;
  const roleCfg = ROLE_CONFIG[user.role.slug] ?? {
    variant: "secondary",
    icon: "fa-user",
    label: user.role.name,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Detail Pengguna'
      size='sm'
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant='warning'
            size='sm'
            leftIcon={<i className='fa-solid fa-key' />}
            onClick={() => {
              onClose();
              onResetPassword(user);
            }}
          >
            Reset Password
          </Button>
          <Button
            variant='primary'
            leftIcon={<i className='fa-solid fa-pen' />}
            onClick={() => {
              onClose();
              onEdit(user);
            }}
          >
            Edit
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: getAvatarColor(user.id),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(user.full_name || user.username)}
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {user.full_name || user.username}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              @{user.username}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <Badge variant={roleCfg.variant} size='sm' dot>
                <i
                  className={`fa-solid ${roleCfg.icon}`}
                  style={{ marginRight: 4 }}
                />
                {roleCfg.label}
              </Badge>
              <Badge
                variant={user.isActive ? "success" : "secondary"}
                size='sm'
                dot
              >
                {user.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
          </div>
        </div>

        {/* info rows */}
        {[
          { icon: "fa-envelope", label: "Email", value: user.email || "—" },
          {
            icon: "fa-clock",
            label: "Login Terakhir",
            value: formatDateTime(user.lastLoginAt),
          },
          {
            icon: "fa-calendar",
            label: "Dibuat",
            value: formatDate(user.createdAt),
          },
          {
            icon: "fa-pen",
            label: "Diperbarui",
            value: formatDate(user.updated_at),
          },
        ].map((row, i, arr) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              paddingBottom: i < arr.length - 1 ? 12 : 0,
              borderBottom:
                i < arr.length - 1 ? "1px solid var(--color-border)" : "none",
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
            <div>
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
    </Modal>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function UsersClient({ user, initialUsers, roles }) {
  const toast = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          (u.full_name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q),
      );
    }
    if (filterRole) arr = arr.filter((u) => u.role.slug === filterRole);
    if (filterStatus === "aktif") arr = arr.filter((u) => u.isActive);
    if (filterStatus === "nonaktif") arr = arr.filter((u) => !u.isActive);
    return arr;
  }, [users, search, filterRole, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── handlers ────────────────────────────────────────────────────
  const handleSave = async (data) => {
    try {
      if (data.id) {
        await updateUser(data);
        setUsers((prev) =>
          prev.map((u) =>
            u.id !== data.id
              ? u
              : {
                  ...u,
                  username: data.username,
                  full_name: data.fullName,
                  email: data.email,
                  isActive: data.isActive,
                  role: roles.find((r) => String(r.id) === String(data.roleId))
                    ? {
                        id: Number(data.roleId),
                        name: roles.find(
                          (r) => String(r.id) === String(data.roleId),
                        ).name,
                        slug: roles.find(
                          (r) => String(r.id) === String(data.roleId),
                        ).slug,
                      }
                    : u.role,
                },
          ),
        );
        toast.add({
          variant: "success",
          message: `${data.username} berhasil diperbarui.`,
        });
      } else {
        await createUser(data);
        // re-fetch would be cleanest; optimistic add with temp data
        setUsers((prev) => [
          {
            id: Date.now(),
            username: data.username,
            full_name: data.fullName,
            email: data.email,
            isActive: data.isActive,
            lastLoginAt: null,
            createdAt: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: {
              id: Number(data.roleId),
              name:
                roles.find((r) => String(r.id) === String(data.roleId))?.name ??
                "",
              slug:
                roles.find((r) => String(r.id) === String(data.roleId))?.slug ??
                "",
            },
          },
          ...prev,
        ]);
        toast.add({
          variant: "success",
          message: `${data.username} berhasil ditambahkan.`,
        });
      }
      setFormOpen(false);
      setEditUser(null);
    } catch (err) {
      throw err; // bubble to modal for inline error
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.add({
        variant: "success",
        message: `${deleteTarget.username} dihapus.`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal menghapus pengguna." });
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(user.id, user.isActive);
      setUsers((prev) =>
        prev.map((u) =>
          u.id !== user.id ? u : { ...u, isActive: !u.isActive },
        ),
      );
      toast.add({
        variant: "info",
        message: `${user.username} → ${user.isActive ? "nonaktif" : "aktif"}`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal mengubah status." });
    }
  };

  // stats
  const activeCount = users.filter((u) => u.isActive).length;
  const ownerCount = users.filter((u) => u.role.slug === "owner").length;
  const adminCount = users.filter((u) => u.role.slug === "admin").length;
  const staffCount = users.filter((u) => u.role.slug === "staff").length;

  return (
    <DashboardLayout activeKey='users' user={user}>
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
              { label: "Pengguna" },
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
                Manajemen Pengguna
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {users.length} pengguna terdaftar · {activeCount} aktif
              </p>
            </div>
            <Button
              variant='primary'
              size='sm'
              leftIcon={<i className='fa-solid fa-plus' />}
              onClick={() => {
                setEditUser(null);
                setFormOpen(true);
              }}
            >
              Tambah Pengguna
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
            label='Total Pengguna'
            value={users.length}
            icon={<i className='fa-solid fa-users' />}
            color='primary'
          />
          <StatCard
            label='Owner'
            value={ownerCount}
            icon={<i className='fa-solid fa-crown' />}
            color='warning'
          />
          <StatCard
            label='Admin'
            value={adminCount}
            icon={<i className='fa-solid fa-shield-halved' />}
            color='primary'
          />
          <StatCard
            label='Staff'
            value={staffCount}
            icon={<i className='fa-solid fa-user' />}
            color='success'
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
                placeholder='Cari username, nama, atau email...'
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
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              style={{ width: 140, paddingRight: 32 }}
            >
              <option value=''>Semua Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.name}
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
          </div>
        </Card>

        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          Menampilkan{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {filtered.length}
          </strong>{" "}
          pengguna
        </div>

        {/* table */}
        {paginated.length === 0 ? (
          <Card padding='lg'>
            <EmptyState
              icon={<i className='fa-solid fa-users-slash' />}
              title='Tidak ada pengguna'
              description='Tidak ada pengguna yang cocok dengan filter.'
              action={
                <Button
                  variant='primary'
                  leftIcon={<i className='fa-solid fa-plus' />}
                  onClick={() => {
                    setEditUser(null);
                    setFormOpen(true);
                  }}
                >
                  Tambah Pengguna
                </Button>
              }
            />
          </Card>
        ) : (
          <div
            style={{ overflow: "visible", borderRadius: "var(--radius-lg)" }}
          >
            <Card padding='none'>
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
                      "Pengguna",
                      "Role",
                      "Email",
                      "Login Terakhir",
                      "Status",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                          textAlign: i === 5 ? "right" : "left",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user, idx) => {
                    const roleCfg = ROLE_CONFIG[user.role.slug] ?? {
                      variant: "secondary",
                      icon: "fa-user",
                      label: user.role.name,
                    };
                    return (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom:
                            idx < paginated.length - 1
                              ? "1px solid var(--color-border)"
                              : "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setDetailUser(user);
                          setDetailOpen(true);
                        }}
                      >
                        {/* avatar + name */}
                        <td style={{ padding: "10px 14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: getAvatarColor(user.id),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "white",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(user.full_name || user.username)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {user.full_name || user.username}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* role */}
                        <td style={{ padding: "10px 14px" }}>
                          <Badge variant={roleCfg.variant} size='sm' dot>
                            <i
                              className={`fa-solid ${roleCfg.icon}`}
                              style={{ marginRight: 4 }}
                            />
                            {roleCfg.label}
                          </Badge>
                        </td>

                        {/* email */}
                        <td
                          style={{
                            padding: "10px 14px",
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {user.email || "—"}
                        </td>

                        {/* last login */}
                        <td
                          style={{
                            padding: "10px 14px",
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {formatDateTime(user.lastLoginAt)}
                        </td>

                        {/* status */}
                        <td style={{ padding: "10px 14px" }}>
                          <Badge
                            variant={user.isActive ? "success" : "secondary"}
                            size='sm'
                            dot
                          >
                            {user.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>

                        {/* actions */}
                        <td
                          style={{ padding: "10px 14px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
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
                                onClick={() => {
                                  setEditUser(user);
                                  setFormOpen(true);
                                }}
                              />
                            </Tooltip>
                            <Tooltip content='Reset Password' placement='top'>
                              <IconButton
                                icon={<i className='fa-solid fa-key' />}
                                size='sm'
                                variant='ghost'
                                label='Reset Password'
                                onClick={() => {
                                  setResetTarget(user);
                                  setResetOpen(true);
                                }}
                              />
                            </Tooltip>
                            <Dropdown
                              trigger={
                                <IconButton
                                  icon={
                                    <i className='fa-solid fa-ellipsis-vertical' />
                                  }
                                  size='sm'
                                  variant='ghost'
                                  label='More'
                                />
                              }
                              align='right'
                              items={[
                                {
                                  label: user.isActive
                                    ? "Nonaktifkan"
                                    : "Aktifkan",
                                  icon: (
                                    <i
                                      className={`fa-solid ${user.isActive ? "fa-eye-slash" : "fa-eye"}`}
                                    />
                                  ),
                                  onClick: () => handleToggleStatus(user),
                                },
                                { divider: true },
                                {
                                  label: "Hapus Pengguna",
                                  icon: <i className='fa-solid fa-trash' />,
                                  onClick: () => setDeleteTarget(user),
                                  danger: true,
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
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

      <UserFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditUser(null);
        }}
        onSave={handleSave}
        initial={editUser}
        roles={roles}
      />

      <UserDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        user={detailUser}
        onEdit={(u) => {
          setEditUser(u);
          setFormOpen(true);
        }}
        onResetPassword={(u) => {
          setResetTarget(u);
          setResetOpen(true);
        }}
      />

      <ResetPasswordModal
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setResetTarget(null);
        }}
        user={resetTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Hapus Pengguna'
        message={`Pengguna "${deleteTarget?.username}" akan dihapus permanen beserta semua sesinya.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </DashboardLayout>
  );
}
