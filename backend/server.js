const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/doctors", require("./src/routes/doctorRoutes"));
app.use("/api/appointments", require("./src/routes/appointmentRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/doctor-auth", require("./src/routes/doctorAuthRoutes"));
app.use(
  "/api/doctor-appointments",
  require("./src/routes/doctorAppointmentRoutes"),
);
// Health check
app.get("/", (req, res) => {
  res.json({ message: "API đặt lịch khám đang chạy!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy endpoint này" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
