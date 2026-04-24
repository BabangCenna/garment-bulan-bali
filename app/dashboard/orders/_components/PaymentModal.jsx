"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/feedback/Modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/form/Input";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import { markOrderDone } from "@/app/actions/orders";

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

export default function PaymentModal({ open, onClose, order, onDone }) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) setAmount("");
  }, [order?.id]);

  if (!order) return null;

  const invoice = order.finalTotal || 0;
  const alreadyPaid = order.amountPaid || 0;
  const paid = Number(amount) || 0;
  const totalAfter = alreadyPaid + paid;
  const remaining = Math.max(0, invoice - totalAfter);
  const isFullPaid = totalAfter >= invoice;
  const isInvalid = paid <= 0;

  const handleSave = async () => {
    if (isInvalid) return;
    setSaving(true);
    try {
      await markOrderDone({
        orderId: order.id,
        amountPaid: paid,
      });

      toast.add({
        variant: "success",
        title: "Tersimpan",
        message: isFullPaid
          ? `${order.code} lunas & selesai.`
          : `Deposit ${formatRupiah(paid)} tersimpan.`,
      });

      onDone({
        orderId: order.id,
        paymentStatus: isFullPaid ? "paid" : "deposit",
        isFullyPaid: isFullPaid,
        totalPaidSoFar: totalAfter,
      });
      onClose();
    } catch {
      toast.add({ variant: "danger", message: "Gagal memperbarui pesanan." });
    }
    setSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Pembayaran · ${order.code}`}
      size='md'
      closeable={!saving}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button
            variant={isFullPaid ? "success" : "warning"}
            loading={saving}
            disabled={isInvalid}
            leftIcon={
              !saving && (
                <i
                  className={`fa-solid ${isFullPaid ? "fa-circle-check" : "fa-clock-rotate-left"}`}
                />
              )
            }
            onClick={handleSave}
          >
            {isFullPaid ? "Tandai Lunas & Selesai" : "Simpan Deposit & Selesai"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* order summary */}
        <div
          style={{
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Pelanggan</span>
            <strong style={{ color: "var(--color-text-primary)" }}>
              {order.customer?.name}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>
              Total Invoice
            </span>
            <strong style={{ color: "var(--color-primary)", fontSize: 15 }}>
              {formatRupiah(invoice)}
            </strong>
          </div>

          {/* show previous deposit info if exists */}
          {alreadyPaid > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>
                  Sudah Dibayar
                </span>
                <strong style={{ color: "var(--color-success)" }}>
                  {formatRupiah(alreadyPaid)}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  borderTop: "1px dashed var(--color-border)",
                  paddingTop: 8,
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>
                  Sisa Tagihan
                </span>
                <strong style={{ color: "var(--color-warning)" }}>
                  {formatRupiah(invoice - alreadyPaid)}
                </strong>
              </div>
            </>
          )}
        </div>

        {/* amount input */}
        <Input
          label='Jumlah Dibayar (Rp)'
          type='number'
          placeholder='0'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leftIcon={
            <i
              className='fa-solid fa-money-bill-wave'
              style={{ fontSize: 12 }}
            />
          }
          hint={
            paid > 0
              ? isFullPaid
                ? "✓ Pembayaran penuh — status akan menjadi Lunas"
                : `Kurang ${formatRupiah(remaining)} — status akan menjadi Deposit`
              : undefined
          }
        />

        {/* live status preview */}
        {paid > 0 && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${isFullPaid ? "var(--color-success)" : "var(--color-warning)"}`,
              background: isFullPaid
                ? "color-mix(in srgb, var(--color-success) 8%, transparent)"
                : "color-mix(in srgb, var(--color-warning) 8%, transparent)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <i
              className={`fa-solid ${isFullPaid ? "fa-circle-check" : "fa-circle-half-stroke"}`}
              style={{
                color: isFullPaid
                  ? "var(--color-success)"
                  : "var(--color-warning)",
                fontSize: 16,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isFullPaid
                    ? "var(--color-success)"
                    : "var(--color-warning)",
                }}
              >
                {isFullPaid ? "Lunas" : "Deposit"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                {isFullPaid
                  ? `Total terbayar ${formatRupiah(totalAfter)} — pesanan selesai`
                  : `Deposit ${formatRupiah(paid)} · sisa ${formatRupiah(remaining)}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
