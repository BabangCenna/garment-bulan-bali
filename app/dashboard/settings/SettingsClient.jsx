// app/dashboard/settings/SettingsClient.jsx
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Badge from "@/components/ui/data/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/form/Input";
import Toggle from "@/components/ui/form/Toggle";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import {
  updateSiteConfig,
  updateContactConfig,
  updateSocialConfig,
  updateFeaturedStyles,
  updateFeaturedFabrics,
  updateHeroSection,
  updateAboutSection,
} from "@/app/actions/settings";

// ─── SECTION WRAPPER ──────────────────────────────────────────────
function SettingsSection({
  id,
  icon,
  title,
  description,
  children,
  onSave,
  saving,
}) {
  return (
    <Card padding='none' id={id}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary-subtle, #EEF2FF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            <i className={`fa-solid ${icon}`} />
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-.2px",
              }}
            >
              {title}
            </div>
            {description && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginTop: 1,
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
        {onSave && (
          <Button
            variant='primary'
            size='sm'
            loading={saving}
            onClick={onSave}
            leftIcon={!saving && <i className='fa-solid fa-floppy-disk' />}
          >
            Simpan
          </Button>
        )}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </Card>
  );
}

// ─── FORM ROW ─────────────────────────────────────────────────────
function FormRow({ children, cols = 2 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

// ─── SECTION: SITE IDENTITY ──────────────────────────────────────
function SiteIdentitySection({ initialConfig }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: initialConfig?.name ?? "",
    tagline: initialConfig?.tagline ?? "",
    description: initialConfig?.description ?? "",
    logo: initialConfig?.logo ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteConfig(form);
      toast.add({
        variant: "success",
        message: "Identitas situs berhasil disimpan.",
      });
    } catch {
      toast.add({
        variant: "danger",
        message: "Gagal menyimpan identitas situs.",
      });
    }
    setSaving(false);
  };

  return (
    <SettingsSection
      id='identitas'
      icon='fa-store'
      title='Identitas Situs'
      description='Nama brand, tagline, dan deskripsi umum toko'
      onSave={handleSave}
      saving={saving}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormRow cols={2}>
          <Input
            label='Nama Toko'
            required
            placeholder='Rumah Kain'
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            hint='Ditampilkan di navbar dan footer'
          />
          <Input
            label='Tagline'
            placeholder='Crafted with soul. Worn with love.'
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            hint='Ditampilkan di footer'
          />
        </FormRow>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Deskripsi Umum
          </label>
          <textarea
            rows={3}
            placeholder='Deskripsi singkat tentang toko Anda...'
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--color-text-primary)",
              background: "var(--color-bg-input, white)",
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 4,
            }}
          >
            Ditampilkan di meta description dan halaman Tentang
          </p>
        </div>
        <Input
          label='URL Logo'
          placeholder='https://cdn.rumahkain.id/logo.png'
          value={form.logo}
          onChange={(e) => set("logo", e.target.value)}
          hint='Kosongkan untuk menggunakan logo SVG default'
          leftIcon={<i className='fa-solid fa-image' />}
        />
        {form.logo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
            }}
          >
            <img
              src={form.logo}
              alt='logo preview'
              style={{ height: 32, objectFit: "contain" }}
              onError={(e) => (e.target.style.display = "none")}
            />
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Preview logo
            </span>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

// ─── SECTION: KONTAK ─────────────────────────────────────────────
function ContactSection({ initialConfig }) {
  const toast = useToast();
  const [form, setForm] = useState({
    whatsapp: initialConfig?.whatsapp ?? "",
    email: initialConfig?.email ?? "",
    instagram: initialConfig?.instagram ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContactConfig(form);
      toast.add({ variant: "success", message: "Kontak berhasil disimpan." });
    } catch {
      toast.add({ variant: "danger", message: "Gagal menyimpan kontak." });
    }
    setSaving(false);
  };

  return (
    <SettingsSection
      id='kontak'
      icon='fa-address-book'
      title='Informasi Kontak'
      description='WhatsApp, email, dan media sosial'
      onSave={handleSave}
      saving={saving}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormRow cols={2}>
          <Input
            label='Nomor WhatsApp'
            required
            placeholder='628123456789'
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))}
            hint='Format internasional tanpa + (cth: 6281234567890)'
            leftIcon={<i className='fa-brands fa-whatsapp' />}
          />
          <Input
            label='Email'
            type='email'
            placeholder='hello@rumahkain.id'
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            leftIcon={<i className='fa-solid fa-envelope' />}
          />
        </FormRow>
        <Input
          label='Instagram'
          placeholder='@rumahkain'
          value={form.instagram}
          onChange={(e) => set("instagram", e.target.value)}
          hint='Sertakan tanda @ di depan username'
          leftIcon={<i className='fa-brands fa-instagram' />}
        />

        {/* Preview CTA */}
        {form.whatsapp && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              fontSize: 12,
              color: "var(--color-text-muted)",
            }}
          >
            <span
              style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}
            >
              Link WhatsApp:
            </span>{" "}
            <a
              href={`https://wa.me/${form.whatsapp}`}
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: "var(--color-primary)", textDecoration: "none" }}
            >
              https://wa.me/{form.whatsapp}
            </a>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

// ─── SECTION: HERO ────────────────────────────────────────────────
function HeroSection({ initialConfig }) {
  const toast = useToast();
  const [form, setForm] = useState({
    headline: initialConfig?.headline ?? "",
    headlineAccent: initialConfig?.headlineAccent ?? "",
    subheadline: initialConfig?.subheadline ?? "",
    cta: initialConfig?.cta ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHeroSection(form);
      toast.add({
        variant: "success",
        message: "Hero section berhasil disimpan.",
      });
    } catch {
      toast.add({
        variant: "danger",
        message: "Gagal menyimpan hero section.",
      });
    }
    setSaving(false);
  };

  return (
    <SettingsSection
      id='hero'
      icon='fa-star'
      title='Hero Section'
      description='Teks utama di halaman pertama landing page'
      onSave={handleSave}
      saving={saving}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormRow cols={2}>
          <Input
            label='Headline'
            required
            placeholder='Ditenun dari Cerita,'
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            hint='Baris pertama judul besar'
          />
          <Input
            label='Headline Accent'
            placeholder='Dipakai dari Hati.'
            value={form.headlineAccent}
            onChange={(e) => set("headlineAccent", e.target.value)}
            hint='Baris kedua (tampil dengan warna aksen)'
          />
        </FormRow>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Subheadline
          </label>
          <textarea
            rows={2}
            placeholder='Koleksi garmen handcrafted dari bahan linen...'
            value={form.subheadline}
            onChange={(e) => set("subheadline", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--color-text-primary)",
              background: "var(--color-bg-input, white)",
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
        </div>
        <Input
          label='Teks Tombol CTA'
          placeholder='Lihat Koleksi'
          value={form.cta}
          onChange={(e) => set("cta", e.target.value)}
          hint='Teks tombol utama di hero'
          leftIcon={<i className='fa-solid fa-arrow-pointer' />}
        />

        {/* Preview box */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, #FDF8F5 0%, #F7EEE8 100%)",
            border: "1px solid #E8D5C8",
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "#C8847A",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 6,
            }}
          >
            Preview
          </p>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 20,
              color: "#3D2B1F",
              lineHeight: 1.2,
            }}
          >
            {form.headline || "Headline..."}{" "}
            <em style={{ color: "#C8847A" }}>
              {form.headlineAccent || "Accent"}
            </em>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "#7A5C4E",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            {form.subheadline || "Subheadline..."}
          </p>
          {form.cta && (
            <div
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "6px 16px",
                background: "#C8847A",
                color: "white",
                borderRadius: 999,
                fontSize: 11,
              }}
            >
              {form.cta}
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}

// ─── SECTION: ABOUT ───────────────────────────────────────────────
function AboutSection({ initialConfig }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: initialConfig?.title ?? "",
    body: initialConfig?.body ?? "",
    highlight: initialConfig?.highlight ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAboutSection(form);
      toast.add({
        variant: "success",
        message: "Tentang kami berhasil disimpan.",
      });
    } catch {
      toast.add({
        variant: "danger",
        message: "Gagal menyimpan tentang kami.",
      });
    }
    setSaving(false);
  };

  return (
    <SettingsSection
      id='tentang'
      icon='fa-circle-info'
      title='Tentang Kami'
      description='Konten bagian Tentang di landing page'
      onSave={handleSave}
      saving={saving}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input
          label='Judul Section'
          placeholder='Tentang Kami'
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Paragraf Deskripsi
          </label>
          <textarea
            rows={4}
            placeholder='Cerita singkat tentang brand Anda...'
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--color-text-primary)",
              background: "var(--color-bg-input, white)",
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
        </div>
        <Input
          label='Highlight / Quote'
          placeholder='Setiap jahitan adalah janji.'
          value={form.highlight}
          onChange={(e) => set("highlight", e.target.value)}
          hint='Muncul sebagai blockquote dan di kartu visual'
          leftIcon={<i className='fa-solid fa-quote-left' />}
        />
      </div>
    </SettingsSection>
  );
}

// ─── SECTION: FEATURED STYLES ─────────────────────────────────────
const BADGE_OPTIONS = ["", "Bestseller", "New", "Favorite"];

// ─── STYLE CARD (uses dropdown) ───────────────────────────────────
function StyleCard({ style, idx, onChange, onRemove, availableStyles }) {
  const set = (k, v) => onChange(idx, { ...style, [k]: v });

  return (
    <div
      style={{
        border: "1.5px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "var(--color-bg-subtle)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
          }}
        >
          Style #{idx + 1}
          {style.name && (
            <span
              style={{
                fontWeight: 400,
                marginLeft: 6,
                color: "var(--color-text-muted)",
              }}
            >
              — {style.name}
            </span>
          )}
        </span>
        <button
          onClick={() => onRemove(idx)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-danger, #EF4444)",
            fontSize: 12,
            padding: "2px 6px",
          }}
        >
          <i className='fa-solid fa-trash' />
        </button>
      </div>

      <div
        style={{
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <FormRow cols={2}>
          {/* Style picker */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
              }}
            >
              Style <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <select
              value={style.style_id ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                const found = availableStyles.find((s) => s.id === id);
                onChange(idx, {
                  ...style,
                  style_id: id,
                  name: found?.name ?? "",
                });
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--color-text-primary)",
                background: "var(--color-bg-input, white)",
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              <option value=''>— Pilih style —</option>
              {availableStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Badge picker */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
              }}
            >
              Badge
            </label>
            <select
              value={style.badge ?? ""}
              onChange={(e) => set("badge", e.target.value || null)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--color-text-primary)",
                background: "var(--color-bg-input, white)",
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {["", "Bestseller", "New", "Favorite"].map((b) => (
                <option key={b} value={b}>
                  {b || "— Tidak ada —"}
                </option>
              ))}
            </select>
          </div>
        </FormRow>

        {/* Show style name as read-only confirmation */}
        {style.style_id && (
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              padding: "6px 10px",
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <i
              className='fa-solid fa-check'
              style={{ color: "var(--color-success, #22c55e)", marginRight: 6 }}
            />
            Terpilih:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {style.name}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedStylesSection({ initialStyles, availableStyles }) {
  const toast = useToast();
  const [styles, setStyles] = useState(initialStyles ?? []);
  const [saving, setSaving] = useState(false);

  const handleChange = (idx, updated) =>
    setStyles((prev) => prev.map((s, i) => (i === idx ? updated : s)));
  const handleRemove = (idx) =>
    setStyles((prev) => prev.filter((_, i) => i !== idx));
  const handleAdd = () =>
    setStyles((prev) => [
      ...prev,
      { id: Date.now(), style_id: null, name: "", badge: null },
    ]);

  const handleSave = async () => {
    const invalid = styles.filter((s) => !s.style_id);
    if (invalid.length) {
      toast.add({
        variant: "warning",
        message: "Pilih style untuk semua kartu sebelum menyimpan.",
      });
      return;
    }
    setSaving(true);
    try {
      await updateFeaturedStyles(styles);
      toast.add({
        variant: "success",
        message: "Koleksi unggulan berhasil disimpan.",
      });
    } catch {
      toast.add({
        variant: "danger",
        message: "Gagal menyimpan koleksi unggulan.",
      });
    }
    setSaving(false);
  };

  return (
    <SettingsSection
      id='koleksi'
      icon='fa-shirt'
      title='Koleksi Unggulan'
      description={`${styles.length} style ditampilkan di landing page`}
      onSave={handleSave}
      saving={saving}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {styles.map((style, idx) => (
          <StyleCard
            key={style.id}
            style={style}
            idx={idx}
            onChange={handleChange}
            onRemove={handleRemove}
            availableStyles={availableStyles}
          />
        ))}
        <button
          onClick={handleAdd}
          style={{
            padding: "10px 16px",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
        >
          <i className='fa-solid fa-plus' /> Tambah Style
        </button>
      </div>
    </SettingsSection>
  );
}

// ─── FABRIC CARD (uses dropdown) ──────────────────────────────────
const FABRIC_COLOR_OPTIONS = ["sand", "rose", "terracotta", "blush"];
const FABRIC_COLOR_MAP = {
  sand: "#F5ECD9",
  rose: "#F5E0DC",
  terracotta: "#EDD8CC",
  blush: "#FAEAF0",
};

function FabricCard({ fabric, idx, onChange, onRemove, availableFabrics }) {
  const set = (k, v) => onChange(idx, { ...fabric, [k]: v });

  return (
    <div
      style={{
        border: "1.5px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "var(--color-bg-subtle)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
          }}
        >
          Bahan #{idx + 1}
          {fabric.name && (
            <span
              style={{
                fontWeight: 400,
                marginLeft: 6,
                color: "var(--color-text-muted)",
              }}
            >
              — {fabric.name}
            </span>
          )}
        </span>
        <button
          onClick={() => onRemove(idx)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-danger, #EF4444)",
            fontSize: 12,
            padding: "2px 6px",
          }}
        >
          <i className='fa-solid fa-trash' />
        </button>
      </div>

      <div
        style={{
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <FormRow cols={2}>
          {/* Fabric picker */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
              }}
            >
              Bahan <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <select
              value={fabric.fabric_id ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                const found = availableFabrics.find((f) => f.id === id);
                onChange(idx, {
                  ...fabric,
                  fabric_id: id,
                  name: found?.name ?? "",
                  material: found?.material ?? "",
                });
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--color-text-primary)",
                background: "var(--color-bg-input, white)",
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              <option value=''>— Pilih bahan —</option>
              {availableFabrics.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                  {f.material ? ` (${f.material})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Color picker */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
              }}
            >
              Warna Kartu
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                paddingTop: 4,
              }}
            >
              {FABRIC_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => set("color", c)}
                  title={c}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: FABRIC_COLOR_MAP[c],
                    border:
                      fabric.color === c
                        ? "3px solid var(--color-primary)"
                        : "2px solid var(--color-border)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                />
              ))}
            </div>
          </div>
        </FormRow>

        {fabric.fabric_id && (
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              padding: "6px 10px",
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <i
              className='fa-solid fa-check'
              style={{ color: "var(--color-success, #22c55e)", marginRight: 6 }}
            />
            Terpilih:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {fabric.name}
            </strong>
            {fabric.material && (
              <span style={{ marginLeft: 6 }}>· {fabric.material}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedFabricsSection({ initialFabrics, availableFabrics }) {
  const toast = useToast();
  const [fabrics, setFabrics] = useState(initialFabrics ?? []);
  const [saving, setSaving] = useState(false);

  const handleChange = (idx, updated) =>
    setFabrics((prev) => prev.map((f, i) => (i === idx ? updated : f)));
  const handleRemove = (idx) =>
    setFabrics((prev) => prev.filter((_, i) => i !== idx));
  const handleAdd = () =>
    setFabrics((prev) => [
      ...prev,
      {
        id: Date.now(),
        fabric_id: null,
        name: "",
        material: "",
        color: "sand",
      },
    ]);

  const handleSave = async () => {
    const invalid = fabrics.filter((f) => !f.fabric_id);
    if (invalid.length) {
      toast.add({
        variant: "warning",
        message: "Pilih bahan untuk semua kartu sebelum menyimpan.",
      });
      return;
    }
    setSaving(true);
    try {
      await updateFeaturedFabrics(fabrics);
      toast.add({
        variant: "success",
        message: "Bahan pilihan berhasil disimpan.",
      });
    } catch {
      toast.add({
        variant: "danger",
        message: "Gagal menyimpan bahan pilihan.",
      });
    }
    setSaving(false);
  };

  return (
    <SettingsSection
      id='bahan'
      icon='fa-layer-group'
      title='Bahan Pilihan'
      description={`${fabrics.length} bahan ditampilkan di landing page`}
      onSave={handleSave}
      saving={saving}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fabrics.map((fabric, idx) => (
          <FabricCard
            key={fabric.id}
            fabric={fabric}
            idx={idx}
            onChange={handleChange}
            onRemove={handleRemove}
            availableFabrics={availableFabrics}
          />
        ))}
        <button
          onClick={handleAdd}
          style={{
            padding: "10px 16px",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
        >
          <i className='fa-solid fa-plus' /> Tambah Bahan
        </button>
      </div>
    </SettingsSection>
  );
}

// ─── SIDE NAV ─────────────────────────────────────────────────────
const SECTIONS = [
  { id: "identitas", icon: "fa-store", label: "Identitas Situs" },
  { id: "kontak", icon: "fa-address-book", label: "Kontak" },
  { id: "hero", icon: "fa-star", label: "Hero Section" },
  { id: "tentang", icon: "fa-circle-info", label: "Tentang Kami" },
  { id: "koleksi", icon: "fa-shirt", label: "Koleksi Unggulan" },
  { id: "bahan", icon: "fa-layer-group", label: "Bahan Pilihan" },
];

function SideNav({ active }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 80,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color: "var(--color-text-muted)",
          marginBottom: 8,
          paddingLeft: 10,
        }}
      >
        Pengaturan
      </p>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            fontSize: 13,
            fontWeight: active === s.id ? 600 : 400,
            color:
              active === s.id
                ? "var(--color-primary)"
                : "var(--color-text-secondary)",
            background:
              active === s.id
                ? "var(--color-primary-subtle, #EEF2FF)"
                : "transparent",
            textDecoration: "none",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <i
            className={`fa-solid ${s.icon}`}
            style={{ width: 14, fontSize: 12, flexShrink: 0 }}
          />
          {s.label}
        </a>
      ))}
    </div>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
// Pass initialConfig from your server action; structure expected:
// {
//   site: { name, tagline, description, logo },
//   contact: { whatsapp, email, instagram },
//   hero: { headline, headlineAccent, subheadline, cta },
//   about: { title, body, highlight },
//   styles: [...featuredStyles],
//   fabrics: [...featuredFabrics],
// }

export default function SettingsClient({
  user,
  initialConfig,
  availableStyles,
  availableFabrics,
}) {
  const [activeSection, setActiveSection] = useState("identitas");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Fallback sample data so the page renders standalone
  const config = initialConfig ?? {
    site: {
      name: "Rumah Kain",
      tagline: "Crafted with soul. Worn with love.",
      description:
        "Kami menciptakan pakaian dengan tangan yang terampil dan bahan pilihan terbaik.",
      logo: "",
    },
    contact: {
      whatsapp: "628123456789",
      email: "hello@rumahkain.id",
      instagram: "@rumahkain",
    },
    hero: {
      headline: "Ditenun dari Cerita,",
      headlineAccent: "Dipakai dari Hati.",
      subheadline:
        "Koleksi garmen handcrafted dari bahan linen, rayon, dan katun pilihan.",
      cta: "Lihat Koleksi",
    },
    about: {
      title: "Tentang Kami",
      body: "Rumah Kain lahir dari kecintaan pada kain-kain alami dan potongan yang bebas bergerak.",
      highlight: "Setiap jahitan adalah janji.",
    },
    styles: [
      {
        id: 1,
        name: "Bali Whisper Dress",
        description: "Gaun mengalir dari rayon voil halus.",
        fabric: "Rayon Voil Halus",
        sizes: ["O/S", "S/M", "M/L"],
        badge: "Bestseller",
      },
      {
        id: 2,
        name: "Isla Dress",
        description: "Dress minimalis dari linen gauze.",
        fabric: "Linen Gauze",
        sizes: ["XS/S", "S/M", "M/L", "L/XL"],
        badge: "New",
      },
    ],
    fabrics: [
      {
        id: 1,
        name: "Linen Gauze",
        material: "Linen",
        description: "Ringan seperti angin.",
        color: "sand",
      },
      {
        id: 2,
        name: "Rayon Voil Halus",
        material: "Rayon",
        description: "Jatuh lembut di tubuh.",
        color: "rose",
      },
    ],
  };

  return (
    <DashboardLayout activeKey='settings' user={user}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div>
          <Breadcrumb
            items={[
              {
                label: "Dashboard",
                href: "/dashboard",
                icon: <i className='fa-solid fa-house' />,
              },
              { label: "Pengaturan" },
            ]}
          />
          <div style={{ marginTop: 12 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: "0 0 4px",
                letterSpacing: "-.3px",
              }}
            >
              Pengaturan Landing Page
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Kelola konten dan tampilan halaman utama Rumah Kain
            </p>
          </div>
        </div>

        {/* Quick stat: preview link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            fontSize: 13,
            color: "var(--color-text-muted)",
          }}
        >
          <i
            className='fa-solid fa-eye'
            style={{ color: "var(--color-primary)" }}
          />
          <span>
            Preview landing page:{" "}
            <a
              href='/'
              target='_blank'
              rel='noopener noreferrer'
              style={{
                color: "var(--color-primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              rumahkain.id →
            </a>
          </span>
          <span style={{ marginLeft: "auto", fontSize: 11 }}>
            Perubahan disimpan per-section
          </span>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Sticky side nav */}
          <SideNav active={activeSection} />

          {/* Content sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SiteIdentitySection initialConfig={config.site} />
            <ContactSection initialConfig={config.contact} />
            <HeroSection initialConfig={config.hero} />
            <AboutSection initialConfig={config.about} />
            <FeaturedStylesSection
              initialStyles={config.styles}
              availableStyles={availableStyles ?? []}
            />
            <FeaturedFabricsSection
              initialFabrics={config.fabrics}
              availableFabrics={availableFabrics ?? []}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
