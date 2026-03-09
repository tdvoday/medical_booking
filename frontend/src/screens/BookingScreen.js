import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../services/api";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Th.1",
  "Th.2",
  "Th.3",
  "Th.4",
  "Th.5",
  "Th.6",
  "Th.7",
  "Th.8",
  "Th.9",
  "Th.10",
  "Th.11",
  "Th.12",
];

const getNextDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Lọc slot đã qua nếu là hôm nay
const filterPassedSlots = (slots, selectedDate) => {
  const now = new Date();
  const today = formatDate(now);
  const selected = formatDate(selectedDate);

  if (selected !== today) return slots; // không phải hôm nay → giữ nguyên

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.filter((slot) => {
    const [h, m] = slot.split(":").map(Number);
    const slotMinutes = h * 60 + m;
    return slotMinutes > currentMinutes; // chỉ giữ slot sau giờ hiện tại
  });
};

export default function BookingScreen({ route, navigation }) {
  const { doctorId, doctorName } = route.params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const days = getNextDays();

  useEffect(() => {
    if (selectedDate) fetchSlots();
  }, [selectedDate]);

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await api.get(`/doctors/${doctorId}/available-slots`, {
        params: { date: formatDate(selectedDate) },
      });

      // Lọc slot đã qua nếu là hôm nay
      const filtered = filterPassedSlots(
        res.data.availableSlots || [],
        selectedDate,
      );
      setAvailableSlots(filtered);
    } catch (err) {
      console.log(err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    Alert.alert(
      "Xác nhận đặt lịch",
      `Bác sĩ: ${doctorName}\nNgày: ${selectedDate.toLocaleDateString("vi-VN")}\nGiờ: ${selectedSlot}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              setBooking(true);
              await api.post("/appointments", {
                doctorId,
                date: formatDate(selectedDate),
                timeSlot: selectedSlot,
              });
              Alert.alert("🎉 Thành công!", "Đặt lịch khám thành công!", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("Appointments"),
                },
              ]);
            } catch (err) {
              Alert.alert(
                "Lỗi",
                err.response?.data?.message || "Không thể đặt lịch",
              );
            } finally {
              setBooking(false);
            }
          },
        },
      ],
    );
  };

  const canBook = selectedDate && selectedSlot && !booking;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Thông tin bác sĩ */}
      <View style={styles.doctorBanner}>
        <Text style={{ fontSize: 36 }}>👨‍⚕️</Text>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.doctorName}>{doctorName}</Text>
          <Text style={styles.doctorSub}>Chọn ngày và giờ khám bên dưới</Text>
        </View>
      </View>

      {/* Chọn ngày */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📆 Chọn ngày khám</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((day, index) => {
            const isSelected =
              selectedDate && formatDate(day) === formatDate(selectedDate);
            const isToday = index === 0;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[styles.dayName, isSelected && styles.dayTextActive]}
                >
                  {isToday ? "Hôm nay" : DAYS[day.getDay()]}
                </Text>
                <Text
                  style={[styles.dayNum, isSelected && styles.dayTextActive]}
                >
                  {day.getDate()}
                </Text>
                <Text
                  style={[styles.dayMonth, isSelected && styles.dayTextActive]}
                >
                  {MONTHS[day.getMonth()]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Chọn giờ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Chọn giờ khám</Text>

        {!selectedDate ? (
          <Text style={styles.hint}>← Vui lòng chọn ngày trước</Text>
        ) : loadingSlots ? (
          <ActivityIndicator color="#1a73e8" style={{ marginVertical: 20 }} />
        ) : availableSlots.length === 0 ? (
          <View style={styles.noSlot}>
            <Text style={{ fontSize: 32 }}>😔</Text>
            <Text style={styles.noSlotText}>
              Không còn slot trống trong ngày này
            </Text>
          </View>
        ) : (
          <View style={styles.slotGrid}>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotBtn,
                  selectedSlot === slot && styles.slotBtnActive,
                ]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === slot && styles.slotTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Tóm tắt */}
      {selectedDate && selectedSlot && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>📋 Thông tin đặt lịch</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bác sĩ</Text>
            <Text style={styles.summaryValue}>{doctorName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ngày khám</Text>
            <Text style={styles.summaryValue}>
              {selectedDate.toLocaleDateString("vi-VN")}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giờ khám</Text>
            <Text style={styles.summaryValue}>{selectedSlot}</Text>
          </View>
        </View>
      )}

      {/* Nút đặt lịch */}
      <TouchableOpacity
        style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]}
        onPress={canBook ? handleBooking : null}
      >
        {booking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.bookBtnText}>
            {canBook ? "Xác nhận đặt lịch" : "Vui lòng chọn ngày và giờ"}
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  doctorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a73e8",
    padding: 20,
  },
  doctorName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  doctorSub: { color: "#fff", opacity: 0.85, fontSize: 13, marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
    marginBottom: 14,
  },
  hint: { color: "#aaa", textAlign: "center", paddingVertical: 16 },
  dayBtn: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 70,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dayBtnActive: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  dayName: { fontSize: 12, color: "#888" },
  dayNum: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 2,
  },
  dayMonth: { fontSize: 11, color: "#aaa" },
  dayTextActive: { color: "#fff" },
  // ← Sửa: bỏ gap, dùng margin trên từng slot
  slotGrid: { flexDirection: "row", flexWrap: "wrap" },
  slotBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f0f4ff",
    borderWidth: 1,
    borderColor: "#c5d5fb",
    margin: 5,
  },
  slotBtnActive: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  slotText: { color: "#1a73e8", fontWeight: "600", fontSize: 14 },
  slotTextActive: { color: "#fff" },
  noSlot: { alignItems: "center", paddingVertical: 20 },
  noSlotText: { color: "#888", marginTop: 8, textAlign: "center" },
  summary: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryLabel: { color: "#888" },
  summaryValue: { fontWeight: "600", color: "#333" },
  bookBtn: {
    backgroundColor: "#1a73e8",
    margin: 16,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  bookBtnDisabled: { backgroundColor: "#b0bec5" },
  bookBtnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});
