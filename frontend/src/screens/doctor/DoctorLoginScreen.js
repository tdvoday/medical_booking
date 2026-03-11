import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const showAlert = (title, message) => {
  if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
  else require("react-native").Alert.alert(title, message);
};

export default function DoctorLoginScreen({ navigation }) {
  const { doctorLogin } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password)
      return showAlert("Lỗi", "Vui lòng nhập đủ thông tin");
    try {
      setLoading(true);
      await doctorLogin(phone, password);
    } catch (err) {
      showAlert(
        "Đăng nhập thất bại",
        err.response?.data?.message || "Lỗi kết nối server",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 60 }}>👨‍⚕️</Text>
        <Text style={styles.title}>Cổng Bác Sĩ</Text>
        <Text style={styles.subtitle}>Đăng nhập để quản lý lịch khám</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.inputLabel}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 0911000001"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Link về patient login */}
      <TouchableOpacity
        style={styles.switchBtn}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.switchText}>
          Bạn là bệnh nhân?{" "}
          <Text style={styles.switchLink}>Đăng nhập tại đây</Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Tài khoản mẫu: 0911000001 / 123456</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f7ff", padding: 24 },
  header: { alignItems: "center", marginTop: 60, marginBottom: 36 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1a73e8", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 6 },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  inputLabel: { fontSize: 13, color: "#888", marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#1a73e8",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: { backgroundColor: "#b0bec5" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchBtn: { marginTop: 20, alignItems: "center" },
  switchText: { color: "#666", fontSize: 14 },
  switchLink: { color: "#1a73e8", fontWeight: "bold" },
  hint: { textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 16 },
});
