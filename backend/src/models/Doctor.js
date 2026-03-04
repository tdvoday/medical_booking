const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên bác sĩ"],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, "Vui lòng nhập chuyên khoa"],
      // Các chuyên khoa phổ biến
      enum: [
        "Nội tổng quát",
        "Nhi khoa",
        "Tim mạch",
        "Da liễu",
        "Mắt",
        "Tai mũi họng",
        "Răng hàm mặt",
        "Sản phụ khoa",
        "Thần kinh",
        "Xương khớp",
        "Tiêu hóa",
        "Nội tiết",
      ],
    },
    avatar: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    experience: {
      type: Number, // Số năm kinh nghiệm
      default: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    fee: {
      type: Number, // Phí khám (VNĐ)
      default: 200000,
    },
    // Lịch làm việc: mỗi ngày trong tuần có danh sách slot giờ
    workingSchedule: [
      {
        dayOfWeek: {
          type: Number, // 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
          required: true,
        },
        slots: [String], // ["08:00", "08:30", "09:00", "09:30", ...]
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", doctorSchema);
