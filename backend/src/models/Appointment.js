const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Vui lòng chọn ngày khám"],
    },
    timeSlot: {
      type: String,
      required: [true, "Vui lòng chọn giờ khám"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "done"],
      default: "pending",
    },
    symptoms: {
      type: String, // Mô tả triệu chứng
      default: "",
    },
    note: {
      type: String, // Ghi chú thêm từ bệnh nhân
      default: "",
    },
    cancelReason: {
      type: String, // Lý do hủy lịch
      default: "",
    },
    // Kết quả khám (do bác sĩ/admin nhập sau khi khám)
    diagnosis: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Index để tránh đặt trùng lịch
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: false });

module.exports = mongoose.model("Appointment", appointmentSchema);
