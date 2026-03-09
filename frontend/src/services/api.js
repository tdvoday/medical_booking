import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thay bằng IP máy tính của bạn (không dùng localhost)
const BASE_URL = "http://192.168.0.101:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// Tự động gắn token vào mỗi request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
