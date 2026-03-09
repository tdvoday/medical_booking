import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thay 192.168.x.x bằng IP máy tính của bạn (chạy ipconfig để xem)
const BASE_URL = "http://192.168.0.101:5000/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
