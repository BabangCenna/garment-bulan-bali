"use client";
import { useState, useEffect, useRef } from "react";
import Modal from "@/components/ui/feedback/Modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/form/Input";
import Select from "@/components/ui/form/Select";
import Textarea from "@/components/ui/form/Textarea";
import CreatableSelect from "@/components/ui/form/CreatableSelect";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import {
  searchCustomers,
  createOrder,
  getOrderFormData,
  searchStyles,
  createStyle,
  searchFabrics,
  createFabric,
  searchSizes,
  createSize,
} from "@/app/actions/orders";
import { createCustomer } from "@/app/actions/customers";
import ConfirmDialog from "@/components/ui/feedback/ConfirmDialog";

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const PAYMENT_METHOD_OPTIONS = [
  { value: "transfer", label: "Transfer Bank" },
  { value: "cash", label: "Tunai" },
  { value: "qris", label: "QRIS" },
  { value: "cod", label: "COD" },
];
const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Belum Dibayar" },
  { value: "partial", label: "Bayar Sebagian" },
  { value: "paid", label: "Lunas" },
];
const EMPTY_CUSTOMER_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  group: "reguler",
  notes: "",
};
const EMPTY_ITEM = {
  style_id: "",
  fabric_id: "",
  size_id: "",
  size_marker: "",
  weight: "",
  colorway: "",
  colour_fabric: "",
  description: "",
  qty: 1,
  production_cost: "",
  invoice_price: "",
  accessories: [],
};
const EMPTY_ACCESSORY = { accessory_id: "", qty: 1, cost_price: "", notes: "" };

// ─── STEP INDICATOR ───────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["Pelanggan", "Item Pesanan", "Ringkasan"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < 2 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: done
                    ? "var(--color-success)"
                    : active
                      ? "var(--color-primary)"
                      : "var(--color-bg-subtle)",
                  color: done || active ? "white" : "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: "all .2s",
                }}
              >
                {done ? (
                  <i className='fa-solid fa-check' style={{ fontSize: 11 }} />
                ) : (
                  num
                )}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: active
                    ? "var(--color-primary)"
                    : done
                      ? "var(--color-success)"
                      : "var(--color-text-muted)",
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 10px",
                  background: done
                    ? "var(--color-success)"
                    : "var(--color-border)",
                  transition: "background .3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 1: CUSTOMER ─────────────────────────────────────────────
function Step1Customer({ selectedCustomer, onSelect, onNext, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_CUSTOMER_FORM);
  const [newErrors, setNewErrors] = useState({});
  const [savingNew, setSavingNew] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef(null);
  const toast = useToast();
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setDropdownOpen(false);
      return;
    }
    if (selected) {
      setSelected(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const rows = await searchCustomers(query);
        setResults(rows);
        setDropdownOpen(true);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const setNew = (k, v) => {
    setNewForm((p) => ({ ...p, [k]: v }));
    setNewErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleSaveNew = async () => {
    const e = {};
    if (!newForm.name.trim()) e.name = "Nama wajib diisi";
    if (!newForm.phone.trim()) e.phone = "Telepon wajib diisi";
    if (Object.keys(e).length) {
      setNewErrors(e);
      return;
    }
    setSavingNew(true);
    try {
      await createCustomer({ ...newForm, status: "aktif" });
      const rows = await searchCustomers(newForm.name);
      const created = rows[0];
      if (created) {
        onSelect(created);
        toast.add({
          variant: "success",
          message: `Pelanggan ${created.name} ditambahkan.`,
        });
        setShowNew(false);
        setQuery(created.name);
      }
    } catch {
      toast.add({
        variant: "danger",
        message: "Gagal menyimpan pelanggan baru.",
      });
    }
    setSavingNew(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!showNew ? (
        <>
          <div style={{ position: "relative" }}>
            <Input
              label='Cari Pelanggan'
              placeholder='Ketik nama atau nomor telepon...'
              leftIcon={<i className='fa-solid fa-magnifying-glass' />}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedCustomer) onSelect(null);
              }}
              hint='Minimal 2 karakter untuk mencari'
            />
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                  maxHeight: 220,
                  overflowY: "auto",
                  marginTop: 4,
                }}
              >
                {searching ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-muted)",
                      fontSize: 13,
                    }}
                  >
                    <i
                      className='fa-solid fa-spinner fa-spin'
                      style={{ marginRight: 8 }}
                    />
                    Mencari...
                  </div>
                ) : results.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-muted)",
                      fontSize: 13,
                    }}
                  >
                    Tidak ditemukan —{" "}
                    <button
                      type='button'
                      onClick={() => {
                        setShowNew(true);
                        setDropdownOpen(false);
                        setNewForm({ ...EMPTY_CUSTOMER_FORM, name: query });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-primary)",
                        fontWeight: 600,
                        padding: 0,
                        fontSize: 13,
                      }}
                    >
                      Tambah pelanggan baru?
                    </button>
                  </div>
                ) : (
                  results.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelect(c);
                        setSelected(true);
                        setQuery(c.name);
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--color-bg-subtle)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {c.phone}
                        {c.email ? ` · ${c.email}` : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedCustomer && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--color-primary)",
                background: "var(--color-bg-subtle)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--color-text-primary)",
                  }}
                >
                  <i
                    className='fa-solid fa-circle-check'
                    style={{ color: "var(--color-primary)", marginRight: 8 }}
                  />
                  {selectedCustomer.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginTop: 4,
                    paddingLeft: 22,
                  }}
                >
                  {selectedCustomer.phone}
                  {selectedCustomer.email ? ` · ${selectedCustomer.email}` : ""}
                </div>
                {selectedCustomer.address && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      marginTop: 2,
                      paddingLeft: 22,
                    }}
                  >
                    {selectedCustomer.address}
                  </div>
                )}
              </div>
              <button
                type='button'
                onClick={() => {
                  onSelect(null);
                  setQuery("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  fontSize: 16,
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                <i className='fa-solid fa-xmark' />
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{ flex: 1, height: 1, background: "var(--color-border)" }}
            />
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              atau
            </span>
            <div
              style={{ flex: 1, height: 1, background: "var(--color-border)" }}
            />
          </div>

          <Button
            variant='secondary'
            size='sm'
            leftIcon={<i className='fa-solid fa-user-plus' />}
            onClick={() => setShowNew(true)}
          >
            Tambah Pelanggan Baru
          </Button>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              paddingTop: 8,
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <Button variant='secondary' onClick={onClose}>
              Batal
            </Button>
            <Button
              variant='primary'
              disabled={!selectedCustomer}
              rightIcon={<i className='fa-solid fa-arrow-right' />}
              onClick={onNext}
            >
              Lanjut ke Pesanan
            </Button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--color-text-primary)",
              }}
            >
              <i
                className='fa-solid fa-user-plus'
                style={{ marginRight: 8, color: "var(--color-primary)" }}
              />
              Pelanggan Baru
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setShowNew(false);
                setNewForm(EMPTY_CUSTOMER_FORM);
                setNewErrors({});
              }}
            >
              ← Kembali
            </Button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Input
              label='Nama Lengkap'
              required
              placeholder='Siti Rahayu'
              value={newForm.name}
              onChange={(e) => setNew("name", e.target.value)}
              error={newErrors.name}
            />
            <Input
              label='Telepon / WA'
              required
              placeholder='08xxxxxxxxxx'
              value={newForm.phone}
              onChange={(e) => setNew("phone", e.target.value)}
              error={newErrors.phone}
            />
          </div>
          <Input
            label='Email'
            type='email'
            placeholder='contoh@email.com'
            value={newForm.email}
            onChange={(e) => setNew("email", e.target.value)}
          />
          <Textarea
            label='Alamat'
            placeholder='Jl. Contoh No. 1...'
            value={newForm.address}
            onChange={(e) => setNew("address", e.target.value)}
            rows={2}
          />
          <Select
            label='Kelompok'
            value={newForm.group}
            onChange={(e) => setNew("group", e.target.value)}
            options={[
              { value: "reguler", label: "Reguler" },
              { value: "member", label: "Member" },
              { value: "vip", label: "VIP" },
              { value: "reseller", label: "Reseller" },
            ]}
          />
          <Button
            variant='primary'
            loading={savingNew}
            onClick={handleSaveNew}
            leftIcon={!savingNew && <i className='fa-solid fa-floppy-disk' />}
          >
            Simpan & Pilih Pelanggan Ini
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── ACCESSORY ROW ────────────────────────────────────────────────
function AccessoryRow({ acc, accessories, onChange, onRemove }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px 100px auto",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      <Select
        label=''
        value={acc.accessory_id}
        onChange={(e) => {
          const found = accessories.find(
            (a) => String(a.id) === e.target.value,
          );
          onChange({
            ...acc,
            accessory_id: e.target.value,
            cost_price: found?.cost_price || 0,
          });
        }}
        options={[
          { value: "", label: "Pilih aksesori..." },
          ...accessories.map((a) => ({
            value: String(a.id),
            label: `${a.name} (${a.unit})`,
          })),
        ]}
      />
      <Input
        label=''
        type='number'
        placeholder='Qty'
        value={acc.qty}
        onChange={(e) => onChange({ ...acc, qty: e.target.value })}
      />
      <Input
        label=''
        type='number'
        placeholder='Harga'
        value={acc.cost_price}
        onChange={(e) => onChange({ ...acc, cost_price: e.target.value })}
      />
      <button
        type='button'
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-danger)",
          fontSize: 14,
          padding: "6px 4px",
          marginBottom: 2,
        }}
      >
        <i className='fa-solid fa-trash' />
      </button>
    </div>
  );
}

// ─── ITEM FORM ────────────────────────────────────────────────────
function ItemForm({ formData, onAdd, onCancel, toast, onFormDataUpdate }) {
  const [form, setForm] = useState(EMPTY_ITEM);
  const [errors, setErrors] = useState({});

  const setF = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  // ── CreatableSelect handlers with toast on error ───────────────
  const handleCreateStyle = async (name) => {
    try {
      const newOpt = await createStyle(name);
      // ← tambahkan ke formData parent supaya semua ItemForm berikutnya ikut dapat
      onFormDataUpdate("styles", { id: newOpt.value, name: newOpt.label });
      return newOpt;
    } catch {
      toast.add({ variant: "danger", message: "Gagal menambah gaya baru." });
      return null;
    }
  };

  const handleCreateFabric = async (name) => {
    try {
      const newOpt = await createFabric(name);
      console.log("createFabric result:", newOpt); // ← tambah ini
      onFormDataUpdate("fabrics", { id: newOpt.value, name: newOpt.label });
      return newOpt;
    } catch (err) {
      console.error("createFabric error:", err); // ← dan ini
      toast.add({ variant: "danger", message: "Gagal menambah bahan baru." });
      return null;
    }
  };

  const handleCreateSize = async (name) => {
    try {
      const newOpt = await createSize(name);
      onFormDataUpdate("sizes", { id: newOpt.value, name: newOpt.label });
      return newOpt;
    } catch {
      toast.add({ variant: "danger", message: "Gagal menambah ukuran baru." });
      return null;
    }
  };

  const addAccessory = () =>
    setF("accessories", [
      ...form.accessories,
      { ...EMPTY_ACCESSORY, _id: Date.now() },
    ]);

  const updateAccessory = (idx, data) =>
    setF(
      "accessories",
      form.accessories.map((a, i) => (i === idx ? data : a)),
    );

  const removeAccessory = (idx) =>
    setF(
      "accessories",
      form.accessories.filter((_, i) => i !== idx),
    );

  const handleAdd = () => {
    const e = {};
    if (!form.qty || Number(form.qty) < 1) e.qty = "Qty minimal 1";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onAdd({
      ...form,
      qty: Number(form.qty),
      production_cost: Number(form.production_cost) || 0,
      invoice_price: Number(form.invoice_price) || 0,
      style_id: form.style_id || null,
      fabric_id: form.fabric_id || null,
      size_id: form.size_id || null,
      accessories: form.accessories
        .filter((a) => a.accessory_id)
        .map((a) => ({
          accessory_id: Number(a.accessory_id),
          qty: Number(a.qty) || 1,
          cost_price: Number(a.cost_price) || 0,
          notes: a.notes || null,
        })),
      _id: Date.now(),
    });
    setForm(EMPTY_ITEM);
    setErrors({});
  };

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-primary)",
        background: "var(--color-bg-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--color-primary)",
        }}
      >
        <i className='fa-solid fa-plus-circle' style={{ marginRight: 8 }} />
        Tambah Item
      </div>

      {/* ── Gaya / Bahan / Ukuran — pakai CreatableSelect ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        <CreatableSelect
          label='Gaya'
          value={form.style_id}
          onChange={(opt) => setF("style_id", opt?.value ?? "")}
          options={formData.styles.map((s) => ({
            value: String(s.id),
            label: s.name,
          }))}
          onSearch={searchStyles}
          onCreate={handleCreateStyle}
          placeholder='Pilih atau buat...'
          createLabel='Buat gaya'
          emptyText='Tidak ada gaya'
        />
        <CreatableSelect
          label='Bahan'
          value={form.fabric_id}
          onChange={(opt) => setF("fabric_id", opt?.value ?? "")}
          options={formData.fabrics.map((f) => ({
            value: String(f.id),
            label: f.name,
          }))}
          onSearch={searchFabrics}
          onCreate={handleCreateFabric}
          placeholder='Pilih atau buat...'
          createLabel='Buat bahan'
          emptyText='Tidak ada bahan'
        />
        <CreatableSelect
          label='Ukuran'
          value={form.size_id}
          onChange={(opt) => setF("size_id", opt?.value ?? "")}
          options={formData.sizes.map((s) => ({
            value: String(s.id),
            label: `${s.name}${s.label ? ` (${s.label})` : ""}`,
          }))}
          onSearch={searchSizes}
          onCreate={handleCreateSize}
          placeholder='Pilih atau buat...'
          createLabel='Buat ukuran'
          emptyText='Tidak ada ukuran'
        />
      </div>

      {/* detail fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Input
          label='Size Marker'
          placeholder='e.g. 38/40/42'
          value={form.size_marker}
          onChange={(e) => setF("size_marker", e.target.value)}
        />
        <Input
          label='Berat / GSM'
          placeholder='e.g. 180 gsm'
          value={form.weight}
          onChange={(e) => setF("weight", e.target.value)}
        />
        <Input
          label='Colorway'
          placeholder='e.g. Navy / Maroon'
          value={form.colorway}
          onChange={(e) => setF("colorway", e.target.value)}
        />
        <Input
          label='Warna Bahan'
          placeholder='e.g. Hitam'
          value={form.colour_fabric}
          onChange={(e) => setF("colour_fabric", e.target.value)}
        />
      </div>

      <Textarea
        label='Deskripsi / Keterangan'
        placeholder='Detail tambahan item...'
        value={form.description}
        onChange={(e) => setF("description", e.target.value)}
        rows={2}
        style={{ resize: "none" }}
      />

      {/* qty + pricing */}
      <div>
        <Input
          label='Qty'
          type='number'
          required
          placeholder='1'
          value={form.qty}
          onChange={(e) => setF("qty", e.target.value)}
          error={errors.qty}
        />
      </div>

      {/* accessories */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            <i className='fa-solid fa-paperclip' style={{ marginRight: 6 }} />
            Aksesori
          </span>
          <Button
            variant='ghost'
            size='sm'
            onClick={addAccessory}
            leftIcon={<i className='fa-solid fa-plus' />}
          >
            Tambah Aksesori
          </Button>
        </div>
        {form.accessories.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              fontStyle: "italic",
            }}
          >
            Belum ada aksesori
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 100px auto",
                gap: 8,
              }}
            >
              {["Aksesori", "Qty", "Harga (Rp)", ""].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {form.accessories.map((acc, idx) => (
              <AccessoryRow
                key={acc._id ?? idx}
                acc={acc}
                accessories={formData.accessories}
                onChange={(data) => updateAccessory(idx, data)}
                onRemove={() => removeAccessory(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* subtotal preview */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 16,
          fontSize: 13,
          paddingTop: 8,
          borderTop: "1px solid var(--color-border)",
        }}
      ></div>

      <div style={{ display: "flex", gap: 8 }}>
        <Button variant='secondary' size='sm' onClick={onCancel}>
          Batal
        </Button>
        <Button
          variant='primary'
          size='sm'
          onClick={handleAdd}
          leftIcon={<i className='fa-solid fa-plus' />}
        >
          Tambah ke Daftar
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 2: ORDER ITEMS ──────────────────────────────────────────
function Step2Items({
  items,
  onItemsChange,
  formData,
  onFormDataUpdate,
  onNext,
  onBack,
}) {
  const [showForm, setShowForm] = useState(items.length === 0);
  const toast = useToast();

  const handleAdd = (item) => {
    onItemsChange([...items, item]);
    setShowForm(false);
  };

  const handleRemove = (id) => onItemsChange(items.filter((i) => i._id !== id));

  const totalInvoice = items.reduce((s, i) => s + i.invoice_price * i.qty, 0);
  const totalProduction = items.reduce(
    (s, i) => s + i.production_cost * i.qty,
    0,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* items list */}
      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, idx) => {
            const styleName = formData.styles.find(
              (s) => String(s.id) === String(item.style_id),
            )?.name;
            const fabricName = formData.fabrics.find(
              (f) => String(f.id) === String(item.fabric_id),
            )?.name;
            const sizeName = formData.sizes.find(
              (s) => String(s.id) === String(item.size_id),
            )?.name;
            return (
              <div
                key={item._id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-primary)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    {styleName && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--color-bg-subtle)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {styleName}
                      </span>
                    )}
                    {fabricName && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--color-bg-subtle)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {fabricName}
                      </span>
                    )}
                    {sizeName && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--color-bg-subtle)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {sizeName}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {item.colorway && <span>Colorway: {item.colorway}</span>}
                    {item.colour_fabric && (
                      <span>Warna Bahan: {item.colour_fabric}</span>
                    )}
                    {item.size_marker && (
                      <span>Size Marker: {item.size_marker}</span>
                    )}
                    {item.weight && <span>Berat: {item.weight}</span>}
                  </div>
                  {item.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        marginTop: 4,
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                  {item.accessories?.length > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        marginTop: 4,
                      }}
                    >
                      <i
                        className='fa-solid fa-paperclip'
                        style={{ marginRight: 4 }}
                      />
                      {item.accessories.length} aksesori
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Qty: {item.qty}
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => handleRemove(item._id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-danger)",
                    fontSize: 14,
                    padding: 4,
                    flexShrink: 0,
                  }}
                >
                  <i className='fa-solid fa-trash' />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* add item */}
      {showForm ? (
        <ItemForm
          formData={formData}
          onAdd={handleAdd}
          onCancel={() => {
            if (items.length > 0) setShowForm(false);
          }}
          toast={toast}
          onFormDataUpdate={onFormDataUpdate}
        />
      ) : (
        <Button
          variant='secondary'
          size='sm'
          leftIcon={<i className='fa-solid fa-plus' />}
          onClick={() => setShowForm(true)}
        >
          Tambah Item Lagi
        </Button>
      )}

      {items.length === 0 && !showForm && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: "var(--color-text-muted)",
            fontSize: 13,
          }}
        >
          <i
            className='fa-solid fa-box-open'
            style={{
              fontSize: 28,
              marginBottom: 10,
              display: "block",
              textAlign: "center",
            }}
          />
          Belum ada item
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          paddingTop: 8,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <Button
          variant='secondary'
          leftIcon={<i className='fa-solid fa-arrow-left' />}
          onClick={onBack}
        >
          Kembali
        </Button>
        <Button
          variant='primary'
          disabled={items.length === 0}
          rightIcon={<i className='fa-solid fa-arrow-right' />}
          onClick={onNext}
        >
          Lanjut ke Ringkasan
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 3: SUMMARY ──────────────────────────────────────────────
function Step3Summary({ customer, items, formData, onBack, onSave, saving }) {
  const [discount, setDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [notes, setNotes] = useState("");
  const [cashier, setCashier] = useState("");

  const subtotal = items.reduce((s, i) => s + i.invoice_price * i.qty, 0);
  const totalProduction = items.reduce(
    (s, i) => s + i.production_cost * i.qty,
    0,
  );
  const discountVal = Number(discount) || 0;
  const finalTotal = subtotal - discountVal;
  const margin = finalTotal - totalProduction;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* customer */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            marginBottom: 6,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".04em",
          }}
        >
          Pelanggan
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {customer.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {customer.phone}
        </div>
      </div>

      {/* items summary */}
      <div
        style={{
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            background: "var(--color-bg-subtle)",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".04em",
            color: "var(--color-text-muted)",
          }}
        >
          Item Pesanan ({items.length})
        </div>
        {items.map((item, idx) => {
          const styleName = formData.styles.find(
            (s) => String(s.id) === String(item.style_id),
          )?.name;
          const fabricName = formData.fabrics.find(
            (f) => String(f.id) === String(item.fabric_id),
          )?.name;
          const sizeName = formData.sizes.find(
            (s) => String(s.id) === String(item.size_id),
          )?.name;
          const label =
            [styleName, fabricName, sizeName].filter(Boolean).join(" · ") ||
            "Item tanpa nama";
          return (
            <div
              key={item._id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 14px",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  minWidth: 20,
                }}
              >
                {idx + 1}.
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                {item.colorway && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {item.colorway}
                  </div>
                )}
                {item.accessories?.length > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {item.accessories.length} aksesori
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  Qty: {item.qty}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* payment */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select
          label='Metode Pembayaran'
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={PAYMENT_METHOD_OPTIONS}
        />
        <Select
          label='Status Pembayaran'
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          options={PAYMENT_STATUS_OPTIONS}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input
          label='Diskon (Rp)'
          type='number'
          placeholder='0'
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        <Input
          label='Kasir / Sales'
          placeholder='Nama kasir atau sales'
          value={cashier}
          onChange={(e) => setCashier(e.target.value)}
        />
      </div>

      <Textarea
        label='Catatan Pesanan'
        placeholder='Catatan tambahan...'
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        style={{ resize: "none" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          paddingTop: 8,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <Button
          variant='secondary'
          leftIcon={<i className='fa-solid fa-arrow-left' />}
          onClick={onBack}
          disabled={saving}
        >
          Kembali
        </Button>
        <Button
          variant='success'
          loading={saving}
          leftIcon={!saving && <i className='fa-solid fa-floppy-disk' />}
          onClick={() =>
            onSave({
              discount: discountVal,
              paymentMethod,
              paymentStatus,
              notes,
              cashier,
            })
          }
        >
          Simpan Pesanan
        </Button>
      </div>
    </div>
  );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────
export default function NewOrderModal({ open, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    styles: [],
    fabrics: [],
    sizes: [],
    accessories: [],
  });
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const handleFormDataUpdate = (key, newItem) => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], newItem],
    }));
  };

  useEffect(() => {
    if (!open) return;
    setLoadingFormData(true);
    getOrderFormData()
      .then(setFormData)
      .catch(() =>
        toast.add({ variant: "danger", message: "Gagal memuat data form." }),
      )
      .finally(() => setLoadingFormData(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setSelectedCustomer(null);
        setItems([]);
      }, 300);
    }
  }, [open]);

  const handleClose = () => {
    if (items.length > 0) {
      setCloseConfirmOpen(true); // buka dialog, jangan langsung close
      return;
    }
    onClose();
  };

  const handleCloseConfirmed = () => {
    setCloseConfirmOpen(false);
    onClose();
  };

  const handleSave = async ({
    discount,
    paymentMethod,
    paymentStatus,
    notes,
    cashier,
  }) => {
    setSaving(true);
    try {
      const result = await createOrder({
        customerId: selectedCustomer.id,
        items,
        discount,
        paymentMethod,
        paymentStatus,
        notes,
        cashier,
      });
      toast.add({
        variant: "success",
        title: "Pesanan Dibuat",
        message: `${result.code} berhasil disimpan.`,
      });
      onSave({ order: result.order, items: result.items, formData });
      onClose();
    } catch {
      toast.add({ variant: "danger", message: "Gagal menyimpan pesanan." });
    }
    setSaving(false);
  };

  const STEP_TITLES = [
    "Pilih Pelanggan",
    "Tambah Item Pesanan",
    "Ringkasan & Simpan",
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={STEP_TITLES[step - 1]}
        size='lg'
        closeable={!saving}
        footer={null}
      >
        <StepIndicator step={step} />

        {loadingFormData && step === 2 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--color-text-muted)",
            }}
          >
            <i
              className='fa-solid fa-spinner fa-spin'
              style={{ fontSize: 24, marginBottom: 10, display: "block" }}
            />
            Memuat data...
          </div>
        ) : (
          <>
            {step === 1 && (
              <Step1Customer
                selectedCustomer={selectedCustomer}
                onSelect={setSelectedCustomer}
                onNext={() => setStep(2)}
                onClose={handleClose}
              />
            )}
            {step === 2 && (
              <Step2Items
                items={items}
                onItemsChange={setItems}
                formData={formData}
                onFormDataUpdate={handleFormDataUpdate}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <Step3Summary
                customer={selectedCustomer}
                items={items}
                formData={formData}
                onBack={() => setStep(2)}
                onSave={handleSave}
                saving={saving}
              />
            )}
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        onConfirm={handleCloseConfirmed}
        title='Tutup Form Pesanan?'
        message='Data item pesanan yang sudah diisi akan hilang. Yakin ingin menutup?'
        variant='warning'
        confirmText='Ya, Tutup'
      />
    </>
  );
}
