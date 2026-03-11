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

  const forceReset = process.argv.includes("--force");

  if (!forceReset) {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount > 0) {
      console.log(
        '⚠️  Đã có dữ liệu. Dùng "npm run seed:force" để reset sạch!',
      );
      process.exit(0);
    }
  }

  // Xóa sạch dữ liệu cũ
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Appointment.deleteMany({});
  console.log("🗑️  Đã xóa dữ liệu cũ");

  // Hash password
  const hashedPw = await bcrypt.hash("123456", 12);

  // Tạo users
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

  // Hash password cho doctor (insertMany bỏ qua pre-save hook)
  const hashedDoctorPw = await bcrypt.hash("123456", 12);

  // Tạo bác sĩ — dùng create() từng cái để trigger pre-save hook
  const doctorData = [
    {
      name: "BS. Nguyễn Văn An",
      specialty: "Nội tổng quát",
      phone: "0911000001",
      experience: 10,
      fee: 200000,
      rating: 4.8,
    },
    {
      name: "BS. Trần Thị Bình",
      specialty: "Nhi khoa",
      phone: "0911000002",
      experience: 8,
      fee: 250000,
      rating: 4.7,
    },
    {
      name: "BS. Lê Minh Châu",
      specialty: "Tim mạch",
      phone: "0911000003",
      experience: 15,
      fee: 300000,
      rating: 4.9,
    },
    {
      name: "BS. Phạm Thị Dung",
      specialty: "Da liễu",
      phone: "0911000004",
      experience: 6,
      fee: 180000,
      rating: 4.6,
    },
    {
      name: "BS. Hoàng Văn Em",
      specialty: "Mắt",
      phone: "0911000005",
      experience: 12,
      fee: 220000,
      rating: 4.7,
    },
    {
      name: "BS. Ngô Thị Phượng",
      specialty: "Tai mũi họng",
      phone: "0911000006",
      experience: 9,
      fee: 200000,
      rating: 4.5,
    },
  ];

  // Dùng insertMany với password đã hash sẵn
  const doctors = await Doctor.insertMany(
    doctorData.map((d) => ({
      ...d,
      password: hashedDoctorPw,
      isActive: true,
      description: `Bác sĩ chuyên khoa ${d.specialty} với ${d.experience} năm kinh nghiệm.`,
      workingSchedule: weekdaySchedule,
    })),
  );
  console.log(`👨‍⚕️ Đã tạo ${doctors.length} bác sĩ`);

  console.log("\n=============================");
  console.log("✅ SEED THÀNH CÔNG!");
  console.log("-----------------------------");
  console.log("🔐 Tài khoản test:");
  console.log("   Admin      : 0900000000 / 123456");
  console.log("   Bệnh nhân  : 0901234567 / 123456");
  console.log("   Bác sĩ 1   : 0911000001 / 123456");
  console.log("   Bác sĩ 2   : 0911000002 / 123456");
  console.log("   Bác sĩ 3   : 0911000003 / 123456");
  console.log("=============================\n");

  process.exit(0);
};

seedData().catch((err) => {
  console.error("❌ Seed lỗi:", err);
  process.exit(1);
});
