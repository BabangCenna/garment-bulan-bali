"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Badge from "@/components/ui/data/Badge";
import Button from "@/components/ui/button/Button";
import ButtonGroup from "@/components/ui/button/ButtonGroup";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import ConfirmDialog from "@/components/ui/feedback/ConfirmDialog";
import FilterBar from "@/components/ui/form/FilterBar";
import SearchInput from "@/components/ui/form/SearchInput";
import EmptyState from "@/components/ui/data/EmptyState";
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import { OrderDetailModal, OrderCard, OrderTableRow } from "./_components";
import NewOrderModal from "./_components/NewOrderModal";
import { ORDER_STATUSES, PAYMENT_STATUS, formatRupiah } from "./_data";
import { updateOrderStatus, cancelOrder } from "@/app/actions/orders";
import ProductionCostModal from "./_components/ProductionCostModal";
import PaymentModal from "./_components/PaymentModal";
import * as XLSX from "xlsx";

const PAGE_SIZE = 8;

export default function OrdersClient({ user, initialOrders }) {
  const toast = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState(initialOrders);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPay, setFilterPay] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [detailOrder, setDetailOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [productionOrder, setProductionOrder] = useState(null);
  const [productionOpen, setProductionOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleExport = () => {
    // prepare rows
    const rows = filtered.map((o) => ({
      "Kode Pesanan": o.code,
      Pelanggan: o.customer.name,
      Telepon: o.customer.phone,
      Total: o.finalTotal,
      Status: ORDER_STATUSES[o.status]?.label ?? o.status,
      Pembayaran: PAYMENT_STATUS[o.paymentStatus]?.label ?? o.paymentStatus,
      "Biaya Produksi": o.productionCost ?? 0,
      Margin: (o.finalTotal ?? 0) - (o.productionCost ?? 0),
      Tanggal: o.createdAt
        ? new Date(o.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // column widths
    ws["!cols"] = [
      { wch: 20 }, // kode
      { wch: 25 }, // pelanggan
      { wch: 16 }, // telepon
      { wch: 16 }, // total
      { wch: 14 }, // status
      { wch: 14 }, // pembayaran
      { wch: 18 }, // biaya produksi
      { wch: 14 }, // margin
      { wch: 20 }, // tanggal
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pesanan");

    const fileName = `pesanan_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ── handlers ──────────────────────────────────────────────────
  const handleNewOrder = ({ order, items, formData }) => {
    const enrichedItems = items.map((item) => ({
      ...item,
      style_name:
        formData.styles.find((s) => s.id === item.style_id)?.name ?? null,
      fabric_name:
        formData.fabrics.find((f) => f.id === item.fabric_id)?.name ?? null,
      size_name:
        formData.sizes.find((s) => s.id === item.size_id)?.name ?? null,
      accessories: [],
    }));
    setOrders((prev) => [
      {
        ...order,
        customer: {
          id: order.customer_id,
          name: order.customer_name,
          phone: order.customer_phone,
          address: order.customer_address,
          email: order.customer_email,
        },
        items: enrichedItems,
        finalTotal: order.final_total,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        productionCost: order.production_cost,
        amountPaid: order.amount_paid ?? 0,
        createdAt: order.created_at,
      },
      ...prev,
    ]);
    toast.add({
      variant: "success",
      title: "Pesanan Dibuat",
      message: `${order.code} berhasil disimpan.`,
    });
  };

  const handleView = (order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const handleConfirm = (order) => {
    setProductionOrder(order);
    setProductionOpen(true);
    // close detail modal if open
    setDetailOpen(false);
  };

  const handleProductionConfirmed = ({
    orderId,
    grandProduction,
    grandInvoice,
  }) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "confirmed",
              productionCost: grandProduction,
              invoicePrice: grandInvoice,
              finalTotal: grandInvoice, // ← this is what PaymentModal reads
              subtotal: grandInvoice,
            }
          : o,
      ),
    );
  };

  const handleMarkDone = (order) => {
    setPaymentOrder(order);
    setPaymentOpen(true);
    setDetailOpen(false);
  };

  const handlePaymentDone = ({
    orderId,
    paymentStatus,
    isFullyPaid,
    totalPaidSoFar,
  }) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: isFullyPaid ? "done" : "confirmed",
              paymentStatus,
              amountPaid: totalPaidSoFar,
            }
          : o,
      ),
    );
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

  // ── filter & sort ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q),
      );
    }
    if (filterStatus) arr = arr.filter((o) => o.status === filterStatus);
    if (filterPay) arr = arr.filter((o) => o.paymentStatus === filterPay);
    arr.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "total_desc") return b.finalTotal - a.finalTotal;
      if (sortBy === "total_asc") return a.finalTotal - b.finalTotal;
      return 0;
    });
    return arr;
  }, [orders, search, filterStatus, filterPay, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters = [
    filterStatus && {
      key: "status",
      label: "Status",
      value: ORDER_STATUSES[filterStatus]?.label,
    },
    filterPay && {
      key: "pay",
      label: "Pembayaran",
      value: PAYMENT_STATUS[filterPay]?.label,
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "status") setFilterStatus("");
    if (key === "pay") setFilterPay("");
    setPage(1);
  };

  // ── stats ─────────────────────────────────────────────────────
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const doneCount = orders.filter((o) => o.status === "done").length;
  const totalRevenue = orders
    .filter((o) => o.status === "done")
    .reduce((s, o) => s + o.finalTotal, 0);

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
              { label: "Pesanan" },
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
                Manajemen Pesanan
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {orders.length} pesanan · {pendingCount} menunggu konfirmasi
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-download' />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                variant='warning'
                size='sm'
                leftIcon={<i className='fa-solid fa-clock' />}
                onClick={() => router.push("/dashboard/orders/pending")}
              >
                Pending ({pendingCount})
              </Button>
              <Button
                variant='success'
                size='sm'
                leftIcon={<i className='fa-solid fa-bag-shopping' />}
                onClick={() => router.push("/dashboard/orders/done")}
              >
                Selesai ({doneCount})
              </Button>
              <Button
                variant='primary'
                size='sm'
                leftIcon={<i className='fa-solid fa-plus' />}
                onClick={() => setNewOrderOpen(true)}
              >
                Buat Pesanan
              </Button>
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
            label='Total Pesanan'
            value={orders.length}
            icon={<i className='fa-solid fa-receipt' />}
            color='primary'
          />
          <StatCard
            label='Menunggu'
            value={pendingCount}
            icon={<i className='fa-solid fa-clock' />}
            color='warning'
            footer={
              pendingCount > 0 ? (
                <button
                  type='button'
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-warning)",
                    fontSize: 11,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                  onClick={() => router.push("/dashboard/orders/pending")}
                >
                  Lihat pesanan →
                </button>
              ) : null
            }
          />
          <StatCard
            label='Selesai'
            value={doneCount}
            icon={<i className='fa-solid fa-bag-shopping' />}
            color='success'
            footer={
              <button
                type='button'
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-success)",
                  fontSize: 11,
                  padding: 0,
                  fontFamily: "inherit",
                }}
                onClick={() => router.push("/dashboard/orders/done")}
              >
                Lihat pesanan →
              </button>
            }
          />
          <StatCard
            label='Total Pendapatan'
            value={formatRupiah(totalRevenue)}
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
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: 160, paddingRight: 32 }}
            >
              <option value=''>Semua Status</option>
              {Object.entries(ORDER_STATUSES).map(([v, c]) => (
                <option key={v} value={v}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className='input-base input-default input-sm select-base'
              value={filterPay}
              onChange={(e) => {
                setFilterPay(e.target.value);
                setPage(1);
              }}
              style={{ width: 150, paddingRight: 32 }}
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
              style={{ width: 160, paddingRight: 32 }}
            >
              <option value='newest'>Terbaru</option>
              <option value='oldest'>Terlama</option>
              <option value='total_desc'>Total Terbesar</option>
              <option value='total_asc'>Total Terkecil</option>
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

        {activeFilters.length > 0 && (
          <FilterBar
            filters={activeFilters}
            onRemove={removeFilter}
            onClearAll={() => {
              setFilterStatus("");
              setFilterPay("");
              setPage(1);
            }}
          />
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
            pesanan
            {(search || activeFilters.length > 0) && " (difilter)"}
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
              icon={<i className='fa-solid fa-receipt' />}
              title='Tidak ada pesanan'
              description='Tidak ada pesanan yang cocok dengan filter atau pencarian kamu.'
              action={
                <Button
                  variant='secondary'
                  onClick={() => {
                    setSearch("");
                    setFilterStatus("");
                    setFilterPay("");
                    setPage(1);
                  }}
                >
                  Reset Filter
                </Button>
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
              <OrderCard
                key={o.id}
                order={o}
                onView={handleView}
                onConfirm={handleConfirm}
                onMarkDone={handleMarkDone}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        ) : (
          <div
            style={{ overflow: "visible", borderRadius: "var(--radius-lg)" }}
          >
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
                      {[
                        "Kode Pesanan",
                        "Pelanggan",
                        "Item",
                        "Total",
                        "Pembayaran",
                        "Status",
                        "Aksi",
                      ].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "10px 14px",
                            textAlign:
                              i === 3
                                ? "right"
                                : i >= 2 && i <= 4
                                  ? "center"
                                  : i === 6
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
                    {paginated.map((o) => (
                      <OrderTableRow
                        key={o.id}
                        order={o}
                        onView={handleView}
                        onConfirm={handleConfirm}
                        onMarkDone={handleMarkDone}
                        onCancel={setCancelTarget}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
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

      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        order={detailOrder}
        onConfirm={handleConfirm}
        onMarkDone={handleMarkDone}
        onCancel={setCancelTarget}
      />

      <NewOrderModal
        open={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        onSave={handleNewOrder}
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

      <ProductionCostModal
        open={productionOpen}
        onClose={() => {
          setProductionOpen(false);
          setProductionOrder(null);
        }}
        order={productionOrder}
        onConfirmed={handleProductionConfirmed}
      />

      <PaymentModal
        open={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          setPaymentOrder(null);
        }}
        order={paymentOrder}
        onDone={handlePaymentDone}
      />
    </DashboardLayout>
  );
}
