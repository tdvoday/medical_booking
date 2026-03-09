const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms, note } = req.body;
    if (!doctorId || !date || !timeSlot)
      return res
        .status(400)
        .json({ message: "Thiếu doctorId, date hoặc timeSlot" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $nin: ["cancelled"] },
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Khung giờ này đã có người đặt!" });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      symptoms: symptoms || "",
      note: note || "",
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("doctor", "name specialty fee")
      .populate("patient", "name phone");

    res
      .status(201)
      .json({ message: "Đặt lịch thành công!", appointment: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { patient: req.user._id };
    if (status) filter.status = status;
    const appointments = await Appointment.find(filter)
      .populate("doctor", "name specialty avatar fee")
      .sort({ date: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor", "name specialty fee")
      .populate("patient", "name phone");
    if (!appointment)
      return res.status(404).json({ message: "Không tìm thấy lịch khám" });
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Không tìm thấy lịch khám" });
    if (appointment.patient.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Không có quyền hủy lịch này" });
    if (["cancelled", "done"].includes(appointment.status))
      return res.status(400).json({ message: "Không thể hủy lịch này" });

    appointment.status = "cancelled";
    appointment.cancelReason = req.body.cancelReason || "Người dùng hủy";
    await appointment.save();
    res.json({ message: "Hủy lịch thành công!", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
};
