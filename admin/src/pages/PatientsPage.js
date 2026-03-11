import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
};

export default function PatientsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // bệnh nhân đang xem

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/appointments");
      setAppointments(res.data.appointments);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Gộp danh sách bệnh nhân unique từ appointments
  const patients = Object.values(
    appointments.reduce((acc, apt) => {
      const p = apt.patient;
      if (!p) return acc;
      if (!acc[p._id]) {
        acc[p._id] = {
          ...p,
          totalAppointments: 0,
          lastAppointment: null,
          specialties: new Set(),
          appointments: [],
        };
      }
      acc[p._id].totalAppointments++;
      acc[p._id].specialties.add(apt.doctor?.specialty);
      acc[p._id].appointments.push(apt);
      if (
        !acc[p._id].lastAppointment ||
        new Date(apt.date) > new Date(acc[p._id].lastAppointment)
      ) {
        acc[p._id].lastAppointment = apt.date;
      }
      return acc;
    }, {}),
  );

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search),
  );

  // Lịch khám của bệnh nhân đang xem — sắp xếp mới nhất trước
  const selectedApts =
    selected?.appointments?.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    ) || [];

  return (
    <div>
      <h2 style={styles.pageTitle}>👥 Danh sách bệnh nhân</h2>

      {/* Tổng số */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Tổng: <strong>{patients.length}</strong> bệnh nhân
        </span>
      </div>

      {/* Tìm kiếm */}
      <div style={styles.searchBox}>
        <span>🔍</span>
        <input
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button style={styles.clearBtn} onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.loading}>Đang tải...</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {[
                  "#",
                  "Họ tên",
                  "Số điện thoại",
                  "Số lịch khám",
                  "Chuyên khoa đã khám",
                  "Lần khám cuối",
                ].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.empty}>
                    <div>📭</div>
                    <div>Không tìm thấy bệnh nhân</div>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p._id}
                    style={styles.tableRow}
                    onClick={() => setSelected(p)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0f7ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "")
                    }
                  >
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.patientRow}>
                        <div style={styles.avatarCircle}>
                          {p.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: "600" }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{p.phone}</td>
                    <td style={styles.td}>
                      <span style={styles.countBadge}>
                        {p.totalAppointments}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.tagList}>
                        {[...p.specialties].filter(Boolean).map((s) => (
                          <span key={s} style={styles.tag}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {p.lastAppointment
                        ? new Date(p.lastAppointment).toLocaleDateString(
                            "vi-VN",
                          )
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết bệnh nhân */}
      {selected && (
        <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalAvatar}>
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={styles.modalName}>{selected.name}</div>
                <div style={styles.modalPhone}>📱 {selected.phone}</div>
                {selected.email && (
                  <div style={styles.modalPhone}>📧 {selected.email}</div>
                )}
              </div>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            {/* Thống kê nhanh */}
            <div style={styles.quickStats}>
              {[
                {
                  label: "Tổng lịch",
                  value: selected.totalAppointments,
                  color: "#1a73e8",
                },
                {
                  label: "Hoàn thành",
                  value: selectedApts.filter((a) => a.status === "done").length,
                  color: "#6366f1",
                },
                {
                  label: "Đã hủy",
                  value: selectedApts.filter((a) => a.status === "cancelled")
                    .length,
                  color: "#ef4444",
                },
                {
                  label: "Chờ xác nhận",
                  value: selectedApts.filter((a) => a.status === "pending")
                    .length,
                  color: "#f59e0b",
                },
              ].map((s) => (
                <div key={s.label} style={styles.quickStatItem}>
                  <div style={{ ...styles.quickStatValue, color: s.color }}>
                    {s.value}
                  </div>
                  <div style={styles.quickStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Lịch sử khám */}
            <div style={styles.historyTitle}>📋 Lịch sử khám bệnh</div>
            <div style={styles.historyList}>
              {selectedApts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    padding: "20px",
                  }}
                >
                  Chưa có lịch khám nào
                </div>
              ) : (
                selectedApts.map((apt) => {
                  const status = STATUS_CONFIG[apt.status];
                  return (
                    <div key={apt._id} style={styles.historyItem}>
                      <div style={styles.historyLeft}>
                        <div style={styles.historyDoctor}>
                          {apt.doctor?.name}
                        </div>
                        <div style={styles.historySpecialty}>
                          {apt.doctor?.specialty}
                        </div>
                        <div style={styles.historyDate}>
                          📅 {new Date(apt.date).toLocaleDateString("vi-VN")} —
                          ⏰ {apt.timeSlot}
                        </div>
                        {apt.symptoms && (
                          <div style={styles.historySymptoms}>
                            🩺 {apt.symptoms}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: status?.bg,
                          color: status?.color,
                        }}
                      >
                        {status?.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Nút đóng */}
            <button
              style={styles.modalCloseBtn}
              onClick={() => setSelected(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  },
  summary: { marginBottom: "16px" },
  summaryText: { color: "#888", fontSize: "14px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: "14px" },
  clearBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#aaa",
    fontSize: "14px",
  },
  loading: { textAlign: "center", padding: "60px", color: "#888" },
  tableWrap: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    color: "#888",
    fontWeight: "600",
    borderBottom: "1px solid #f0f0f0",
  },
  tableRow: {
    borderBottom: "1px solid #f9f9f9",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  td: { padding: "14px 16px", fontSize: "14px", color: "#333" },
  patientRow: { display: "flex", alignItems: "center", gap: "10px" },
  avatarCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "16px",
    flexShrink: 0,
  },
  countBadge: {
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    padding: "3px 12px",
    borderRadius: "12px",
    fontWeight: "bold",
  },
  tagList: { display: "flex", flexWrap: "wrap", gap: "4px" },
  tag: {
    backgroundColor: "#f0fdf4",
    color: "#10b981",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  empty: {
    textAlign: "center",
    padding: "60px",
    color: "#aaa",
    lineHeight: "2",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    width: "560px",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    backgroundColor: "#1a73e8",
    borderRadius: "16px 16px 0 0",
    position: "relative",
  },
  modalAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    color: "#1a73e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "bold",
    flexShrink: 0,
  },
  modalName: { color: "#fff", fontSize: "20px", fontWeight: "bold" },
  modalPhone: {
    color: "rgba(255,255,255,0.85)",
    fontSize: "13px",
    marginTop: "4px",
  },
  closeBtn: {
    position: "absolute",
    right: "16px",
    top: "16px",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "#fff",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  quickStats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px",
    backgroundColor: "#f0f0f0",
    borderBottom: "1px solid #f0f0f0",
  },
  quickStatItem: {
    backgroundColor: "#fff",
    padding: "16px",
    textAlign: "center",
  },
  quickStatValue: { fontSize: "24px", fontWeight: "bold" },
  quickStatLabel: { color: "#888", fontSize: "12px", marginTop: "4px" },
  historyTitle: {
    padding: "16px 24px 8px",
    fontWeight: "bold",
    fontSize: "15px",
    color: "#333",
  },
  historyList: { padding: "0 24px", maxHeight: "300px", overflowY: "auto" },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "14px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  historyLeft: { flex: 1 },
  historyDoctor: { fontWeight: "600", color: "#333", fontSize: "14px" },
  historySpecialty: { color: "#1a73e8", fontSize: "12px", marginTop: "2px" },
  historyDate: { color: "#888", fontSize: "12px", marginTop: "4px" },
  historySymptoms: {
    color: "#555",
    fontSize: "12px",
    marginTop: "4px",
    fontStyle: "italic",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
    marginLeft: "12px",
  },
  modalCloseBtn: {
    display: "block",
    width: "calc(100% - 48px)",
    margin: "16px 24px 24px",
    padding: "12px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },
};
