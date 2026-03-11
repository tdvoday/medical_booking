import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

// Patient screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import DoctorListScreen from "../screens/DoctorListScreen";
import DoctorDetailScreen from "../screens/DoctorDetailScreen";
import BookingScreen from "../screens/BookingScreen";
import AppointmentScreen from "../screens/AppointmentScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Doctor screens
import DoctorLoginScreen from "../screens/doctor/DoctorLoginScreen";
import DoctorHomeScreen from "../screens/doctor/DoctorHomeScreen";
import DoctorScheduleScreen from "../screens/doctor/DoctorScheduleScreen";
import DoctorAppointmentDetailScreen from "../screens/doctor/DoctorAppointmentDetailScreen";
import DoctorProfileScreen from "../screens/doctor/DoctorProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const DoctorTab = createBottomTabNavigator();

// Patient bottom tabs
function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#1a73e8" }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Trang chủ", tabBarIcon: () => "🏠" }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentScreen}
        options={{ tabBarLabel: "Lịch khám", tabBarIcon: () => "📅" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Cá nhân", tabBarIcon: () => "👤" }}
      />
    </Tab.Navigator>
  );
}

// Doctor bottom tabs
function DoctorTabs() {
  return (
    <DoctorTab.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#1a73e8" }}
    >
      <DoctorTab.Screen
        name="DoctorHome"
        component={DoctorHomeScreen}
        options={{ tabBarLabel: "Trang chủ", tabBarIcon: () => "🏠" }}
      />
      <DoctorTab.Screen
        name="DoctorSchedule"
        component={DoctorScheduleScreen}
        options={{ tabBarLabel: "Lịch khám", tabBarIcon: () => "📅" }}
      />
      <DoctorTab.Screen
        name="DoctorProfile"
        component={DoctorProfileScreen}
        options={{ tabBarLabel: "Hồ sơ", tabBarIcon: () => "👨‍⚕️" }}
      />
    </DoctorTab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, doctor, loading } = useContext(AuthContext);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Chưa đăng nhập → hiện cả 2 login */}
        {!user && !doctor && (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="DoctorLogin" component={DoctorLoginScreen} />
          </>
        )}

        {/* Đã đăng nhập là Patient */}
        {user && !doctor && (
          <>
            <Stack.Screen name="MainTabs" component={PatientTabs} />
            <Stack.Screen name="DoctorList" component={DoctorListScreen} />
            <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
          </>
        )}

        {/* Đã đăng nhập là Doctor */}
        {doctor && !user && (
          <>
            <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
            <Stack.Screen
              name="DoctorAppointmentDetail"
              component={DoctorAppointmentDetailScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
