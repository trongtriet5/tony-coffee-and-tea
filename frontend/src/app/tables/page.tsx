"use client";
import React, { useState, useEffect } from "react";
import { getTableOccupancy, occupyTable, releaseTable, transferTable, getOrder, getBranches } from "@/lib/api";
import { optimisticCreateTable, optimisticDeleteTable, useTables, useBranches } from "@/lib/useData";
import type { Table, Order, Branch } from "@/types";
import { HiPlus, HiCheck, HiOutlineDesktopComputer, HiBan, HiTrash, HiOutlineShoppingCart } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";

export default function TablesManagementPage() {
  const currentUser = useCurrentUser();
  const { success: toastSuccess, error: toastError } = useToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const { tables, isLoading: tablesLoading, mutate: mutateTables } = useTables(selectedBranchId || undefined);
  const { branches, isLoading: branchLoading } = useBranches();
  const [occupancyStats, setOccupancyStats] = useState<any>(null);

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const fetchLoading = tablesLoading || branchLoading;
  const [isMobile, setIsMobile] = useState(false);
  
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [orderLoading, setOrderLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [tableName, setTableName] = useState('');
  const [tableCount, setTableCount] = useState('');

  useEffect(() => {
    if (currentUser && branches.length > 0) {
      if (currentUser.role !== 'ADMIN' && currentUser.branch_id) {
        setSelectedBranchId(currentUser.branch_id);
      } else if (!selectedBranchId) {
        setSelectedBranchId(branches[0].id);
      }
    }
  }, [currentUser, branches, selectedBranchId]);

  // Fetch occupancy when tables change
  useEffect(() => {
    if (tables.length > 0) {
      getTableOccupancy(selectedBranchId).then(setOccupancyStats);
    }
  }, [tables, selectedBranchId]);


  const handleSelectTable = async (table: Table) => {
    setSelectedTable(table);
    setShowAddForm(false);
    setIsTransferring(false);
    setTransferTarget("");

    // Use the latest order from table.orders directly (no need to fetch separately)
    if (table.orders && table.orders.length > 0) {
      setSelectedOrder(table.orders[0]);
    } else {
      setSelectedOrder(null);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tableCount) {
        const count = parseInt(tableCount);
        
        // Find highest table number in current branch
        const existingTableNumbers = tables
          .filter(t => t.name?.match(/^Bàn\s*(\d+)$/))
          .map(t => parseInt(t.name.replace('Bàn ', '').trim()));
        const startNum = existingTableNumbers.length > 0 ? Math.max(...existingTableNumbers) + 1 : 1;
        
        for (let i = 0; i < count; i++) {
          await optimisticCreateTable({ name: `Bàn ${startNum + i}`, branch_id: selectedBranchId });
        }
        toastSuccess(`Đã tạo ${count} bàn mới!`);
      } else if (tableName) {
        await optimisticCreateTable({ name: tableName, branch_id: selectedBranchId });
        toastSuccess(`Tạo bàn ${tableName} thành công!`);
      }
      setTableName('');
      setTableCount('');
      setShowAddForm(false);
    } catch (err) {
      toastError("Lỗi khi thêm bàn");
    } finally { setLoading(false); }
  };

  const handleDeleteTable = async (id: string) => {
    const Swal = (window as any).Swal;
    if (!Swal) return;

    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Bạn chắc chắn muốn xóa bàn này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await optimisticDeleteTable(id);
        toastSuccess("Đã xóa bàn");
        if (selectedTable?.id === id) {
          setSelectedTable(null);
          setSelectedOrder(null);
        }
        mutateTables();
      } catch (err) {
        toastError('Không thể xóa bàn (có thể do đang có hóa đơn)');
      } finally { setLoading(false); }
    }
  };

  const handleOccupy = async (id: string) => {
    try {
      setLoading(true);
      await occupyTable(id);
      toastSuccess("Đã mở bàn");
      mutateTables();
    } catch (err) {
      toastError('Lỗi mở bàn');
    } finally { setLoading(false); }
  };

  const handleRelease = async (id: string) => {
    try {
      setLoading(true);
      await releaseTable(id);
      toastSuccess("Đã kết thúc sử dụng bàn");
      setSelectedOrder(null);
      mutateTables();
    } catch (err) {
      toastError('Lỗi kết thúc bàn');
    } finally { setLoading(false); }
  };

  const handleTransfer = async () => {
    if (!selectedTable || !transferTarget) return;
    try {
      setLoading(true);
      await transferTable(selectedTable.id, transferTarget);
      toastSuccess("Chuyển bàn thành công");
      setIsTransferring(false);
      setTransferTarget("");
      await mutateTables();
      const newTable = tables.find(t => t.id === transferTarget);
      if (newTable) {
        handleSelectTable(newTable);
      } else {
        setSelectedTable(null);
        setSelectedOrder(null);
      }
    } catch (err) {
      toastError('Lỗi chuyển bàn');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: "100%", padding: "14px 18px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 15, fontWeight: 700, outline: "none", transition: "0.2s", background: "var(--bg-primary)" };
  const labelStyle = { fontSize: 14, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "32px 24px" : "40px 40px 60px 120px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Quản lý bàn</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 700 }}>Chi nhánh:</p>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={currentUser?.role !== 'ADMIN'}
                style={{ background: "white", border: "1px solid var(--border)", padding: "4px 12px", borderRadius: 8, fontSize: 15, fontWeight: 700, outline: "none", cursor: currentUser?.role !== 'ADMIN' ? "not-allowed" : "pointer", opacity: currentUser?.role !== 'ADMIN' ? 0.6 : 1 }}
              >
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <button onClick={() => { setShowAddForm(true); setSelectedTable(null); }} style={{ padding: "12px 24px", background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", transition: "0.2s" }} className="hover-btn">
              <HiPlus size={18} /> THÊM BÀN
            </button>
          )}
        </div>

        <div style={{ opacity: 0, height: 0, overflow: "hidden" }} />

        {/* STATS */}
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {fetchLoading && !occupancyStats ? (
            [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 20 }} />)
          ) : (
            occupancyStats && (
              <>
                <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }} className="animate-fade-in">
                  <p style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", marginBottom: 8 }}>TỔNG BÀN</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)" }}>{occupancyStats.total_tables}</p>
                </div>
                <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }} className="animate-fade-in">
                  <p style={{ fontSize: 13, fontWeight: 900, color: "var(--danger)", marginBottom: 8 }}>BÀN ĐANG SỬ DỤNG</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "var(--danger)" }}>{occupancyStats.occupied_tables}</p>
                </div>
                <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }} className="animate-fade-in">
                  <p style={{ fontSize: 13, fontWeight: 900, color: "var(--success)", marginBottom: 8 }}>BÀN TRỐNG</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "var(--success)" }}>{occupancyStats.available_tables}</p>
                </div>
                <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }} className="animate-fade-in">
                  <p style={{ fontSize: 13, fontWeight: 900, color: "var(--accent)", marginBottom: 8 }}>TỶ LỆ LẤP ĐẦY</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "var(--accent)" }}>{occupancyStats.occupancy_rate}</p>
                </div>
              </>
            )
          )}
        </div>

        {/* MAIN SPLIT */}
        <div style={{ display: "grid", gridTemplateColumns: "7fr 4fr", gap: 32 }}>

          {/* LEFT: GRID OF TABLES */}
          <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", minHeight: "60vh" }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              SƠ ĐỒ BÀN {fetchLoading && <AiOutlineLoading3Quarters className="spin" size={16} color="var(--accent)" />}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
              {fetchLoading && tables.length === 0 ? (
                [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)
              ) : (
                tables.map((table, idx) => {
                  const isSelected = selectedTable?.id === table.id;
                  const isAvail = table.status === 'AVAILABLE';
                  return (
                    <div 
                      key={table.id} 
                      onClick={() => handleSelectTable(table)} 
                      className="table-card animate-fade-in" 
                      style={{
                        padding: 16, borderRadius: 16, cursor: "pointer", transition: "0.2s",
                        background: isSelected ? (isAvail ? "#e6f4ea" : "#fce8e8") : "var(--bg-primary)",
                        border: `2px solid ${isSelected ? (isAvail ? "var(--success)" : "var(--danger)") : "transparent"}`,
                        animationDelay: `${idx * 0.03}s`
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <HiOutlineDesktopComputer size={24} color={isAvail ? "var(--success)" : "var(--danger)"} />
                        {table.current_order && (
                          <div style={{ width: 8, height: 8, background: "var(--danger)", borderRadius: "50%" }} />
                        )}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 900, marginBottom: 4 }}>{table.name}</p>
                      <p style={{ fontSize: 11, fontWeight: 800, color: isAvail ? "var(--success)" : "var(--danger)" }}>
                        {isAvail ? "Bàn trống" : "Đang dùng"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS PANEL */}
          <div style={{ position: "sticky", top: 40, alignSelf: "start" }}>
            {showAddForm ? (
              <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  THÊM BÀN MỚI
                  <button onClick={() => setShowAddForm(false)} style={{ background: "transparent", color: "var(--text-muted)", fontSize: 11, border: "none", fontWeight: 800, cursor: "pointer" }}>HỦY</button>
                </h3>
                <form onSubmit={handleAddTable} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Tên bàn cụ thể</label>
                      <input
                        placeholder="vd: Bàn VIP 1" style={inputStyle} value={tableName}
                        onChange={e => { setTableName(e.target.value); if (e.target.value) setTableCount(''); }}
                      />
                    </div>
                    
                    <div style={{ position: "relative", textAlign: "center", margin: "4px 0" }}>
                      <span style={{ background: "white", padding: "0 12px", fontSize: 10, fontWeight: 900, color: "var(--text-muted)", position: "relative", zIndex: 2 }}>HOẶC</span>
                      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--border)", zIndex: 1 }} />
                    </div>

                    <div>
                      <label style={labelStyle}>Số lượng bàn cần tạo</label>
                      <input
                        type="number" min="1" max="100" placeholder="vd: 10" style={inputStyle} value={tableCount}
                        onChange={e => { setTableCount(e.target.value); if (e.target.value) setTableName(''); }}
                      />
                      {(() => {
                        const existingTableNumbers = tables
                          .filter(t => t.name?.match(/^Bàn\s*(\d+)$/))
                          .map(t => parseInt(t.name.replace('Bàn ', '').trim()));
                        const startNum = existingTableNumbers.length > 0 ? Math.max(...existingTableNumbers) + 1 : 1;
                        const count = parseInt(tableCount) || 0;
                        const endNum = startNum + count - 1;
                        return count > 0 ? <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 8, fontWeight: 700 }}>Sẽ tự động tạo: Bàn {startNum} - Bàn {endNum}</p> : null;
                      })()}
                    </div>
                  </div>
                  <button disabled={loading || (!tableName && !tableCount)} type="submit" style={{ width: "100%", padding: 16, background: "var(--accent)", color: "white", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", transition: "0.2s", marginTop: 12 }} className="hover-btn">
                    {loading ? <AiOutlineLoading3Quarters size={18} className="spin" /> : <><HiPlus size={18} /> THÊM NGAY</>}
                  </button>
                </form>
              </div>
            ) : selectedTable ? (
              <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: 24, fontWeight: 900 }}>{selectedTable.name}</h3>
                    <p style={{ fontSize: 12, fontWeight: 800, color: selectedTable.status === "AVAILABLE" ? "var(--success)" : "var(--danger)", marginTop: 4 }}>
                      {selectedTable.status === "AVAILABLE" ? "Đang trống" : "Đang được sử dụng"}
                    </p>
                  </div>
                  {currentUser?.role === 'ADMIN' && (
                    <button onClick={() => handleDeleteTable(selectedTable.id)} style={{ padding: 8, background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center" }} title="Xóa bàn này">
                      <HiTrash size={18} />
                    </button>
                  )}
                </div>

                <div style={{ height: 1, background: "var(--border)" }} />

                {selectedTable.status === "OCCUPIED" ? (
                  <div>
                    {orderLoading ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><AiOutlineLoading3Quarters className="spin" size={24} color="var(--accent)" /></div>
                    ) : isTransferring ? (
                      <div style={{ padding: "20px 0" }}>
                        <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Chọn bàn trống để chuyển đến:</p>
                        <select 
                          value={transferTarget} 
                          onChange={(e) => setTransferTarget(e.target.value)}
                          style={{ 
                            width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", 
                            fontSize: 13, fontWeight: 700, outline: "none", marginBottom: 20,
                            appearance: "none", backgroundColor: "var(--bg-primary)",
                            background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5z\"/></svg>') no-repeat right 16px center"
                          }}
                        >
                          <option value="">-- Chọn bàn --</option>
                          {tables.filter(t => t.status === "AVAILABLE" && t.id !== selectedTable?.id).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setIsTransferring(false)} disabled={loading} style={{ flex: 1, padding: 12, background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s" }} className="hover-btn">
                            HỦY
                          </button>
                          <button onClick={handleTransfer} disabled={loading || !transferTarget} style={{ flex: 1, padding: 12, background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s", opacity: !transferTarget ? 0.5 : 1 }} className="hover-btn">
                            XÁC NHẬN CHUYỂN
                          </button>
                        </div>
                      </div>
                    ) : selectedTable?.orders && selectedTable.orders.length > 0 ? (
                      <div>
                        <div style={{ marginBottom: 20 }}>
                          <p style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 12 }}>CÁC ĐƠN HÀNG CỦA BÀN</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {selectedTable.orders.map((order: any) => (
                              <div 
                                key={order.id} 
                                onClick={() => setSelectedOrder(order)}
                                style={{ 
                                  padding: 12, 
                                  borderRadius: 12, 
                                  background: selectedOrder?.id === order.id ? "var(--accent-light)" : "var(--bg-primary)",
                                  border: selectedOrder?.id === order.id ? "2px solid var(--accent)" : "2px solid transparent",
                                  cursor: "pointer"
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: 800 }}>{order.order_number}</span>
                                  <span style={{ fontSize: 13, fontWeight: 900, color: "var(--accent)" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.final_amount)}</span>
                                </div>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                  {new Date(order.created_at).toLocaleString("vi-VN")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedOrder && (
                          <>
                            <div style={{ marginBottom: 16 }}>
                              <p style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 4 }}>MÃ HÓA ĐƠN</p>
                              <p style={{ fontSize: 14, fontWeight: 900 }}>{selectedOrder.order_number}</p>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                              <p style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><HiOutlineShoppingCart size={16} /> CHI TIẾT MÓN</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "30vh", overflowY: "auto", paddingRight: 8 }} className="custom-scroll">
                                {selectedOrder.items?.map((item: any) => (
                                  <div key={item.id} style={{ background: "var(--bg-primary)", padding: 12, borderRadius: 12 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                      <p style={{ fontSize: 13, fontWeight: 800 }}>{item.quantity} x {item.product?.name_vi || 'Món'}</p>
                                      <p style={{ fontSize: 13, fontWeight: 900, color: "var(--accent)" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}</p>
                                    </div>
                                    {item.toppings && item.toppings.length > 0 && (
                                      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, paddingLeft: 8 }}>
                                        + Topping: {item.toppings.map((t: any) => t.topping?.name || t.name).filter(Boolean).join(', ')}
                                      </div>
                                    )}
                                    {item.note && (
                                      <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, paddingLeft: 8, marginTop: 4 }}>
                                        {item.note.split(', ').map((part: string, idx: number) => (
                                          <div key={idx}>- {part}</div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "16px 0", borderTop: "1px dashed var(--border)" }}>
                              <p style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)" }}>TỔNG BÀN</p>
                              <p style={{ fontSize: 20, fontWeight: 900, color: "var(--accent)" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTable.orders.reduce((sum: number, o: any) => sum + (o.final_amount || 0), 0))}</p>
                            </div>
                          </>
                        )}

                        {currentUser?.role !== 'ADMIN' && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => alert("Điều hướng tới trang thanh toán để in bill (Tương lai)")} style={{ flex: 1, padding: 12, background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s" }} className="hover-btn">
                              IN TẠM TÍNH
                            </button>
                            <button onClick={() => {
                              window.location.href = `/?tableId=${selectedTable.id}`;
                            }} style={{ flex: 1, padding: 12, background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }} className="hover-btn">
                              GỌI THÊM
                            </button>
                            <button onClick={() => handleRelease(selectedTable.id)} disabled={loading} style={{ flex: 1, padding: 12, background: "var(--success)", color: "white", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s" }} className="hover-btn">
                              HỦY / RỜI ĐI
                            </button>
                          </div>
                        )}
                        {currentUser?.role !== 'ADMIN' && (
                          <div style={{ marginTop: 8 }}>
                            <button onClick={() => setIsTransferring(true)} disabled={loading} style={{ width: "100%", padding: 12, background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s" }} className="hover-btn">
                              CHUYỂN BÀN
                            </button>
                          </div>
                        )}
                        {currentUser?.role === 'ADMIN' && (
                          <div style={{ marginTop: 8, padding: 12, background: "var(--bg-primary)", borderRadius: 12, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                            (Chỉ xem - Không thể thực hiện thao tác gọi món)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, textAlign: "center", padding: 20 }}>Bàn đang bận nhưng không có đơn hàng chưa thanh toán.</p>
                        {currentUser?.role !== 'ADMIN' ? (
                          <>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => window.location.href = `/?tableId=${selectedTable.id}`} style={{ flex: 1.5, padding: 14, background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" }} className="hover-btn">
                                GỌI MÓN MỚI
                              </button>
                              <button onClick={() => handleRelease(selectedTable.id)} disabled={loading} style={{ flex: 1, padding: 14, background: "var(--danger)", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" }} className="hover-btn">
                                GIẢI PHÓNG BÀN
                              </button>
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <button onClick={() => setIsTransferring(true)} disabled={loading} style={{ width: "100%", padding: 12, background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s" }} className="hover-btn">
                                CHUYỂN BÀN
                              </button>
                            </div>
                          </>
                        ) : (
                          <div style={{ marginTop: 8, padding: 12, background: "var(--bg-primary)", borderRadius: 12, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                            (Bàn đang bận - Chỉ Admin được xem hóa đơn)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 16 }}>
                    <div style={{ width: 64, height: 64, background: "var(--bg-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <HiOutlineDesktopComputer size={32} color="var(--success)" />
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, textAlign: "center" }}>Bàn đang trống, có thể sắp xếp khách vào.</p>
                    {currentUser?.role !== 'ADMIN' ? (
                      <button onClick={() => handleOccupy(selectedTable.id)} disabled={loading} style={{ padding: "12px 32px", background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "0.2s", marginTop: 8 }} className="hover-btn">
                        MỞ BÀN (KHÁCH VÀO)
                      </button>
                    ) : (
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginTop: 8 }}>[Chỉ xem trạng thái bàn]</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 24, border: "1px dashed var(--border)", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-muted)", height: "400px" }}>
                <HiOutlineDesktopComputer size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p style={{ fontSize: 14, fontWeight: 800 }}>Chưa chọn bàn nào</p>
                <p style={{ fontSize: 12, fontWeight: 700, marginTop: 8, opacity: 0.7 }}>Click vào một bàn bên trái để xem chi tiết hoặc hóa đơn đang dùng.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hover-btn:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(202, 162, 26, 0.2); }
        .hover-btn:active { transform: translateY(0); }
        .table-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.04); }
        input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(202, 162, 26, 0.1); }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
