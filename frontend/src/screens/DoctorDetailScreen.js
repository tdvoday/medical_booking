import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";

export default function DoctorDetailScreen({ route, navigation }) {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      const res = await api.get(`/doctors/${doctorId}`);
      setDoctor(res.data.doctor);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1 }} />
    );
  if (!doctor)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không tìm thấy bác sĩ</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* Header bác sĩ */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 56 }}>👨‍⚕️</Text>
        </View>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {doctor.rating}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.experience}</Text>
            <Text style={styles.statLabel}>Năm KN</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(doctor.fee / 1000).toFixed(0)}k
            </Text>
            <Text style={styles.statLabel}>Phí khám</Text>
          </View>
        </View>
      </View>

      {/* Giới thiệu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
        <Text style={styles.description}>
          {doctor.description || "Chưa có thông tin"}
        </Text>
      </View>

      {/* Lịch làm việc */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch làm việc</Text>
        {doctor.workingSchedule?.length > 0 ? (
          doctor.workingSchedule.map((schedule) => {
            const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
            return (
              <View key={schedule.dayOfWeek} style={styles.scheduleRow}>
                <Text style={styles.scheduleDay}>
                  {days[schedule.dayOfWeek]}
                </Text>
                <Text style={styles.scheduleSlots}>
                  {schedule.slots[0]} -{" "}
                  {schedule.slots[schedule.slots.length - 1]}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={{ color: "#888" }}>Chưa có lịch làm việc</Text>
        )}
      </View>

      {/* Nút đặt lịch */}
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() =>
          navigation.navigate("Booking", {
            doctorId: doctor._id,
            doctorName: doctor.name,
          })
        }
      >
        <Text style={styles.bookBtnText}>📅 Đặt lịch khám</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#1a73e8",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    backgroundColor: "#fff",
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  specialty: { color: "#fff", opacity: 0.85, fontSize: 15, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    width: "100%",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { fontWeight: "bold", fontSize: 16, color: "#333" },
  statLabel: { color: "#888", fontSize: 12, marginTop: 2 },
  divider: { width: 1, backgroundColor: "#eee" },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  description: { color: "#555", lineHeight: 22 },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scheduleDay: { fontWeight: "bold", color: "#1a73e8", width: 40 },
  scheduleSlots: { color: "#555" },
  bookBtn: {
    backgroundColor: "#1a73e8",
    margin: 16,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  bookBtnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});
