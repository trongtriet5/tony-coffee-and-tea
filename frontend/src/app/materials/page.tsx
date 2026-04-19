"use client";
import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Material, MaterialTransaction } from "@/types";
import {
  addMaterialTransaction,
  getMaterialTransactions, getInventoryReport,
  importMaterials, getMaterialTemplateUrl, exportMaterialsExcel,
  getAllTransactions
} from "@/lib/api";
import { optimisticCreateMaterial, optimisticUpdateMaterial, optimisticDeleteMaterial, useMaterials, useBranches } from "@/lib/useData";
import { HiPlus, HiBeaker, HiExclamationCircle, HiCheck, HiPencilAlt, HiBadgeCheck, HiBan, HiTrash, HiDownload, HiCollection, HiUpload, HiDocumentText, HiOutlineClipboardList, HiArrowRight } from "react-icons/hi";
import { AiOutlineLoading3Quarters, AiOutlineStock } from "react-icons/ai";
import { useToast } from "@/components/ToastProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function MaterialsPage() {
  const currentUser = useCurrentUser();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const { materials, isLoading: materialsLoading, mutate: mutateMaterials } = useMaterials(selectedBranchId || undefined);
  const { branches, isLoading: branchLoading } = useBranches();
  const [transactions, setTransactions] = useState<MaterialTransaction[]>([]);

  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [materialForm, setMaterialForm] = useState({ name: "", unit: "", cost_per_unit: "", stock_current: "", safety_stock: "" });
  const [transactionForm, setTransactionForm] = useState({ type: "IN" as const, quantity: "", note: "" });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (currentUser && !selectedBranchId) {
      if (currentUser.branch_id) {
        setSelectedBranchId(currentUser.branch_id);
      }
    }
  }, [currentUser, selectedBranchId]);

  // Fetch transactions separately since they're not in the hook
  useEffect(() => {
    if (currentUser?.role !== 'ADMIN' && !selectedBranchId) return;
    const paramBranch = selectedBranchId === "" ? undefined : selectedBranchId;
    getAllTransactions(paramBranch).then(setTransactions);
  }, [currentUser, selectedBranchId]);

  const handleCreateOrUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name || !materialForm.unit || !materialForm.cost_per_unit) return;
    setLoading(true);
    try {
      const payload = {
        name: materialForm.name,
        branch_id: selectedBranchId === "" ? null : selectedBranchId,
        unit: materialForm.unit,
        cost_per_unit: parseFloat(materialForm.cost_per_unit),
        stock_current: materialForm.stock_current ? parseFloat(materialForm.stock_current) : 0,
        safety_stock: materialForm.safety_stock ? parseFloat(materialForm.safety_stock) : null,
      };

      if (editingMaterialId) {
        await optimisticUpdateMaterial(editingMaterialId, payload);
        toastSuccess("Cập nhật nguyên liệu thành công!");
      } else {
        await optimisticCreateMaterial(payload);
        toastSuccess("Đã thêm nguyên liệu mới thành công!");
      }

      setMaterialForm({ name: "", unit: "", cost_per_unit: "", stock_current: "", safety_stock: "" });
      setEditingMaterialId(null);
    } catch (error) {
      toastError("Có lỗi xảy ra khi xử lý nguyên liệu");
    } finally { setLoading(false); }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || !transactionForm.quantity) return;
    setLoading(true);
    try {
      await addMaterialTransaction({
        material_id: selectedMaterialId,
        type: transactionForm.type,
        quantity: parseFloat(transactionForm.quantity),
        note: transactionForm.note,
      });
      toastSuccess("Ghi nhận giao dịch thành công!");
      setTransactionForm({ type: "IN", quantity: "", note: "" });
      mutateMaterials();
    } catch (error) {
      toastError("Có lỗi xảy ra khi ghi nhận giao dịch");
    } finally { setLoading(false); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await importMaterials(file, selectedBranchId);
      toastSuccess(`Import thành công ${res.success}/${res.total} nguyên liệu!`);
      if (res.errors.length > 0) toastWarning(`Có ${res.errors.length} lỗi mapping!`);
      mutateMaterials();
    } catch (err) {
      toastError("Lỗi import file. Vui lòng kiểm tra định dạng template.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startEditMaterial = (m: Material, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMaterialId(m.id);
    setSelectedMaterialId(null);
    setMaterialForm({ name: m.name, unit: m.unit, cost_per_unit: m.cost_per_unit.toString(), stock_current: m.stock_current.toString(), safety_stock: m.safety_stock?.toString() || "" });
  };

  const handleDeleteMaterial = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const Swal = (window as any).Swal;
    if (!Swal) return;

    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Bạn chắc chắn muốn xóa nguyên liệu này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--danger)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await optimisticDeleteMaterial(id);
        toastSuccess("Xóa nguyên liệu thành công!");
        if (selectedMaterialId === id) setSelectedMaterialId(null);
        if (editingMaterialId === id) cancelEdit();
      } catch (error) {
        toastError("Có lỗi xảy ra khi xóa nguyên liệu");
      } finally { setLoading(false); }
    }
  };

  const cancelEdit = () => {
    setEditingMaterialId(null);
    setMaterialForm({ name: "", unit: "", cost_per_unit: "", stock_current: "", safety_stock: "" });
  };

  const activeMaterial = selectedMaterialId ? materials.find(m => m.id === selectedMaterialId) : null;
  const filteredTransactions = selectedMaterialId ? transactions.filter(tx => tx.material_id === selectedMaterialId) : transactions;

  const inputStyle = { width: "100%", padding: "14px 18px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, fontWeight: 700, outline: "none", transition: "0.2s", background: "var(--bg-primary)" };
  const labelStyle = { fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 8, display: "block", textTransform: "uppercase" as const, letterSpacing: 0.5 };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "32px 24px" : "40px 40px 60px 120px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Kho & Nguyên liệu</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Quản lý định mức, thêm mới và theo dõi biến động kho</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {currentUser?.role?.toUpperCase() === 'ADMIN' && (
              <div style={{ position: "relative" }}>
                <select
                  style={{ ...inputStyle, width: "auto", minWidth: 200, padding: "12px 16px", background: "white", cursor: "pointer" }}
                  value={selectedBranchId}
                  onChange={e => {
                    setSelectedBranchId(e.target.value);
                    setSelectedMaterialId(null);
                    setEditingMaterialId(null);
                  }}
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div style={{ position: "absolute", top: -8, left: 12, background: "white", padding: "0 4px", fontSize: 10, fontWeight: 900, color: "var(--accent)", borderRadius: 4 }}>CHI NHÁNH</div>
              </div>
            )}
            {currentUser?.role?.toUpperCase() === 'ADMIN' && (
              <>
                <a href={getMaterialTemplateUrl()} target="_blank" style={{ textDecoration: "none", background: "white", color: "var(--accent)", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "0.2s" }} className="hover-btn">
                  <HiDocumentText size={18} /> TEMPLATE
                </a>
                <button onClick={() => fileInputRef.current?.click()} style={{ background: "white", color: "var(--text-primary)", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "0.2s" }} className="hover-btn">
                  <HiUpload size={18} /> IMPORT
                  <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: "none" }} accept=".xlsx,.xls" />
                </button>
              </>
            )}
            <a href={exportMaterialsExcel(selectedBranchId)} target="_blank" style={{ textDecoration: "none", background: "var(--accent)", color: "white", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, border: "none", boxShadow: "0 4px 12px rgba(202, 162, 26, 0.3)", transition: "0.2s" }} className="hover-btn">
              <HiDownload size={18} /> EXPORT
            </a>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 4fr", gap: 32 }}>

          {/* LEFT: MATERIALS LIST & ADD FORM */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* ADD/EDIT FORM */}
            {currentUser?.role?.toUpperCase() === 'ADMIN' && (
              <div style={{ background: "white", borderRadius: 24, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                    <AiOutlineStock size={24} color="var(--accent)" />
                    {editingMaterialId ? "CẬP NHẬT NGUYÊN LIỆU" : "THÊM NGUYÊN LIỆU MỚI"}
                  </h3>
                  {editingMaterialId && (
                    <button onClick={cancelEdit} style={{ background: "var(--bg-primary)", color: "var(--text-muted)", fontSize: 11, border: "none", padding: "6px 12px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>HỦY BỎ</button>
                  )}
                </div>

                <form onSubmit={handleCreateOrUpdateMaterial} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Tên nguyên liệu</label>
                    <input style={inputStyle} value={materialForm.name} onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })} required placeholder="VD: Sữa tươi không đường" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Đơn vị tính</label>
                      <input style={inputStyle} value={materialForm.unit} onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value })} required placeholder="VD: Lít, Kg, Hộp" />
                    </div>
                    <div>
                      <label style={labelStyle}>Giá mỗi ĐVT (VNĐ)</label>
                      <input type="number" style={inputStyle} value={materialForm.cost_per_unit} onChange={e => setMaterialForm({ ...materialForm, cost_per_unit: e.target.value })} required placeholder="VD: 35000" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Tồn kho hiện tại</label>
                      <input type="number" style={inputStyle} value={materialForm.stock_current} onChange={e => setMaterialForm({ ...materialForm, stock_current: e.target.value })} placeholder="VD: 10" disabled={!!editingMaterialId} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tồn kho an toàn</label>
                      <input type="number" style={inputStyle} value={materialForm.safety_stock} onChange={e => setMaterialForm({ ...materialForm, safety_stock: e.target.value })} placeholder="VD: 2" />
                    </div>
                  </div>

                  <button disabled={loading} type="submit" style={{ width: "100%", padding: 16, background: editingMaterialId ? "var(--success)" : "var(--accent)", color: "white", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", transition: "0.2s", marginTop: 8 }} className="hover-btn">
                    {loading ? <AiOutlineLoading3Quarters size={18} className="spin" /> : editingMaterialId ? <><HiCheck size={18} /> LƯU THAY ĐỔI</> : <><HiPlus size={18} /> THÊM NGUYÊN LIỆU</>}
                  </button>
                </form>
              </div>
            )}

            {/* MATERIALS LIST */}
            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "calc(100vh - 460px)", minHeight: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
              <div style={{ padding: 24, borderBottom: "1px solid var(--bg-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                  <HiCollection size={20} color="var(--accent)" />
                  DANH SÁCH NGUYÊN LIỆU
                </h3>
                {(materialsLoading || branchLoading) && <AiOutlineLoading3Quarters size={18} className="spin" color="var(--accent)" />}
              </div>

              <div className="custom-scroll" style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {(materialsLoading || branchLoading) && materials.length === 0 ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)
                ) : materials.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>Chưa có nguyên liệu nào.</div>
                ) : (
                  materials.map(m => {
                    const isSelected = selectedMaterialId === m.id;
                    const isLowStock = (m.safety_stock && m.stock_current <= m.safety_stock);
                    return (
                      <div
                        key={m.id}
                        onClick={() => { setSelectedMaterialId(isSelected ? null : m.id); setEditingMaterialId(null); }}
                        style={{
                          padding: 16, borderRadius: 16, border: `2px solid ${isSelected ? "var(--accent)" : "transparent"}`,
                          background: isSelected ? "var(--bg-primary)" : "white", cursor: "pointer", transition: "0.2s",
                          boxShadow: isSelected ? "none" : "0 2px 8px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}
                        className="hover-card"
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4, color: "var(--text-primary)" }}>{m.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "flex", gap: 12 }}>
                            <span>Kho: <span style={{ color: isLowStock ? "var(--danger)" : "var(--success)", fontWeight: 900 }}>{m.stock_current.toFixed(2)} {m.unit}</span></span>
                            <span>Giá: {new Intl.NumberFormat('vi-VN').format(m.cost_per_unit)} ₫</span>
                          </div>
                        </div>

                        {currentUser?.role?.toUpperCase() === 'ADMIN' && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={(e) => startEditMaterial(m, e)} style={{ padding: 8, background: "white", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", cursor: "pointer" }}><HiPencilAlt size={16} /></button>
                            <button onClick={(e) => handleDeleteMaterial(m.id, e)} style={{ padding: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "var(--danger)", cursor: "pointer" }}><HiTrash size={16} /></button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: TRANSACTIONS PORTAL */}
          <div style={{ background: "white", borderRadius: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 600 }}>
            {/* Context Header */}
            <div style={{ padding: "32px 32px 24px 32px", borderBottom: "1px solid var(--bg-primary)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", background: activeMaterial ? "#fffbf0" : "white", borderRadius: "24px 24px 0 0", transition: "0.3s" }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)", marginBottom: 8 }}>
                  <HiOutlineClipboardList size={24} color={activeMaterial ? "var(--accent)" : "var(--text-primary)"} />
                  {activeMaterial ? "LỊCH SỬ NGUYÊN LIỆU" : "SỔ KHO TỔNG HỢP"}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 700 }}>
                  {activeMaterial
                    ? `Theo dõi chi tiết nhập xuất cho: ${activeMaterial.name}`
                    : "Lịch sử biến động kho cho tất cả nguyên liệu."}
                </p>
              </div>
            </div>

            {/* If a material is selected, show Quick Transaction Form */}
            {activeMaterial && currentUser?.role?.toUpperCase() === 'ADMIN' && (
              <div style={{ padding: 24, background: "var(--bg-primary)" }}>
                <form onSubmit={handleAddTransaction} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <div style={{ width: 140 }}>
                    <label style={{ ...labelStyle, fontSize: 10 }}>Loại</label>
                    <select style={{ ...inputStyle, padding: "12px 14px" }} value={transactionForm.type} onChange={e => setTransactionForm({ ...transactionForm, type: e.target.value as any })}>
                      <option value="IN">NHẬP (+)</option>
                      <option value="OUT">XUẤT (-)</option>
                      <option value="ADJUST">ĐK KHO</option>
                    </select>
                  </div>
                  <div style={{ width: 120 }}>
                    <label style={{ ...labelStyle, fontSize: 10 }}>Số lượng</label>
                    <input type="number" style={{ ...inputStyle, padding: "12px 14px" }} value={transactionForm.quantity} onChange={e => setTransactionForm({ ...transactionForm, quantity: e.target.value })} required placeholder="VD: 5" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontSize: 10 }}>Ghi chú</label>
                    <input style={{ ...inputStyle, padding: "12px 14px" }} value={transactionForm.note} onChange={e => setTransactionForm({ ...transactionForm, note: e.target.value })} placeholder="VD: Nhập lô 123" />
                  </div>
                  <button disabled={loading || !transactionForm.quantity} type="submit" style={{ padding: "12px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", transition: "0.2s", height: 43 }} className="hover-btn">
                    {loading ? <AiOutlineLoading3Quarters size={16} className="spin" /> : <HiPlus size={16} />}
                  </button>
                </form>
              </div>
            )}

            {/* TRANSACTIONS TABLE */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="custom-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 10 }}>
                    <tr style={{ background: "white" }}>
                      <th style={{ padding: "16px 24px", fontSize: 11, fontWeight: 900, color: "var(--text-muted)", borderBottom: "2px solid var(--bg-primary)", textAlign: "left" }}>THỜI GIAN</th>
                      {!selectedMaterialId && (
                        <th style={{ padding: "16px 24px", fontSize: 11, fontWeight: 900, color: "var(--text-muted)", borderBottom: "2px solid var(--bg-primary)", textAlign: "left" }}>NGUYÊN LIỆU</th>
                      )}
                      <th style={{ padding: "16px 24px", fontSize: 11, fontWeight: 900, color: "var(--text-muted)", borderBottom: "2px solid var(--bg-primary)", textAlign: "center" }}>LOẠI</th>
                      <th style={{ padding: "16px 24px", fontSize: 11, fontWeight: 900, color: "var(--text-muted)", borderBottom: "2px solid var(--bg-primary)", textAlign: "right" }}>SL</th>
                      <th style={{ padding: "16px 24px", fontSize: 11, fontWeight: 900, color: "var(--text-muted)", borderBottom: "2px solid var(--bg-primary)", textAlign: "left", width: 180 }}>GHI CHÚ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(materialsLoading || branchLoading) ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <tr key={i}><td colSpan={5} style={{ padding: 16 }}><div className="skeleton" style={{ height: 40, borderRadius: 8, width: "100%" }} /></td></tr>
                      ))
                    ) : filteredTransactions.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>Chưa có giao dịch.</td></tr>
                    ) : (
                      filteredTransactions.map(tx => {
                        const isIn = tx.type === 'IN' || tx.type === 'ADJUST' && tx.quantity > 0;
                        const isOut = tx.type === 'OUT' || tx.type === 'USED';
                        const badgeColor = isIn ? "#10b981" : isOut ? "#ef4444" : "#f5a62d";
                        const badgeBg = isIn ? "#d1fae5" : isOut ? "#fee2e2" : "#fef3c7";

                        return (
                          <tr key={tx.id} style={{ borderBottom: "1px solid var(--bg-primary)", transition: "0.2s" }} className="hover-row">
                            <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                              <div style={{ fontSize: 13, fontWeight: 900 }}>{format(new Date(tx.created_at), "dd/MM/yyyy")}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>{format(new Date(tx.created_at), "HH:mm")}</div>
                            </td>
                            {!selectedMaterialId && (
                              <td style={{ padding: "16px 24px" }}>
                                <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text-primary)" }}>{(tx as any).material?.name || "N/A"}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>{(tx as any).material?.unit || ""}</div>
                              </td>
                            )}
                            <td style={{ padding: "16px 24px", textAlign: "center" }}>
                              <span style={{ padding: "4px 8px", background: badgeBg, color: badgeColor, borderRadius: 6, fontSize: 10, fontWeight: 900 }}>
                                {tx.type === 'USED' ? 'Pha chế' : tx.type}
                              </span>
                            </td>
                            <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 900, fontSize: 14, color: badgeColor }}>
                              {isIn ? '+' : (isOut && tx.quantity > 0 ? '-' : '')}{Math.abs(tx.quantity).toFixed(2)}
                            </td>
                            <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {tx.note || (tx.type === 'IN' ? 'Nhập hàng' : tx.type === 'OUT' ? 'Xuất hàng' : tx.type === 'USED' ? 'Bán hàng (POS)' : 'Điều chỉnh kho')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hover-btn:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(202, 162, 26, 0.2); }
        .hover-btn:active { transform: translateY(0); }
        .hover-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.04) !important; border-color: var(--border) !important; }
        .hover-row:hover { background: #fbfbfd !important; }
        input:focus, select:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(202, 162, 26, 0.1); }
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
