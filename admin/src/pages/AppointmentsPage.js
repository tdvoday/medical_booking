import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
};

const isPassed = (date, timeSlot) => {
  const appointmentDate = new Date(date);
  const [h, m] = timeSlot.split(":").map(Number);
  appointmentDate.setHours(h, m, 0, 0);
  return new Date() > appointmentDate;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus, filterDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      const res = await api.get("/admin/appointments", { params });
      setAppointments(res.data.appointments);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await api.put(`/admin/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      console.log(err);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Lọc theo tên bệnh nhân ở phía client
  const filtered = appointments.filter(
    (apt) =>
      apt.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      apt.patient?.phone?.includes(search),
  );

  return (
    <div>
      <h2 style={styles.pageTitle}>📅 Quản lý lịch khám</h2>

      {/* Tổng số */}
      <div style={styles.summary}>
        <span style={styles.summaryText}>
          Tìm thấy <strong>{filtered.length}</strong> lịch khám
        </span>
      </div>

      {/* Thanh công cụ */}
      <div style={styles.toolbar}>
        {/* Tìm kiếm */}
        <div style={styles.searchBox}>
          <span>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Tìm tên bệnh nhân, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        {/* Lọc ngày */}
        <div style={styles.datePicker}>
          <span>📅</span>
          <input
            type="date"
            style={styles.dateInput}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button style={styles.clearBtn} onClick={() => setFilterDate("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter trạng thái */}
      <div style={styles.filterBar}>
        {[
          { key: "", label: "Tất cả" },
          { key: "pending", label: "🟡 Chờ xác nhận" },
          { key: "confirmed", label: "🟢 Đã xác nhận" },
          { key: "done", label: "🟣 Hoàn thành" },
          { key: "cancelled", label: "🔴 Đã hủy" },
        ].map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.filterBtn,
              ...(filterStatus === tab.key ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilterStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bảng lịch khám */}
      {loading ? (
        <div style={styles.loading}>Đang tải...</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {[
                  "Bệnh nhân",
                  "Bác sĩ",
                  "Ngày khám",
                  "Giờ",
                  "Trạng thái",
                  "Hành động",
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
                    <div>Không có lịch khám nào</div>
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => {
                  const status = STATUS_CONFIG[apt.status];
                  const passed = isPassed(apt.date, apt.timeSlot);
                  const isLoading = updating === apt._id;

                  return (
                    <tr key={apt._id} style={styles.tableRow}>
                      {/* Bệnh nhân */}
                      <td style={styles.td}>
                        <div style={styles.patientName}>
                          {apt.patient?.name}
                        </div>
                        <div style={styles.subText}>{apt.patient?.phone}</div>
                      </td>

                      {/* Bác sĩ */}
                      <td style={styles.td}>
                        <div style={styles.doctorName}>{apt.doctor?.name}</div>
                        <div style={styles.specialty}>
                          {apt.doctor?.specialty}
                        </div>
                      </td>

                      {/* Ngày */}
                      <td style={styles.td}>{formatDate(apt.date)}</td>

                      {/* Giờ */}
                      <td style={styles.td}>
                        <strong>{apt.timeSlot}</strong>
                      </td>

                      {/* Trạng thái */}
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: status?.bg,
                            color: status?.color,
                          }}
                        >
                          {status?.label}
                        </span>
                      </td>

                      {/* Hành động */}
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          {/* Xác nhận — chỉ khi pending */}
                          {apt.status === "pending" && (
                            <button
                              style={{
                                ...styles.actionBtn,
                                backgroundColor: "#10b981",
                              }}
                              onClick={() => updateStatus(apt._id, "confirmed")}
                              disabled={isLoading}
                            >
                              ✓ Xác nhận
                            </button>
                          )}

                          {/* Hoàn thành — chỉ khi confirmed */}
                          {apt.status === "confirmed" && (
                            <button
                              style={{
                                ...styles.actionBtn,
                                backgroundColor: passed ? "#6366f1" : "#a5b4fc",
                                cursor: passed ? "pointer" : "not-allowed",
                              }}
                              onClick={() => {
                                if (!passed) {
                                  window.alert(
                                    `Chưa thể hoàn thành!\n\nLịch khám lúc ${apt.timeSlot} ngày ${new Date(apt.date).toLocaleDateString("vi-VN")} chưa diễn ra.`,
                                  );
                                  return;
                                }
                                updateStatus(apt._id, "done");
                              }}
                              disabled={isLoading}
                              title={
                                !passed
                                  ? `Lịch khám lúc ${apt.timeSlot} chưa diễn ra`
                                  : "Xác nhận đã khám"
                              }
                            >
                              ✓ Đã khám
                            </button>
                          )}

                          {/* Hủy — khi pending hoặc confirmed */}
                          {["pending", "confirmed"].includes(apt.status) && (
                            <button
                              style={{
                                ...styles.actionBtn,
                                backgroundColor: "#ef4444",
                              }}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Hủy lịch khám của ${apt.patient?.name}?`,
                                  )
                                ) {
                                  updateStatus(apt._id, "cancelled");
                                }
                              }}
                              disabled={isLoading}
                            >
                              ✕ Hủy
                            </button>
                          )}

                          {isLoading && (
                            <span style={styles.loadingText}>
                              Đang xử lý...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    flex: 1,
    minWidth: "200px",
  },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: "14px" },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  dateInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    cursor: "pointer",
  },
  clearBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#aaa",
    fontSize: "14px",
    padding: "0 4px",
  },
  filterBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  filterBtnActive: {
    backgroundColor: "#1a73e8",
    color: "#fff",
    borderColor: "#1a73e8",
  },
  loading: { textAlign: "center", padding: "60px", color: "#888" },
  tableWrap: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "800px" },
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
    transition: "background 0.15s",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#333",
    verticalAlign: "middle",
  },
  patientName: { fontWeight: "600", color: "#333" },
  subText: { color: "#888", fontSize: "12px", marginTop: "2px" },
  doctorName: { fontWeight: "600", color: "#333" },
  specialty: { color: "#1a73e8", fontSize: "12px", marginTop: "2px" },
  badge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  actionBtns: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  actionBtn: {
    padding: "6px 12px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  loadingText: { color: "#888", fontSize: "12px", fontStyle: "italic" },
  empty: {
    textAlign: "center",
    padding: "60px",
    color: "#aaa",
    fontSize: "15px",
    lineHeight: "2",
  },
};
