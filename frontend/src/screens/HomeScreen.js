import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const SPECIALTIES = [
  { icon: "🫀", name: "Tim mạch" },
  { icon: "🧒", name: "Nhi khoa" },
  { icon: "🦷", name: "Răng hàm mặt" },
  { icon: "👁️", name: "Mắt" },
  { icon: "🧴", name: "Da liễu" },
  { icon: "🦴", name: "Xương khớp" },
  { icon: "🧠", name: "Thần kinh" },
  { icon: "🩺", name: "Nội tổng quát" },
];

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data.doctors);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào 👋</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <Text style={styles.avatar}>🏥</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bác sĩ, chuyên khoa..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => navigation.navigate("DoctorList", { search })}
        />
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Đặt lịch khám dễ dàng</Text>
        <Text style={styles.bannerSub}>Hàng trăm bác sĩ chuyên khoa</Text>
        <TouchableOpacity
          style={styles.bannerBtn}
          onPress={() => navigation.navigate("DoctorList", {})}
        >
          <Text style={styles.bannerBtnText}>Đặt lịch ngay →</Text>
        </TouchableOpacity>
      </View>

      {/* Chuyên khoa */}
      <Text style={styles.sectionTitle}>Chuyên khoa</Text>
      <FlatList
        data={SPECIALTIES}
        keyExtractor={(item) => item.name}
        numColumns={4}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.specialtyItem}
            onPress={() =>
              navigation.navigate("DoctorList", { specialty: item.name })
            }
          >
            <View style={styles.specialtyIcon}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            </View>
            <Text style={styles.specialtyName} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Bác sĩ nổi bật */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bác sĩ nổi bật</Text>
        <TouchableOpacity onPress={() => navigation.navigate("DoctorList", {})}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1a73e8"
          style={{ marginTop: 20 }}
        />
      ) : (
        doctors.slice(0, 4).map((doctor) => (
          <TouchableOpacity
            key={doctor._id}
            style={styles.doctorCard}
            onPress={() =>
              navigation.navigate("DoctorDetail", { doctorId: doctor._id })
            }
          >
            <View style={styles.doctorAvatar}>
              <Text style={{ fontSize: 32 }}>👨‍⚕️</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <Text style={styles.doctorExp}>
                ⭐ {doctor.rating} • {doctor.experience} năm kinh nghiệm
              </Text>
            </View>
            <View style={styles.doctorFee}>
              <Text style={styles.feeText}>
                {(doctor.fee / 1000).toFixed(0)}k
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#1a73e8",
  },
  greeting: { color: "#fff", opacity: 0.85, fontSize: 14 },
  userName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  avatar: { fontSize: 36 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 3,
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  banner: {
    backgroundColor: "#1a73e8",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  bannerSub: { color: "#fff", opacity: 0.85, marginTop: 4 },
  bannerBtn: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  bannerBtnText: { color: "#1a73e8", fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  seeAll: { color: "#1a73e8", fontSize: 13 },
  specialtyItem: { flex: 1, alignItems: "center", margin: 6 },
  specialtyIcon: {
    backgroundColor: "#e8f0fe",
    borderRadius: 16,
    padding: 14,
    marginBottom: 6,
  },
  specialtyName: { fontSize: 11, textAlign: "center", color: "#444" },
  doctorCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    alignItems: "center",
  },
  doctorAvatar: {
    backgroundColor: "#e8f0fe",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorInfo: { flex: 1 },
  doctorName: { fontWeight: "bold", fontSize: 15, color: "#333" },
  doctorSpecialty: { color: "#1a73e8", fontSize: 13, marginTop: 2 },
  doctorExp: { color: "#888", fontSize: 12, marginTop: 4 },
  doctorFee: { backgroundColor: "#e8f0fe", borderRadius: 8, padding: 8 },
  feeText: { color: "#1a73e8", fontWeight: "bold", fontSize: 13 },
});
