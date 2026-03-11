import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { doctorApi } from "../../services/api";

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
};

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getWeekDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

const formatDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function DoctorScheduleScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const weekDays = getWeekDays();

  useEffect(() => {
    fetchApts();
  }, [selectedDate]);

  const fetchApts = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.get("/doctor-appointments/my", {
        params: { date: formatDate(selectedDate) },
      });
      setAppointments(res.data.appointments);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("DoctorAppointmentDetail", {
            appointment: item,
            onGoBack: fetchApts,
          })
        }
      >
        <View style={styles.cardLeft}>
          <Text style={styles.timeText}>{item.timeSlot}</Text>
          <View
            style={{ ...styles.statusDot, backgroundColor: status?.color }}
          />
        </View>
        <View style={styles.cardRight}>
          <View style={styles.patientAvatar}>
            <Text style={{ fontWeight: "bold", color: "#1a73e8" }}>
              {item.patient?.name?.[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{item.patient?.name}</Text>
            <Text style={styles.patientPhone}>📱 {item.patient?.phone}</Text>
            {item.symptoms && (
              <Text style={styles.symptoms} numberOfLines={1}>
                🩺 {item.symptoms}
              </Text>
            )}
          </View>
          <View style={{ ...styles.statusBadge, backgroundColor: status?.bg }}>
            <Text style={{ ...styles.statusText, color: status?.color }}>
              {status?.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Lịch khám của tôi</Text>
      </View>

      {/* Chọn ngày */}
      <View style={styles.weekRow}>
        {weekDays.map((day, i) => {
          const isSel = formatDate(day) === formatDate(selectedDate);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayBtn, isSel && styles.dayBtnActive]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[styles.dayName, isSel && styles.dayTextActive]}>
                {i === 0 ? "Hôm nay" : DAYS[day.getDay()]}
              </Text>
              <Text style={[styles.dayNum, isSel && styles.dayTextActive]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tóm tắt ngày */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryDate}>
          {selectedDate.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Text>
        <Text style={styles.summaryCount}>{appointments.length} lịch khám</Text>
      </View>

      {/* Danh sách */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1a73e8"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchApts();
              }}
              colors={["#1a73e8"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={styles.emptyText}>
                Không có lịch khám trong ngày này
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#1a73e8",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  weekRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dayBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  dayBtnActive: { backgroundColor: "#1a73e8" },
  dayName: { fontSize: 10, color: "#888" },
  dayNum: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 2 },
  dayTextActive: { color: "#fff" },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#e8f0fe",
  },
  summaryDate: { color: "#1a73e8", fontWeight: "600", fontSize: 13 },
  summaryCount: { color: "#1a73e8", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
  },
  cardLeft: {
    backgroundColor: "#f0f7ff",
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  timeText: { fontWeight: "bold", color: "#1a73e8", fontSize: 16 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  cardRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
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
  symptoms: { color: "#555", fontSize: 12, marginTop: 2, fontStyle: "italic" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "600" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#888", marginTop: 10, fontSize: 14 },
});
