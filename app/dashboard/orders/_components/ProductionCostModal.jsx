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
  { key: "platpack", label: "Plat Pack - Stiker", icon: "fa-box" },
  {
    key: "overhead",
    label: "Overhead (75% Jahit)",
    icon: "fa-percent",
    computed: true,
  },
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
    key: "pre_wash",
    label: "Pre-wash (Rp)",
    icon: "fa-droplet",
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
];

const EMPTY_COSTS = {
  sewing: "",
  buttonhole: "",
  swir: "",
  assembly: "",
  embroidery: "",
  fabric_price: "",
  dying: "",
  pre_wash: "",
  consumption_meter: "",
};

const makeCostsMap = (items) =>
  Object.fromEntries(
    (items ?? []).map((item) => [item.id, { ...EMPTY_COSTS }]),
  );

const makeAccessoriesMap = (items) =>
  Object.fromEntries(
    (items ?? []).map((item) => [
      item.id,
      (item.accessories ?? []).map((a) => ({
        id: a.id,
        accessory_id: a.accessory_id,
        name: a.name,
        unit: a.unit,
        qty: a.qty ?? 1,
        cost_price: a.cost_price ?? 0,
        notes: a.notes ?? "",
      })),
    ]),
  );

function computeFabricCost(costs) {
  const fabricPrice = Number(costs.fabric_price) || 0;
  const dying = Number(costs.dying) || 0;
  const prewash = Number(costs.pre_wash) || 0;
  const meter = Number(costs.consumption_meter) || 0;
  const shrink5 = Math.round(fabricPrice * 0.05);
  const finalAdding = fabricPrice + shrink5 + dying + prewash;
  const calcTotal = finalAdding * meter;
  return Math.round(calcTotal * 1.1);
}

function computeOverhead(costs) {
  return Math.round((Number(costs.sewing) || 0) * 0.75);
}

function computeTotalSewing(costs) {
  const overhead = computeOverhead(costs);
  return SEWING_FIELDS.reduce((s, f) => {
    if (f.key === "overhead") return s + overhead; // use computed, not input
    return s + (Number(costs[f.key]) || 0);
  }, 0);
}

function computeAccessoriesTotal(accessories) {
  return (accessories ?? []).reduce(
    (s, a) => s + (Number(a.qty) || 0) * (Number(a.cost_price) || 0),
    0,
  );
}

// ─── ACCORDION ITEM (inline, no extra import needed) ──────────────
function AccordionItem({ title, children, open, onToggle }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <button
        type='button'
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "var(--color-bg-subtle)",
          border: "none",
          cursor: "pointer",
          gap: 12,
          borderBottom: open ? "1px solid var(--color-border)" : "none",
        }}
      >
        <div style={{ flex: 1, textAlign: "left" }}>{title}</div>
        <i
          className='fa-solid fa-chevron-down'
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── ACCORDION TITLE (summary shown when collapsed) ───────────────
function ItemAccordionTitle({ item, costs, accessories }) {
  const sewingTotal = computeTotalSewing(costs);
  const accTotal = computeAccessoriesTotal(accessories);
  const fabricCost = computeFabricCost(costs);
  const jahitTotal = sewingTotal + accTotal;
  const totalPerUnit = jahitTotal + fabricCost;
  const totalProd = totalPerUnit * item.qty;

  const itemLabel =
    [item.style_name, item.fabric_name, item.size_name]
      .filter(Boolean)
      .join(" · ") ||
    item.description ||
    "Item";

  const hasData = sewingTotal > 0 || fabricCost > 0 || accTotal > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
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
          {itemLabel}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            marginTop: 2,
          }}
        >
          Qty: {item.qty}
        </div>
      </div>
      {hasData ? (
        <div
          style={{ display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" }}
        >
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            Jahit:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {formatRupiah(jahitTotal)}
            </strong>
          </span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            Kain:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {formatRupiah(fabricCost)}
            </strong>
          </span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            Total produksi:{" "}
            <strong style={{ color: "var(--color-warning)" }}>
              {formatRupiah(totalProd)}
            </strong>
          </span>
        </div>
      ) : (
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            fontStyle: "italic",
          }}
        >
          Belum diisi
        </span>
      )}
    </div>
  );
}

// ─── ITEM COST CONTENT (body of accordion) ────────────────────────
function ItemCostContent({
  item,
  costs = EMPTY_COSTS,
  accessories = [],
  onChange,
  onAccessoryChange,
}) {
  const sewingTotal = computeTotalSewing(costs);
  const accessoriesTotal = computeAccessoriesTotal(accessories);
  const fabricCost = computeFabricCost(costs);
  const jahitTotal = sewingTotal + accessoriesTotal;
  const totalCostPerUnit = jahitTotal + fabricCost;
  const totalProduction = totalCostPerUnit * item.qty;

  const fabricPrice = Number(costs.fabric_price) || 0;
  const dying = Number(costs.dying) || 0;
  const prewash = Number(costs.pre_wash) || 0;
  const meter = Number(costs.consumption_meter) || 0;
  const shrink5 = Math.round(fabricPrice * 0.05);
  const finalAdding = fabricPrice + shrink5 + dying + prewash;
  const calcTotal = finalAdding * meter;
  const orgFabric = calcTotal * 0.1;

  return (
    <div>
      {/* ── Jahit & Finishing ── */}
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
          {SEWING_FIELDS.map((f) => {
            if (f.computed) {
              const computedVal = computeOverhead(costs);
              return (
                <div
                  key={f.key}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {f.label}
                  </label>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg-subtle)",
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <i
                      className={`fa-solid ${f.icon}`}
                      style={{ fontSize: 11 }}
                    />
                    <span>{formatRupiah(computedVal)}</span>
                    <span
                      style={{
                        fontSize: 10,
                        marginLeft: "auto",
                        color: "var(--color-text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      otomatis
                    </span>
                  </div>
                  {computedVal > 0 && (
                    <span
                      style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                    >
                      Total: {formatRupiah(computedVal * item.qty)}
                    </span>
                  )}
                </div>
              );
            }
            return (
              <Input
                key={f.key}
                label={f.label}
                type='number'
                placeholder='0'
                value={costs[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                leftIcon={
                  <i
                    className={`fa-solid ${f.icon}`}
                    style={{ fontSize: 11 }}
                  />
                }
                hint={
                  costs[f.key]
                    ? `Total: ${formatRupiah(Number(costs[f.key]) * item.qty)}`
                    : undefined
                }
              />
            );
          })}
        </div>

        {/* Accessories */}
        {accessories.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i
                className='fa-solid fa-paperclip'
                style={{ color: "var(--color-primary)" }}
              />
              Aksesori
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 70px 110px",
                gap: 8,
                marginBottom: 4,
                padding: "0 2px",
              }}
            >
              {["Nama Aksesori", "Qty", "Harga/unit (Rp)"].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {accessories.map((acc, idx) => (
              <div
                key={acc.id ?? idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 70px 110px",
                  gap: 8,
                  marginBottom: 6,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {acc.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-muted)",
                      background: "var(--color-bg-subtle)",
                      padding: "1px 6px",
                      borderRadius: 999,
                    }}
                  >
                    {acc.unit}
                  </span>
                </div>
                <Input
                  label=''
                  type='number'
                  placeholder='1'
                  value={acc.qty}
                  onChange={(e) =>
                    onAccessoryChange(idx, "qty", e.target.value)
                  }
                />
                <Input
                  label=''
                  type='number'
                  placeholder='0'
                  value={acc.cost_price}
                  onChange={(e) =>
                    onAccessoryChange(idx, "cost_price", e.target.value)
                  }
                  hint={
                    acc.qty && acc.cost_price
                      ? formatRupiah(Number(acc.qty) * Number(acc.cost_price))
                      : undefined
                  }
                />
              </div>
            ))}
            <div
              style={{
                marginTop: 4,
                padding: "6px 10px",
                background: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                Subtotal Aksesori/pcs
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {formatRupiah(accessoriesTotal)}
              </span>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 8,
            padding: "6px 10px",
            background: "var(--color-primary)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "white" }}>
            Total Jahit & Finishing/pcs
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
            {formatRupiah(jahitTotal)}
          </span>
        </div>
      </div>

      {/* ── Biaya Kain ── */}
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
              step={f.step}
              value={costs[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              leftIcon={
                <i className={`fa-solid ${f.icon}`} style={{ fontSize: 11 }} />
              }
            />
          ))}
        </div>
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
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ color: "var(--color-text-muted)" }}>
              Shrink 5%: <strong>{formatRupiah(shrink5)}</strong>
            </div>
            <div style={{ color: "var(--color-text-muted)" }}>
              Final Adding: {formatRupiah(fabricPrice)} +{" "}
              {formatRupiah(shrink5)} + {formatRupiah(dying)} +{" "}
              {formatRupiah(prewash)} ={" "}
              <strong>{formatRupiah(finalAdding)}/m</strong>
            </div>
            <div style={{ color: "var(--color-text-muted)" }}>
              Calculated Total: {formatRupiah(finalAdding)} × {meter}m ={" "}
              <strong>{formatRupiah(Math.round(calcTotal))}</strong>
            </div>
            <div style={{ color: "var(--color-text-muted)" }}>
              Organized Fabric (10%):{" "}
              <strong>{formatRupiah(Math.round(orgFabric))}</strong>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                marginTop: 4,
                paddingTop: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>
                Total Biaya Kain/pcs
              </span>
              <strong style={{ color: "var(--color-primary)" }}>
                {formatRupiah(fabricCost)}
              </strong>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              Total kain ({item.qty} pcs):{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                {formatRupiah(fabricCost * item.qty)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grand Summary ── */}
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
          Jahit & Finishing:{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {formatRupiah(jahitTotal)}
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
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginLeft: "auto",
          }}
        >
          Total produksi:{" "}
          <strong style={{ color: "var(--color-warning)" }}>
            {formatRupiah(totalProduction)}
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
  const [itemAccessories, setItemAccessories] = useState(() =>
    makeAccessoriesMap(order?.items),
  );
  // first item open by default
  const [openMap, setOpenMap] = useState({ 0: true });

  useEffect(() => {
    if (!order?.items) return;
    setItemCosts(makeCostsMap(order.items));
    setItemAccessories(makeAccessoriesMap(order.items));
    setOpenMap({ 0: true });
  }, [order?.id]);

  if (!order) return null;

  const toggleItem = (idx) =>
    setOpenMap((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const updateCost = (itemId, field, value) =>
    setItemCosts((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? EMPTY_COSTS), [field]: value },
    }));

  const updateAccessory = (itemId, accIdx, field, value) =>
    setItemAccessories((prev) => {
      const list = [...(prev[itemId] ?? [])];
      list[accIdx] = { ...list[accIdx], [field]: value };
      return { ...prev, [itemId]: list };
    });

  // grand totals
  const grandProduction = order.items.reduce((s, item) => {
    const costs = itemCosts[item.id] ?? EMPTY_COSTS;
    const accessories = itemAccessories[item.id] ?? [];
    return (
      s +
      (computeTotalSewing(costs) +
        computeAccessoriesTotal(accessories) +
        computeFabricCost(costs)) *
        item.qty
    );
  }, 0);

  const grandInvoice = grandProduction;
  const grandMargin = grandInvoice - grandProduction;
  const marginPct =
    grandInvoice > 0 ? Math.round((grandMargin / grandInvoice) * 100) : 0;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const payload = order.items.map((item) => {
        const costs = itemCosts[item.id] ?? EMPTY_COSTS;
        const accessories = itemAccessories[item.id] ?? [];
        const sewing = computeTotalSewing(costs);
        const accTotal = computeAccessoriesTotal(accessories);
        const fabric = computeFabricCost(costs);
        const perUnit = sewing + accTotal + fabric;
        return {
          itemId: item.id,
          productionCost: perUnit,
          invoicePrice: perUnit,
          breakdown: {
            sewing: Number(costs.sewing) || 0,
            buttonhole: Number(costs.buttonhole) || 0,
            swir: Number(costs.swir) || 0,
            assembly: Number(costs.assembly) || 0,
            embroidery: Number(costs.embroidery) || 0,
            platpack: Number(costs.platpack) || 0,
            overhead: computeOverhead(costs),
            fabric_price: Number(costs.fabric_price) || 0,
            dying: Number(costs.dying) || 0,
            pre_wash: Number(costs.pre_wash) || 0,
            consumption_meter: Number(costs.consumption_meter) || 0,
            total_fabric_cost: fabric,
            accessories_total: accTotal,
            accessories: accessories.map((a) => ({
              id: a.id,
              accessory_id: a.accessory_id,
              qty: Number(a.qty) || 1,
              cost_price: Number(a.cost_price) || 0,
            })),
          },
        };
      });

      await saveProductionCosts({ orderId: order.id, items: payload });
      toast.add({
        variant: "success",
        title: "Dikonfirmasi",
        message: `${order.code} dikonfirmasi & biaya produksi tersimpan.`,
      });
      onConfirmed({
        orderId: order.id,
        grandProduction,
        grandInvoice: grandProduction,
      });
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
              Total Produksi:{" "}
              <strong style={{ color: "var(--color-warning)" }}>
                {formatRupiah(grandProduction)}
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
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            margin: "0 0 16px",
          }}
        >
          Masukkan biaya produksi per item per pcs. Klik item untuk membuka
          detail.
        </p>
        {order.items.map((item, idx) => {
          const costs = itemCosts[item.id] ?? EMPTY_COSTS;
          const accessories = itemAccessories[item.id] ?? [];
          return (
            <AccordionItem
              key={item.id}
              open={!!openMap[idx]}
              onToggle={() => toggleItem(idx)}
              title={
                <ItemAccordionTitle
                  item={item}
                  costs={costs}
                  accessories={accessories}
                />
              }
            >
              <ItemCostContent
                item={item}
                costs={costs}
                accessories={accessories}
                onChange={(field, value) => updateCost(item.id, field, value)}
                onAccessoryChange={(accIdx, field, value) =>
                  updateAccessory(item.id, accIdx, field, value)
                }
              />
            </AccordionItem>
          );
        })}
      </div>
    </Modal>
  );
}
