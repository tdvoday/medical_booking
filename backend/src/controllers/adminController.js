const bcrypt = require("bcryptjs");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// GET /api/admin/appointments
const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    if (date) filter.date = new Date(date);

    const appointments = await Appointment.find(filter)
      .populate("doctor", "name specialty fee")
      .populate("patient", "name phone email")
      .sort({ date: -1 });

    res.json({ total: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!appointment)
      return res.status(404).json({ message: "Không tìm thấy lịch khám" });
    res.json({ message: "Cập nhật thành công!", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/doctors
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      specialty,
      experience,
      fee,
      description,
      phone,
      password,
      workingSchedule,
    } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu cho bác sĩ" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập số điện thoại cho bác sĩ" });
    }

    const existed = await Doctor.findOne({ phone });
    if (existed) {
      return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
    }

    const hashedPw = await bcrypt.hash(password, 12);
    const doctor = await Doctor.create({
      name,
      specialty,
      experience,
      fee,
      description,
      phone,
      password: hashedPw,
      workingSchedule,
      isActive: true,
    });

    res.status(201).json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/doctors/:id
const updateDoctor = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const updateData = { ...rest };

    // Chỉ đổi password nếu admin nhập mới
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!doctor)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/doctors/:id
const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Đã ẩn bác sĩ thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      statusStats,
      topDoctors,
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $group: { _id: "$doctor", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        { $unwind: "$doctorInfo" },
        {
          $project: {
            name: "$doctorInfo.name",
            specialty: "$doctorInfo.specialty",
            count: 1,
          },
        },
      ]),
    ]);

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      statusStats,
      topDoctors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllAppointments,
  updateAppointmentStatus,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getStats,
};
