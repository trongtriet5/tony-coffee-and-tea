"use client";
import { useState, useEffect } from "react";
import { getDashboardStats, getBranches } from "@/lib/api";
import type { DashboardStats } from "@/types";
import {
  HiCalendar, HiDownload, HiCurrencyDollar,
  HiShoppingCart, HiTicket, HiTrendingUp, HiStar,
  HiChevronDown
} from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { format, subDays, subMonths } from "date-fns";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ChartDataLabels
);

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatK = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n;
};

export default function DashboardPage() {
  const currentUser = useCurrentUser();
  const { error: toastError } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filtering states
  const [range, setRange] = useState("7d");
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Fetch branches for admin if user is loaded
    if (currentUser?.role === 'ADMIN') {
      getBranches().then(setBranches);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const bId = currentUser.role === 'ADMIN' ? (selectedBranchId || undefined) : currentUser.branch_id;
      const d = await getDashboardStats({ startDate, endDate, branch_id: bId });
      setStats(d);
    } catch (err) {
      console.error(err);
      toastError("Lỗi khi tải báo cáo thống kê");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [startDate, endDate, currentUser, selectedBranchId]);

  const handleRangeSelect = (r: string) => {
    setRange(r);
    setShowRangeDropdown(false);
    const now = new Date();
    let start = now;

    if (r === "7d") start = subDays(now, 7);
    else if (r === "1m") start = subMonths(now, 1);
    else if (r === "3m") start = subMonths(now, 3);
    else if (r === "6m") start = subMonths(now, 6);
    else if (r === "12m") start = subMonths(now, 12);

    if (r !== 'custom') {
      setStartDate(format(start, "yyyy-MM-dd"));
      setEndDate(format(now, "yyyy-MM-dd"));
    }
  };

  const rangeLabels: Record<string, string> = {
    "7d": "7 ngày gần nhất",
    "1m": "1 tháng gần nhất",
    "3m": "3 tháng gần nhất",
    "6m": "6 tháng gần nhất",
    "12m": "12 tháng gần nhất",
    "custom": "Tùy chỉnh khoảng ngày"
  };

  // No early return for loading to allow skeleton UI

  const maxRevenue = Math.max(...(stats?.revenue_by_day.map(d => d.revenue) || [1000000]), 1000000) * 1.2;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "32px 24px" : "40px 40px 60px 120px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900 }}>Báo cáo bán hàng</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 700 }}>Phân tích tài chính Tony Coffee & Tea</p>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {currentUser?.role === 'ADMIN' && (
              <div style={{ position: "relative" }}>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  style={{ padding: "12px 24px", paddingRight: 40, borderRadius: 14, background: "white", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 15, fontWeight: 800, cursor: "pointer", outline: "none", appearance: "none", minWidth: 240 }}
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <HiChevronDown size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
              </div>
            )}

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 14, background: "white", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 15, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", width: "fit-content" }}
              >
                <HiCalendar size={18} /> {rangeLabels[range].toUpperCase()} <HiChevronDown size={16} />
              </button>

              {showRangeDropdown && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, background: "white", borderRadius: 20, border: "1px solid var(--border)", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", zIndex: 2000, width: 240, overflow: "hidden" }}>
                  {Object.entries(rangeLabels).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => handleRangeSelect(k)}
                      style={{ width: "100%", textAlign: "left", padding: "14px 20px", background: range === k ? "var(--bg-primary)" : "white", border: "none", color: range === k ? "var(--accent)" : "var(--text-primary)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {range === 'custom' && (
          <div style={{ display: "flex", gap: 16, marginBottom: 32, background: "white", padding: 24, borderRadius: 24, border: "1px solid var(--border)", width: "fit-content" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)" }}>TỪ NGÀY</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 14, fontWeight: 700, outline: "none" }} />
              <label style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)" }}>ĐẾN NGÀY</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 14, fontWeight: 700, outline: "none" }} />
            </div>
          </div>
        )}

        {/* METRIC CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 24, marginBottom: 40 }}>
          {loading && !stats ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 24 }} />
            ))
          ) : (
            [
              {
                label: "DOANH THU (GROSS SALE)",
                value: formatVND(stats?.total_revenue || 0),
                icon: HiCurrencyDollar,
                color: "var(--accent)",
                trend: stats?.comparison?.revenue_change_percent
              },
              {
                label: "ĐƠN HÀNG (ORDER)",
                value: stats?.total_orders || 0,
                icon: HiShoppingCart,
                color: "var(--accent)",
                trend: stats?.comparison?.orders_change_percent
              },
              { label: "CHIẾT KHẤU (DISCOUNT)", value: formatVND(stats?.total_discount || 0), icon: HiTicket, color: "var(--danger)" },
              { label: "DOANH THU NET (NET SALE)", value: formatVND(stats?.total_net_revenue || 0), icon: HiTrendingUp, color: "var(--success)", trend: stats?.comparison?.revenue_change_percent },
            ].map((c, i) => (
              <div key={i} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, padding: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }} className="animate-fade-in">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <c.icon size={22} color={c.color || "var(--accent)"} />
                  </div>
                  {c.trend !== undefined && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: c.trend >= 0 ? "var(--success)" : "var(--danger)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        {c.trend >= 0 ? "+" : ""}{c.trend.toFixed(1)}%
                        <HiTrendingUp style={{ transform: c.trend >= 0 ? "none" : "rotate(90deg)" }} />
                      </div>
                      {stats?.comparison?.period_start && (
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
                          So với {stats.comparison.period_start} – {stats.comparison.period_end}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 800, letterSpacing: "1px", marginBottom: 6 }}>{c.label}</p>
                <p style={{ fontSize: 28, fontWeight: 900 }}>{c.value}</p>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 400px", gap: 32 }}>
          {/* REVENUE FLOW CHART */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 32, padding: "48px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Doanh thu theo ngày</h3>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", fontWeight: 700 }}>Biến động doanh thu trong giai đoạn chọn</p>
              </div>
              {loading && <AiOutlineLoading3Quarters className="spin" color="var(--accent)" />}
            </div>

            <div style={{ position: "relative", height: 380, width: "100%" }}>
              {loading && !stats ? (
                <div className="skeleton" style={{ height: "100%", width: "100%", borderRadius: 16 }} />
              ) : (stats && (
                <Line
                  data={{
                    labels: stats.revenue_by_day.map(d => format(new Date(d.date), "dd/MM/yyyy")),
                    datasets: [{
                      fill: true,
                      label: 'Doanh thu',
                      data: stats.revenue_by_day.map(d => d.revenue),
                      borderColor: '#346739',
                      backgroundColor: 'rgba(52, 103, 57, 0.25)',
                      borderWidth: 3,
                      pointRadius: isMobile ? 0 : 4,
                      pointBackgroundColor: '#fff',
                      pointBorderColor: '#346739',
                      pointHoverRadius: 6,
                      tension: 0.4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { left: 40, right: 20, top: 40, bottom: 0 } },
                    plugins: {
                      legend: { display: false },
                      datalabels: {
                        color: '#346739',
                        anchor: 'end',
                        align: 'top',
                        offset: 8,
                        font: { weight: 900, size: 11 },
                        formatter: (v: any) => v > 0 ? formatK(v) : '',
                        display: stats.revenue_by_day.length <= 20
                      },
                      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, callbacks: { label: (c: any) => formatVND(c.raw as number) } }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        suggestedMax: maxRevenue,
                        border: { display: false },
                        grid: { color: 'rgba(0, 0, 0, 0.04)' },
                        ticks: { callback: (v: any) => formatK(v as number), font: { family: 'inherit', size: 12, weight: 800 }, color: 'var(--text-muted)', padding: 10 }
                      },
                      x: {
                        border: { display: false },
                        grid: { display: false },
                        ticks: {
                          maxTicksLimit: stats.revenue_by_day.length > 60 ? 12 : stats.revenue_by_day.length > 30 ? 15 : stats.revenue_by_day.length > 14 ? 20 : undefined,
                          font: { family: 'inherit', size: 11, weight: 800 },
                          color: 'var(--text-muted)',
                          maxRotation: stats.revenue_by_day.length > 30 ? 45 : 0
                        }
                      }
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* TOP PRODUCTS CHART */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 32, padding: "40px" }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <HiStar color="var(--accent)" /> Sản phẩm bán chạy
            </h3>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 32 }}>Top sản phẩm bán chạy nhất giai đoạn này</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
              {loading && !stats ? (
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton" style={{ height: 40, width: "100%", borderRadius: 12 }} />
                ))
              ) : (stats && stats.top_products.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }} className="animate-fade-in">
                  <div style={{ minWidth: 90, maxWidth: 120, fontSize: 13, fontWeight: 800, color: "var(--text-primary)", textAlign: "right", lineHeight: 1.2, flexShrink: 0 }}>
                    {p.name}
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        height: 38,
                        width: `${Math.max((p.count / Math.max(...stats.top_products.map(x => x.count), 1)) * 100, 15)}%`,
                        background: "var(--gold-gradient)",
                        borderRadius: 12,
                        boxShadow: "0 4px 12px rgba(225, 194, 51, 0.2)",
                        transition: "width 1s ease-out"
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 900, color: "var(--accent)", whiteSpace: "nowrap" }}>
                      {p.count} món
                    </span>
                  </div>
                </div>
              )))}
              {!loading && (!stats || stats.top_products.length === 0) && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontWeight: 700 }}>Chưa có dữ liệu bán hàng</div>
              )}
            </div>
          </div>
        </div>

        {/* TRANSACTION COUNT ANALYZE (HOURLY) */}
        <div style={{ marginTop: 32, background: "white", border: "1px solid var(--border)", borderRadius: 32, padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Sản phẩm bán ra</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700 }}>Tổng hợp lưu lượng bán ra (sản phẩm và topping) theo khung giờ</p>
            </div>
            {/* Custom HTML Legend */}
            {stats && (
              <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
                {stats.transaction_count_by_hour.some(h => h.products > 0) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#346739", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>Sản phẩm</span>
                  </div>
                )}
                {stats.transaction_count_by_hour.some(h => h.toppings > 0) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#9CA3AF", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>Topping</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ height: 320, width: "100%" }}>
            {loading && !stats ? (
              <div className="skeleton" style={{ height: "100%", width: "100%", borderRadius: 16 }} />
            ) : stats && (
              <Bar
                data={({
                  labels: stats.transaction_count_by_hour.map((h: any) => h.hour),
                  datasets: [
                    {
                      type: 'line',
                      label: 'Sản phẩm',
                      data: stats.transaction_count_by_hour.map((h: any) => h.products),
                      borderColor: '#346739',
                      backgroundColor: 'rgba(52, 103, 57, 0.25)',
                      fill: true,
                      borderWidth: 2,
                      pointRadius: 5,
                      pointBackgroundColor: '#346739',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      tension: 0.5,
                      order: 0,
                    },
                    {
                      type: 'bar',
                      label: 'Sản phẩm',
                      data: stats.transaction_count_by_hour.map((h: any) => h.products),
                      backgroundColor: '#346739',
                      borderRadius: 6,
                      barPercentage: 0.6,
                      categoryPercentage: 0.4,
                      order: 1,
                    },
                    ...(stats.transaction_count_by_hour.some((h: any) => h.toppings > 0) ? [
                      {
                        type: 'line',
                        label: 'Topping',
                        data: stats.transaction_count_by_hour.map((h: any) => h.toppings),
                        borderColor: '#9CA3AF',
                        backgroundColor: 'rgba(156, 163, 175, 0.2)',
                        fill: true,
                        borderWidth: 2,
                        pointRadius: 5,
                        pointBackgroundColor: '#9CA3AF',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        tension: 0.5,
                        order: 0,
                      },
                      {
                        type: 'bar',
                        label: 'Topping',
                        data: stats.transaction_count_by_hour.map((h: any) => h.toppings),
                        backgroundColor: '#e5e7eb',
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.4,
                        order: 1,
                      }
                    ] : []),
                  ]
                }) as any}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    y: { 
                      beginAtZero: true,
                      border: { display: false },
                      grid: { color: 'rgba(0, 0, 0, 0.04)' },
                      ticks: { font: { weight: 700, size: 11 } }
                    },
                    x: { 
                      display: true,
                      border: { display: false },
                      grid: { display: false },
                      ticks: { font: { weight: 700, size: 11 } }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        <style jsx>{`
          .spin { animation: spin 1s linear infinite; } 
          @keyframes spin { 100% { transform: rotate(360deg); } } 
          .bar:hover { filter: brightness(1.1); }
        `}</style>
      </div>
    </div>
  );
}
