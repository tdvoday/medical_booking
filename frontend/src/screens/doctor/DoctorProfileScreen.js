import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  useState,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function DoctorProfileScreen() {
  const { doctor, doctorLogout } = useContext(AuthContext);
  const [showLogout, setShowLogout] = React.useState(false);

  const INFO = [
    { icon: "🏥", label: "Chuyên khoa", value: doctor?.specialty },
    { icon: "⭐", label: "Đánh giá", value: `${doctor?.rating}/5` },
    { icon: "📅", label: "Kinh nghiệm", value: `${doctor?.experience} năm` },
    {
      icon: "💰",
      label: "Phí khám",
      value: `${doctor?.fee?.toLocaleString("vi-VN")}đ`,
    },
    { icon: "📱", label: "Số điện thoại", value: doctor?.phone },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={{ fontSize: 48 }}>👨‍⚕️</Text>
        </View>
        <Text style={styles.name}>{doctor?.name}</Text>
        <Text style={styles.specialty}>{doctor?.specialty}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>👨‍⚕️ Bác sĩ</Text>
        </View>
      </View>

      {/* Thông tin */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        {INFO.map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text style={styles.infoIcon}>{item.icon}</Text>
            <View>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Đăng xuất */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => setShowLogout(true)}
      >
        <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
      </TouchableOpacity>

      {/* Modal xác nhận */}
      <Modal visible={showLogout} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đăng xuất</Text>
            <Text style={styles.modalMsg}>
              Bạn có chắc muốn đăng xuất không?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogout(false)}
              >
                <Text style={{ color: "#666", fontWeight: "600" }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={doctorLogout}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Đăng xuất
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#1a73e8",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
  },
  avatarCircle: {
    backgroundColor: "#fff",
    borderRadius: 50,
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  specialty: { color: "rgba(255,255,255,0.85)", marginTop: 4 },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 10,
  },
  roleText: { color: "#fff", fontSize: 13 },
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
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoIcon: { fontSize: 20, marginRight: 12, width: 28 },
  infoLabel: { color: "#888", fontSize: 12 },
  infoValue: { color: "#333", fontSize: 14, fontWeight: "500", marginTop: 2 },
  logoutBtn: {
    margin: 16,
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutText: { color: "#ef4444", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalMsg: { color: "#666", textAlign: "center", marginBottom: 20 },
  modalBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
});
