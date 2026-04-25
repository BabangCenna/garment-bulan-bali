"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/feedback/Modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/form/Input";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import { saveProductionCosts } from "@/app/actions/orders";

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const SEWING_FIELDS = [
  { key: "sewing", label: "Ongkos Jahit", icon: "fa-scissors" },
  { key: "buttonhole", label: "Lubang Kancing", icon: "fa-circle-dot" },
  { key: "swir", label: "Swir", icon: "fa-arrow-right-arrow-left" },
  { key: "assembly", label: "Ongkos Pasang", icon: "fa-screwdriver-wrench" },
  { key: "embroidery", label: "Bordir / Embroidery", icon: "fa-star" },
  { key: "prewash", label: "Pre-wash", icon: "fa-droplet" },
];

const FABRIC_FIELDS = [
  {
    key: "fabric_price",
    label: "Harga Kain/meter (Rp)",
    icon: "fa-tag",
    type: "number",
    placeholder: "0",
  },
  {
    key: "dying",
    label: "Biaya Dying/meter (Rp)",
    icon: "fa-fill-drip",
    type: "number",
    placeholder: "0",
  },
  {
    key: "consumption_meter",
    label: "Konsumsi (meter/pcs)",
    icon: "fa-ruler",
    type: "number",
    placeholder: "0.00",
    step: "0.01",
  },
  {
    key: "organized_fabric_percentage",
    label: "Susut / Waste (%)",
    icon: "fa-percent",
    type: "number",
    placeholder: "0",
    step: "0.1",
  },
];

const EMPTY_COSTS = {
  ...Object.fromEntries(SEWING_FIELDS.map((f) => [f.key, ""])),
  fabric_price: "",
  dying: "",
  consumption_meter: "",
  organized_fabric_percentage: "",
};

const makeCostsMap = (items) =>
  Object.fromEntries(
    (items ?? []).map((item) => [item.id, { ...EMPTY_COSTS }]),
  );

// ─── computed fabric cost ─────────────────────────────────────────
// total_fabric_cost = (fabric_price + dying) * consumption_meter * (1 + percentage/100)
function computeFabricCost(costs) {
  const price = Number(costs.fabric_price) || 0;
  const dying = Number(costs.dying) || 0;
  const meter = Number(costs.consumption_meter) || 0;
  const pct = Number(costs.organized_fabric_percentage) || 0;
  return Math.round((price + dying) * meter * (1 + pct / 100));
}

function computeTotalSewing(costs) {
  return SEWING_FIELDS.reduce((s, f) => s + (Number(costs[f.key]) || 0), 0);
}

// ─── ITEM COST ROW ────────────────────────────────────────────────
function ItemCostRow({ item, costs = EMPTY_COSTS, onChange }) {
  const itemLabel =
    [item.style_name, item.fabric_name, item.size_name]
      .filter(Boolean)
      .join(" · ") ||
    item.description ||
    "Item";

  const sewingTotal = computeTotalSewing(costs);
  const fabricCost = computeFabricCost(costs);
  const totalCostPerUnit = sewingTotal + fabricCost;
  const invoicePerUnit = item.invoice_price || 0;
  const totalInvoice = invoicePerUnit * item.qty;
  const totalProduction = totalCostPerUnit * item.qty;
  const margin = totalInvoice - totalProduction;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      {/* item header */}
      <div
        style={{
          padding: "10px 14px",
          background: "var(--color-bg-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {itemLabel}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 2,
            }}
          >
            Qty: {item.qty} · Invoice: {formatRupiah(invoicePerUnit)}/pcs
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            Estimasi Margin
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color:
                margin >= 0 ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {formatRupiah(margin)}
          </div>
        </div>
      </div>

      {/* ── Section 1: Sewing & Finishing ── */}
      <div
        style={{
          padding: "12px 14px 8px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            color: "var(--color-text-muted)",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i
            className='fa-solid fa-scissors'
            style={{ color: "var(--color-primary)" }}
          />
          Jahit & Finishing
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          {SEWING_FIELDS.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              type='number'
              placeholder='0'
              value={costs[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              leftIcon={
                <i className={`fa-solid ${f.icon}`} style={{ fontSize: 11 }} />
              }
              hint={
                costs[f.key]
                  ? `Total: ${formatRupiah(Number(costs[f.key]) * item.qty)}`
                  : undefined
              }
            />
          ))}
        </div>
        {/* sewing subtotal */}
        <div
          style={{
            marginTop: 8,
            padding: "6px 10px",
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Subtotal Jahit & Finishing/pcs
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {formatRupiah(sewingTotal)}
          </span>
        </div>
      </div>

      {/* ── Section 2: Fabric Cost ── */}
      <div
        style={{
          padding: "12px 14px 8px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            color: "var(--color-text-muted)",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i
            className='fa-solid fa-shirt'
            style={{ color: "var(--color-primary)" }}
          />
          Biaya Kain
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {FABRIC_FIELDS.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              type={f.type}
              placeholder={f.placeholder}
              value={costs[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              leftIcon={
                <i className={`fa-solid ${f.icon}`} style={{ fontSize: 11 }} />
              }
            />
          ))}
        </div>

        {/* fabric cost formula preview */}
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginBottom: 6,
            }}
          >
            Formula: (Harga Kain + Dying) × Konsumsi × (1 + Susut%)
          </div>
          <div
            style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>
              ({formatRupiah(Number(costs.fabric_price) || 0)} +{" "}
              {formatRupiah(Number(costs.dying) || 0)}) ×{" "}
              {Number(costs.consumption_meter) || 0}m ×{" "}
              {(
                1 +
                (Number(costs.organized_fabric_percentage) || 0) / 100
              ).toFixed(3)}
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontWeight: 700,
                color: "var(--color-primary)",
              }}
            >
              = {formatRupiah(fabricCost)}/pcs
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              marginTop: 4,
            }}
          >
            Total kain ({item.qty} pcs):{" "}
            <strong style={{ color: "var(--color-primary)" }}>
              {formatRupiah(fabricCost * item.qty)}
            </strong>
          </div>
        </div>
      </div>

      {/* ── Per-item grand summary ── */}
      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          background: "var(--color-bg-primary)",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Jahit:{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {formatRupiah(sewingTotal)}
          </strong>
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Kain:{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {formatRupiah(fabricCost)}
          </strong>
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Total/pcs:{" "}
          <strong style={{ color: "var(--color-warning)" }}>
            {formatRupiah(totalCostPerUnit)}
          </strong>
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Total produksi:{" "}
          <strong style={{ color: "var(--color-warning)" }}>
            {formatRupiah(totalProduction)}
          </strong>
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginLeft: "auto",
          }}
        >
          Invoice:{" "}
          <strong style={{ color: "var(--color-primary)" }}>
            {formatRupiah(totalInvoice)}
          </strong>
        </span>
      </div>
    </div>
  );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────
export default function ProductionCostModal({
  open,
  onClose,
  order,
  onConfirmed,
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [itemCosts, setItemCosts] = useState(() => makeCostsMap(order?.items));

  useEffect(() => {
    if (!order?.items) return;
    setItemCosts(makeCostsMap(order.items));
  }, [order?.id]);

  if (!order) return null;

  const updateCost = (itemId, field, value) => {
    setItemCosts((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? EMPTY_COSTS), [field]: value },
    }));
  };

  // grand totals
  const grandInvoice = order.items.reduce(
    (s, i) => s + (i.invoice_price || 0) * i.qty,
    0,
  );
  const grandProduction = order.items.reduce((s, item) => {
    const costs = itemCosts[item.id] ?? EMPTY_COSTS;
    const sewing = computeTotalSewing(costs);
    const fabric = computeFabricCost(costs);
    return s + (sewing + fabric) * item.qty;
  }, 0);
  const grandMargin = grandInvoice - grandProduction;
  const marginPct =
    grandInvoice > 0 ? Math.round((grandMargin / grandInvoice) * 100) : 0;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const payload = order.items.map((item) => {
        const costs = itemCosts[item.id] ?? EMPTY_COSTS;
        const sewing = computeTotalSewing(costs);
        const fabric = computeFabricCost(costs);
        const perUnit = sewing + fabric;
        return {
          itemId: item.id,
          productionCost: perUnit,
          breakdown: {
            sewing: Number(costs.sewing) || 0,
            buttonhole: Number(costs.buttonhole) || 0,
            swir: Number(costs.swir) || 0,
            assembly: Number(costs.assembly) || 0,
            embroidery: Number(costs.embroidery) || 0,
            prewash: Number(costs.prewash) || 0,
            fabric_price: Number(costs.fabric_price) || 0,
            dying: Number(costs.dying) || 0,
            consumption_meter: Number(costs.consumption_meter) || 0,
            organized_fabric_percentage:
              Number(costs.organized_fabric_percentage) || 0,
            total_fabric_cost: fabric,
          },
        };
      });

      await saveProductionCosts({ orderId: order.id, items: payload });

      toast.add({
        variant: "success",
        title: "Dikonfirmasi",
        message: `${order.code} dikonfirmasi & biaya produksi tersimpan.`,
      });
      onConfirmed({ orderId: order.id, grandProduction, grandMargin });
      onClose();
    } catch {
      toast.add({
        variant: "danger",
        message: "Gagal menyimpan biaya produksi.",
      });
    }
    setSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Biaya Produksi · ${order.code}`}
      size='xl'
      closeable={!saving}
      footer={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Invoice:{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                {formatRupiah(grandInvoice)}
              </strong>
            </span>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Produksi:{" "}
              <strong style={{ color: "var(--color-warning)" }}>
                {formatRupiah(grandProduction)}
              </strong>
            </span>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Margin:{" "}
              <strong
                style={{
                  color:
                    grandMargin >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {formatRupiah(grandMargin)} ({marginPct}%)
              </strong>
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant='secondary' onClick={onClose} disabled={saving}>
              Batal
            </Button>
            <Button
              variant='success'
              loading={saving}
              leftIcon={!saving && <i className='fa-solid fa-circle-check' />}
              onClick={handleConfirm}
            >
              Konfirmasi Pesanan
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            margin: "0 0 16px",
          }}
        >
          Masukkan biaya produksi per item per pcs. Total kain dihitung otomatis
          dari formula.
        </p>
        {order.items.map((item) => (
          <ItemCostRow
            key={item.id}
            item={item}
            costs={itemCosts[item.id] ?? EMPTY_COSTS}
            onChange={(field, value) => updateCost(item.id, field, value)}
          />
        ))}
      </div>
    </Modal>
  );
}
