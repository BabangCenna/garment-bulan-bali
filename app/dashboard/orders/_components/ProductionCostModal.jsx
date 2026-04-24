"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/feedback/Modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/form/Input";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import { saveProductionCosts } from "@/app/actions/orders";

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const COST_FIELDS = [
  { key: "sewing", label: "Ongkos Jahit", icon: "fa-scissors" },
  { key: "buttonhole", label: "Ongkos Lubang Kancing", icon: "fa-circle-dot" },
  { key: "swir", label: "Swir", icon: "fa-arrow-right-arrow-left" },
  { key: "assembly", label: "Ongkos Pasang", icon: "fa-screwdriver-wrench" },
  { key: "embroidery", label: "Bordir / Embroidery", icon: "fa-star" },
  { key: "prewash", label: "Pre-wash", icon: "fa-droplet" },
];

const EMPTY_COSTS = Object.fromEntries(COST_FIELDS.map((f) => [f.key, ""]));

const makeCostsMap = (items) =>
  Object.fromEntries(
    (items ?? []).map((item) => [item.id, { ...EMPTY_COSTS }]),
  );

// ─── ItemCostRow ──────────────────────────────────────────────────────────────
function ItemCostRow({ item, costs = EMPTY_COSTS, onChange }) {
  const itemLabel =
    [item.style_name, item.fabric_name, item.size_name]
      .filter(Boolean)
      .join(" · ") ||
    item.description ||
    "Item";

  const totalCost = COST_FIELDS.reduce(
    (s, f) => s + (Number(costs[f.key]) || 0),
    0,
  );
  const invoicePerUnit = item.invoice_price || 0;
  const totalInvoice = invoicePerUnit * item.qty;
  const totalProduction = totalCost * item.qty;
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

      {/* cost fields grid */}
      <div
        style={{
          padding: "12px 14px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        {COST_FIELDS.map((f) => (
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

      {/* per-item summary */}
      <div
        style={{
          padding: "8px 14px 12px",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Produksi/pcs:{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {formatRupiah(totalCost)}
          </strong>
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Total Produksi:{" "}
          <strong style={{ color: "var(--color-warning)" }}>
            {formatRupiah(totalProduction)}
          </strong>
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Total Invoice:{" "}
          <strong style={{ color: "var(--color-primary)" }}>
            {formatRupiah(totalInvoice)}
          </strong>
        </span>
      </div>
    </div>
  );
}

// ─── ProductionCostModal ──────────────────────────────────────────────────────
export default function ProductionCostModal({
  open,
  onClose,
  order,
  onConfirmed,
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // costs per item: { [itemId]: { sewing: "", buttonhole: "", ... } }
  const [itemCosts, setItemCosts] = useState(() => makeCostsMap(order?.items));

  // re-initialize whenever a different order is opened
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
    const perUnit = COST_FIELDS.reduce(
      (t, f) => t + (Number(costs[f.key]) || 0),
      0,
    );
    return s + perUnit * item.qty;
  }, 0);
  const grandMargin = grandInvoice - grandProduction;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const payload = order.items.map((item) => {
        const costs = itemCosts[item.id] ?? EMPTY_COSTS;
        const perUnit = COST_FIELDS.reduce(
          (t, f) => t + (Number(costs[f.key]) || 0),
          0,
        );
        return {
          itemId: item.id,
          productionCost: perUnit,
          breakdown: Object.fromEntries(
            COST_FIELDS.map((f) => [f.key, Number(costs[f.key]) || 0]),
          ),
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
          {/* grand summary */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Total Invoice:{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                {formatRupiah(grandInvoice)}
              </strong>
            </span>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Total Produksi:{" "}
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
                {formatRupiah(grandMargin)}
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
          Masukkan biaya produksi per item per pcs. Sistem akan menghitung total
          biaya dan margin otomatis.
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
