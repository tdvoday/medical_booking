const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      unique: true,
      match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ"],
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [6, "Mật khẩu tối thiểu 6 ký tự"],
      select: false, // Không trả về password khi query
    },
    role: {
      type: String,
      enum: ["patient", "admin"],
      default: "patient",
    },
    avatar: {
      type: String,
      default: "",
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: String,
  },
  { timestamps: true },
);

// Hash password trước khi lưu
// ✅ Mới — bỏ next, dùng async thuần
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// So sánh password khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
