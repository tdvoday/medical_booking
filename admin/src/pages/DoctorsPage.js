import React, { useEffect, useState } from "react";
import api from "../services/api";

const DEFAULT_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
];
const SPECIALTIES = [
  "Nội tổng quát",
  "Nhi khoa",
  "Tim mạch",
  "Da liễu",
  "Mắt",
  "Tai mũi họng",
  "Răng hàm mặt",
  "Sản phụ khoa",
  "Thần kinh",
  "Xương khớp",
  "Tiêu hóa",
  "Nội tiết",
];

const emptyForm = {
  name: "",
  specialty: SPECIALTIES[0],
  experience: "",
  fee: "",
  description: "",
  workingSchedule: [1, 2, 3, 4, 5].map((d) => ({
    dayOfWeek: d,
    slots: DEFAULT_SLOTS,
  })),
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data.doctors);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (doctor) => {
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      experience: doctor.experience,
      fee: doctor.fee,
      description: doctor.description || "",
      workingSchedule: doctor.workingSchedule || emptyForm.workingSchedule,
    });
    setEditId(doctor._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editId) {
        await api.put(`/admin/doctors/${editId}`, form);
      } else {
        await api.post("/admin/doctors", form);
      }
      setShowForm(false);
      fetchDoctors();
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ẩn bác sĩ này?")) return;
    await api.delete(`/admin/doctors/${id}`);
    fetchDoctors();
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>👨‍⚕️ Quản lý bác sĩ</h2>
        <button style={styles.addBtn} onClick={openAdd}>
          + Thêm bác sĩ
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          Đang tải...
        </div>
      ) : (
        <div style={styles.grid}>
          {doctors.map((d) => (
            <div key={d._id} style={styles.card}>
              <div style={styles.cardAvatar}>👨‍⚕️</div>
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>{d.name}</div>
                <div style={styles.cardSpecialty}>{d.specialty}</div>
                <div style={styles.cardMeta}>
                  ⭐ {d.rating} • {d.experience} năm KN
                </div>
                <div style={styles.cardFee}>
                  💰 {d.fee?.toLocaleString("vi-VN")}đ
                </div>
              </div>
              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => openEdit(d)}>
                  ✏️ Sửa
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(d._id)}
                >
                  🗑️ Ẩn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm/sửa bác sĩ */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>
              {editId ? "Sửa thông tin bác sĩ" : "Thêm bác sĩ mới"}
            </h3>
            <div style={styles.formGrid}>
              {[
                { label: "Họ tên", key: "name", type: "text" },
                {
                  label: "Số năm kinh nghiệm",
                  key: "experience",
                  type: "number",
                },
                { label: "Phí khám (VNĐ)", key: "fee", type: "number" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={styles.label}>{field.label}</label>
                  <input
                    style={styles.input}
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                  />
                </div>
              ))}
              <div>
                <label style={styles.label}>Chuyên khoa</label>
                <select
                  style={styles.input}
                  value={form.specialty}
                  onChange={(e) =>
                    setForm({ ...form, specialty: e.target.value })
                  }
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={styles.label}>Mô tả</label>
              <textarea
                style={{ ...styles.input, height: "80px", resize: "vertical" }}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div style={styles.modalBtns}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button
                style={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  pageTitle: { fontSize: "24px", fontWeight: "bold", color: "#333" },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardAvatar: { fontSize: "40px", marginBottom: "12px" },
  cardName: { fontWeight: "bold", fontSize: "16px", color: "#333" },
  cardSpecialty: { color: "#1a73e8", fontSize: "13px", marginTop: "4px" },
  cardMeta: { color: "#888", fontSize: "12px", marginTop: "6px" },
  cardFee: {
    color: "#10b981",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "4px",
  },
  cardActions: { display: "flex", gap: "8px", marginTop: "14px" },
  editBtn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#f0f4ff",
    color: "#1a73e8",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  deleteBtn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "28px",
    width: "500px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "20px" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "4px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  modalBtns: { display: "flex", gap: "10px", marginTop: "20px" },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f5f5f5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
