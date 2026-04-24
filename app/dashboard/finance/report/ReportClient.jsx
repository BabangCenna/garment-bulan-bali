"use client";
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/data/Badge";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import EmptyState from "@/components/ui/data/EmptyState";
import Button from "@/components/ui/button/Button";
import ButtonGroup from "@/components/ui/button/ButtonGroup";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import ProgressBar from "@/components/ui/feedback/ProgressBar";

// ─── RAW DATA (sama persis seperti income & expense) ──────────────
const INCOME_DATA = [
  { date: "2025-01-22", category: "penjualan", amount: 875000 },
  { date: "2025-01-22", category: "penjualan", amount: 1240000 },
  { date: "2025-01-21", category: "penjualan", amount: 3500000 },
  { date: "2025-01-21", category: "jasa", amount: 250000 },
  { date: "2025-01-20", category: "penjualan", amount: 660000 },
  { date: "2025-01-20", category: "penjualan", amount: 1875000 },
  { date: "2025-01-19", category: "penjualan", amount: 945000 },
  { date: "2025-01-19", category: "investasi", amount: 412500 },
  { date: "2025-01-18", category: "penjualan", amount: 520000 },
  { date: "2025-01-18", category: "lainnya", amount: 175000 },
  { date: "2025-01-17", category: "penjualan", amount: 710000 },
  { date: "2025-01-17", category: "penjualan", amount: 990000 },
  { date: "2025-01-16", category: "penjualan", amount: 2100000 },
  { date: "2025-01-15", category: "jasa", amount: 500000 },
  { date: "2025-01-15", category: "penjualan", amount: 430000 },
];

const EXPENSE_DATA = [
  { date: "2025-01-22", category: "pembelian", amount: 4250000 },
  { date: "2025-01-22", category: "utilitas", amount: 875000 },
  { date: "2025-01-21", category: "marketing", amount: 500000 },
  { date: "2025-01-20", category: "gaji", amount: 8500000 },
  { date: "2025-01-20", category: "pembelian", amount: 2100000 },
  { date: "2025-01-19", category: "operasional", amount: 3500000 },
  { date: "2025-01-18", category: "operasional", amount: 185000 },
  { date: "2025-01-17", category: "operasional", amount: 150000 },
  { date: "2025-01-17", category: "pembelian", amount: 1750000 },
  { date: "2025-01-16", category: "utilitas", amount: 320000 },
  { date: "2025-01-15", category: "marketing", amount: 200000 },
  { date: "2025-01-15", category: "gaji", amount: 300000 },
];

// daily aggregation
const DAILY_RANGE = [
  "2025-01-15",
  "2025-01-16",
  "2025-01-17",
  "2025-01-18",
  "2025-01-19",
  "2025-01-20",
  "2025-01-21",
  "2025-01-22",
];

const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const formatRupiahShort = (n) => {
  if (n >= 1_000_000)
    return "Rp " + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + "rb";
  return "Rp " + n;
};
const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

const INCOME_CAT_LABELS = {
  penjualan: "Penjualan Produk",
  jasa: "Jasa / Layanan",
  investasi: "Hasil Investasi",
  lainnya: "Lain-lain",
};
const EXPENSE_CAT_LABELS = {
  pembelian: "Pembelian Stok",
  operasional: "Operasional",
  gaji: "Gaji & Tunjangan",
  utilitas: "Utilitas & Listrik",
  marketing: "Marketing & Iklan",
  lainnya: "Lain-lain",
};

// ─── MINI BAR CHART ───────────────────────────────────────────────
function MiniBarChart({ daily, maxVal }) {
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}
    >
      {daily.map((d, i) => {
        const incPct = maxVal > 0 ? (d.income / maxVal) * 100 : 0;
        const expPct = maxVal > 0 ? (d.expense / maxVal) * 100 : 0;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              height: "100%",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
                width: "100%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: `${incPct}%`,
                  minHeight: incPct > 0 ? 2 : 0,
                  background: "var(--color-success)",
                  borderRadius: "3px 3px 0 0",
                  opacity: 0.85,
                }}
                title={`Pemasukan: ${formatRupiah(d.income)}`}
              />
              <div
                style={{
                  flex: 1,
                  height: `${expPct}%`,
                  minHeight: expPct > 0 ? 2 : 0,
                  background: "var(--color-danger)",
                  borderRadius: "3px 3px 0 0",
                  opacity: 0.85,
                }}
                title={`Pengeluaran: ${formatRupiah(d.expense)}`}
              />
            </div>
            <div
              style={{
                fontSize: 9,
                color: "var(--color-text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(d.date)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── BREAKDOWN SECTION ────────────────────────────────────────────
function BreakdownBar({ label, amount, total, variant }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>
          {label}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color:
                variant === "success"
                  ? "var(--color-success)"
                  : "var(--color-danger)",
            }}
          >
            {formatRupiah(amount)}
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              width: 32,
              textAlign: "right",
            }}
          >
            {pct}%
          </span>
        </div>
      </div>
      <ProgressBar
        value={pct}
        size='xs'
        variant={variant === "success" ? "success" : "danger"}
      />
    </div>
  );
}

// ─── JOURNAL TABLE ────────────────────────────────────────────────
function JournalRow({ date, entries, incomeTotal, expenseTotal }) {
  const net = incomeTotal - expenseTotal;
  return (
    <>
      {/* date group header */}
      <tr
        style={{
          background: "var(--color-bg-subtle)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <td colSpan={5} style={{ padding: "6px 14px" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            {new Date(date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </td>
      </tr>
      {entries.map((e, i) => (
        <tr
          key={i}
          style={{
            borderBottom: "1px solid var(--color-border)",
            transition: "background .15s",
          }}
          onMouseEnter={(ev) =>
            (ev.currentTarget.style.background = "var(--color-bg-subtle)")
          }
          onMouseLeave={(ev) =>
            (ev.currentTarget.style.background = "transparent")
          }
        >
          <td style={{ padding: "9px 14px", paddingLeft: 28 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {e.ref}
            </span>
          </td>
          <td style={{ padding: "9px 14px" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>
              {e.description}
            </span>
            {e.note && (
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                {e.note}
              </div>
            )}
          </td>
          <td style={{ padding: "9px 14px", textAlign: "center" }}>
            <Badge
              variant={e.type === "income" ? "success" : "danger"}
              size='sm'
            >
              {e.type === "income" ? "Pemasukan" : "Pengeluaran"}
            </Badge>
          </td>
          <td style={{ padding: "9px 14px", textAlign: "right" }}>
            {e.type === "income" && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-success)",
                }}
              >
                +{formatRupiah(e.amount)}
              </span>
            )}
          </td>
          <td style={{ padding: "9px 14px", textAlign: "right" }}>
            {e.type === "expense" && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-danger)",
                }}
              >
                -{formatRupiah(e.amount)}
              </span>
            )}
          </td>
        </tr>
      ))}
      {/* day subtotal */}
      <tr
        style={{
          borderBottom: "2px solid var(--color-border)",
          background: "var(--color-bg-muted, var(--color-bg-subtle))",
        }}
      >
        <td colSpan={2} style={{ padding: "7px 14px", paddingLeft: 28 }}>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            Subtotal · {entries.length} transaksi
          </span>
        </td>
        <td />
        <td style={{ padding: "7px 14px", textAlign: "right" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-success)",
            }}
          >
            +{formatRupiah(incomeTotal)}
          </span>
        </td>
        <td style={{ padding: "7px 14px", textAlign: "right" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-danger)",
            }}
          >
            -{formatRupiah(expenseTotal)}
          </span>
        </td>
      </tr>
    </>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function ReportClient({ user }) {
  const [period, setPeriod] = useState("bulan"); // bulan | minggu
  const [view, setView] = useState("ringkasan"); // ringkasan | jurnal

  // ── derived data ──────────────────────────────────────────────
  const totalIncome = INCOME_DATA.reduce((s, i) => s + i.amount, 0);
  const totalExpense = EXPENSE_DATA.reduce((s, i) => s + i.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin =
    totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const daily = useMemo(
    () =>
      DAILY_RANGE.map((date) => ({
        date,
        income: INCOME_DATA.filter((i) => i.date === date).reduce(
          (s, i) => s + i.amount,
          0,
        ),
        expense: EXPENSE_DATA.filter((i) => i.date === date).reduce(
          (s, i) => s + i.amount,
          0,
        ),
      })),
    [],
  );

  const maxDaily = Math.max(...daily.map((d) => Math.max(d.income, d.expense)));

  // income breakdown
  const incomeBreakdown = useMemo(() => {
    const cats = [...new Set(INCOME_DATA.map((i) => i.category))];
    return cats
      .map((cat) => ({
        cat,
        label: INCOME_CAT_LABELS[cat] ?? cat,
        amount: INCOME_DATA.filter((i) => i.category === cat).reduce(
          (s, i) => s + i.amount,
          0,
        ),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, []);

  // expense breakdown
  const expenseBreakdown = useMemo(() => {
    const cats = [...new Set(EXPENSE_DATA.map((i) => i.category))];
    return cats
      .map((cat) => ({
        cat,
        label: EXPENSE_CAT_LABELS[cat] ?? cat,
        amount: EXPENSE_DATA.filter((i) => i.category === cat).reduce(
          (s, i) => s + i.amount,
          0,
        ),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, []);

  // journal entries (combined, grouped by date)
  const journalByDate = useMemo(() => {
    const INCOME_DETAIL = [
      {
        date: "2025-01-22",
        ref: "INC-0001",
        description: "Penjualan kasir – sesi pagi",
        type: "income",
        amount: 875000,
        note: "",
      },
      {
        date: "2025-01-22",
        ref: "INC-0002",
        description: "Penjualan kasir – sesi siang",
        type: "income",
        amount: 1240000,
        note: "",
      },
      {
        date: "2025-01-21",
        ref: "INC-0003",
        description: "Transfer pelanggan grosir",
        type: "income",
        amount: 3500000,
        note: "Toko Maju Jaya",
      },
      {
        date: "2025-01-21",
        ref: "INC-0004",
        description: "Jasa konsultasi kecantikan",
        type: "income",
        amount: 250000,
        note: "",
      },
      {
        date: "2025-01-20",
        ref: "INC-0005",
        description: "Penjualan kasir – sesi pagi",
        type: "income",
        amount: 660000,
        note: "",
      },
      {
        date: "2025-01-20",
        ref: "INC-0006",
        description: "Penjualan online Tokopedia",
        type: "income",
        amount: 1875000,
        note: "",
      },
      {
        date: "2025-01-19",
        ref: "INC-0007",
        description: "Penjualan kasir – sesi sore",
        type: "income",
        amount: 945000,
        note: "",
      },
      {
        date: "2025-01-19",
        ref: "INC-0008",
        description: "Pendapatan bunga deposito",
        type: "income",
        amount: 412500,
        note: "",
      },
      {
        date: "2025-01-18",
        ref: "INC-0009",
        description: "Penjualan kasir – sesi pagi",
        type: "income",
        amount: 520000,
        note: "",
      },
      {
        date: "2025-01-18",
        ref: "INC-0010",
        description: "Retur vendor – lebih bayar",
        type: "income",
        amount: 175000,
        note: "",
      },
      {
        date: "2025-01-17",
        ref: "INC-0011",
        description: "Penjualan kasir – sesi pagi",
        type: "income",
        amount: 710000,
        note: "",
      },
      {
        date: "2025-01-17",
        ref: "INC-0012",
        description: "Penjualan kasir – sesi siang",
        type: "income",
        amount: 990000,
        note: "",
      },
      {
        date: "2025-01-16",
        ref: "INC-0013",
        description: "Penjualan online Shopee",
        type: "income",
        amount: 2100000,
        note: "",
      },
      {
        date: "2025-01-15",
        ref: "INC-0014",
        description: "Jasa pelatihan karyawan baru",
        type: "income",
        amount: 500000,
        note: "",
      },
      {
        date: "2025-01-15",
        ref: "INC-0015",
        description: "Penjualan kasir – sesi pagi",
        type: "income",
        amount: 430000,
        note: "",
      },
    ];
    const EXPENSE_DETAIL = [
      {
        date: "2025-01-22",
        ref: "EXP-0001",
        description: "Restock Wardah & Scarlett",
        type: "expense",
        amount: 4250000,
        note: "",
      },
      {
        date: "2025-01-22",
        ref: "EXP-0002",
        description: "Biaya listrik bulan Januari",
        type: "expense",
        amount: 875000,
        note: "",
      },
      {
        date: "2025-01-21",
        ref: "EXP-0003",
        description: "Iklan Instagram & TikTok",
        type: "expense",
        amount: 500000,
        note: "",
      },
      {
        date: "2025-01-20",
        ref: "EXP-0004",
        description: "Gaji karyawan + kasir (Jan 2025)",
        type: "expense",
        amount: 8500000,
        note: "",
      },
      {
        date: "2025-01-20",
        ref: "EXP-0005",
        description: "Restock Cetaphil & Blackmores",
        type: "expense",
        amount: 2100000,
        note: "",
      },
      {
        date: "2025-01-19",
        ref: "EXP-0006",
        description: "Sewa toko bulan Februari",
        type: "expense",
        amount: 3500000,
        note: "",
      },
      {
        date: "2025-01-18",
        ref: "EXP-0007",
        description: "Alat kebersihan toko",
        type: "expense",
        amount: 185000,
        note: "",
      },
      {
        date: "2025-01-17",
        ref: "EXP-0008",
        description: "Printer struk kasir – servis",
        type: "expense",
        amount: 150000,
        note: "",
      },
      {
        date: "2025-01-17",
        ref: "EXP-0009",
        description: "Restock Johnson's & Cap Lang",
        type: "expense",
        amount: 1750000,
        note: "",
      },
      {
        date: "2025-01-16",
        ref: "EXP-0010",
        description: "Biaya internet toko",
        type: "expense",
        amount: 320000,
        note: "",
      },
      {
        date: "2025-01-15",
        ref: "EXP-0011",
        description: "Desain banner promosi",
        type: "expense",
        amount: 200000,
        note: "",
      },
      {
        date: "2025-01-15",
        ref: "EXP-0012",
        description: "Bonus karyawan terbaik",
        type: "expense",
        amount: 300000,
        note: "",
      },
    ];
    const all = [...INCOME_DETAIL, ...EXPENSE_DETAIL].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return a.type.localeCompare(b.type);
    });
    const grouped = {};
    all.forEach((e) => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, []);

  return (
    <DashboardLayout activeKey='finance'>
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
              { label: "Laporan" },
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
                Laporan Keuangan
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                Periode: Januari 2025
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <ButtonGroup
                mode='toggle'
                size='sm'
                value={view}
                onChange={setView}
                items={[
                  {
                    value: "ringkasan",
                    icon: <i className='fa-solid fa-chart-pie' />,
                    label: "Ringkasan",
                  },
                  {
                    value: "jurnal",
                    icon: <i className='fa-solid fa-book' />,
                    label: "Jurnal",
                  },
                ]}
              />
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-download' />}
              >
                Export PDF
              </Button>
              <Button
                variant='secondary'
                size='sm'
                leftIcon={<i className='fa-solid fa-print' />}
              >
                Cetak
              </Button>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          <StatCard
            label='Total Pemasukan'
            value={formatRupiah(totalIncome)}
            icon={<i className='fa-solid fa-arrow-trend-up' />}
            color='success'
          />
          <StatCard
            label='Total Pengeluaran'
            value={formatRupiah(totalExpense)}
            icon={<i className='fa-solid fa-arrow-trend-down' />}
            color='danger'
          />
          <StatCard
            label='Laba Bersih'
            value={formatRupiah(netProfit)}
            icon={<i className='fa-solid fa-scale-balanced' />}
            color={netProfit >= 0 ? "primary" : "danger"}
          />
          <StatCard
            label='Margin Laba'
            value={`${profitMargin}%`}
            icon={<i className='fa-solid fa-percent' />}
            color={
              profitMargin >= 20
                ? "success"
                : profitMargin >= 0
                  ? "warning"
                  : "danger"
            }
          />
        </div>

        {view === "ringkasan" ? (
          <>
            {/* P&L summary card */}
            <Card padding='md'>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: 2,
                  }}
                >
                  Laporan Laba Rugi
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  Ringkasan periode Januari 2025
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* income row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--color-success)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Total Pemasukan
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-success)",
                    }}
                  >
                    {formatRupiah(totalIncome)}
                  </span>
                </div>
                {/* expense row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "2px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--color-danger)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Total Pengeluaran
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-danger)",
                    }}
                  >
                    ({formatRupiah(totalExpense)})
                  </span>
                </div>
                {/* net */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Laba Bersih
                    </span>
                    <Badge
                      variant={netProfit >= 0 ? "success" : "danger"}
                      size='sm'
                    >
                      {profitMargin}%
                    </Badge>
                  </div>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color:
                        netProfit >= 0
                          ? "var(--color-primary)"
                          : "var(--color-danger)",
                    }}
                  >
                    {netProfit < 0 && "-"}
                    {formatRupiah(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </Card>

            {/* chart + breakdowns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14,
              }}
            >
              {/* chart */}
              <Card padding='md' style={{ gridColumn: "1 / -1" }}>
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        Tren Harian
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        15 Jan – 22 Jan 2025
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: "var(--color-success)",
                            opacity: 0.85,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Pemasukan
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: "var(--color-danger)",
                            opacity: 0.85,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Pengeluaran
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <MiniBarChart daily={daily} maxVal={maxDaily} />
                {/* axis labels */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                  >
                    Maks: {formatRupiahShort(maxDaily)}
                  </span>
                  <span
                    style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                  >
                    Total: {formatRupiahShort(totalIncome)} masuk ·{" "}
                    {formatRupiahShort(totalExpense)} keluar
                  </span>
                </div>
              </Card>

              {/* income breakdown */}
              <Card padding='md'>
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: 2,
                    }}
                  >
                    Sumber Pemasukan
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                  >
                    Breakdown per kategori
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {incomeBreakdown.map((c) => (
                    <BreakdownBar
                      key={c.cat}
                      label={c.label}
                      amount={c.amount}
                      total={totalIncome}
                      variant='success'
                    />
                  ))}
                </div>
              </Card>

              {/* expense breakdown */}
              <Card padding='md'>
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: 2,
                    }}
                  >
                    Pos Pengeluaran
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                  >
                    Breakdown per kategori
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {expenseBreakdown.map((c) => (
                    <BreakdownBar
                      key={c.cat}
                      label={c.label}
                      amount={c.amount}
                      total={totalExpense}
                      variant='danger'
                    />
                  ))}
                </div>
              </Card>

              {/* daily best/worst */}
              <Card padding='md'>
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: 2,
                    }}
                  >
                    Performa Harian
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                  >
                    Terbaik & terburuk
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {[...daily]
                    .map((d) => ({ ...d, net: d.income - d.expense }))
                    .sort((a, b) => b.net - a.net)
                    .map((d, i) => {
                      const isPositive = d.net >= 0;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                  i === 0
                                    ? "var(--color-success)"
                                    : i === daily.length - 1
                                      ? "var(--color-danger)"
                                      : "var(--color-bg-muted)",
                                color:
                                  i === 0 || i === daily.length - 1
                                    ? "white"
                                    : "var(--color-text-muted)",
                              }}
                            >
                              {i + 1}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {formatDate(d.date)}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: isPositive
                                ? "var(--color-success)"
                                : "var(--color-danger)",
                            }}
                          >
                            {isPositive ? "+" : ""}
                            {formatRupiahShort(d.net)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </div>
          </>
        ) : (
          /* ── JURNAL VIEW ──────────────────────────────────────── */
          <Card padding='none'>
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "2px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  Buku Jurnal Harian
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {INCOME_DATA.length + EXPENSE_DATA.length} entri · Januari
                  2025
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                  >
                    Total Masuk
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-success)",
                    }}
                  >
                    {formatRupiah(totalIncome)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                  >
                    Total Keluar
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-danger)",
                    }}
                  >
                    {formatRupiah(totalExpense)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                  >
                    Laba Bersih
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatRupiah(netProfit)}
                  </div>
                </div>
              </div>
            </div>
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
                      borderBottom: "1px solid var(--color-border)",
                      background: "var(--color-bg-subtle)",
                    }}
                  >
                    {[
                      "Ref",
                      "Keterangan",
                      "Tipe",
                      "Debit (Masuk)",
                      "Kredit (Keluar)",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "9px 14px",
                          textAlign:
                            i >= 3 ? "right" : i === 2 ? "center" : "left",
                          fontSize: 10,
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
                  {journalByDate.map(([date, entries]) => {
                    const incomeTotal = entries
                      .filter((e) => e.type === "income")
                      .reduce((s, e) => s + e.amount, 0);
                    const expenseTotal = entries
                      .filter((e) => e.type === "expense")
                      .reduce((s, e) => s + e.amount, 0);
                    return (
                      <JournalRow
                        key={date}
                        date={date}
                        entries={entries}
                        incomeTotal={incomeTotal}
                        expenseTotal={expenseTotal}
                      />
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "var(--color-bg-subtle)",
                      borderTop: "3px solid var(--color-border)",
                    }}
                  >
                    <td colSpan={2} style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        TOTAL PERIODE
                      </span>
                    </td>
                    <td />
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "var(--color-success)",
                      }}
                    >
                      {formatRupiah(totalIncome)}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "var(--color-danger)",
                      }}
                    >
                      {formatRupiah(totalExpense)}
                    </td>
                  </tr>
                  <tr style={{ background: "var(--color-bg-subtle)" }}>
                    <td colSpan={3} style={{ padding: "8px 14px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Laba Bersih (Debit – Kredit)
                      </span>
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        padding: "8px 14px",
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 800,
                        color:
                          netProfit >= 0
                            ? "var(--color-primary)"
                            : "var(--color-danger)",
                      }}
                    >
                      {netProfit < 0 && "-"}
                      {formatRupiah(Math.abs(netProfit))}
                      <Badge
                        variant={netProfit >= 0 ? "success" : "danger"}
                        size='sm'
                        style={{ marginLeft: 8 }}
                      >
                        {profitMargin}%
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
