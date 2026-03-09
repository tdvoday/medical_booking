const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const register = async (req, res) => {
  try {
    const { name, phone, email, password, dateOfBirth, gender } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser)
      return res.status(400).json({ message: "Số điện thoại đã được đăng ký" });

    const user = await User.create({
      name,
      phone,
      email,
      password,
      dateOfBirth,
      gender,
    });
    res.status(201).json({
      message: "Đăng ký thành công!",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });

    const user = await User.findOne({ phone }).select("+password");
    if (!user)
      return res
        .status(401)
        .json({ message: "Số điện thoại hoặc mật khẩu không đúng" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Số điện thoại hoặc mật khẩu không đúng" });

    res.json({
      message: "Đăng nhập thành công!",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => res.json({ user: req.user });

const updateProfile = async (req, res) => {
  try {
    const { name, email, dateOfBirth, gender, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, dateOfBirth, gender, address },
      { new: true },
    );
    res.json({ message: "Cập nhật thành công!", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
