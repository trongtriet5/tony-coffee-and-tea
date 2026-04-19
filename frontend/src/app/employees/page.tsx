"use client";
import React, { useState, useEffect, useMemo } from "react";
import { optimisticCreateEmployee, optimisticUpdateEmployee, optimisticDeleteEmployee, useEmployees, useBranches } from "@/lib/useData";
import type { Employee, Branch } from "@/types";
import { HiPlus, HiUsers, HiCheck, HiPencilAlt, HiTrash, HiShieldCheck, HiOutlineUser } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";

export default function EmployeesPage() {
  const currentUser = useCurrentUser();
  const { success: toastSuccess, error: toastError } = useToast();
  const { employees, isLoading: empLoading, mutate: mutateEmployees } = useEmployees();
  const { branches, isLoading: branchLoading } = useBranches();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultBranchId = useMemo(() => branches[0]?.id || "", [branches]);

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "STAFF",
    branch_id: defaultBranchId
  });

  useEffect(() => {
    if (!form.branch_id && defaultBranchId) {
      setForm(prev => ({ ...prev, branch_id: defaultBranchId }));
    }
  }, [defaultBranchId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete (payload as any).password;
        await optimisticUpdateEmployee(editingId, payload);
        toastSuccess("Cập nhật tài khoản thành công!");
      } else {
        await optimisticCreateEmployee(form);
        toastSuccess("Thêm tài khoản mới thành công!");
      }
      setForm({ username: "", password: "", name: "", role: "STAFF", branch_id: defaultBranchId });
      setEditingId(null);
    } catch (error: any) {
      toastError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      username: emp.username || "",
      password: "",
      name: emp.name,
      role: emp.role,
      branch_id: emp.branch_id || ""
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa tài khoản này?")) return;
    try {
      setLoading(true);
      await optimisticDeleteEmployee(id);
      toastSuccess("Xóa tài khoản thành công!");
    } catch (error) {
      toastError("Lỗi khi xóa tài khoản.");
    } finally { setLoading(false); }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 14, fontWeight: 700, outline: "none", transition: "0.2s", background: "var(--bg-primary)" };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block" };

  const fetchLoading = empLoading || branchLoading;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "32px 24px" : "40px 40px 60px 120px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Quản lý tài khoản</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, marginBottom: 32 }}>Quản lý tài khoản quản lý & nhân viên các chi nhánh</p>

        <div style={{ opacity: 0, height: 0, overflow: "hidden" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 32 }}>
          <div>
            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, position: "sticky", top: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{editingId ? "Sửa tài khoản" : "Tạo tài khoản mới"}</h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={labelStyle}>Tên nhân viên</label>
                  <input required placeholder="VD: Nguyễn Văn A" style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Tên đăng nhập</label>
                  <input required placeholder="VD: van_a_01" style={inputStyle} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Mật khẩu {editingId && "(để trống nếu không đổi)"}</label>
                  <input type="password" required={!editingId} placeholder="••••••••" style={inputStyle} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>VAI TRÒ</label>
                  <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="STAFF">Nhân viên (Staff)</option>
                    <option value="MANAGER">Quản lý (Manager)</option>
                    <option value="ADMIN">Admin hệ thống</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>CHI NHÁNH</label>
                  <select style={inputStyle} value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })}>
                    <option value="">Global / Toàn hệ thống</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%", padding: 16, background: "var(--accent)", color: "white", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
                  {loading ? <AiOutlineLoading3Quarters size={18} className="spin" /> : editingId ? "CẬP NHẬT" : "TẠO TÀI KHOẢN"}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>Danh Sách Nhân Viên</h3>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>{employees.length} Accounts</div>
              </div>

              {fetchLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><AiOutlineLoading3Quarters size={32} className="spin" color="var(--accent)" /></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {employees.map(emp => (
                    <div key={emp.id} style={{ padding: "16px 20px", background: "var(--bg-primary)", borderRadius: 16, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: "white", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                          {emp.role === 'ADMIN' ? <HiShieldCheck size={24} /> : <HiOutlineUser size={24} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-primary)" }}>{emp.name} <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginLeft: 6 }}>@{emp.username}</span></div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", display: "flex", gap: 8, marginTop: 4 }}>
                            <span>{emp.role}</span>
                            <span style={{ color: "var(--text-muted)" }}>•</span>
                            <span>{(emp as any).branch?.name || "Global"}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(emp)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><HiPencilAlt size={18} /></button>
                        <button onClick={() => handleDelete(emp.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><HiTrash size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}