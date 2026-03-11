const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id, type: "doctor" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// POST /api/doctor-auth/login
exports.loginDoctor = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const doctor = await Doctor.findOne({ phone, isActive: true }).select(
      "+password",
    );
    if (!doctor || !doctor.password) {
      return res
        .status(401)
        .json({ message: "Số điện thoại hoặc mật khẩu không đúng" });
    }
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Số điện thoại hoặc mật khẩu không đúng" });
    }
    const token = generateToken(doctor._id);
    res.json({
      token,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialty: doctor.specialty,
        phone: doctor.phone,
        avatar: doctor.avatar,
        experience: doctor.experience,
        fee: doctor.fee,
        rating: doctor.rating,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctor-auth/me
exports.getMe = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor._id);
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
