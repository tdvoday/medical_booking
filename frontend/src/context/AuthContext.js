import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { doctorApi } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null); // ← thêm
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        // Load patient
        const savedToken = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");
        if (savedToken && savedUser) {
          setUser(JSON.parse(savedUser));
          try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
            await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
          } catch (err) {}
        }

        // Load doctor
        const doctorToken = await AsyncStorage.getItem("doctorToken");
        const savedDoctor = await AsyncStorage.getItem("doctor");
        if (doctorToken && savedDoctor) {
          setDoctor(JSON.parse(savedDoctor));
          try {
            const res = await doctorApi.get("/doctor-auth/me");
            setDoctor(res.data.doctor);
            await AsyncStorage.setItem(
              "doctor",
              JSON.stringify(res.data.doctor),
            );
          } catch (err) {}
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

  // ← Doctor login/logout
  const doctorLogin = async (phone, password) => {
    const res = await doctorApi.post("/doctor-auth/login", { phone, password });
    await AsyncStorage.setItem("doctorToken", res.data.token);
    await AsyncStorage.setItem("doctor", JSON.stringify(res.data.doctor));
    setDoctor(res.data.doctor);
    return res.data;
  };

  const doctorLogout = async () => {
    await AsyncStorage.removeItem("doctorToken");
    await AsyncStorage.removeItem("doctor");
    setDoctor(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        doctor,
        loading,
        login,
        register,
        logout,
        updateUser,
        doctorLogin,
        doctorLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
