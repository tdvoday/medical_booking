import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");

        if (savedToken && savedUser) {
          // Hiển thị user từ storage trước
          setUser(JSON.parse(savedUser));

          // Sau đó cập nhật từ server
          try {
            const res = await api.get("/auth/me");
            const freshUser = res.data.user;
            setUser(freshUser);
            await AsyncStorage.setItem("user", JSON.stringify(freshUser));
          } catch (err) {
            // Nếu lỗi server thì vẫn giữ user từ storage
            // KHÔNG xóa user ở đây
            console.log("Không thể refresh từ server, dùng dữ liệu local");
          }
        }
      } catch (err) {
        console.log("Lỗi load storage:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStorage();
  }, []);

  const login = async (phone, password) => {
    const res = await api.post("/auth/login", { phone, password });
    await AsyncStorage.setItem("token", res.data.token);
    await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    try {
      const me = await api.get("/auth/me");
      setUser(me.data.user);
      await AsyncStorage.setItem("user", JSON.stringify(me.data.user));
    } catch (err) {}
    return res.data;
  };

  const register = async (name, phone, password) => {
    const res = await api.post("/auth/register", { name, phone, password });
    await AsyncStorage.setItem("token", res.data.token);
    await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const updateUser = async (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
