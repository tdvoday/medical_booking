const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;
    let filter = { isActive: true };
    if (specialty) filter.specialty = specialty;
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
      ];
    const doctors = await Doctor.find(filter).select("-workingSchedule");
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date)
      return res.status(400).json({ message: "Vui lòng truyền tham số date" });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const schedule = doctor.workingSchedule.find(
      (s) => s.dayOfWeek === dayOfWeek,
    );
    if (!schedule)
      return res.json({ slots: [], message: "Bác sĩ không làm việc ngày này" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      doctor: req.params.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ["cancelled"] },
    });

    const bookedSlots = booked.map((a) => a.timeSlot);
    const availableSlots = schedule.slots.filter(
      (s) => !bookedSlots.includes(s),
    );
    res.json({ date, availableSlots, bookedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.distinct("specialty", { isActive: true });
    res.json({ specialties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  getSpecialties,
};
