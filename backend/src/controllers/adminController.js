const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    const appointments = await Appointment.find(filter)
      .populate("doctor", "name specialty")
      .populate("patient", "name phone")
      .sort({ date: -1 });
    res.json({ total: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ message: "Thêm bác sĩ thành công!", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doctor)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    res.json({ message: "Cập nhật thành công!", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Đã ẩn bác sĩ thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "patient" });
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const totalAppointments = await Appointment.countDocuments();
    const statusStats = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json({ totalUsers, totalDoctors, totalAppointments, statusStats });
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
