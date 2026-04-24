"use client";
import { useState } from "react";
import Badge from "@/components/ui/data/Badge";
import Tooltip from "@/components/ui/data/Tooltip";
import Button from "@/components/ui/button/Button";
import IconButton from "@/components/ui/button/IconButton";
import Modal from "@/components/ui/feedback/Modal";
import Dropdown from "@/components/ui/navigation/Dropdown";
import {
  ORDER_STATUSES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  formatRupiah,
  formatDateTime,
} from "./_data";
import { printStruk } from "./_components/printStruk";
import { printInvoice } from "./_components/printInvoice";

// ─── helpers ──────────────────────────────────────────────────────
function getItemLabel(item) {
  return (
    [item.style_name, item.fabric_name, item.size_name]
      .filter(Boolean)
      .join(" · ") ||
    item.description ||
    "Item"
  );
}

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────
export function OrderDetailModal({
  open,
  onClose,
  order,
  onConfirm,
  onCancel,
  onMarkDone,
}) {
  if (!order) return null;
  const statusCfg = ORDER_STATUSES[order.status] ?? {
    variant: "secondary",
    label: order.status,
    icon: "fa-circle",
  };
  const payCfg = PAYMENT_STATUS[order.paymentStatus] ?? {
    variant: "secondary",
    label: order.paymentStatus,
  };
  const payLabel =
    PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label ??
    order.paymentMethod;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detail Pesanan · ${order.code}`}
      size='lg'
      footer={
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Button variant='secondary' onClick={onClose}>
            Tutup
          </Button>
          <div style={{ display: "flex", gap: 8 }}>
            {order.status === "pending" && (
              <>
                <Button
                  variant='danger'
                  leftIcon={<i className='fa-solid fa-xmark' />}
                  onClick={() => {
                    onCancel(order);
                    onClose();
                  }}
                >
                  Batalkan
                </Button>
                <Button
                  variant='primary'
                  leftIcon={<i className='fa-solid fa-circle-check' />}
                  onClick={() => {
                    onConfirm(order);
                    onClose();
                  }}
                >
                  Konfirmasi
                </Button>
              </>
            )}
            {(order.status === "confirmed" ||
              order.status === "processing") && (
              <Button
                variant='success'
                leftIcon={<i className='fa-solid fa-bag-shopping' />}
                onClick={() => {
                  onMarkDone(order);
                  onClose();
                }}
              >
                Tandai Selesai
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* status badges */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Badge variant={statusCfg.variant} size='sm' dot>
            <i
              className={`fa-solid ${statusCfg.icon}`}
              style={{ marginRight: 4 }}
            />
            {statusCfg.label}
          </Badge>
          <Badge variant={payCfg.variant} size='sm' dot>
            {payCfg.label}
          </Badge>
          <Badge variant='secondary' size='sm'>
            <i className='fa-solid fa-credit-card' style={{ marginRight: 4 }} />
            {payLabel}
          </Badge>
        </div>

        {/* customer & date */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div
            style={{
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginBottom: 4,
              }}
            >
              <i className='fa-solid fa-user' style={{ marginRight: 5 }} />
              Pelanggan
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {order.customer.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              {order.customer.phone}
            </div>
          </div>
          <div
            style={{
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginBottom: 4,
              }}
            >
              <i className='fa-solid fa-clock' style={{ marginRight: 5 }} />
              Waktu Pesanan
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {formatDateTime(order.createdAt)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              Kasir: {order.cashier || "—"}
            </div>
          </div>
        </div>

        {/* items table — fixed field names */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: 8,
            }}
          >
            Item Pesanan
          </div>
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              // overflow: "hidden",
            }}
          >
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
                    background: "var(--color-bg-subtle)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {["Produk", "Qty", "Harga", "Subtotal"].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "8px 12px",
                        textAlign: i === 0 ? "left" : "right",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => {
                  const price = item.invoice_price ?? item.price ?? 0;
                  const subtotal = price * item.qty;
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom:
                          i < order.items.length - 1
                            ? "1px solid var(--color-border)"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "var(--color-text-primary)",
                          fontWeight: 500,
                        }}
                      >
                        <div style={{ fontSize: 13 }}>{getItemLabel(item)}</div>
                        {item.colorway && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                              marginTop: 2,
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
                              marginTop: 2,
                            }}
                          >
                            <i
                              className='fa-solid fa-paperclip'
                              style={{ marginRight: 4 }}
                            />
                            {item.accessories.length} aksesori
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {item.qty}×
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {formatRupiah(price)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {formatRupiah(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* totals — fixed field names */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: 40 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Subtotal
            </span>
            <span
              style={{
                fontSize: 13,
                color: "var(--color-text-primary)",
                minWidth: 100,
                textAlign: "right",
              }}
            >
              {formatRupiah(order.subtotal ?? order.finalTotal)}
            </span>
          </div>
          {order.discount > 0 && (
            <div style={{ display: "flex", gap: 40 }}>
              <span style={{ fontSize: 13, color: "var(--color-success)" }}>
                Diskon
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--color-success)",
                  minWidth: 100,
                  textAlign: "right",
                }}
              >
                − {formatRupiah(order.discount)}
              </span>
            </div>
          )}
          {order.productionCost > 0 && (
            <div style={{ display: "flex", gap: 40 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Biaya Produksi
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--color-warning)",
                  minWidth: 100,
                  textAlign: "right",
                }}
              >
                {formatRupiah(order.productionCost)}
              </span>
            </div>
          )}
          {order.productionCost > 0 && (
            <div style={{ display: "flex", gap: 40 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Margin
              </span>
              <span
                style={{
                  fontSize: 13,
                  minWidth: 100,
                  textAlign: "right",
                  fontWeight: 600,
                  color:
                    order.finalTotal - order.productionCost >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {formatRupiah(order.finalTotal - order.productionCost)}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 40,
              paddingTop: 6,
              borderTop: "2px solid var(--color-border)",
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              Total
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-primary)",
                minWidth: 100,
                textAlign: "right",
              }}
            >
              {formatRupiah(order.finalTotal)}
            </span>
          </div>
        </div>

        {/* notes */}
        {order.notes && (
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
              {order.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── ORDER CARD ───────────────────────────────────────────────────
export function OrderCard({ order, onView, onConfirm, onMarkDone, onCancel }) {
  const statusCfg = ORDER_STATUSES[order.status] ?? {
    variant: "secondary",
    label: order.status,
    icon: "fa-circle",
  };
  const payCfg = PAYMENT_STATUS[order.paymentStatus] ?? {
    variant: "secondary",
    label: order.paymentStatus,
  };
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div
      style={{
        background: "var(--color-bg-primary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "pointer",
        transition: "box-shadow .2s, transform .2s",
      }}
      onClick={() => onView(order)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(233,30,140,.1)";
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
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-primary)",
              fontFamily: "monospace",
              letterSpacing: ".03em",
            }}
          >
            {order.code}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginTop: 2,
            }}
          >
            {order.customer.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            {order.customer.phone}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
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
                label: "Lihat detail",
                icon: <i className='fa-solid fa-eye' />,
                onClick: () => onView(order),
              },
              ...(order.status === "pending"
                ? [
                    {
                      label: "Konfirmasi",
                      icon: <i className='fa-solid fa-circle-check' />,
                      onClick: () => onConfirm(order),
                    },
                    {
                      label: "Batalkan",
                      icon: <i className='fa-solid fa-xmark' />,
                      onClick: () => onCancel(order),
                      danger: true,
                    },
                  ]
                : []),
              ...(order.status === "confirmed" || order.status === "processing"
                ? [
                    {
                      label: "Tandai Selesai",
                      icon: <i className='fa-solid fa-bag-shopping' />,
                      onClick: () => onMarkDone(order),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <Badge variant={statusCfg.variant} size='sm' dot>
          {statusCfg.label}
        </Badge>
        <Badge variant={payCfg.variant} size='sm' dot>
          {payCfg.label}
        </Badge>
      </div>

      {/* item previews — fixed field names */}
      <div
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          lineHeight: 1.5,
        }}
      >
        {order.items.slice(0, 2).map((item, i) => (
          <div
            key={i}
            style={{
              whiteSpace: "nowrap",
              // overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.qty}× {getItemLabel(item)}
          </div>
        ))}
        {order.items.length > 2 && (
          <div>+{order.items.length - 2} item lainnya</div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          {formatRupiah(order.finalTotal)}
        </span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          <i className='fa-solid fa-clock' style={{ marginRight: 4 }} />
          {formatDateTime(order.createdAt).split(",")[0]}
        </span>
      </div>
    </div>
  );
}

// ─── ORDER TABLE ROW ──────────────────────────────────────────────
export function OrderTableRow({
  order,
  onView,
  onConfirm,
  onMarkDone,
  onCancel,
}) {
  const statusCfg = ORDER_STATUSES[order.status] ?? {
    variant: "secondary",
    label: order.status,
    icon: "fa-circle",
  };
  const payCfg = PAYMENT_STATUS[order.paymentStatus] ?? {
    variant: "secondary",
    label: order.paymentStatus,
  };
  const payLabel =
    PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label ??
    order.paymentMethod;
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <tr
      className='product-table-row'
      style={{ cursor: "pointer" }}
      onClick={() => onView(order)}
    >
      <td style={{ padding: "10px 14px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--color-primary)",
            fontFamily: "monospace",
          }}
        >
          {order.code}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            marginTop: 1,
          }}
        >
          {formatDateTime(order.createdAt)}
        </div>
      </td>
      <td style={{ padding: "10px 14px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {order.customer.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          {order.customer.phone}
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {itemCount} item
        </span>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "right" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          {formatRupiah(order.finalTotal)}
        </div>
        {order.discount > 0 && (
          <div style={{ fontSize: 11, color: "var(--color-success)" }}>
            diskon {formatRupiah(order.discount)}
          </div>
        )}
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            alignItems: "center",
          }}
        >
          <Badge variant={payCfg.variant} size='sm' dot>
            {payCfg.label}
          </Badge>
          <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
            {payLabel}
          </span>
        </div>
      </td>
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <Badge variant={statusCfg.variant} size='sm' dot>
          <i
            className={`fa-solid ${statusCfg.icon}`}
            style={{ marginRight: 4 }}
          />
          {statusCfg.label}
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
              onClick={() => onView(order)}
            />
          </Tooltip>
          {order.status === "pending" && (
            <Tooltip content='Konfirmasi' placement='top'>
              <IconButton
                icon={<i className='fa-solid fa-circle-check' />}
                size='sm'
                variant='ghost'
                label='Konfirmasi'
                onClick={() => onConfirm(order)}
              />
            </Tooltip>
          )}
          {(order.status === "confirmed" || order.status === "processing") && (
            <Tooltip content='Selesai' placement='top'>
              <IconButton
                icon={<i className='fa-solid fa-bag-shopping' />}
                size='sm'
                variant='ghost'
                label='Selesai'
                onClick={() => onMarkDone(order)}
              />
            </Tooltip>
          )}
          <Tooltip content='Cetak Struk' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-print' />}
              size='sm'
              variant='ghost'
              label='Cetak struk'
              onClick={() => printStruk(order)}
            />
          </Tooltip>
          <Tooltip content='Cetak Invoice' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-file-alt' />}
              size='sm'
              variant='ghost'
              label='Cetak Invoice'
              onClick={() => printInvoice(order)}
            />
          </Tooltip>
          {/* <Dropdown
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
              ...(order.status === "pending"
                ? [
                    {
                      label: "Batalkan",
                      icon: <i className='fa-solid fa-xmark' />,
                      onClick: () => onCancel(order),
                      danger: true,
                    },
                  ]
                : []),
              {
                label: "Cetak struk",
                icon: <i className='fa-solid fa-print' />,
                onClick: () => {},
              },
            ]}
          /> */}
        </div>
      </td>
    </tr>
  );
}
