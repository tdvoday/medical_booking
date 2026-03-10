import React, { useState, useContext } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require("react-native");
    Alert.alert(title, message);
  }
};

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate
    if (!name || !phone || !password || !confirm) {
      return showAlert("Lỗi", "Vui lòng điền đầy đủ thông tin");
    }
    if (password !== confirm) {
      return showAlert("Lỗi", "Mật khẩu xác nhận không khớp");
    }
    if (password.length < 6) {
      return showAlert("Lỗi", "Mật khẩu tối thiểu 6 ký tự");
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone)) {
      return showAlert("Lỗi", "Số điện thoại không hợp lệ");
    }

    try {
      setLoading(true);
      await register(name, phone, password);
      // AuthContext tự động chuyển sang AppStack
    } catch (err) {
      showAlert(
        "Đăng ký thất bại",
        err.response?.data?.message || "Lỗi kết nối server",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Đăng ký để đặt lịch khám</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại (VD: 0901234567)"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>
            Đã có tài khoản? <Text style={styles.link}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a73e8",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#1a73e8",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#b0bec5" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: { textAlign: "center", marginTop: 20, color: "#666" },
  link: { color: "#1a73e8", fontWeight: "bold" },
});
