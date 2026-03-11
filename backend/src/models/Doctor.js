const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const workingScheduleSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true },
  slots: [String],
});

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    workingSchedule: [workingScheduleSchema],
    // ← Thêm mới
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
  },
  { timestamps: true },
);

doctorSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

doctorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Doctor", doctorSchema);
