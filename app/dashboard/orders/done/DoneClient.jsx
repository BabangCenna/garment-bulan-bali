// app/dashboard/orders/done/DoneClient.jsx
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
import Tooltip from "@/components/ui/data/Tooltip";
import { useToast } from "@/components/ui/feedback/ToastProvider";
import SearchInput from "@/components/ui/form/SearchInput";
import EmptyState from "@/components/ui/data/EmptyState";
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import Dropdown from "@/components/ui/navigation/Dropdown";
import { OrderDetailModal, OrderCard } from "../_components";
import {
  DUMMY_ORDERS,
  ORDER_STATUSES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  formatRupiah,
  formatDateTime,
} from "../_data";

const PAGE_SIZE = 8;

export default function DoneClient({ user }) {
  const toast = useToast();
  const router = useRouter();

  const [orders] = useState(DUMMY_ORDERS);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [filterPay, setFilterPay] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [detailOrder, setDetailOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const done = useMemo(
    () => orders.filter((o) => o.status === "done"),
    [orders],
  );

  const filtered = useMemo(() => {
    let arr = [...done];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q),
      );
    }
    if (filterPay) arr = arr.filter((o) => o.paymentMethod === filterPay);
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
  }, [done, search, filterPay, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleView = (order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  // ── revenue analytics ─────────────────────────────────────────
  const totalRevenue = done.reduce((s, o) => s + o.finalTotal, 0);
  const totalDiscount = done.reduce((s, o) => s + o.discount, 0);
  const avgOrder = done.length > 0 ? Math.round(totalRevenue / done.length) : 0;

  // top product from done orders
  const productMap = {};
  done.forEach((o) => {
    o.items.forEach((it) => {
      if (!productMap[it.name])
        productMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
      productMap[it.name].qty += it.qty;
      productMap[it.name].revenue += it.qty * it.price;
    });
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const maxQty = topProducts[0]?.qty ?? 1;

  return (
    <DashboardLayout activeKey='orders'>
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
              { label: "Selesai" },
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
                Pesanan Selesai
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {done.length} pesanan selesai · Total pendapatan{" "}
                {formatRupiah(totalRevenue)}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-download' />}
              >
                Export
              </Button>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-arrow-left' />}
                onClick={() => router.push("/dashboard/orders")}
              >
                Semua Pesanan
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
            label='Pesanan Selesai'
            value={done.length}
            icon={<i className='fa-solid fa-bag-shopping' />}
            color='success'
          />
          <StatCard
            label='Total Pendapatan'
            value={formatRupiah(totalRevenue)}
            icon={<i className='fa-solid fa-wallet' />}
            color='primary'
          />
          <StatCard
            label='Rata-rata Pesanan'
            value={formatRupiah(avgOrder)}
            icon={<i className='fa-solid fa-chart-line' />}
            color='primary'
          />
          <StatCard
            label='Total Diskon'
            value={formatRupiah(totalDiscount)}
            icon={<i className='fa-solid fa-tag' />}
            color='warning'
          />
        </div>

        {/* top products mini analytics */}
        {topProducts.length > 0 && (
          <Card padding='md'>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 14,
              }}
            >
              <i
                className='fa-solid fa-fire'
                style={{ marginRight: 6, color: "var(--color-primary)" }}
              />
              Produk Terlaris (dari pesanan selesai)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topProducts.map((p, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        i === 0
                          ? "var(--color-warning)"
                          : i === 1
                            ? "var(--color-text-muted)"
                            : "var(--color-bg-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: i < 2 ? "white" : "var(--color-text-muted)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 3,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        height: 5,
                        borderRadius: 4,
                        background: "var(--color-bg-subtle)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          width: `${(p.qty / maxQty) * 100}%`,
                          background:
                            i === 0
                              ? "var(--color-primary)"
                              : "var(--color-primary-light, var(--color-primary))",
                          opacity: 1 - i * 0.12,
                          transition: "width .4s",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {p.qty} terjual
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                    >
                      {formatRupiah(p.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

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
              <option value=''>Semua Metode</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
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
            pesanan selesai
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
              icon={<i className='fa-solid fa-bag-shopping' />}
              title='Tidak ada pesanan selesai'
              description='Tidak ada pesanan yang cocok dengan filter atau pencarian kamu.'
              action={
                <Button
                  variant='secondary'
                  onClick={() => {
                    setSearch("");
                    setFilterPay("");
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
                onConfirm={() => {}}
                onMarkDone={() => {}}
                onCancel={() => {}}
              />
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
                    {[
                      "Kode Pesanan",
                      "Pelanggan",
                      "Item",
                      "Total",
                      "Metode Bayar",
                      "Waktu Selesai",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          textAlign:
                            i === 3
                              ? "right"
                              : i === 2 || i === 4 || i === 5
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
                  {paginated.map((o) => {
                    const payCfg = PAYMENT_STATUS[o.paymentStatus];
                    const payLabel =
                      PAYMENT_METHODS.find((m) => m.value === o.paymentMethod)
                        ?.label ?? o.paymentMethod;
                    const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
                    return (
                      <tr
                        key={o.id}
                        className='product-table-row'
                        style={{ cursor: "pointer" }}
                        onClick={() => handleView(o)}
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
                            {o.code}
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
                          <Badge variant='secondary' size='sm'>
                            {payLabel}
                          </Badge>
                        </td>
                        <td
                          style={{ padding: "10px 14px", textAlign: "center" }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {formatDateTime(o.updatedAt)}
                          </span>
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
                            <Tooltip content='Detail' placement='top'>
                              <IconButton
                                icon={<i className='fa-solid fa-eye' />}
                                size='sm'
                                variant='ghost'
                                label='Detail'
                                onClick={() => handleView(o)}
                              />
                            </Tooltip>
                            <Tooltip content='Cetak Struk' placement='top'>
                              <IconButton
                                icon={<i className='fa-solid fa-print' />}
                                size='sm'
                                variant='ghost'
                                label='Print'
                                onClick={() => {}}
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
        onConfirm={() => {}}
        onMarkDone={() => {}}
        onCancel={() => {}}
      />
    </DashboardLayout>
  );
}
