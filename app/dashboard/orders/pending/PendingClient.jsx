// app/dashboard/orders/pending/PendingClient.jsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Badge from "@/components/ui/data/Badge";
import Button from "@/components/ui/button/Button";
import ButtonGroup from "@/components/ui/button/ButtonGroup";
import IconButton from "@/components/ui/button/IconButton";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import ConfirmDialog from "@/components/ui/feedback/ConfirmDialog";
import SearchInput from "@/components/ui/form/SearchInput";
import EmptyState from "@/components/ui/data/EmptyState";
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Tooltip from "@/components/ui/data/Tooltip";
import { OrderDetailModal, OrderCard } from "../_components";
import ProductionCostModal from "../_components/ProductionCostModal";
import {
  ORDER_STATUSES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  formatRupiah,
  formatDateTime,
} from "../_data";
import { cancelOrder, saveProductionCosts } from "@/app/actions/orders";

const PAGE_SIZE = 8;

export default function PendingClient({ user, initialOrders }) {
  const toast = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState(initialOrders);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [filterPay, setFilterPay] = useState("");
  const [sortBy, setSortBy] = useState("oldest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const [detailOrder, setDetailOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [bulkConfirming, setBulkConfirming] = useState(false);

  const [productionOrder, setProductionOrder] = useState(null);
  const [productionOpen, setProductionOpen] = useState(false);

  // only pending orders
  const pending = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders],
  );

  const filtered = useMemo(() => {
    let arr = [...pending];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q),
      );
    }
    if (filterPay) arr = arr.filter((o) => o.paymentStatus === filterPay);
    arr.sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "total_desc") return b.finalTotal - a.finalTotal;
      return 0;
    });
    return arr;
  }, [pending, search, filterPay, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── selection ──────────────────────────────────────────────────
  const allPageSelected =
    paginated.length > 0 && paginated.every((o) => selected.has(o.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const s = new Set(prev);
        paginated.forEach((o) => s.delete(o.id));
        return s;
      });
    } else {
      setSelected((prev) => {
        const s = new Set(prev);
        paginated.forEach((o) => s.add(o.id));
        return s;
      });
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── handlers ───────────────────────────────────────────────────
  const handleView = (order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const handleConfirm = (order) => {
    setProductionOrder(order);
    setProductionOpen(true);
    setDetailOpen(false);
  };

  const handleProductionConfirmed = ({ orderId, grandProduction }) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "confirmed", productionCost: grandProduction }
          : o,
      ),
    );
    setSelected((prev) => {
      const s = new Set(prev);
      s.delete(orderId);
      return s;
    });
    toast.add({
      variant: "success",
      title: "Dikonfirmasi",
      message: "Pesanan dikonfirmasi & biaya produksi tersimpan.",
    });
  };

  const handleMarkDone = (order) => {
    // on pending page, mark done just navigates back or could open payment modal
    // keeping it simple — navigate to main orders page
    router.push("/dashboard/orders");
  };

  const handleBulkConfirm = async () => {
    if (selected.size === 0) return;
    setBulkConfirming(true);
    // bulk confirm: set all selected to confirmed (no production cost modal for bulk)
    const ids = new Set(selected);
    setOrders((prev) =>
      prev.map((o) => (ids.has(o.id) ? { ...o, status: "confirmed" } : o)),
    );
    toast.add({
      variant: "success",
      title: "Bulk Konfirmasi",
      message: `${ids.size} pesanan dikonfirmasi.`,
    });
    setSelected(new Set());
    setBulkConfirming(false);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelTarget.id);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelTarget.id ? { ...o, status: "cancelled" } : o,
        ),
      );
      setSelected((prev) => {
        const s = new Set(prev);
        s.delete(cancelTarget.id);
        return s;
      });
      toast.add({
        variant: "danger",
        message: `${cancelTarget.code} dibatalkan.`,
      });
    } catch {
      toast.add({ variant: "danger", message: "Gagal membatalkan pesanan." });
    }
    setCancelTarget(null);
    setCancelling(false);
  };

  // ── stats ──────────────────────────────────────────────────────
  const unpaidCount = pending.filter(
    (o) => o.paymentStatus === "unpaid",
  ).length;
  const depositCount = pending.filter(
    (o) => o.paymentStatus === "deposit",
  ).length;
  const totalValue = pending.reduce((s, o) => s + o.finalTotal, 0);

  return (
    <DashboardLayout activeKey='orders' user={user}>
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
              { label: "Pesanan", href: "/dashboard/orders" },
              { label: "Menunggu Konfirmasi" },
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
                Pesanan Menunggu
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {pending.length} pesanan perlu dikonfirmasi
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-arrow-left' />}
                onClick={() => router.push("/dashboard/orders")}
              >
                Semua Pesanan
              </Button>
              {selected.size > 0 && (
                <Button
                  variant='primary'
                  size='sm'
                  leftIcon={<i className='fa-solid fa-circle-check' />}
                  loading={bulkConfirming}
                  onClick={handleBulkConfirm}
                >
                  Konfirmasi {selected.size} Pesanan
                </Button>
              )}
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
            label='Total Pending'
            value={pending.length}
            icon={<i className='fa-solid fa-clock' />}
            color='warning'
          />
          <StatCard
            label='Belum Bayar'
            value={unpaidCount}
            icon={<i className='fa-solid fa-money-bill-wave' />}
            color='danger'
          />
          <StatCard
            label='DP / Deposit'
            value={depositCount}
            icon={<i className='fa-solid fa-hand-holding-dollar' />}
            color='primary'
          />
          <StatCard
            label='Nilai Tertahan'
            value={formatRupiah(totalValue)}
            icon={<i className='fa-solid fa-wallet' />}
            color='primary'
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
                placeholder='Cari kode pesanan atau nama pelanggan...'
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
              value={filterPay}
              onChange={(e) => {
                setFilterPay(e.target.value);
                setPage(1);
              }}
              style={{ width: 160, paddingRight: 32 }}
            >
              <option value=''>Semua Pembayaran</option>
              {Object.entries(PAYMENT_STATUS).map(([v, c]) => (
                <option key={v} value={v}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className='input-base input-default input-sm select-base'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 180, paddingRight: 32 }}
            >
              <option value='oldest'>Paling Lama (Urgen)</option>
              <option value='newest'>Terbaru</option>
              <option value='total_desc'>Total Terbesar</option>
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

        {/* selection bar */}
        {selected.size > 0 && (
          <div
            style={{
              background: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
              <i
                className='fa-solid fa-circle-check'
                style={{ marginRight: 8 }}
              />
              {selected.size} pesanan dipilih
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => setSelected(new Set())}
              >
                Batal Pilih
              </Button>
              <Button
                size='sm'
                loading={bulkConfirming}
                style={{
                  background: "white",
                  color: "var(--color-primary)",
                  fontWeight: 600,
                }}
                onClick={handleBulkConfirm}
                leftIcon={<i className='fa-solid fa-circle-check' />}
              >
                Konfirmasi Semua
              </Button>
            </div>
          </div>
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
            pesanan pending
            {(search || filterPay) && " (difilter)"}
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
              icon={<i className='fa-solid fa-circle-check' />}
              title={search || filterPay ? "Tidak ada pesanan" : "Semua beres!"}
              description={
                search || filterPay
                  ? "Tidak ada pesanan yang cocok dengan filter."
                  : "Tidak ada pesanan yang menunggu konfirmasi saat ini."
              }
              action={
                search || filterPay ? (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setSearch("");
                      setFilterPay("");
                    }}
                  >
                    Reset Filter
                  </Button>
                ) : (
                  <Button
                    variant='secondary'
                    onClick={() => router.push("/dashboard/orders")}
                  >
                    Lihat Semua Pesanan
                  </Button>
                )
              }
            />
          </Card>
        ) : view === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {paginated.map((o) => (
              <div key={o.id} style={{ position: "relative" }}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOne(o.id);
                  }}
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 2,
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: selected.has(o.id)
                      ? "var(--color-primary)"
                      : "white",
                    border: `2px solid ${selected.has(o.id) ? "var(--color-primary)" : "var(--color-border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {selected.has(o.id) && (
                    <i
                      className='fa-solid fa-check'
                      style={{ fontSize: 10, color: "white" }}
                    />
                  )}
                </div>
                <OrderCard
                  order={o}
                  onView={handleView}
                  onConfirm={handleConfirm}
                  onMarkDone={handleMarkDone}
                  onCancel={setCancelTarget}
                />
              </div>
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
                    <th style={{ padding: "10px 14px", width: 40 }}>
                      <div
                        onClick={toggleSelectAll}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          cursor: "pointer",
                          background: allPageSelected
                            ? "var(--color-primary)"
                            : "transparent",
                          border: `2px solid ${allPageSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {allPageSelected && (
                          <i
                            className='fa-solid fa-check'
                            style={{ fontSize: 9, color: "white" }}
                          />
                        )}
                      </div>
                    </th>
                    {[
                      "Kode Pesanan",
                      "Pelanggan",
                      "Item",
                      "Total",
                      "Pembayaran",
                      "Aksi",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          textAlign:
                            i === 2
                              ? "center"
                              : i === 3
                                ? "right"
                                : i === 4
                                  ? "center"
                                  : i === 5
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
                  {paginated.map((o) => {
                    const payCfg = PAYMENT_STATUS[o.paymentStatus] ?? {
                      variant: "secondary",
                      label: o.paymentStatus,
                    };
                    const payLabel =
                      PAYMENT_METHODS.find((m) => m.value === o.paymentMethod)
                        ?.label ?? o.paymentMethod;
                    const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
                    return (
                      <tr
                        key={o.id}
                        className='product-table-row'
                        style={{
                          cursor: "pointer",
                          background: selected.has(o.id)
                            ? "rgba(233,30,140,.04)"
                            : undefined,
                        }}
                        onClick={() => handleView(o)}
                      >
                        <td
                          style={{ padding: "10px 14px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOne(o.id);
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              cursor: "pointer",
                              background: selected.has(o.id)
                                ? "var(--color-primary)"
                                : "transparent",
                              border: `2px solid ${selected.has(o.id) ? "var(--color-primary)" : "var(--color-border)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {selected.has(o.id) && (
                              <i
                                className='fa-solid fa-check'
                                style={{ fontSize: 9, color: "white" }}
                              />
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--color-primary)",
                              fontFamily: "monospace",
                            }}
                          >
                            {o.code}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                              marginTop: 1,
                            }}
                          >
                            {formatDateTime(o.createdAt)}
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
                            {o.customer.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {o.customer.phone}
                          </div>
                        </td>
                        <td
                          style={{ padding: "10px 14px", textAlign: "center" }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {itemCount} item
                          </span>
                        </td>
                        <td
                          style={{ padding: "10px 14px", textAlign: "right" }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "var(--color-primary)",
                            }}
                          >
                            {formatRupiah(o.finalTotal)}
                          </div>
                          {o.discount > 0 && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--color-success)",
                              }}
                            >
                              diskon {formatRupiah(o.discount)}
                            </div>
                          )}
                        </td>
                        <td
                          style={{ padding: "10px 14px", textAlign: "center" }}
                        >
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
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {payLabel}
                            </span>
                          </div>
                        </td>
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
                            <Tooltip content='Konfirmasi' placement='top'>
                              <IconButton
                                icon={
                                  <i className='fa-solid fa-circle-check' />
                                }
                                size='sm'
                                variant='ghost'
                                label='Konfirmasi'
                                onClick={() => handleConfirm(o)}
                                style={{ color: "var(--color-success)" }}
                              />
                            </Tooltip>
                            <Tooltip content='Batalkan' placement='top'>
                              <IconButton
                                icon={<i className='fa-solid fa-xmark' />}
                                size='sm'
                                variant='ghost'
                                label='Batalkan'
                                onClick={() => setCancelTarget(o)}
                                style={{ color: "var(--color-danger)" }}
                              />
                            </Tooltip>
                            <Tooltip content='Detail' placement='top'>
                              <IconButton
                                icon={<i className='fa-solid fa-eye' />}
                                size='sm'
                                variant='ghost'
                                label='Detail'
                                onClick={() => handleView(o)}
                              />
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        order={detailOrder}
        onConfirm={handleConfirm}
        onMarkDone={handleMarkDone}
        onCancel={setCancelTarget}
      />

      <ProductionCostModal
        open={productionOpen}
        onClose={() => {
          setProductionOpen(false);
          setProductionOrder(null);
        }}
        order={productionOrder}
        onConfirmed={handleProductionConfirmed}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title='Batalkan Pesanan'
        message={`Pesanan "${cancelTarget?.code}" akan dibatalkan. Tindakan ini tidak bisa diurungkan.`}
        variant='danger'
        confirmText='Ya, Batalkan'
        loading={cancelling}
      />
    </DashboardLayout>
  );
}
