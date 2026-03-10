import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function PatientsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
          doctors: new Set(),
        };
      }
      acc[p._id].totalAppointments++;
      acc[p._id].doctors.add(apt.doctor?.specialty);
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
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          Đang tải...
        </div>
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
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#888",
                    }}
                  >
                    Không tìm thấy bệnh nhân
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p._id} style={styles.tableRow}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.patientAvatar}>
                        <span style={styles.avatarCircle}>
                          {p.name?.[0]?.toUpperCase()}
                        </span>
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
                        {[...p.doctors].filter(Boolean).map((s) => (
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
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
  },
  summary: { marginBottom: "16px" },
  summaryText: { color: "#888", fontSize: "14px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fff",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: "14px" },
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
  tableRow: { borderBottom: "1px solid #f9f9f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#333" },
  patientAvatar: { display: "flex", alignItems: "center", gap: "10px" },
  avatarCircle: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "15px",
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
};
