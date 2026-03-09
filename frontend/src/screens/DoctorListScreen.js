import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";

export default function DoctorListScreen({ route, navigation }) {
  const { specialty, search: initSearch } = route.params || {};
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initSearch || "");
  const [selected, setSelected] = useState(specialty || "");

  const SPECIALTIES = [
    "Tất cả",
    "Nội tổng quát",
    "Nhi khoa",
    "Tim mạch",
    "Da liễu",
    "Xương khớp",
    "Sản phụ khoa",
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selected]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selected && selected !== "Tất cả") params.specialty = selected;
      if (search) params.search = search;
      const res = await api.get("/doctors", { params });
      setDoctors(res.data.doctors);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bác sĩ..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchDoctors}
          returnKeyType="search"
        />
      </View>

      {/* Filter chuyên khoa */}
      <FlatList
        horizontal
        data={SPECIALTIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterBtn,
              selected === item && styles.filterBtnActive,
            ]}
            onPress={() => setSelected(item)}
          >
            <Text
              style={[
                styles.filterText,
                selected === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Danh sách bác sĩ */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1a73e8"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={styles.emptyText}>Không tìm thấy bác sĩ</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("DoctorDetail", { doctorId: item._id })
              }
            >
              <View style={styles.avatar}>
                <Text style={{ fontSize: 32 }}>👨‍⚕️</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.specialty}>{item.specialty}</Text>
                <Text style={styles.exp}>
                  ⭐ {item.rating} • {item.experience} năm kinh nghiệm
                </Text>
                <Text style={styles.fee}>
                  💰 {item.fee?.toLocaleString("vi-VN")}đ / lần
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  filterList: { paddingHorizontal: 12, marginBottom: 8, maxHeight: 50 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterBtnActive: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  filterText: { color: "#666", fontSize: 13 },
  filterTextActive: { color: "#fff", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#e8f0fe",
    borderRadius: 30,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontWeight: "bold", fontSize: 15, color: "#333" },
  specialty: { color: "#1a73e8", fontSize: 13, marginTop: 2 },
  exp: { color: "#888", fontSize: 12, marginTop: 3 },
  fee: { color: "#2e7d32", fontSize: 12, marginTop: 3, fontWeight: "600" },
  arrow: { fontSize: 24, color: "#ccc" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#888", marginTop: 12, fontSize: 15 },
});
