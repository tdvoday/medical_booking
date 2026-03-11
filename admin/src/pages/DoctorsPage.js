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
  phone: "",
  password: "",
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
  const [search, setSearch] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [error, setError] = useState("");

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
    setError("");
    setShowForm(true);
  };

  const openEdit = (doctor) => {
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      experience: doctor.experience,
      fee: doctor.fee,
      description: doctor.description || "",
      phone: doctor.phone || "",
      password: "", // để trống = không đổi
      workingSchedule: doctor.workingSchedule || emptyForm.workingSchedule,
    });
    setEditId(doctor._id);
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    // Validate
    if (!form.name.trim()) return setError("Vui lòng nhập họ tên bác sĩ");
    if (!form.phone.trim()) return setError("Vui lòng nhập số điện thoại");
    if (!editId && !form.password.trim())
      return setError("Vui lòng nhập mật khẩu");

    try {
      setSaving(true);
      setError("");
      if (editId) {
        await api.put(`/admin/doctors/${editId}`, form);
      } else {
        await api.post("/admin/doctors", form);
      }
      setShowForm(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Ẩn bác sĩ "${name}" khỏi hệ thống?`)) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      console.log(err);
    }
  };

  // Lọc theo tìm kiếm + chuyên khoa
  const filtered = doctors.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) &&
      (filterSpec === "" || d.specialty === filterSpec),
  );

  // Danh sách chuyên khoa có trong DB
  const specs = [...new Set(doctors.map((d) => d.specialty))];

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>👨‍⚕️ Quản lý bác sĩ</h2>
        <button style={styles.addBtn} onClick={openAdd}>
          + Thêm bác sĩ
        </button>
      </div>

      {/* Tìm kiếm + lọc */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <span>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Tìm tên bác sĩ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
        <select
          style={styles.specFilter}
          value={filterSpec}
          onChange={(e) => setFilterSpec(e.target.value)}
        >
          <option value="">Tất cả chuyên khoa</option>
          {specs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Tổng số */}
      <div style={styles.summary}>
        Hiển thị <strong>{filtered.length}</strong> / {doctors.length} bác sĩ
      </div>

      {/* Danh sách */}
      {loading ? (
        <div style={styles.loading}>Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>📭 Không tìm thấy bác sĩ nào</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((d) => (
            <div key={d._id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardAvatar}>👨‍⚕️</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.cardName}>{d.name}</div>
                  <div style={styles.cardSpecialty}>{d.specialty}</div>
                </div>
                <div
                  style={{
                    ...styles.activeBadge,
                    backgroundColor: d.isActive ? "#ecfdf5" : "#fef2f2",
                    color: d.isActive ? "#10b981" : "#ef4444",
                  }}
                >
                  {d.isActive ? "Hoạt động" : "Đã ẩn"}
                </div>
              </div>

              <div style={styles.cardStats}>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>⭐</span>
                  <span>{d.rating}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>📅</span>
                  <span>{d.experience} năm</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>💰</span>
                  <span>{Number(d.fee).toLocaleString("vi-VN")}đ</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>📱</span>
                  <span>{d.phone || "Chưa có"}</span>
                </div>
              </div>

              {d.description && (
                <div style={styles.cardDesc} title={d.description}>
                  {d.description.length > 80
                    ? d.description.slice(0, 80) + "..."
                    : d.description}
                </div>
              )}

              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => openEdit(d)}>
                  ✏️ Sửa
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(d._id, d.name)}
                >
                  🗑️ {d.isActive ? "Ẩn" : "Đã ẩn"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm/sửa */}
      {showForm && (
        <div style={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editId ? "✏️ Sửa thông tin bác sĩ" : "➕ Thêm bác sĩ mới"}
              </h3>
              <button
                style={styles.modalCloseX}
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            {/* Error */}
            {error && <div style={styles.errorBox}>{error}</div>}

            {/* Form */}
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Họ tên bác sĩ *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="VD: BS. Nguyễn Văn An"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Chuyên khoa *</label>
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

              <div>
                <label style={styles.label}>Số điện thoại đăng nhập *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="VD: 0911000007"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Mật khẩu{" "}
                  {editId && (
                    <span style={styles.optionalText}>
                      (để trống = không đổi)
                    </span>
                  )}
                  {!editId && " *"}
                </label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder={
                    editId ? "Nhập để đổi mật khẩu" : "Mật khẩu đăng nhập app"
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label style={styles.label}>Số năm kinh nghiệm</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="VD: 10"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                />
              </div>

              <div>
                <label style={styles.label}>Phí khám (VNĐ)</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="VD: 200000"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>Mô tả</label>
              <textarea
                style={{ ...styles.input, height: "80px", resize: "vertical" }}
                placeholder="Giới thiệu về bác sĩ..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Hướng dẫn đăng nhập */}
            <div style={styles.loginHint}>
              <span style={{ fontSize: "16px" }}>💡</span>
              <span>
                Bác sĩ dùng <strong>Số điện thoại</strong> +{" "}
                <strong>Mật khẩu</strong> để đăng nhập vào app di động
              </span>
            </div>

            {/* Buttons */}
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
                {saving
                  ? "Đang lưu..."
                  : editId
                    ? "💾 Lưu thay đổi"
                    : "➕ Thêm bác sĩ"}
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
    marginBottom: "20px",
  },
  pageTitle: { fontSize: "24px", fontWeight: "bold", color: "#333", margin: 0 },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    flex: 1,
    minWidth: "200px",
  },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: "14px" },
  clearBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#aaa",
    fontSize: "14px",
  },
  specFilter: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  summary: { color: "#888", fontSize: "13px", marginBottom: "16px" },
  loading: { textAlign: "center", padding: "60px", color: "#888" },
  empty: {
    textAlign: "center",
    padding: "60px",
    color: "#aaa",
    fontSize: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  cardAvatar: { fontSize: "36px", flexShrink: 0 },
  cardName: { fontWeight: "bold", fontSize: "16px", color: "#333" },
  cardSpecialty: { color: "#1a73e8", fontSize: "13px", marginTop: "3px" },
  activeBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    flexShrink: 0,
  },
  cardStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    padding: "12px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#555",
  },
  statIcon: { fontSize: "14px" },
  cardDesc: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "14px",
    lineHeight: "1.5",
  },
  cardActions: { display: "flex", gap: "8px" },
  editBtn: {
    flex: 1,
    padding: "9px",
    backgroundColor: "#f0f4ff",
    color: "#1a73e8",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  deleteBtn: {
    flex: 1,
    padding: "9px",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  // Modal
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
    width: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 0",
  },
  modalTitle: { fontSize: "18px", fontWeight: "bold", margin: 0 },
  modalCloseX: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
    padding: "4px 8px",
  },
  errorBox: {
    margin: "12px 24px 0",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    padding: "20px 24px 0",
  },
  label: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "5px",
    display: "block",
  },
  optionalText: { color: "#aaa", fontSize: "11px", fontWeight: "normal" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  loginHint: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "16px 24px 0",
    backgroundColor: "#f0f7ff",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#555",
  },
  modalBtns: { display: "flex", gap: "10px", padding: "20px 24px 24px" },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f5f5f5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
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
    fontSize: "14px",
  },
};
