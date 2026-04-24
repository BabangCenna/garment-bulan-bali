"use client";
import { useState, useMemo, useEffect } from "react";
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
import Textarea from "@/components/ui/form/Textarea";
import Toggle from "@/components/ui/form/Toggle";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import Pagination from "@/components/ui/navigation/Pagination";
import {
  createSize,
  updateSize,
  deleteSize,
  toggleSizeStatus,
  createStyle,
  updateStyle,
  deleteStyle,
  toggleStyleStatus,
  createFabric,
  updateFabric,
  deleteFabric,
  toggleFabricStatus,
} from "@/app/actions/attributes";

const PAGE_SIZE = 10;

const EMPTY_SIZE = {
  name: "",
  label: "",
  description: "",
  sortOrder: "",
  status: true,
};
const EMPTY_STYLE = { name: "", description: "", tags: "", status: true };
const EMPTY_FABRIC = {
  name: "",
  material: "",
  weight: "",
  description: "",
  care: "",
  status: true,
};

// ─── SIZE FORM MODAL ───────────────────────────────────────────────
function SizeFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY_SIZE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  useEffect(() => {
    setForm(
      initial
        ? {
            ...initial,
            sortOrder: initial.sortOrder ?? initial.sort_order ?? "",
          }
        : EMPTY_SIZE,
    );
    setErrors({});
  }, [initial, open]);

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama ukuran wajib diisi";
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Edit Ukuran" : "Tambah Ukuran Baru"}
      size='sm'
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
            {initial?.id ? "Simpan" : "Tambah"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Input
            label='Kode Ukuran'
            required
            placeholder='Contoh: M/L'
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
          />
          <Input
            label='Label Ukuran'
            placeholder='Contoh: Medium / Large'
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
          />
        </div>
        <Textarea
          label='Deskripsi'
          placeholder='Keterangan ukuran, rentang dimensi, dll...'
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
        />
        <Input
          label='Urutan Tampil'
          type='number'
          placeholder='1'
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", e.target.value)}
          hint='Angka lebih kecil tampil lebih awal'
        />
        <Toggle
          label='Ukuran Aktif'
          hint='Ukuran nonaktif tidak muncul saat input produk'
          checked={form.status}
          onChange={(e) => set("status", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── STYLE FORM MODAL ──────────────────────────────────────────────
function StyleFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          tags: Array.isArray(initial.tags)
            ? initial.tags.join(", ")
            : initial.tags,
        }
      : EMPTY_STYLE,
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  useEffect(() => {
    setForm(
      initial
        ? {
            ...initial,
            tags: Array.isArray(initial.tags)
              ? initial.tags.join(", ")
              : initial.tags,
          }
        : EMPTY_STYLE,
    );
    setErrors({});
  }, [initial, open]);

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama gaya wajib diisi";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const tags = form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    onSave?.({ ...form, tags, id: initial?.id ?? Date.now() });
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Edit Gaya" : "Tambah Gaya Baru"}
      size='sm'
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
            {initial?.id ? "Simpan" : "Tambah"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          label='Nama Gaya'
          required
          placeholder='Contoh: Streetwear'
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <Textarea
          label='Deskripsi'
          placeholder='Jelaskan karakteristik gaya ini...'
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
        />
        <Input
          label='Tags'
          placeholder='urban, hype, kekinian'
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          hint='Pisahkan dengan koma'
        />
        <Toggle
          label='Gaya Aktif'
          checked={form.status}
          onChange={(e) => set("status", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── FABRIC FORM MODAL ─────────────────────────────────────────────
function FabricFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY_FABRIC);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  useEffect(() => {
    setForm(initial ?? EMPTY_FABRIC);
    setErrors({});
  }, [initial, open]);

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama bahan wajib diisi";
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Edit Bahan" : "Tambah Bahan Baru"}
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
            {initial?.id ? "Simpan" : "Tambah"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          label='Nama Bahan'
          required
          placeholder='Contoh: Cotton Combed 20s'
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Input
            label='Komposisi Material'
            placeholder='Cotton, Polyester, dll'
            value={form.material}
            onChange={(e) => set("material", e.target.value)}
          />
          <Input
            label='Gramasi / Berat'
            placeholder='180 gsm'
            value={form.weight}
            onChange={(e) => set("weight", e.target.value)}
          />
        </div>
        <Textarea
          label='Deskripsi'
          placeholder='Karakteristik, keunggulan bahan...'
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
        />
        <Input
          label='Cara Perawatan'
          placeholder='Cuci dingin, jangan diperas...'
          value={form.care}
          onChange={(e) => set("care", e.target.value)}
        />
        <Toggle
          label='Bahan Aktif'
          checked={form.status}
          onChange={(e) => set("status", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── SIZE TAB ──────────────────────────────────────────────────────
// ✅ FIX 1 & 2: destructure { initialItems } properly
function SizeTab({ initialItems }) {
  const toast = useToast();
  // ✅ FIX: use initialItems not DUMMY_SIZES
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search.trim())
      arr = arr.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.label?.toLowerCase().includes(search.toLowerCase()),
      );
    if (filterStatus === "aktif") arr = arr.filter((i) => i.status);
    if (filterStatus === "nonaktif") arr = arr.filter((i) => !i.status);
    arr.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
    return arr;
  }, [items, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (data) => {
    try {
      if (data.id && items.find((i) => i.id === data.id)) {
        await updateSize(data);
        setItems((prev) =>
          prev.map((i) => (i.id === data.id ? { ...i, ...data } : i)),
        );
        toast.add({
          variant: "success",
          message: `Ukuran "${data.name}" diperbarui.`,
        });
      } else {
        await createSize(data);
        // Optimistic: add with temp id; revalidatePath will refresh server data
        setItems((prev) => [
          { ...data, id: Date.now(), productCount: 0 },
          ...prev,
        ]);
        toast.add({
          variant: "success",
          message: `Ukuran "${data.name}" ditambahkan.`,
        });
      }
    } catch (err) {
      toast.add({ variant: "danger", message: "Gagal menyimpan ukuran." });
    }
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const target = deleteTarget;
    try {
      await deleteSize(target.id);
      setItems((prev) => prev.filter((i) => i.id !== target.id));
      toast.add({
        variant: "success",
        message: `Ukuran "${target.name}" dihapus.`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal menghapus ukuran." });
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleToggle = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      await toggleSizeStatus(id, item.status);
      setItems((prev) =>
        prev.map((i) => (i.id !== id ? i : { ...i, status: !i.status })),
      );
      toast.add({
        variant: "info",
        message: `${item.name} → ${item.status ? "nonaktif" : "aktif"}`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal mengubah status." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput
            placeholder='Cari ukuran...'
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
        <Button
          variant='primary'
          size='sm'
          leftIcon={<i className='fa-solid fa-plus' />}
          onClick={() => {
            setEditItem(null);
            setFormOpen(true);
          }}
        >
          Tambah Ukuran
        </Button>
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          icon={<i className='fa-solid fa-ruler' />}
          title='Tidak ada ukuran'
          description='Belum ada data ukuran.'
          action={
            <Button
              variant='primary'
              leftIcon={<i className='fa-solid fa-plus' />}
              onClick={() => setFormOpen(true)}
            >
              Tambah Ukuran
            </Button>
          }
        />
      ) : (
        <Card padding='none'>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--color-border)",
                  background: "var(--color-bg-subtle)",
                }}
              >
                {[
                  "Urutan",
                  "Kode",
                  "Label",
                  "Deskripsi",
                  "Produk",
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
                      textAlign:
                        i === 0 || i === 4
                          ? "center"
                          : i === 6
                            ? "right"
                            : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      idx < paginated.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--color-bg-subtle)",
                        color: "var(--color-text-muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item.sortOrder ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 12px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-primary-light, #fce7f3)",
                        color: "var(--color-primary)",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: ".03em",
                      }}
                    >
                      {item.name}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      color: "var(--color-text-secondary)",
                      fontSize: 12,
                    }}
                  >
                    {item.label || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      color: "var(--color-text-muted)",
                      fontSize: 12,
                      maxWidth: 280,
                    }}
                  >
                    {item.description || "—"}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <Badge variant='secondary' size='sm'>
                      {item.productCount} produk
                    </Badge>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge
                      variant={item.status ? "success" : "secondary"}
                      size='sm'
                      dot
                    >
                      {item.status ? "Aktif" : "Nonaktif"}
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
                          onClick={() => {
                            setEditItem(item);
                            setFormOpen(true);
                          }}
                        />
                      </Tooltip>
                      <Tooltip content='Hapus' placement='top'>
                        <IconButton
                          icon={<i className='fa-solid fa-trash' />}
                          size='sm'
                          variant='ghost'
                          label='Hapus'
                          onClick={() => setDeleteTarget(item)}
                          style={{ color: "var(--color-danger)" }}
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
                            label: item.status ? "Nonaktifkan" : "Aktifkan",
                            icon: (
                              <i
                                className={`fa-solid ${item.status ? "fa-eye-slash" : "fa-eye"}`}
                              />
                            ),
                            onClick: () => handleToggle(item.id),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <SizeFormModal
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
        title='Hapus Ukuran'
        message={`Ukuran "${deleteTarget?.name}" akan dihapus permanen.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </div>
  );
}

// ─── STYLE TAB ─────────────────────────────────────────────────────
// ✅ FIX 3: destructure { initialItems } and use it instead of DUMMY_STYLES
function StyleTab({ initialItems }) {
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (filterStatus === "aktif") arr = arr.filter((i) => i.status);
    if (filterStatus === "nonaktif") arr = arr.filter((i) => !i.status);
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [items, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (data) => {
    try {
      if (data.id && items.find((i) => i.id === data.id)) {
        await updateStyle(data);
        setItems((prev) =>
          prev.map((i) => (i.id === data.id ? { ...i, ...data } : i)),
        );
        toast.add({
          variant: "success",
          message: `Gaya "${data.name}" diperbarui.`,
        });
      } else {
        await createStyle(data);
        setItems((prev) => [
          { ...data, id: Date.now(), productCount: 0 },
          ...prev,
        ]);
        toast.add({
          variant: "success",
          message: `Gaya "${data.name}" ditambahkan.`,
        });
      }
    } catch {
      toast.add({ variant: "danger", message: "Gagal menyimpan gaya." });
    }
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const target = deleteTarget;
    try {
      await deleteStyle(target.id);
      setItems((prev) => prev.filter((i) => i.id !== target.id));
      toast.add({
        variant: "success",
        message: `Gaya "${target.name}" dihapus.`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal menghapus gaya." });
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleToggle = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      await toggleStyleStatus(id, item.status);
      setItems((prev) =>
        prev.map((i) => (i.id !== id ? i : { ...i, status: !i.status })),
      );
      toast.add({
        variant: "info",
        message: `${item.name} → ${item.status ? "nonaktif" : "aktif"}`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal mengubah status." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput
            placeholder='Cari gaya atau tag...'
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
        <Button
          variant='primary'
          size='sm'
          leftIcon={<i className='fa-solid fa-plus' />}
          onClick={() => {
            setEditItem(null);
            setFormOpen(true);
          }}
        >
          Tambah Gaya
        </Button>
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          icon={<i className='fa-solid fa-shirt' />}
          title='Tidak ada gaya'
          description='Belum ada data gaya pakaian.'
          action={
            <Button
              variant='primary'
              leftIcon={<i className='fa-solid fa-plus' />}
              onClick={() => setFormOpen(true)}
            >
              Tambah Gaya
            </Button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {paginated.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "box-shadow .2s, transform .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(233,30,140,.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      marginTop: 3,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
                <Dropdown
                  trigger={
                    <IconButton
                      icon={<i className='fa-solid fa-ellipsis-vertical' />}
                      size='sm'
                      variant='ghost'
                      label='Opsi'
                    />
                  }
                  align='right'
                  items={[
                    {
                      label: "Edit",
                      icon: <i className='fa-solid fa-pen' />,
                      onClick: () => {
                        setEditItem(item);
                        setFormOpen(true);
                      },
                    },
                    {
                      label: item.status ? "Nonaktifkan" : "Aktifkan",
                      icon: (
                        <i
                          className={`fa-solid ${item.status ? "fa-eye-slash" : "fa-eye"}`}
                        />
                      ),
                      onClick: () => handleToggle(item.id),
                    },
                    { divider: true },
                    {
                      label: "Hapus",
                      icon: <i className='fa-solid fa-trash' />,
                      onClick: () => setDeleteTarget(item),
                      danger: true,
                    },
                  ]}
                />
              </div>

              {item.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "var(--color-bg-subtle)",
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                >
                  <i className='fa-solid fa-box' style={{ marginRight: 4 }} />
                  {item.productCount} produk
                </span>
                <Badge
                  variant={item.status ? "success" : "secondary"}
                  size='sm'
                  dot
                >
                  {item.status ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </div>
          ))}
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

      <StyleFormModal
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
        title='Hapus Gaya'
        message={`Gaya "${deleteTarget?.name}" akan dihapus permanen.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </div>
  );
}

// ─── FABRIC TAB ────────────────────────────────────────────────────
// ✅ FIX 3: destructure { initialItems } and use it instead of DUMMY_FABRICS
function FabricTab({ initialItems }) {
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ FIX 4: derive from live items, not DUMMY_FABRICS
  const materials = useMemo(
    () => [...new Set(items.map((f) => f.material).filter(Boolean))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.material?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q),
      );
    }
    if (filterStatus === "aktif") arr = arr.filter((i) => i.status);
    if (filterStatus === "nonaktif") arr = arr.filter((i) => !i.status);
    if (filterMaterial) arr = arr.filter((i) => i.material === filterMaterial);
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [items, search, filterStatus, filterMaterial]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (data) => {
    try {
      if (data.id && items.find((i) => i.id === data.id)) {
        await updateFabric(data);
        setItems((prev) =>
          prev.map((i) => (i.id === data.id ? { ...i, ...data } : i)),
        );
        toast.add({
          variant: "success",
          message: `Bahan "${data.name}" diperbarui.`,
        });
      } else {
        await createFabric(data);
        setItems((prev) => [
          { ...data, id: Date.now(), productCount: 0 },
          ...prev,
        ]);
        toast.add({
          variant: "success",
          message: `Bahan "${data.name}" ditambahkan.`,
        });
      }
    } catch {
      toast.add({ variant: "danger", message: "Gagal menyimpan bahan." });
    }
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const target = deleteTarget;
    try {
      await deleteFabric(target.id);
      setItems((prev) => prev.filter((i) => i.id !== target.id));
      toast.add({
        variant: "success",
        message: `Bahan "${target.name}" dihapus.`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal menghapus bahan." });
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleToggle = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      await toggleFabricStatus(id, item.status);
      setItems((prev) =>
        prev.map((i) => (i.id !== id ? i : { ...i, status: !i.status })),
      );
      toast.add({
        variant: "info",
        message: `${item.name} → ${item.status ? "nonaktif" : "aktif"}`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal mengubah status." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput
            placeholder='Cari nama atau komposisi bahan...'
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
          value={filterMaterial}
          onChange={(e) => {
            setFilterMaterial(e.target.value);
            setPage(1);
          }}
          style={{ width: 160, paddingRight: 32 }}
        >
          <option value=''>Semua Material</option>
          {materials.map((m) => (
            <option key={m} value={m}>
              {m}
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
        <Button
          variant='primary'
          size='sm'
          leftIcon={<i className='fa-solid fa-plus' />}
          onClick={() => {
            setEditItem(null);
            setFormOpen(true);
          }}
        >
          Tambah Bahan
        </Button>
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          icon={<i className='fa-solid fa-scissors' />}
          title='Tidak ada bahan'
          description='Belum ada data bahan kain.'
          action={
            <Button
              variant='primary'
              leftIcon={<i className='fa-solid fa-plus' />}
              onClick={() => setFormOpen(true)}
            >
              Tambah Bahan
            </Button>
          }
        />
      ) : (
        <Card padding='none'>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--color-border)",
                  background: "var(--color-bg-subtle)",
                }}
              >
                {[
                  "Nama Bahan",
                  "Material",
                  "Gramasi",
                  "Deskripsi",
                  "Perawatan",
                  "Produk",
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
                      textAlign:
                        i === 5 ? "center" : i === 7 ? "right" : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      idx < paginated.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {item.name}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge variant='secondary' size='sm'>
                      {item.material}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {item.weight || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", maxWidth: 240 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", maxWidth: 180 }}>
                    <span
                      style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                    >
                      {item.care || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <Badge variant='secondary' size='sm'>
                      {item.productCount}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge
                      variant={item.status ? "success" : "secondary"}
                      size='sm'
                      dot
                    >
                      {item.status ? "Aktif" : "Nonaktif"}
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
                          onClick={() => {
                            setEditItem(item);
                            setFormOpen(true);
                          }}
                        />
                      </Tooltip>
                      <Tooltip content='Hapus' placement='top'>
                        <IconButton
                          icon={<i className='fa-solid fa-trash' />}
                          size='sm'
                          variant='ghost'
                          label='Hapus'
                          onClick={() => setDeleteTarget(item)}
                          style={{ color: "var(--color-danger)" }}
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
                            label: item.status ? "Nonaktifkan" : "Aktifkan",
                            icon: (
                              <i
                                className={`fa-solid ${item.status ? "fa-eye-slash" : "fa-eye"}`}
                              />
                            ),
                            onClick: () => handleToggle(item.id),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <FabricFormModal
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
        title='Hapus Bahan'
        message={`Bahan "${deleteTarget?.name}" akan dihapus permanen.`}
        variant='danger'
        confirmText='Ya, Hapus'
        loading={deleting}
      />
    </div>
  );
}

// ─── TAB BAR COMPONENT ─────────────────────────────────────────────
// ✅ FIX 6: use tabs prop, not the old module-level TABS const
function TabBar({ active, onChange, tabs }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        borderBottom: "2px solid var(--color-border)",
        marginBottom: 20,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type='button'
            onClick={() => onChange(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              color: isActive
                ? "var(--color-primary)"
                : "var(--color-text-muted)",
              borderBottom: `2px solid ${isActive ? "var(--color-primary)" : "transparent"}`,
              marginBottom: -2,
              transition: "color .15s",
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ fontSize: 13 }} />
            {tab.label}
            <span
              style={{
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: isActive
                  ? "var(--color-primary)"
                  : "var(--color-bg-subtle)",
                color: isActive ? "white" : "var(--color-text-muted)",
                transition: "background .15s, color .15s",
              }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN CLIENT ───────────────────────────────────────────────────
export default function CategoriesClient({
  user,
  initialSizes,
  initialStyles,
  initialFabrics,
}) {
  const [activeTab, setActiveTab] = useState("size");

  // ✅ FIX 1 & 5: tabs defined inside component so it can access props
  const tabs = [
    {
      key: "size",
      label: "Ukuran",
      icon: "fa-ruler",
      count: initialSizes.length,
    },
    {
      key: "style",
      label: "Gaya",
      icon: "fa-shirt",
      count: initialStyles.length,
    },
    {
      key: "fabric",
      label: "Bahan",
      icon: "fa-scissors",
      count: initialFabrics.length,
    },
  ];

  const totalActive =
    initialSizes.filter((i) => i.status).length +
    initialStyles.filter((i) => i.status).length +
    initialFabrics.filter((i) => i.status).length;

  const totalAll =
    initialSizes.length + initialStyles.length + initialFabrics.length;

  return (
    <DashboardLayout activeKey='categories' user={user}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <Breadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/dashboard",
                icon: <i className='fa-solid fa-house' />,
              },
              { label: "Kategori Produk" },
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
                Atribut Produk
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {totalAll} atribut terdaftar · {totalActive} aktif
              </p>
            </div>
          </div>
        </div>

        {/* ✅ FIX 5: use initialSizes/Styles/Fabrics.length, not DUMMY_* */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          <StatCard
            label='Total Ukuran'
            value={initialSizes.length}
            icon={<i className='fa-solid fa-ruler' />}
            color='primary'
          />
          <StatCard
            label='Total Gaya'
            value={initialStyles.length}
            icon={<i className='fa-solid fa-shirt' />}
            color='success'
          />
          <StatCard
            label='Total Bahan'
            value={initialFabrics.length}
            icon={<i className='fa-solid fa-scissors' />}
            color='warning'
          />
        </div>

        <Card padding='md'>
          <TabBar active={activeTab} onChange={setActiveTab} tabs={tabs} />
          {activeTab === "size" && <SizeTab initialItems={initialSizes} />}
          {activeTab === "style" && <StyleTab initialItems={initialStyles} />}
          {activeTab === "fabric" && (
            <FabricTab initialItems={initialFabrics} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
