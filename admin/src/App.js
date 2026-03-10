import React, { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorsPage from "./pages/DoctorsPage";
import PatientsPage from "./pages/PatientsPage";

const NAV_ITEMS = [
  { key: "dashboard", label: "📊 Tổng quan" },
  { key: "appointments", label: "📅 Lịch khám" },
  { key: "doctors", label: "👨‍⚕️ Bác sĩ" },
  { key: "patients", label: "👥 Bệnh nhân" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>🏥 Admin</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              style={{
                ...styles.navBtn,
                ...(activePage === item.key ? styles.navBtnActive : {}),
              }}
              onClick={() => setActivePage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.adminName}>👤 {user.name}</div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <div style={styles.content}>
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "appointments" && <AppointmentsPage />}
          {activePage === "doctors" && <DoctorsPage />}
          {activePage === "patients" && <PatientsPage />}
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: { display: "flex", minHeight: "100vh", fontFamily: "sans-serif" },
  sidebar: {
    width: "240px",
    backgroundColor: "#1e293b",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
  },
  logo: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "bold",
    padding: "0 20px 24px",
  },
  navBtn: {
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  navBtnActive: { backgroundColor: "#1a73e8", color: "#fff" },
  sidebarBottom: { marginTop: "auto", padding: "20px" },
  adminName: { color: "#94a3b8", fontSize: "13px", marginBottom: "10px" },
  logoutBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  main: { flex: 1, backgroundColor: "#f0f4f8", overflow: "auto" },
  content: { padding: "32px" },
};
