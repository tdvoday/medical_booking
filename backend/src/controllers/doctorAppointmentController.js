const Appointment = require("../models/Appointment");

// GET /api/doctor-appointments/my?date=YYYY-MM-DD
exports.getMyAppointments = async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = { doctor: req.doctor._id };
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;
    const appointments = await Appointment.find(filter)
      .populate("patient", "name phone email address")
      .sort({ date: 1, timeSlot: 1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/doctor-appointments/:id/done
exports.markDone = async (req, res) => {
  try {
    const apt = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.doctor._id,
    });
    if (!apt)
      return res.status(404).json({ message: "Không tìm thấy lịch khám" });
    const now = new Date();
    const aptTime = new Date(apt.date);
    const [h, m] = apt.timeSlot.split(":").map(Number);
    aptTime.setHours(h, m, 0, 0);
    if (now < aptTime) {
      return res.status(400).json({ message: "Chưa đến giờ khám" });
    }
    apt.status = "done";
    await apt.save();
    res.json({ appointment: apt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
