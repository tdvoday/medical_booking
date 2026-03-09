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
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Appointment.deleteMany({});
  console.log("🗑️  Đã xóa dữ liệu cũ");

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
      name: "BS. Nguyễn Hoàng Nam",
      specialty: "Nội tổng quát",
      experience: 10,
      rating: 4.8,
      fee: 200000,
      description: "Chuyên gia khám và điều trị các bệnh nội khoa tổng quát",
      workingSchedule: weekdaySchedule,
    },
    {
      name: "BS. Lê Thị Thu Hà",
      specialty: "Nhi khoa",
      experience: 8,
      rating: 4.9,
      fee: 220000,
      description: "Chuyên khám và điều trị bệnh trẻ em từ 0-15 tuổi",
      workingSchedule: weekdaySchedule,
    },
    {
      name: "BS. Phạm Minh Đức",
      specialty: "Tim mạch",
      experience: 15,
      rating: 4.7,
      fee: 300000,
      description: "Chuyên gia tim mạch, điều trị tăng huyết áp",
      workingSchedule: weekdaySchedule,
    },
    {
      name: "BS. Trần Văn Khoa",
      specialty: "Da liễu",
      experience: 6,
      rating: 4.6,
      fee: 180000,
      description: "Điều trị các bệnh về da: mụn, viêm da, nấm da",
      workingSchedule: weekdaySchedule,
    },
    {
      name: "BS. Ngô Thị Lan",
      specialty: "Sản phụ khoa",
      experience: 12,
      rating: 4.9,
      fee: 250000,
      description: "Khám thai định kỳ, điều trị bệnh phụ khoa",
      workingSchedule: weekdaySchedule,
    },
    {
      name: "BS. Võ Thanh Tùng",
      specialty: "Xương khớp",
      experience: 9,
      rating: 4.7,
      fee: 220000,
      description: "Điều trị thoát vị đĩa đệm, thoái hóa khớp",
      workingSchedule: weekdaySchedule,
    },
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
