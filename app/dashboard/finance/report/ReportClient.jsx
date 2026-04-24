"use client";
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/data/Badge";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Button from "@/components/ui/button/Button";
import ButtonGroup from "@/components/ui/button/ButtonGroup";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import ProgressBar from "@/components/ui/feedback/ProgressBar";

// ─── HELPERS ──────────────────────────────────────────────────────
const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const formatRupiahShort = (n) => {
  if (n >= 1_000_000)
    return "Rp " + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + "rb";
  return "Rp " + n;
};
const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
const formatDateFull = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const formatMonthYear = (d) =>
  new Date(d + "-01").toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

const COST_FIELDS = [
  { key: "sewing", label: "Jahit" },
  { key: "buttonhole", label: "Kancing" },
  { key: "swir", label: "Swir" },
  { key: "assembly", label: "Assembly" },
  { key: "embroidery", label: "Bordir" },
  { key: "prewash", label: "Prewash" },
];

// get all unique months from data as "YYYY-MM"
function getMonths(income, expense) {
  const set = new Set();
  [...income, ...expense].forEach((r) => {
    if (r.date) set.add((r.date ?? "").slice(0, 7));
  });
  return [...set].sort((a, b) => b.localeCompare(a));
}

// ─── MINI BAR CHART ───────────────────────────────────────────────
function MiniBarChart({ daily, maxVal }) {
  if (!daily.length) return null;
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

// ─── BREAKDOWN BAR ────────────────────────────────────────────────
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

// ─── JOURNAL ROW ─────────────────────────────────────────────────
function JournalRow({ date, entries, incomeTotal, expenseTotal }) {
  return (
    <>
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
            {formatDateFull(date)}
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
          background: "var(--color-bg-subtle)",
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
export default function ReportClient({ user, income, expense }) {
  const [view, setView] = useState("ringkasan");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // default to latest month that has data
    const all = [...income, ...expense];
    if (!all.length) return "";
    return (
      all
        .map((r) => (r.date ?? "").slice(0, 7))
        .sort((a, b) => b.localeCompare(a))[0] ?? ""
    );
  });

  const months = useMemo(() => getMonths(income, expense), [income, expense]);

  // filter by selected month
  const filteredIncome = useMemo(
    () =>
      selectedMonth
        ? income.filter((r) => (r.date ?? "").startsWith(selectedMonth))
        : income,
    [income, selectedMonth],
  );

  const filteredExpense = useMemo(
    () =>
      selectedMonth
        ? expense.filter((r) => (r.date ?? "").startsWith(selectedMonth))
        : expense,
    [expense, selectedMonth],
  );

  // totals
  const totalIncome = filteredIncome.reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalExpense = filteredExpense.reduce((s, r) => s + (r.amount ?? 0), 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin =
    totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // daily aggregation
  const daily = useMemo(() => {
    const daySet = new Set([
      ...filteredIncome.map((r) => r.date),
      ...filteredExpense.map((r) => r.date),
    ]);
    return [...daySet].sort().map((date) => ({
      date,
      income: filteredIncome
        .filter((r) => r.date === date)
        .reduce((s, r) => s + (r.amount ?? 0), 0),
      expense: filteredExpense
        .filter((r) => r.date === date)
        .reduce((s, r) => s + (r.amount ?? 0), 0),
    }));
  }, [filteredIncome, filteredExpense]);

  const maxDaily = Math.max(
    ...daily.map((d) => Math.max(d.income, d.expense)),
    1,
  );

  // income breakdown — by customer (since all income is penjualan)
  const incomeBreakdown = useMemo(() => {
    const map = {};
    filteredIncome.forEach((r) => {
      const key = r.customer_name ?? "Lainnya";
      map[key] = (map[key] ?? 0) + (r.amount ?? 0);
    });
    return Object.entries(map)
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // top 6
  }, [filteredIncome]);

  // expense breakdown — by cost type
  const expenseBreakdown = useMemo(() => {
    return COST_FIELDS.map(({ key, label }) => ({
      label,
      amount: filteredExpense.reduce(
        (s, r) => s + (r[key] ?? 0) * (r.qty ?? 1),
        0,
      ),
    }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpense]);

  // journal grouped by date
  const journalByDate = useMemo(() => {
    const incomeEntries = filteredIncome.map((r) => ({
      ref: r.ref,
      date: r.date,
      description: r.customer_name ?? "—",
      note: r.note ?? "",
      type: "income",
      amount: r.amount ?? 0,
    }));
    const expenseEntries = filteredExpense.map((r) => ({
      ref: r.ref,
      date: r.date,
      description: `${r.customer_name ?? "—"}${r.style_name ? ` · ${r.style_name}` : ""}`,
      note: r.note ?? "",
      type: "expense",
      amount: r.amount ?? 0,
    }));
    const all = [...incomeEntries, ...expenseEntries].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return a.type.localeCompare(b.type);
    });
    const grouped = {};
    all.forEach((e) => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredIncome, filteredExpense]);

  const periodLabel = selectedMonth
    ? formatMonthYear(selectedMonth)
    : "Semua Periode";

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
                Periode: {periodLabel}
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
              {/* month picker */}
              <select
                className='input-base input-default input-sm select-base'
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: 170, paddingRight: 32 }}
              >
                <option value=''>Semua Periode</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthYear(m)}
                  </option>
                ))}
              </select>
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

        {/* no data state */}
        {filteredIncome.length === 0 && filteredExpense.length === 0 ? (
          <Card padding='lg'>
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--color-text-muted)",
              }}
            >
              <i
                className='fa-solid fa-chart-pie'
                style={{ fontSize: 32, marginBottom: 12, display: "block" }}
              />
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Tidak ada data
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Belum ada transaksi untuk periode ini.
              </div>
            </div>
          </Card>
        ) : view === "ringkasan" ? (
          <>
            {/* P&L summary */}
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
                  Ringkasan {periodLabel}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
              {/* daily chart */}
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
                        {periodLabel}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      {[
                        ["var(--color-success)", "Pemasukan"],
                        ["var(--color-danger)", "Pengeluaran"],
                      ].map(([color, label]) => (
                        <div
                          key={label}
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
                              background: color,
                              opacity: 0.85,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <MiniBarChart daily={daily} maxVal={maxDaily} />
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
                    Top pelanggan
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {incomeBreakdown.length > 0 ? (
                    incomeBreakdown.map((c) => (
                      <BreakdownBar
                        key={c.label}
                        label={c.label}
                        amount={c.amount}
                        total={totalIncome}
                        variant='success'
                      />
                    ))
                  ) : (
                    <span
                      style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                    >
                      Tidak ada data
                    </span>
                  )}
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
                    Breakdown per jenis biaya
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {expenseBreakdown.length > 0 ? (
                    expenseBreakdown.map((c) => (
                      <BreakdownBar
                        key={c.label}
                        label={c.label}
                        amount={c.amount}
                        total={totalExpense}
                        variant='danger'
                      />
                    ))
                  ) : (
                    <span
                      style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                    >
                      Tidak ada data
                    </span>
                  )}
                </div>
              </Card>

              {/* daily performance */}
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
                    .map((d, i) => (
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
                            color:
                              d.net >= 0
                                ? "var(--color-success)"
                                : "var(--color-danger)",
                          }}
                        >
                          {d.net >= 0 ? "+" : ""}
                          {formatRupiahShort(d.net)}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </>
        ) : (
          /* ── JURNAL VIEW ────────────────────────────────────────── */
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
                  {filteredIncome.length + filteredExpense.length} entri ·{" "}
                  {periodLabel}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  {
                    label: "Total Masuk",
                    value: totalIncome,
                    color: "var(--color-success)",
                  },
                  {
                    label: "Total Keluar",
                    value: totalExpense,
                    color: "var(--color-danger)",
                  },
                  {
                    label: "Laba Bersih",
                    value: netProfit,
                    color: "var(--color-primary)",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "right" }}>
                    <div
                      style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color }}>
                      {formatRupiah(value)}
                    </div>
                  </div>
                ))}
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
