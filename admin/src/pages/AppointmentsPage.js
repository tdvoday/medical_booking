import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
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
  // Kiểm tra lịch khám đã qua chưa
  const isPassed = (date, timeSlot) => {
    const appointmentDate = new Date(date);
    const [h, m] = timeSlot.split(":").map(Number);
    appointmentDate.setHours(h, m, 0, 0);
    return new Date() > appointmentDate; // true = đã qua giờ khám
  };
  return (
    <div>
      <h2 style={styles.pageTitle}>📅 Quản lý lịch khám</h2>

      {/* Filter */}
      <div style={styles.filterBar}>
        {[
          { key: "", label: "Tất cả" },
          { key: "pending", label: "Chờ xác nhận" },
          { key: "confirmed", label: "Đã xác nhận" },
          { key: "done", label: "Hoàn thành" },
          { key: "cancelled", label: "Đã hủy" },
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

      {loading ? (
        <div style={styles.loading}>Đang tải...</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Bệnh nhân</th>
                <th style={styles.th}>Bác sĩ</th>
                <th style={styles.th}>Ngày khám</th>
                <th style={styles.th}>Giờ</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#888",
                    }}
                  >
                    Không có lịch khám nào
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => {
                  const status = STATUS_CONFIG[apt.status];
                  return (
                    <tr key={apt._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: "600" }}>
                          {apt.patient?.name}
                        </div>
                        <div style={{ color: "#888", fontSize: "13px" }}>
                          {apt.patient?.phone}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: "600" }}>
                          {apt.doctor?.name}
                        </div>
                        <div style={{ color: "#1a73e8", fontSize: "13px" }}>
                          {apt.doctor?.specialty}
                        </div>
                      </td>
                      <td style={styles.td}>{formatDate(apt.date)}</td>
                      <td style={styles.td}>
                        <strong>{apt.timeSlot}</strong>
                      </td>
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
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          {apt.status === "pending" && (
                            <button
                              style={{
                                ...styles.actionBtn,
                                backgroundColor: "#10b981",
                              }}
                              onClick={() => updateStatus(apt._id, "confirmed")}
                              disabled={updating === apt._id}
                            >
                              ✓ Xác nhận
                            </button>
                          )}

                          {apt.status === "confirmed" &&
                            (isPassed(apt.date, apt.timeSlot) ? (
                              // Đã qua giờ khám → cho phép bấm Hoàn thành
                              <button
                                style={{
                                  ...styles.actionBtn,
                                  backgroundColor: "#6366f1",
                                }}
                                onClick={() => updateStatus(apt._id, "done")}
                                disabled={updating === apt._id}
                              >
                                ✓ Hoàn thành
                              </button>
                            ) : (
                              // Chưa đến giờ → disable + tooltip
                              <div style={styles.tooltipWrap}>
                                <button
                                  style={{
                                    ...styles.actionBtn,
                                    backgroundColor: "#a5b4fc",
                                    cursor: "not-allowed",
                                  }}
                                  disabled
                                >
                                  ✓ Hoàn thành
                                </button>
                                <span style={styles.tooltip}>
                                  Chưa đến giờ khám ({apt.timeSlot}{" "}
                                  {new Date(apt.date).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                  )
                                </span>
                              </div>
                            ))}

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
                              disabled={updating === apt._id}
                            >
                              ✕ Hủy
                            </button>
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
    marginBottom: "24px",
    color: "#333",
  },
  filterBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  filterBtnActive: {
    backgroundColor: "#1a73e8",
    color: "#fff",
    borderColor: "#1a73e8",
  },
  loading: { textAlign: "center", padding: "40px", color: "#888" },
  tableWrap: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
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
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  actionBtns: { display: "flex", gap: "6px" },
  actionBtn: {
    padding: "6px 12px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  tooltipWrap: { position: "relative", display: "inline-block" },
  tooltip: {
    visibility: "hidden",
    backgroundColor: "#333",
    color: "#fff",
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "6px",
    position: "absolute",
    bottom: "130%",
    left: "50%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    zIndex: 10,
  },
};
