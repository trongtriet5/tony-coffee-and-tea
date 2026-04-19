"use client";
import React, { useState, useEffect } from "react";
import { optimisticCreateBranch, optimisticUpdateBranch, optimisticDeleteBranch, useBranches } from "@/lib/useData";
import { HiPlus, HiOfficeBuilding, HiCheck, HiPencilAlt, HiTrash } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";

export default function BranchesPage() {
  const currentUser = useCurrentUser();
  const { success: toastSuccess, error: toastError } = useToast();
  const { branches, isLoading, mutate: mutateBranches } = useBranches();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState({ name: "", address: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name) return;
    setLoading(true);
    try {
      if (editingId) {
        await optimisticUpdateBranch(editingId, branchForm);
        toastSuccess("Cập nhật chi nhánh thành công!");
      } else {
        await optimisticCreateBranch(branchForm);
        toastSuccess("Thêm chi nhánh mới thành công!");
      }
      setBranchForm({ name: "", address: "", phone: "" });
      setEditingId(null);
    } catch (error) {
      toastError("Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  const startEdit = (b: any) => {
    setEditingId(b.id);
    setBranchForm({ name: b.name, address: b.address || "", phone: b.phone || "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa chi nhánh này? Điều này có thể ảnh hưởng đến dữ liệu liên quan.")) return;
    try {
      setLoading(true);
      await optimisticDeleteBranch(id);
      toastSuccess("Xóa chi nhánh thành công!");
    } catch (error) {
      toastError("Chỉ có thể xóa chi nhánh chưa có dữ liệu giao dịch.");
    } finally { setLoading(false); }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 14, fontWeight: 700, outline: "none", transition: "0.2s", background: "var(--bg-primary)" };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "32px 24px" : "40px 40px 60px 120px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Quản lý chi nhánh</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 700, marginBottom: 32 }}>Quản lý danh sách chi nhánh trong hệ thống</p>

        <div style={{ opacity: 0, height: 0, overflow: "hidden" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32 }}>
          <div>
            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{editingId ? "Sửa chi nhánh" : "Thêm chi nhánh"}</h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={labelStyle}>Tên chi nhánh</label>
                  <input required style={inputStyle} value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Địa chỉ</label>
                  <input style={inputStyle} value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input style={inputStyle} value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} />
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%", padding: 16, background: "var(--accent)", color: "white", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
                  {loading ? <AiOutlineLoading3Quarters size={18} className="spin" /> : editingId ? "CẬP NHẬT" : "THÊM MỚI"}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>Danh Sách Chi Nhánh</h3>
              {isLoading ? (
                <AiOutlineLoading3Quarters size={32} className="spin" color="var(--accent)" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {branches.map(b => (
                    <div key={b.id} style={{ padding: 20, background: "var(--bg-primary)", borderRadius: 16, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{b.address || "Chưa có địa chỉ"}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => startEdit(b)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}><HiPencilAlt size={20} /></button>
                        <button onClick={() => handleDelete(b.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><HiTrash size={20} /></button>
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