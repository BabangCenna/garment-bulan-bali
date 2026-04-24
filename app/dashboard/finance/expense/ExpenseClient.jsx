"use client";
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/data/Badge";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Tooltip from "@/components/ui/data/Tooltip";
import EmptyState from "@/components/ui/data/EmptyState";
import Button from "@/components/ui/button/Button";
import IconButton from "@/components/ui/button/IconButton";
import Modal from "@/components/ui/feedback/Modal";
import SearchInput from "@/components/ui/form/SearchInput";
import Pagination from "@/components/ui/navigation/Pagination";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import FilterBar from "@/components/ui/form/FilterBar";

// ─── CONSTANTS ────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const PAYMENT_METHODS = [
  { value: "cash", label: "Tunai" },
  { value: "transfer", label: "Transfer Bank" },
  { value: "qris", label: "QRIS" },
  { value: "kartu", label: "Kartu Debit/Kredit" },
];

// cost breakdown fields
const COST_FIELDS = [
  { key: "sewing", label: "Jahit" },
  { key: "buttonhole", label: "Kancing" },
  { key: "swir", label: "Swir" },
  { key: "assembly", label: "Assembly" },
  { key: "embroidery", label: "Bordir" },
  { key: "prewash", label: "Prewash" },
];

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── COST DETAIL MODAL ────────────────────────────────────────────
function CostDetailModal({ open, onClose, item }) {
  if (!item) return null;
  const qty = item.qty ?? 1;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Rincian Biaya · ${item.ref}`}
      size='sm'
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant='secondary' onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* order info */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            fontSize: 12,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {item.customer_name}
          </div>
          <div style={{ color: "var(--color-text-muted)" }}>
            Style: {item.style_name ?? "—"} · Qty: {qty}
          </div>
        </div>

        {/* cost rows */}
        {COST_FIELDS.map(({ key, label }) => {
          const perPcs = item[key] ?? 0;
          const total = perPcs * qty;
          if (perPcs === 0) return null;
          return (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 10,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {formatRupiah(perPcs)} × {qty} pcs
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-danger)",
                }}
              >
                {formatRupiah(total)}
              </div>
            </div>
          );
        })}

        {/* total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            Total
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--color-danger)",
            }}
          >
            {formatRupiah(item.amount)}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── TABLE ROW ────────────────────────────────────────────────────
function ExpenseTableRow({ item, onDetail }) {
  const method = PAYMENT_METHODS.find((m) => m.value === item.method);

  // which cost types are active on this item
  const activeCosts = COST_FIELDS.filter(({ key }) => (item[key] ?? 0) > 0);

  return (
    <tr
      style={{
        borderBottom: "1px solid var(--color-border)",
        transition: "background .15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--color-bg-subtle)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* date + ref */}
      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {formatDate(item.date)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-danger)",
            fontWeight: 600,
          }}
        >
          {item.ref}
        </div>
      </td>

      {/* customer + style */}
      <td style={{ padding: "10px 14px", maxWidth: 240 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            lineHeight: 1.35,
          }}
        >
          {item.customer_name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            marginTop: 2,
          }}
        >
          {item.style_name ?? "—"} · {item.qty} pcs
        </div>
      </td>

      {/* cost types as badges */}
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {activeCosts.length > 0 ? (
            activeCosts.map(({ key, label }) => (
              <Badge key={key} variant='secondary' size='sm'>
                {label}
              </Badge>
            ))
          ) : (
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              —
            </span>
          )}
        </div>
      </td>

      {/* method */}
      <td style={{ padding: "10px 14px" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {method?.label ?? item.method ?? "—"}
        </span>
      </td>

      {/* amount */}
      <td style={{ padding: "10px 14px", textAlign: "right" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-danger)",
          }}
        >
          {formatRupiah(item.amount)}
        </div>
      </td>

      {/* action */}
      <td style={{ padding: "10px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "flex-end",
          }}
        >
          <Tooltip content='Rincian' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-list-ul' />}
              size='sm'
              variant='ghost'
              label='Rincian'
              onClick={() => onDetail(item)}
            />
          </Tooltip>
          <Tooltip content='Lihat Order' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-arrow-up-right-from-square' />}
              size='sm'
              variant='ghost'
              label='Lihat Order'
              onClick={() =>
                window.open(`/dashboard/orders/${item.order_id}`, "_blank")
              }
            />
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function ExpenseClient({ user, initialExpenses }) {
  const items = initialExpenses ?? [];
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [detailItem, setDetailItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (i) =>
          (i.customer_name ?? "").toLowerCase().includes(q) ||
          (i.ref ?? "").toLowerCase().includes(q) ||
          (i.style_name ?? "").toLowerCase().includes(q),
      );
    }
    if (filterMethod) arr = arr.filter((i) => i.method === filterMethod);
    arr.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date_asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      return 0;
    });
    return arr;
  }, [items, search, filterMethod, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters = [
    filterMethod && {
      key: "method",
      label: "Metode",
      value: PAYMENT_METHODS.find((m) => m.value === filterMethod)?.label,
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "method") setFilterMethod("");
    setPage(1);
  };
  const clearAllFilters = () => {
    setFilterMethod("");
    setPage(1);
  };

  // stats
  const totalAmount = items.reduce((s, i) => s + (i.amount ?? 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAmount = items
    .filter((i) => (i.date ?? "").slice(0, 10) === todayStr)
    .reduce((s, i) => s + (i.amount ?? 0), 0);
  const monthStr = new Date().toISOString().slice(0, 7);
  const monthAmount = items
    .filter((i) => (i.date ?? "").slice(0, 7) === monthStr)
    .reduce((s, i) => s + (i.amount ?? 0), 0);

  // category breakdown — sum by cost type across all items
  const costBreakdown = useMemo(() => {
    return COST_FIELDS.map(({ key, label }) => {
      const total = items.reduce((s, i) => s + (i[key] ?? 0) * (i.qty ?? 1), 0);
      return { key, label, total };
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [items]);

  return (
    <DashboardLayout activeKey='finance' user={user}>
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
              { label: "Keuangan", href: "/dashboard/finance" },
              { label: "Pengeluaran" },
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
                Pengeluaran Produksi
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {items.length} item · Total {formatRupiah(totalAmount)}
              </p>
            </div>
            <Button
              variant='secondary'
              size='sm'
              leftIcon={<i className='fa-solid fa-download' />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          <StatCard
            label='Total Biaya Produksi'
            value={formatRupiah(totalAmount)}
            icon={<i className='fa-solid fa-arrow-trend-down' />}
            color='danger'
          />
          <StatCard
            label='Bulan Ini'
            value={formatRupiah(monthAmount)}
            icon={<i className='fa-solid fa-calendar' />}
            color='warning'
          />
          <StatCard
            label='Hari Ini'
            value={formatRupiah(todayAmount)}
            icon={<i className='fa-solid fa-calendar-day' />}
            color='primary'
          />
        </div>

        {/* cost breakdown */}
        {costBreakdown.length > 0 && (
          <Card padding='md'>
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: 2,
                }}
              >
                Breakdown per Jenis Biaya
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Distribusi biaya produksi keseluruhan
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {costBreakdown.map(({ key, label, total }) => {
                const pct =
                  totalAmount > 0 ? Math.round((total / totalAmount) * 100) : 0;
                return (
                  <div key={key}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {label}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-danger)",
                          }}
                        >
                          {formatRupiah(total)}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                            width: 30,
                            textAlign: "right",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 99,
                        background: "var(--color-bg-muted)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 99,
                          background: "var(--color-danger)",
                          opacity: pct < 20 ? 0.5 : pct < 50 ? 0.75 : 1,
                          transition: "width .5s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
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
                placeholder='Cari pelanggan, style, atau nomor order...'
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
              value={filterMethod}
              onChange={(e) => {
                setFilterMethod(e.target.value);
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
              <option value='date_desc'>Terbaru</option>
              <option value='date_asc'>Terlama</option>
              <option value='amount_desc'>Jumlah Terbesar</option>
              <option value='amount_asc'>Jumlah Terkecil</option>
            </select>
          </div>
        </Card>

        {activeFilters.length > 0 && (
          <FilterBar
            filters={activeFilters}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Menampilkan{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {filtered.length}
            </strong>{" "}
            item
            {(search || activeFilters.length > 0) && " (difilter)"}
            {filtered.length > 0 && (
              <>
                {" "}
                · Total{" "}
                <strong style={{ color: "var(--color-danger)" }}>
                  {formatRupiah(
                    filtered.reduce((s, i) => s + (i.amount ?? 0), 0),
                  )}
                </strong>
              </>
            )}
          </span>
          {filtered.length > PAGE_SIZE && (
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Halaman {page} dari {totalPages}
            </span>
          )}
        </div>

        {/* table */}
        {paginated.length === 0 ? (
          <Card padding='lg'>
            <EmptyState
              icon={<i className='fa-solid fa-arrow-trend-down' />}
              title='Tidak ada pengeluaran'
              description={
                search || activeFilters.length > 0
                  ? "Tidak ada data yang cocok dengan filter."
                  : "Belum ada biaya produksi tercatat. Tambahkan biaya pada halaman order."
              }
              action={
                (search || activeFilters.length > 0) && (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setSearch("");
                      clearAllFilters();
                    }}
                  >
                    Reset Filter
                  </Button>
                )
              }
            />
          </Card>
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
                      "Tanggal / Order",
                      "Pelanggan / Style",
                      "Jenis Biaya",
                      "Metode",
                      "Jumlah",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          textAlign:
                            i === 4 ? "right" : i === 5 ? "right" : "left",
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
                  {paginated.map((item) => (
                    <ExpenseTableRow
                      key={item.id}
                      item={item}
                      onDetail={(i) => {
                        setDetailItem(i);
                        setDetailOpen(true);
                      }}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      borderTop: "2px solid var(--color-border)",
                      background: "var(--color-bg-subtle)",
                    }}
                  >
                    <td
                      colSpan={4}
                      style={{
                        padding: "10px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Total halaman ini ({paginated.length} item)
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--color-danger)",
                      }}
                    >
                      {formatRupiah(
                        paginated.reduce((s, i) => s + (i.amount ?? 0), 0),
                      )}
                    </td>
                    <td />
                  </tr>
                </tfoot>
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

      <CostDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailItem(null);
        }}
        item={detailItem}
      />
    </DashboardLayout>
  );
}
