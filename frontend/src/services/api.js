import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : "http://192.168.0.101:5000/api"; // ← thay IP của bạn

// API cho Patient
const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// API cho Doctor
export const doctorApi = axios.create({ baseURL: BASE_URL });
doctorApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("doctorToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
