import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Đã khám", color: "#6366f1", bg: "#eef2ff" },
};

const TABS = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "done", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function AppointmentScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [selected, setSelected] = useState(null); // lịch đang xem chi tiết
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Tự động reload khi màn hình được focus (sau khi đặt lịch xong)
  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [activeTab]),
  );

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab) params.status = activeTab;
      const res = await api.get("/appointments/my", { params });
      setAppointments(res.data.appointments);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await api.put(`/appointments/${selected._id}/cancel`, {
        cancelReason: "Người dùng hủy",
      });
      setShowCancel(false);
      setSelected(null);
      fetchAppointments();
    } catch (err) {
      console.log(err);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
        {/* Header card */}
        <View style={styles.cardHeader}>
          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{item.doctor?.name}</Text>
              <Text style={styles.specialty}>{item.doctor?.specialty}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <Text style={styles.infoText}>{item.timeSlot}</Text>
          </View>
          {item.symptoms ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🩺</Text>
              <Text style={styles.infoText} numberOfLines={1}>
                {item.symptoms}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Nút hủy nếu còn pending */}
        {item.status === "pending" && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setSelected(item);
              setShowCancel(true);
            }}
          >
            <Text style={styles.cancelBtnText}>Hủy lịch</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Lịch khám của tôi</Text>
      </View>

      {/* Tab filter */}
      <FlatList
        horizontal
        data={TABS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        style={styles.tabList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === item.key && styles.tabActive]}
            onPress={() => setActiveTab(item.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === item.key && styles.tabTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Danh sách lịch */}
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
                fetchAppointments();
              }}
              colors={["#1a73e8"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>📭</Text>
              <Text style={styles.emptyText}>Chưa có lịch khám nào</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Modal chi tiết lịch */}
      <Modal
        visible={!!selected && !showCancel}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>Chi tiết lịch khám</Text>
                <View style={styles.modalBody}>
                  {[
                    { label: "Bác sĩ", value: selected.doctor?.name },
                    { label: "Chuyên khoa", value: selected.doctor?.specialty },
                    { label: "Ngày khám", value: formatDate(selected.date) },
                    { label: "Giờ khám", value: selected.timeSlot },
                    {
                      label: "Phí khám",
                      value: `${selected.doctor?.fee?.toLocaleString("vi-VN")}đ`,
                    },
                    {
                      label: "Trạng thái",
                      value: STATUS_CONFIG[selected.status]?.label,
                    },
                    ...(selected.symptoms
                      ? [{ label: "Triệu chứng", value: selected.symptoms }]
                      : []),
                    ...(selected.cancelReason && selected.status === "cancelled"
                      ? [{ label: "Lý do hủy", value: selected.cancelReason }]
                      : []),
                  ].map((row) => (
                    <View key={row.label} style={styles.modalRow}>
                      <Text style={styles.modalLabel}>{row.label}</Text>
                      <Text style={styles.modalValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalBtns}>
                  {selected.status === "pending" && (
                    <TouchableOpacity
                      style={styles.cancelOutlineBtn}
                      onPress={() => setShowCancel(true)}
                    >
                      <Text style={styles.cancelOutlineText}>Hủy lịch</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelected(null)}
                  >
                    <Text style={styles.closeBtnText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal xác nhận hủy lịch */}
      <Modal visible={showCancel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Xác nhận hủy lịch</Text>
            <Text style={styles.cancelWarning}>
              Bạn có chắc muốn hủy lịch khám với{"\n"}
              <Text style={{ fontWeight: "bold" }}>
                {selected?.doctor?.name}
              </Text>{" "}
              vào {selected?.timeSlot} ngày{" "}
              {selected ? formatDate(selected.date) : ""}?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCancel(false)}
              >
                <Text style={styles.modalCancelText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Hủy lịch</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tabList: {
    maxHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  tabActive: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  tabText: { fontSize: 12, color: "#666" },
  tabTextActive: { color: "#fff", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  doctorRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    backgroundColor: "#e8f0fe",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  doctorName: { fontWeight: "bold", fontSize: 15, color: "#333" },
  specialty: { color: "#1a73e8", fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardBody: { padding: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoIcon: { fontSize: 14, marginRight: 8, width: 20 },
  infoText: { color: "#555", fontSize: 13, flex: 1 },
  cancelBtn: {
    backgroundColor: "#fef2f2",
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#fee2e2",
  },
  cancelBtnText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#888", fontSize: 15, marginTop: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalBody: { marginBottom: 20 },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modalLabel: { color: "#888", flex: 1 },
  modalValue: { fontWeight: "600", color: "#333", flex: 2, textAlign: "right" },
  modalBtns: { flexDirection: "row", justifyContent: "space-between" },
  cancelOutlineBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
    alignItems: "center",
    marginRight: 8,
  },
  cancelOutlineText: { color: "#ef4444", fontWeight: "600" },
  closeBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#1a73e8",
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontWeight: "bold" },
  cancelWarning: {
    textAlign: "center",
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
  },
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
