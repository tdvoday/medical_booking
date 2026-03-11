import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    color: "#f59e0b",
    bg: "#fffbeb",
    dot: "#f59e0b",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "#10b981",
    bg: "#ecfdf5",
    dot: "#10b981",
  },
  cancelled: {
    label: "Đã hủy",
    color: "#ef4444",
    bg: "#fef2f2",
    dot: "#ef4444",
  },
  done: {
    label: "Hoàn thành",
    color: "#6366f1",
    bg: "#eef2ff",
    dot: "#6366f1",
  },
};

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export default function CalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedApts, setSelectedApts] = useState([]);

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

  // Lấy ngày đầu và cuối tháng hiện tại
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=CN
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Tạo mảng ô ngày (null = ô trống đầu tháng)
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formatKey = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  // Group appointments theo ngày
  const aptsByDate = appointments.reduce((acc, apt) => {
    const key = apt.date?.slice(0, 10); // YYYY-MM-DD
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {});

  const handleDayClick = (day) => {
    if (!day) return;
    const key = formatKey(year, month, day);
    setSelectedDate({ day, key });
    setSelectedApts(
      (aptsByDate[key] || []).sort((a, b) =>
        a.timeSlot.localeCompare(b.timeSlot),
      ),
    );
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const today = new Date();
  const todayKey = formatKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div>
      <h2 style={styles.pageTitle}>📆 Lịch khám theo tháng</h2>

      {loading ? (
        <div style={styles.loading}>Đang tải...</div>
      ) : (
        <div style={styles.layout}>
          {/* Calendar bên trái */}
          <div style={styles.calendarCard}>
            {/* Navigation */}
            <div style={styles.calendarNav}>
              <button style={styles.navBtn} onClick={prevMonth}>
                ‹
              </button>
              <div style={styles.monthTitle}>
                {MONTHS[month]} {year}
              </div>
              <button style={styles.navBtn} onClick={nextMonth}>
                ›
              </button>
            </div>

            <button style={styles.todayBtn} onClick={goToday}>
              Hôm nay
            </button>

            {/* Header ngày trong tuần */}
            <div style={styles.weekHeader}>
              {DAYS_OF_WEEK.map((d, i) => (
                <div
                  key={d}
                  style={{
                    ...styles.weekDay,
                    color: i === 0 ? "#ef4444" : "#888",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Các ô ngày */}
            <div style={styles.daysGrid}>
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const key = formatKey(year, month, day);
                const dayApts = aptsByDate[key] || [];
                const isToday = key === todayKey;
                const isSel = selectedDate?.key === key;
                const dayOfWeek = (firstDay + day - 1) % 7;

                // Nhóm status để hiện dots
                const statuses = [...new Set(dayApts.map((a) => a.status))];

                return (
                  <div
                    key={day}
                    style={{
                      ...styles.dayCell,
                      backgroundColor: isSel
                        ? "#1557b0"
                        : isToday
                          ? "#1a73e8"
                          : dayApts.length > 0
                            ? "#f0f7ff"
                            : "#fff",
                    }}
                    onClick={() => handleDayClick(day)}
                  >
                    <span
                      style={{
                        ...styles.dayNum,
                        color:
                          isToday || isSel
                            ? "#fff"
                            : dayOfWeek === 0
                              ? "#ef4444"
                              : "#333",
                      }}
                    >
                      {day}
                    </span>

                    {/* Số lịch khám */}
                    {dayApts.length > 0 && (
                      <span
                        style={{
                          ...styles.aptCount,
                          color: isToday || isSel ? "#fff" : "#1a73e8",
                        }}
                      >
                        {dayApts.length} lịch
                      </span>
                    )}

                    {/* Dots trạng thái */}
                    {statuses.length > 0 && (
                      <div style={styles.dots}>
                        {statuses.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            style={{
                              ...styles.dot,
                              backgroundColor:
                                isSel || isToday
                                  ? "#fff"
                                  : STATUS_CONFIG[s]?.dot,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chú thích */}
            <div style={styles.legend}>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <div key={key} style={styles.legendItem}>
                  <span style={{ ...styles.dot, backgroundColor: val.dot }} />
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {val.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chi tiết ngày bên phải */}
          <div style={styles.detailCard}>
            {!selectedDate ? (
              <div style={styles.noSelect}>
                <div style={{ fontSize: "48px" }}>📅</div>
                <div style={{ color: "#888", marginTop: "12px" }}>
                  Chọn một ngày để xem lịch khám
                </div>
              </div>
            ) : (
              <>
                <div style={styles.detailHeader}>
                  <div style={styles.detailDate}>
                    {new Date(selectedDate.key).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                  <div style={styles.detailCount}>
                    {selectedApts.length} lịch khám
                  </div>
                </div>

                {selectedApts.length === 0 ? (
                  <div style={styles.noApt}>
                    <div>📭</div>
                    <div>Không có lịch khám trong ngày này</div>
                  </div>
                ) : (
                  <div style={styles.aptList}>
                    {selectedApts.map((apt) => {
                      const status = STATUS_CONFIG[apt.status];
                      return (
                        <div key={apt._id} style={styles.aptItem}>
                          <div
                            style={{
                              ...styles.aptTimeline,
                              backgroundColor: status?.dot,
                            }}
                          />
                          <div style={styles.aptContent}>
                            <div style={styles.aptTime}>{apt.timeSlot}</div>
                            <div style={styles.aptPatient}>
                              {apt.patient?.name}
                            </div>
                            <div style={styles.aptDoctor}>
                              👨‍⚕️ {apt.doctor?.name} — {apt.doctor?.specialty}
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
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
    marginBottom: "24px",
    color: "#333",
  },
  loading: { textAlign: "center", padding: "60px", color: "#888" },
  layout: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "20px",
    alignItems: "start",
  },
  // Calendar
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  calendarNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  monthTitle: { fontSize: "18px", fontWeight: "bold", color: "#333" },
  navBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid #eee",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  todayBtn: {
    padding: "4px 14px",
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  weekHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: "8px",
  },
  weekDay: {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
    padding: "4px 0",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  dayCell: {
    borderRadius: "10px",
    padding: "6px 4px",
    cursor: "pointer",
    textAlign: "center",
    minHeight: "56px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "background 0.15s",
  },
  // ✅ Thêm dòng này (dùng để hover)
  dayCellHover: { cursor: "pointer" },
  dayNum: { fontSize: "14px", fontWeight: "600" },
  aptCount: { fontSize: "10px", marginTop: "2px" },
  dots: { display: "flex", gap: "2px", marginTop: "2px" },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #f0f0f0",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "4px" },
  // Detail
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    minHeight: "400px",
  },
  noSelect: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "14px",
    borderBottom: "1px solid #f0f0f0",
  },
  detailDate: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
  },
  detailCount: {
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  noApt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    color: "#aaa",
    gap: "8px",
    fontSize: "15px",
  },
  aptList: { display: "flex", flexDirection: "column", gap: "12px" },
  aptItem: {
    display: "flex",
    gap: "12px",
    padding: "14px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
  },
  aptTimeline: { width: "4px", borderRadius: "4px", flexShrink: 0 },
  aptContent: { flex: 1 },
  aptTime: { fontSize: "18px", fontWeight: "bold", color: "#1a73e8" },
  aptPatient: { fontWeight: "600", color: "#333", marginTop: "4px" },
  aptDoctor: {
    color: "#888",
    fontSize: "13px",
    marginTop: "2px",
    marginBottom: "6px",
  },
  badge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
};
