import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Đang tải...</div>;

  const statusLabels = {
    pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
    confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
    cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
    done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
  };

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

      {/* Thống kê theo trạng thái */}
      <h3 style={styles.sectionTitle}>Lịch khám theo trạng thái</h3>
      <div style={styles.statsGrid}>
        {stats?.statusStats?.map((s) => {
          const config = statusLabels[s._id] || {
            label: s._id,
            color: "#888",
            bg: "#f5f5f5",
          };
          return (
            <div
              key={s._id}
              style={{ ...styles.statusCard, backgroundColor: config.bg }}
            >
              <div style={{ ...styles.statusValue, color: config.color }}>
                {s.count}
              </div>
              <div style={{ color: config.color, fontWeight: "600" }}>
                {config.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top bác sĩ */}
      {stats?.topDoctors?.length > 0 && (
        <>
          <h3 style={styles.sectionTitle}>🏆 Top bác sĩ được đặt nhiều nhất</h3>
          <div style={styles.table}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Tên bác sĩ</th>
                  <th style={styles.th}>Chuyên khoa</th>
                  <th style={styles.th}>Số lịch</th>
                </tr>
              </thead>
              <tbody>
                {stats.topDoctors.map((d, i) => (
                  <tr key={d._id} style={styles.tableRow}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{d.name}</td>
                    <td style={styles.td}>{d.specialty}</td>
                    <td style={styles.td}>
                      <strong>{d.count}</strong>
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
  loading: { textAlign: "center", padding: "40px", color: "#888" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
  },
  statusCard: { borderRadius: "12px", padding: "20px", textAlign: "center" },
  statusValue: { fontSize: "28px", fontWeight: "bold", marginBottom: "4px" },
  table: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tableHeader: { backgroundColor: "#f8fafc" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    color: "#888",
    fontWeight: "600",
    borderBottom: "1px solid #f0f0f0",
  },
  tableRow: { borderBottom: "1px solid #f9f9f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#333" },
};
