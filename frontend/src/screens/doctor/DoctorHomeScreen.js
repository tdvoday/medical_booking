import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { doctorApi } from "../../services/api";

export default function DoctorHomeScreen({ navigation }) {
  const { doctor, doctorLogout } = useContext(AuthContext);
  const [todayApts, setTodayApts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [todayRes, allRes] = await Promise.all([
        doctorApi.get("/doctor-appointments/my", {
          params: { date: todayStr },
        }),
        doctorApi.get("/doctor-appointments/my"),
      ]);
      setTodayApts(todayRes.data.appointments);
      const all = allRes.data.appointments;
      setStats({
        total: all.length,
        pending: all.filter(
          (a) => a.status === "pending" || a.status === "confirmed",
        ).length,
        done: all.filter((a) => a.status === "done").length,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_CONFIG = {
    pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
    confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
    cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
    done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào 👋</Text>
          <Text style={styles.doctorName}>{doctor?.name}</Text>
          <Text style={styles.specialty}>{doctor?.specialty}</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn}>
          <Text style={{ fontSize: 36 }}>👨‍⚕️</Text>
        </TouchableOpacity>
      </View>

      {/* Thống kê */}
      <View style={styles.statsRow}>
        {[
          { label: "Tổng lịch", value: stats.total, color: "#1a73e8" },
          { label: "Chờ khám", value: stats.pending, color: "#f59e0b" },
          { label: "Đã khám", value: stats.done, color: "#10b981" },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={{ ...styles.statValue, color: s.color }}>
              {s.value}
            </Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Lịch hôm nay */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 Lịch khám hôm nay</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("DoctorSchedule")}
          >
            <Text style={styles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#1a73e8" style={{ marginVertical: 20 }} />
        ) : todayApts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 32 }}>🎉</Text>
            <Text style={styles.emptyText}>Không có lịch khám hôm nay</Text>
          </View>
        ) : (
          todayApts.slice(0, 5).map((apt) => {
            const status = STATUS_CONFIG[apt.status];
            return (
              <TouchableOpacity
                key={apt._id}
                style={styles.aptCard}
                onPress={() =>
                  navigation.navigate("DoctorAppointmentDetail", {
                    appointment: apt,
                  })
                }
              >
                <View style={styles.aptLeft}>
                  <View style={styles.patientAvatar}>
                    <Text style={{ fontWeight: "bold", color: "#1a73e8" }}>
                      {apt.patient?.name?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.patientName}>{apt.patient?.name}</Text>
                    <Text style={styles.patientPhone}>
                      {apt.patient?.phone}
                    </Text>
                  </View>
                </View>
                <View style={styles.aptRight}>
                  <Text style={styles.aptTime}>{apt.timeSlot}</Text>
                  <View
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: status?.bg,
                    }}
                  >
                    <Text
                      style={{ ...styles.statusText, color: status?.color }}
                    >
                      {status?.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Truy cập nhanh</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: "📅", label: "Lịch khám", screen: "DoctorSchedule" },
            { icon: "👥", label: "Bệnh nhân", screen: "DoctorSchedule" },
            { icon: "👤", label: "Hồ sơ", screen: "DoctorProfile" },
            { icon: "🚪", label: "Đăng xuất", action: doctorLogout },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickItem}
              onPress={() =>
                item.action ? item.action() : navigation.navigate(item.screen)
              }
            >
              <Text style={{ fontSize: 28 }}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#1a73e8",
    padding: 24,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  doctorName: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 4 },
  specialty: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },
  avatarBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    padding: 8,
  },
  statsRow: { flexDirection: "row", margin: 16, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: "bold" },
  statLabel: { color: "#888", fontSize: 12, marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 15, color: "#333" },
  seeAll: { color: "#1a73e8", fontSize: 13 },
  empty: { alignItems: "center", paddingVertical: 20 },
  emptyText: { color: "#888", marginTop: 8 },
  aptCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  aptLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
  },
  patientName: { fontWeight: "600", color: "#333" },
  patientPhone: { color: "#888", fontSize: 12, marginTop: 2 },
  aptRight: { alignItems: "flex-end" },
  aptTime: { fontWeight: "bold", color: "#1a73e8", fontSize: 16 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  quickItem: {
    width: "22%",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
  },
  quickLabel: {
    fontSize: 11,
    color: "#555",
    marginTop: 6,
    textAlign: "center",
  },
});
