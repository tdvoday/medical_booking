const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const DEFAULT_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
];

const weekdaySchedule = [1, 2, 3, 4, 5].map((day) => ({
  dayOfWeek: day,
  slots: DEFAULT_SLOTS,
}));

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Đã kết nối MongoDB");

  // Xóa dữ liệu cũ
  // await User.deleteMany({});
  // await Doctor.deleteMany({});
  // await Appointment.deleteMany({});
  // console.log("🗑️  Đã xóa dữ liệu cũ");

  // Tạo users
  const hashedPw = await bcrypt.hash("123456", 12);
  const users = await User.insertMany([
    {
      name: "Admin Hệ Thống",
      phone: "0900000000",
      email: "admin@clinic.com",
      password: hashedPw,
      role: "admin",
    },
    {
      name: "Võ Hoàng Phúc",
      phone: "0901234567",
      email: "phuc@gmail.com",
      password: hashedPw,
      role: "patient",
      gender: "male",
    },
    {
      name: "Trần Thị Bình",
      phone: "0912345678",
      email: "binh@gmail.com",
      password: hashedPw,
      role: "patient",
      gender: "female",
    },
  ]);
  console.log(`👥 Đã tạo ${users.length} users`);

  // Tạo bác sĩ
  const doctors = await Doctor.insertMany([
    {
      name: "BS. Nguyễn Văn An",
      specialty: "Nội tổng quát",
      phone: "0911000001",
      password: "123456", // ← thêm
      experience: 10,
      fee: 200000,
      rating: 4.8,
      workingSchedule: weekdays,
    },
    {
      name: "BS. Trần Thị Bình",
      specialty: "Nhi khoa",
      phone: "0911000002",
      password: "123456", // ← thêm
      experience: 8,
      fee: 250000,
      rating: 4.7,
      workingSchedule: weekdays,
    },
    // ... các bác sĩ khác thêm phone/password tương tự
  ]);
  console.log(`👨‍⚕️ Đã tạo ${doctors.length} bác sĩ`);

  console.log("\n=============================");
  console.log("✅ SEED THÀNH CÔNG!");
  console.log("-----------------------------");
  console.log("🔐 Tài khoản test:");
  console.log("   Admin    : 0900000000 / 123456");
  console.log("   Bệnh nhân: 0901234567 / 123456");
  console.log("=============================\n");

  process.exit(0);
};

seedData().catch((err) => {
  console.error("❌ Seed lỗi:", err);
  process.exit(1);
});
