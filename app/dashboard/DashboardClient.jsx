// app/dashboard/DashboardClient.jsx
"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/data/Card";
import StatCard from "@/components/ui/data/StatCard";
import Badge from "@/components/ui/data/Badge";
import Breadcrumb from "@/components/ui/navigation/Breadcrumb";
import ProgressBar from "@/components/ui/feedback/ProgressBar";

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ORDER_STATUS_CFG = {
  pending: { label: "Menunggu", variant: "warning", icon: "fa-clock" },
  confirmed: {
    label: "Dikonfirmasi",
    variant: "primary",
    icon: "fa-circle-check",
  },
  done: { label: "Selesai", variant: "success", icon: "fa-bag-shopping" },
  cancelled: { label: "Dibatalkan", variant: "danger", icon: "fa-xmark" },
};

const PAYMENT_STATUS_CFG = {
  paid: { label: "Lunas", variant: "success" },
  unpaid: { label: "Belum Bayar", variant: "danger" },
  partial: { label: "Sebagian", variant: "warning" },
};

const GROUP_CFG = {
  vip: { label: "VIP", variant: "warning" },
  reseller: { label: "Reseller", variant: "primary" },
  member: { label: "Member", variant: "success" },
  reguler: { label: "Reguler", variant: "secondary" },
};

const AVATAR_COLORS = [
  "#E91E8C",
  "#9C27B0",
  "#2196F3",
  "#4CAF50",
  "#FF9800",
  "#F44336",
  "#00BCD4",
  "#607D8B",
];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// ─── SECTION HEADER ───────────────────────────────────────────────
function SectionHeader({ icon, title, action }) {
  return (
    <div
      style={{
        padding: "14px 18px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          margin: 0,
        }}
      >
        <i
          className={`fa-solid ${icon}`}
          style={{ marginRight: 8, color: "var(--color-primary)" }}
        />
        {title}
      </h2>
      {action}
    </div>
  );
}

// ─── MAIN CLIENT ──────────────────────────────────────────────────
export default function DashboardClient({ user, data }) {
  const router = useRouter();
  const {
    stats,
    recentOrders,
    topStyles,
    ordersByStatus,
    revenueByMonth,
    pendingCount,
    customerStats,
    topCustomers,
    allTime,
  } = data;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, []);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // build status map from DB data
  const statusMap = useMemo(() => {
    const m = {};
    (ordersByStatus || []).forEach((s) => {
      m[s.status] = s;
    });
    return m;
  }, [ordersByStatus]);

  // revenue chart max for bar scaling
  const maxRevenue = useMemo(
    () => Math.max(...(revenueByMonth || []).map((m) => Number(m.revenue)), 1),
    [revenueByMonth],
  );

  const margin = Number(allTime.total_margin || 0);
  const revenue = Number(allTime.total_revenue || 0);
  const marginPct = revenue > 0 ? Math.round((margin / revenue) * 100) : 0;

  return (
    <DashboardLayout activeKey='home' user={user}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ── Header ── */}
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", icon: <i className='fa-solid fa-house' /> },
            ]}
          />
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 8,
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
                {greeting}, {user?.name ?? "Admin"} 👋
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {today}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => router.push("/dashboard/orders")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <i className='fa-solid fa-plus' /> Buat Pesanan
              </button>
            </div>
          </div>
        </div>

        {/* ── Today Stat Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          <StatCard
            label='Pendapatan Hari Ini'
            value={formatRupiah(stats.done_revenue ?? 0)}
            icon={<i className='fa-solid fa-sack-dollar' />}
            color='primary'
            footer={
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                {stats.done_count ?? 0} pesanan selesai
              </span>
            }
          />
          <StatCard
            label='Total Pesanan Hari Ini'
            value={stats.total_orders ?? 0}
            icon={<i className='fa-solid fa-receipt' />}
            color='success'
            footer={
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                {stats.pending_count ?? 0} menunggu konfirmasi
              </span>
            }
          />
          <StatCard
            label='Margin Hari Ini'
            value={formatRupiah(stats.total_margin ?? 0)}
            icon={<i className='fa-solid fa-chart-line' />}
            color='warning'
            footer={
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                dari pesanan selesai
              </span>
            }
          />
          <StatCard
            label='Pesanan Pending'
            value={pendingCount}
            icon={<i className='fa-solid fa-clock' />}
            color='danger'
            footer={
              pendingCount > 0 ? (
                <button
                  type='button'
                  onClick={() => router.push("/dashboard/orders")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-danger)",
                    fontSize: 11,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Lihat pesanan →
                </button>
              ) : (
                <span
                  style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                >
                  Semua beres 🎉
                </span>
              )
            }
          />
        </div>

        {/* ── All-time summary strip ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {[
            {
              label: "Total Pendapatan",
              value: formatRupiah(allTime.total_revenue ?? 0),
              icon: "fa-wallet",
              color: "var(--color-primary)",
            },
            {
              label: "Total Biaya Produksi",
              value: formatRupiah(allTime.total_cost ?? 0),
              icon: "fa-scissors",
              color: "var(--color-warning)",
            },
            {
              label: "Total Margin",
              value: formatRupiah(allTime.total_margin ?? 0),
              icon: "fa-arrow-trend-up",
              color:
                margin >= 0 ? "var(--color-success)" : "var(--color-danger)",
            },
            {
              label: "Margin %",
              value: `${marginPct}%`,
              icon: "fa-percent",
              color:
                marginPct >= 30
                  ? "var(--color-success)"
                  : "var(--color-warning)",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`fa-solid ${item.icon}`}
                  style={{ color: item.color, fontSize: 16 }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginBottom: 3,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: item.color }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Middle Row: Recent Orders + Customer Stats ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}
        >
          {/* Recent Orders */}
          <Card padding='none'>
            <SectionHeader
              icon='fa-clock-rotate-left'
              title='Pesanan Terbaru'
              action={
                <button
                  type='button'
                  onClick={() => router.push("/dashboard/orders")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-primary)",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Lihat semua →
                </button>
              }
            />
            {recentOrders.length === 0 ? (
              <div
                style={{
                  padding: "32px 18px",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: 13,
                }}
              >
                <i
                  className='fa-solid fa-receipt'
                  style={{ fontSize: 24, marginBottom: 8, display: "block" }}
                />
                Belum ada pesanan
              </div>
            ) : (
              recentOrders.map((order, i) => {
                const statusCfg = ORDER_STATUS_CFG[order.status] ?? {
                  label: order.status,
                  variant: "secondary",
                  icon: "fa-circle",
                };
                const payCfg = PAYMENT_STATUS_CFG[order.payment_status] ?? {
                  label: order.payment_status,
                  variant: "secondary",
                };
                return (
                  <div
                    key={order.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 18px",
                      borderBottom:
                        i < recentOrders.length - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                      cursor: "pointer",
                    }}
                    onClick={() => router.push("/dashboard/orders")}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-bg-subtle)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: getAvatarColor(order.id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(order.customer_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {order.customer_name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {order.code} · {formatDateTime(order.created_at)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--color-primary)",
                        }}
                      >
                        {formatRupiah(order.final_total)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          justifyContent: "flex-end",
                          marginTop: 3,
                        }}
                      >
                        <Badge variant={statusCfg.variant} size='sm' dot>
                          {statusCfg.label}
                        </Badge>
                        <Badge variant={payCfg.variant} size='sm'>
                          {payCfg.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </Card>

          {/* Customer Stats */}
          <Card padding='none'>
            <SectionHeader
              icon='fa-users'
              title='Pelanggan'
              action={
                <button
                  type='button'
                  onClick={() => router.push("/dashboard/customers")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-primary)",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Lihat semua →
                </button>
              }
            />

            {/* summary row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {[
                {
                  label: "Total",
                  value: customerStats.total ?? 0,
                  icon: "fa-users",
                  color: "var(--color-primary)",
                },
                {
                  label: "Aktif",
                  value: customerStats.active ?? 0,
                  icon: "fa-circle-check",
                  color: "var(--color-success)",
                },
                {
                  label: "VIP",
                  value: customerStats.vip ?? 0,
                  icon: "fa-crown",
                  color: "var(--color-warning)",
                },
                {
                  label: "Reseller",
                  value: customerStats.reseller ?? 0,
                  icon: "fa-store",
                  color: "var(--color-danger)",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    borderRight:
                      i % 2 === 0 ? "1px solid var(--color-border)" : "none",
                    borderBottom:
                      i < 2 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <i
                    className={`fa-solid ${s.icon}`}
                    style={{
                      color: s.color,
                      fontSize: 14,
                      marginBottom: 4,
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* top customers */}
            <div style={{ padding: "10px 0" }}>
              <div
                style={{
                  padding: "6px 16px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  color: "var(--color-text-muted)",
                }}
              >
                Pelanggan Teratas
              </div>
              {topCustomers.slice(0, 4).map((c, i) => {
                const grpCfg = GROUP_CFG[c.group_type] ?? {
                  label: c.group_type,
                  variant: "secondary",
                };
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 16px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: getAvatarColor(c.id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(c.name)}
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
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {formatRupiah(c.total_spent)}
                      </div>
                    </div>
                    <Badge variant={grpCfg.variant} size='sm'>
                      {grpCfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Bottom Row: Revenue Chart + Top Styles + Order Status ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}
        >
          {/* Revenue Chart (last 6 months) */}
          <Card padding='none'>
            <SectionHeader
              icon='fa-chart-bar'
              title='Pendapatan 6 Bulan Terakhir'
            />
            {revenueByMonth.length === 0 ? (
              <div
                style={{
                  padding: "32px 18px",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: 13,
                }}
              >
                <i
                  className='fa-solid fa-chart-bar'
                  style={{ fontSize: 24, marginBottom: 8, display: "block" }}
                />
                Belum ada data
              </div>
            ) : (
              <div style={{ padding: "20px 18px" }}>
                {/* bar chart */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 10,
                    height: 140,
                    marginBottom: 10,
                  }}
                >
                  {revenueByMonth.map((m, i) => {
                    const pct = (Number(m.revenue) / maxRevenue) * 100;
                    const costPct = (Number(m.cost) / maxRevenue) * 100;
                    const [year, month] = m.month.split("-");
                    const label = new Date(
                      Number(year),
                      Number(month) - 1,
                    ).toLocaleDateString("id-ID", { month: "short" });
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          {formatRupiah(m.revenue)
                            .replace("Rp ", "")
                            .replace(/\.000$/, "k")}
                        </div>
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            height: 110,
                            gap: 2,
                            position: "relative",
                          }}
                        >
                          {/* revenue bar */}
                          <div
                            style={{
                              width: "100%",
                              height: `${pct}%`,
                              minHeight: 4,
                              background: "var(--color-primary)",
                              borderRadius:
                                "var(--radius-sm) var(--radius-sm) 0 0",
                              opacity: 0.85,
                              transition: "height .3s",
                            }}
                            title={`Revenue: ${formatRupiah(m.revenue)}`}
                          />
                          {/* cost overlay */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: `${costPct}%`,
                              minHeight: costPct > 0 ? 4 : 0,
                              background: "var(--color-warning)",
                              borderRadius:
                                "var(--radius-sm) var(--radius-sm) 0 0",
                              opacity: 0.6,
                            }}
                            title={`Cost: ${formatRupiah(m.cost)}`}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* legend */}
                <div
                  style={{ display: "flex", gap: 16, justifyContent: "center" }}
                >
                  {[
                    { color: "var(--color-primary)", label: "Invoice" },
                    { color: "var(--color-warning)", label: "Biaya Produksi" },
                  ].map((l) => (
                    <div
                      key={l.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: l.color,
                        }}
                      />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Right column: Top Styles + Order Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Top Styles */}
            <Card padding='none'>
              <SectionHeader icon='fa-shirt' title='Gaya Terlaris' />
              {topStyles.length === 0 ? (
                <div
                  style={{
                    padding: "20px 18px",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    fontSize: 13,
                  }}
                >
                  Belum ada data
                </div>
              ) : (
                <div style={{ padding: "10px 0" }}>
                  {topStyles.map((s, i) => {
                    const maxQty = topStyles[0]?.total_qty || 1;
                    const pct = Math.round((s.total_qty / maxQty) * 100);
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "8px 16px",
                          borderTop:
                            i > 0 ? "1px solid var(--color-border)" : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 4,
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
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background:
                                  i < 3
                                    ? "var(--color-primary)"
                                    : "var(--color-bg-subtle)",
                                color:
                                  i < 3 ? "white" : "var(--color-text-muted)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {i + 1}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--color-text-primary)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 130,
                              }}
                            >
                              {s.style_name}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                              flexShrink: 0,
                            }}
                          >
                            {s.total_qty} pcs
                          </span>
                        </div>
                        <ProgressBar value={pct} size='xs' variant='primary' />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Order Status Breakdown */}
            <Card padding='none'>
              <SectionHeader icon='fa-chart-pie' title='Status Pesanan' />
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {Object.entries(ORDER_STATUS_CFG).map(([key, cfg]) => {
                  const row = statusMap[key];
                  const count = row?.count ?? 0;
                  const totalOrders =
                    Object.values(statusMap).reduce(
                      (s, r) => s + Number(r.count || 0),
                      0,
                    ) || 1;
                  const pct = Math.round((count / totalOrders) * 100);
                  return (
                    <div key={key}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <i
                            className={`fa-solid ${cfg.icon}`}
                            style={{
                              fontSize: 11,
                              color: `var(--color-${cfg.variant === "primary" ? "primary" : cfg.variant})`,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {count}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        value={pct}
                        size='xs'
                        variant={cfg.variant}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
