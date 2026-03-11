const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user)
      return res.status(401).json({ message: "User không tồn tại" });

    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") next();
  else res.status(403).json({ message: "Không có quyền" });
};

const protectDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "doctor")
      return res.status(401).json({ message: "Token không hợp lệ" });

    req.doctor = await Doctor.findById(decoded.id);

    if (!req.doctor)
      return res.status(401).json({ message: "Bác sĩ không tồn tại" });

    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = { protect, adminOnly, protectDoctor };
