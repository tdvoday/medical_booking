import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../services/api";

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
};

const PIE_COLORS = ["#f59e0b", "#10b981", "#ef4444", "#6366f1"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/admin/appointments")])
      .then(([statsRes, aptsRes]) => {
        setStats(statsRes.data);

        // Tạo dữ liệu biểu đồ 7 ngày gần nhất
        const apts = aptsRes.data.appointments;
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
          const dayApts = apts.filter((a) => {
            const aDate = new Date(a.date);
            return aDate.toDateString() === d.toDateString();
          });
          last7.push({
            date: dateStr,
            total: dayApts.length,
            confirmed: dayApts.filter((a) => a.status === "confirmed").length,
            done: dayApts.filter((a) => a.status === "done").length,
            cancelled: dayApts.filter((a) => a.status === "cancelled").length,
          });
        }
        setWeekly(last7);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
        Đang tải...
      </div>
    );

  // Dữ liệu cho Pie chart
  const pieData =
    stats?.statusStats?.map((s) => ({
      name: STATUS_CONFIG[s._id]?.label || s._id,
      value: s.count,
    })) || [];

  return (
    <div>
      <h2 style={styles.pageTitle}>📊 Tổng quan</h2>

      {/* Thống kê tổng */}
      <div style={styles.statsGrid}>
        {[
          {
            label: "Bệnh nhân",
            value: stats?.totalUsers,
            icon: "👥",
            color: "#1a73e8",
          },
          {
            label: "Bác sĩ",
            value: stats?.totalDoctors,
            icon: "👨‍⚕️",
            color: "#10b981",
          },
          {
            label: "Tổng lịch",
            value: stats?.totalAppointments,
            icon: "📅",
            color: "#f59e0b",
          },
        ].map((item) => (
          <div key={item.label} style={styles.statCard}>
            <div style={{ fontSize: "36px" }}>{item.icon}</div>
            <div style={{ ...styles.statValue, color: item.color }}>
              {item.value}
            </div>
            <div style={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* 2 biểu đồ cạnh nhau */}
      <div style={styles.chartsRow}>
        {/* Bar chart — lịch khám 7 ngày */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Lịch khám 7 ngày gần nhất</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={weekly}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total"
                name="Tổng"
                fill="#1a73e8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="confirmed"
                name="Đã xác nhận"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="done"
                name="Hoàn thành"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cancelled"
                name="Đã hủy"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — tỉ lệ trạng thái */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🥧 Tỉ lệ trạng thái lịch khám</h3>
          {pieData.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: "#aaa" }}
            >
              Chưa có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top bác sĩ */}
      {stats?.topDoctors?.length > 0 && (
        <>
          <h3 style={styles.sectionTitle}>🏆 Top bác sĩ được đặt nhiều nhất</h3>
          <div style={styles.tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["#", "Tên bác sĩ", "Chuyên khoa", "Số lịch đặt"].map(
                    (h) => (
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {stats.topDoctors.map((d, i) => (
                  <tr key={d._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.rank,
                          backgroundColor:
                            i < 3
                              ? ["#ffd700", "#c0c0c0", "#cd7f32"][i]
                              : "#eee",
                          color: i < 3 ? "#fff" : "#888",
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{d.name}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.specialtyBadge}>{d.specialty}</span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: "#1a73e8" }}>{d.count}</strong>{" "}
                      lịch
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#333",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  statValue: { fontSize: "36px", fontWeight: "bold", margin: "8px 0" },
  statLabel: { color: "#888", fontSize: "14px" },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  chartTitle: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "16px",
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
  },
  tableWrap: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    color: "#888",
    fontWeight: "600",
    borderBottom: "1px solid #f0f0f0",
  },
  td: { padding: "14px 16px", fontSize: "14px", color: "#333" },
  rank: {
    display: "inline-block",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    textAlign: "center",
    lineHeight: "28px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  specialtyBadge: {
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
  },
};
