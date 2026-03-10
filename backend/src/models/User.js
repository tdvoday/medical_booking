const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["patient", "admin"], default: "patient" },
    avatar: { type: String, default: "" },
    address: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: Date,
  },
  { timestamps: true },
);

// ✅ Đúng — không có tham số next
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
