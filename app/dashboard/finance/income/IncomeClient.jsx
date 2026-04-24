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

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const methodConfig = {
  cash: { label: "Tunai", icon: "fa-money-bill-wave", variant: "success" },
  transfer: { label: "Transfer", icon: "fa-building-columns", variant: "info" },
  qris: { label: "QRIS", icon: "fa-qrcode", variant: "primary" },
  kartu: { label: "Kartu", icon: "fa-credit-card", variant: "secondary" },
};

// ─── TABLE ROW ────────────────────────────────────────────────────
function IncomeTableRow({ item }) {
  const method = methodConfig[item.method] ?? {
    label: item.method ?? "—",
    icon: "fa-circle",
    variant: "secondary",
  };

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
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          {item.ref}
        </div>
      </td>

      {/* customer + cashier */}
      <td style={{ padding: "10px 14px", maxWidth: 260 }}>
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
        {item.description && (
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 2,
            }}
          >
            Kasir: {item.description}
          </div>
        )}
        {item.note && (
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 1,
            }}
          >
            {item.note}
          </div>
        )}
      </td>

      {/* category — always penjualan */}
      <td style={{ padding: "10px 14px" }}>
        <Badge variant='primary' size='sm'>
          Penjualan Produk
        </Badge>
      </td>

      {/* method */}
      <td style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i
            className={`fa-solid ${method.icon}`}
            style={{ fontSize: 11, color: "var(--color-text-muted)" }}
          />
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {method.label}
          </span>
        </div>
      </td>

      {/* amount */}
      <td style={{ padding: "10px 14px", textAlign: "right" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-success)",
          }}
        >
          {formatRupiah(item.amount)}
        </div>
      </td>

      {/* status — always selesai since payment_status = paid */}
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <Badge variant='success' size='sm' dot>
          Selesai
        </Badge>
      </td>

      {/* view order link */}
      <td style={{ padding: "10px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "flex-end",
          }}
        >
          <Tooltip content='Lihat Order' placement='top'>
            <IconButton
              icon={<i className='fa-solid fa-arrow-up-right-from-square' />}
              size='sm'
              variant='ghost'
              label='Lihat Order'
              onClick={() =>
                window.open(`/dashboard/orders/${item.id}`, "_blank")
              }
            />
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function IncomeClient({ user, initialIncome }) {
  const items = initialIncome ?? [];
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (i) =>
          (i.customer_name ?? "").toLowerCase().includes(q) ||
          (i.ref ?? "").toLowerCase().includes(q) ||
          (i.note ?? "").toLowerCase().includes(q),
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

  // stat calculations
  const totalAmount = items.reduce((s, i) => s + (i.amount ?? 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAmount = items
    .filter((i) => (i.date ?? "").slice(0, 10) === todayStr)
    .reduce((s, i) => s + (i.amount ?? 0), 0);
  const thisMonthStr = new Date().toISOString().slice(0, 7);
  const monthAmount = items
    .filter((i) => (i.date ?? "").slice(0, 7) === thisMonthStr)
    .reduce((s, i) => s + (i.amount ?? 0), 0);

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
              { label: "Pemasukan" },
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
                Pemasukan
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {items.length} transaksi · Total {formatRupiah(totalAmount)}
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
            label='Total Pemasukan'
            value={formatRupiah(totalAmount)}
            icon={<i className='fa-solid fa-arrow-trend-up' />}
            color='success'
          />
          <StatCard
            label='Bulan Ini'
            value={formatRupiah(monthAmount)}
            icon={<i className='fa-solid fa-calendar' />}
            color='primary'
          />
          <StatCard
            label='Hari Ini'
            value={formatRupiah(todayAmount)}
            icon={<i className='fa-solid fa-calendar-day' />}
            color='info'
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
                placeholder='Cari nama pelanggan, nomor order...'
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
            transaksi
            {(search || activeFilters.length > 0) && " (difilter)"}
            {filtered.length > 0 && (
              <>
                {" "}
                · Total{" "}
                <strong style={{ color: "var(--color-success)" }}>
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
              icon={<i className='fa-solid fa-arrow-trend-up' />}
              title='Tidak ada pemasukan'
              description={
                search || activeFilters.length > 0
                  ? "Tidak ada transaksi yang cocok dengan filter."
                  : "Belum ada order yang lunas. Tandai order sebagai paid untuk melihatnya di sini."
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
                      "Pelanggan",
                      "Kategori",
                      "Metode",
                      "Jumlah",
                      "Status",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 14px",
                          textAlign:
                            i === 4
                              ? "right"
                              : i === 5
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
                  {paginated.map((item) => (
                    <IncomeTableRow key={item.id} item={item} />
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
                      Total halaman ini ({paginated.length} transaksi)
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--color-success)",
                      }}
                    >
                      {formatRupiah(
                        paginated.reduce((s, i) => s + (i.amount ?? 0), 0),
                      )}
                    </td>
                    <td colSpan={2} />
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
    </DashboardLayout>
  );
}
