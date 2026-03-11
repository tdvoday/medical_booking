import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { doctorApi } from "../../services/api";

const showAlert = (title, message, onOk) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    if (onOk) onOk();
  } else {
    require("react-native").Alert.alert(title, message, [
      { text: "OK", onPress: onOk },
    ]);
  }
};

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Hoàn thành", color: "#6366f1", bg: "#eef2ff" },
};

export default function DoctorAppointmentDetailScreen({ route, navigation }) {
  const { appointment: initialApt, onGoBack } = route.params;
  const [apt, setApt] = useState(initialApt);
  const [loading, setLoading] = useState(false);

  const isPassed = () => {
    const aptTime = new Date(apt.date);
    const [h, m] = apt.timeSlot.split(":").map(Number);
    aptTime.setHours(h, m, 0, 0);
    return new Date() > aptTime;
  };

  const handleMarkDone = async () => {
    if (!isPassed()) {
      showAlert(
        "Chưa thể xác nhận",
        `Lịch khám lúc ${apt.timeSlot} chưa diễn ra`,
        null,
      );
      return;
    }
    try {
      setLoading(true);
      await doctorApi.put(`/doctor-appointments/${apt._id}/done`);
      setApt({ ...apt, status: "done" });
      showAlert("✅ Thành công", "Đã xác nhận hoàn thành khám!", () => {
        if (onGoBack) onGoBack();
        navigation.goBack();
      });
    } catch (err) {
      showAlert(
        "Lỗi",
        err.response?.data?.message || "Không thể cập nhật",
        null,
      );
    } finally {
      setLoading(false);
    }
  };

  const status = STATUS_CONFIG[apt.status];

  return (
    <View style={styles.wrapper}>
      {/* Navbar rõ ràng */}
      <View style={styles.navbar}>
        {/* <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity> */}
        <Text style={styles.navTitle}>Chi tiết lịch khám</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Thông tin bệnh nhân */}
        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>
              {apt.patient?.name?.[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{apt.patient?.name}</Text>
            {apt.patient?.phone && (
              <Text style={styles.patientInfo}>📱 {apt.patient.phone}</Text>
            )}
            {apt.patient?.email && (
              <Text style={styles.patientInfo}>📧 {apt.patient.email}</Text>
            )}
            {apt.patient?.address && (
              <Text style={styles.patientInfo}>📍 {apt.patient.address}</Text>
            )}
          </View>
        </View>

        {/* Badge trạng thái */}
        <View style={{ ...styles.statusBar, backgroundColor: status?.bg }}>
          <Text style={{ ...styles.statusBarText, color: status?.color }}>
            Trạng thái: {status?.label}
          </Text>
        </View>

        {/* Thông tin lịch khám */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Thông tin lịch khám</Text>
          {[
            {
              label: "Ngày khám",
              value: new Date(apt.date).toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
            },
            { label: "Giờ khám", value: apt.timeSlot },
            {
              label: "Phí khám",
              // apt.doctor có thể là object hoặc string ID — xử lý cả 2
              value: apt.doctor?.fee
                ? `${Number(apt.doctor.fee).toLocaleString("vi-VN")}đ`
                : "Liên hệ phòng khám",
            },
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Triệu chứng */}
        {apt.symptoms ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🩺 Triệu chứng bệnh nhân</Text>
            <Text style={styles.symptomsText}>{apt.symptoms}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🩺 Triệu chứng bệnh nhân</Text>
            <Text style={styles.emptyText}>
              Bệnh nhân chưa nhập triệu chứng
            </Text>
          </View>
        )}

        {/* Hành động */}
        <View style={styles.actionSection}>
          {apt.status === "confirmed" && (
            <TouchableOpacity
              style={[styles.doneBtn, !isPassed() && styles.doneBtnDisabled]}
              onPress={handleMarkDone}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.doneBtnIcon}>
                    {isPassed() ? "✅" : "⏳"}
                  </Text>
                  <Text style={styles.doneBtnText}>
                    {isPassed()
                      ? "Xác nhận đã khám"
                      : `Chờ đến ${apt.timeSlot}`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {apt.status === "pending" && (
            <View style={styles.infoTag}>
              <Text style={styles.infoTagText}>
                ⏳ Chờ bệnh nhân xác nhận lịch
              </Text>
            </View>
          )}

          {apt.status === "done" && (
            <View style={[styles.infoTag, { backgroundColor: "#ecfdf5" }]}>
              <Text style={[styles.infoTagText, { color: "#10b981" }]}>
                ✅ Đã hoàn thành khám
              </Text>
            </View>
          )}

          {apt.status === "cancelled" && (
            <View style={[styles.infoTag, { backgroundColor: "#fef2f2" }]}>
              <Text style={[styles.infoTagText, { color: "#ef4444" }]}>
                ❌ Lịch khám đã bị hủy
              </Text>
            </View>
          )}

          {/* Nút quay lại rõ ràng ở dưới cùng */}
          <TouchableOpacity
            style={styles.backBtnBottom}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnBottomText}>← Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f5f5f5" },
  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a73e8",
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backIcon: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  backText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  navTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  // Patient card
  container: { flex: 1 },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    elevation: 2,
  },
  patientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "bold", color: "#1a73e8" },
  patientName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  patientInfo: { color: "#666", fontSize: 13, marginTop: 3 },
  // Status bar
  statusBar: {
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  statusBarText: { fontWeight: "bold", fontSize: 15 },
  // Section
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: { color: "#888" },
  infoValue: { fontWeight: "600", color: "#333" },
  symptomsText: { color: "#555", lineHeight: 22 },
  emptyText: { color: "#aaa", fontStyle: "italic" },
  // Actions
  actionSection: { marginHorizontal: 16 },
  doneBtn: {
    backgroundColor: "#10b981",
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  doneBtnDisabled: { backgroundColor: "#b0bec5" },
  doneBtnIcon: { fontSize: 20 },
  doneBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  infoTag: {
    backgroundColor: "#f0f4ff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  infoTagText: { fontWeight: "bold", fontSize: 15, color: "#6366f1" },
  backBtnBottom: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  backBtnBottomText: { color: "#555", fontWeight: "600", fontSize: 15 },
});
