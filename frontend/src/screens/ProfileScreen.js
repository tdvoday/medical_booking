import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function ProfileScreen() {
  const { user, logout, login, updateUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.address || "");

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put("/auth/update-profile", {
        name,
        email,
        address,
      });

      // ← Cập nhật lại AuthContext + AsyncStorage ngay lập tức
      await updateUser({ name, email, address });

      setEditing(false);

      if (Platform.OS === "web") {
        window.alert("Thành công!\n\nCập nhật thông tin thành công!");
      }
    } catch (err) {
      console.log(err);
      if (Platform.OS === "web") {
        window.alert("Lỗi!\n\nKhông thể cập nhật thông tin");
      }
    } finally {
      setSaving(false);
    }
  };
  const handleLogout = () => setShowLogout(true);

  const MENU_ITEMS = [
    { icon: "📋", label: "Họ và tên", value: user?.name },
    { icon: "📱", label: "Số điện thoại", value: user?.phone },
    { icon: "📧", label: "Email", value: user?.email || "Chưa cập nhật" },
    { icon: "📍", label: "Địa chỉ", value: user?.address || "Chưa cập nhật" },
    {
      icon: "🔰",
      label: "Vai trò",
      value: user?.role === "admin" ? "Quản trị viên" : "Bệnh nhân",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={{ fontSize: 48 }}>👤</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === "admin" ? "👑 Quản trị viên" : "🏥 Bệnh nhân"}
          </Text>
        </View>
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editBtn}>
              {editing ? "Hủy" : "✏️ Chỉnh sửa"}
            </Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          // Form chỉnh sửa
          <View>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Hiển thị thông tin
          MENU_ITEMS.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Các tùy chọn khác */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuLabel}>Thông báo</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuIcon}>🔒</Text>
          <Text style={styles.menuLabel}>Đổi mật khẩu</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuLabel}>Trợ giúp</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Nút đăng xuất */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Phiên bản 1.0.0</Text>

      {/* Modal xác nhận đăng xuất */}
      <Modal visible={showLogout} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đăng xuất</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc muốn đăng xuất không?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogout(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={logout}>
                <Text style={styles.modalConfirmText}>Đăng xuất</Text>
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
  userName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  userPhone: { color: "#fff", opacity: 0.85, marginTop: 4 },
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
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, color: "#333" },
  editBtn: { color: "#1a73e8", fontSize: 14 },
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
  inputLabel: { color: "#888", fontSize: 13, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  saveBtn: {
    backgroundColor: "#1a73e8",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuIcon: { fontSize: 20, marginRight: 12, width: 28 },
  menuLabel: { flex: 1, fontSize: 14, color: "#333" },
  menuArrow: { fontSize: 20, color: "#ccc" },
  logoutBtn: {
    margin: 16,
    marginTop: 16,
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutText: { color: "#ef4444", fontWeight: "bold", fontSize: 16 },
  version: {
    textAlign: "center",
    color: "#bbb",
    fontSize: 12,
    marginBottom: 8,
  },
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
  modalMessage: { color: "#666", textAlign: "center", marginBottom: 20 },
  modalBtns: { flexDirection: "row" },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    marginRight: 8,
  },
  modalCancelText: { color: "#666", fontWeight: "600" },
  modalConfirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  modalConfirmText: { color: "#fff", fontWeight: "bold" },
});
