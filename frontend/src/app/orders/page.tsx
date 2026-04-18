"use client";
import { useState, useEffect } from "react";
import { getOrders, getBranches, reprintOrder, getOrder } from "@/lib/api";
import type { Order, PaginatedResponse, Branch } from "@/types";
import {
   HiClock, HiSearch, HiOutlineReceiptTax, HiDownload,
   HiChevronRight, HiEye, HiX, HiCreditCard, HiTicket, HiTemplate,
   HiChevronLeft, HiPrinter
} from "react-icons/hi";
import { HiViewColumns } from "react-icons/hi2";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import * as XLSX from "xlsx";
import { BiCoffeeTogo, BiDish } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdPayment, MdOutlineDeliveryDining } from "react-icons/md";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";

const formatVND = (n: number) =>
   new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function OrdersPage() {
   const currentUser = useCurrentUser();
   const { success: toastSuccess, error: toastError } = useToast();
   const [orders, setOrders] = useState<Order[]>([]);
   const [branches, setBranches] = useState<any[]>([]);
   const [selectedBranchId, setSelectedBranchId] = useState<string>("");
   const [loading, setLoading] = useState(true);
   const [total, setTotal] = useState(0);
   const [isMobile, setIsMobile] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

   // Pagination & Search States
   const [search, setSearch] = useState("");
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(20);
   const [totalPages, setTotalPages] = useState(0);
   const [isReprinting, setIsReprinting] = useState(false);

   // Column visibility
const allColumns = [
       { key: 'order_number', label: 'MÃ ĐƠN HÀNG' },
       { key: 'branch', label: 'CHI NHÁNH' },
       { key: 'created_at', label: 'THỜI GIAN' },
       { key: 'items', label: 'SẢN PHẨM' },
       { key: 'payment_method', label: 'PHƯƠNG THỨC' },
       { key: 'order_type', label: 'HÌNH THỨC' },
       { key: 'discount_amount', label: 'GIẢM GIÁ' },
       { key: 'final_amount', label: 'THANH TOÁN' },
       { key: 'print_count', label: 'LẦN IN' },
       { key: 'status', label: 'TRẠNG THÁI' }
    ];
   const [visibleColumns, setVisibleColumns] = useState(allColumns.map(c => c.key));
   const [showColumnPicker, setShowColumnPicker] = useState(false);

   const handleReprint = async (order: Order) => {
      try {
         const updatedOrder = await reprintOrder(order.id);
         setSelectedOrder(updatedOrder);

         // Update in list
         setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));

         // Trigger print (need to wait for React to render the hidden print div if any, or use manual window writing)
         // Trigger print using iframe
         setTimeout(() => {
            const printContent = document.getElementById("reprint-content");
            if (!printContent) return;
            
            let iframe = document.getElementById("print-iframe") as HTMLIFrameElement;
            if (!iframe) {
               iframe = document.createElement("iframe");
               iframe.id = "print-iframe";
               iframe.style.display = "none";
               document.body.appendChild(iframe);
            }

            const doc = iframe.contentWindow?.document;
            if (!doc) return;

            doc.open();
            doc.write('<html><head><title>Reprint</title>');
            doc.write('<style>@page { size: 80mm auto; margin: 0; } body { margin: 0; padding: 0; font-family: sans-serif; } #reprint-content-inner { width: 80mm; box-sizing: border-box; } * { font-family: "Courier New", Courier, monospace !important; }</style>');
            doc.write('</head><body><div id="reprint-content-inner">');
            doc.write(printContent.innerHTML);
            doc.write('</div></body></html>');
            doc.close();

            setTimeout(() => {
               iframe.contentWindow?.focus();
               iframe.contentWindow?.print();
            }, 300);
         }, 500);
      } catch (err) {
         toastError("Không thể in lại hóa đơn.");
      }
   };

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      checkMobile();
      window.addEventListener("resize", checkMobile);

      // Fetch branches for admin if user is loaded
      if (currentUser?.role === 'ADMIN') {
         getBranches().then(setBranches);
      }

      return () => window.removeEventListener("resize", checkMobile);
   }, [currentUser]);

   // Debounced search to optimize API calls
   const [debouncedSearch, setDebouncedSearch] = useState(search);

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearch(search);
      }, 500);
      return () => clearTimeout(timer);
   }, [search]);

   // UseEffect for dynamic search and pagination
   useEffect(() => {
      if (currentUser) fetchData();
   }, [debouncedSearch, page, limit, currentUser, selectedBranchId]);

   const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
         const bId = currentUser?.role === 'ADMIN' ? (selectedBranchId || undefined) : currentUser?.branch_id;
         const res = await getOrders({ page, limit, search: debouncedSearch, branch_id: bId });
         setOrders((res as any).data || []);
         setTotal((res as any).total || 0);
         setTotalPages((res as any).totalPages || 0);
      } catch (err) {
         console.error(err);
         setOrders([]);
      } finally {
         setLoading(false);
      }
   };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1); // Reset to first page on new search
   };

   const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
         setPage(newPage);
      }
   };

   const formatExactDBTime = (ds: string | Date, pat: string) => {
      const d = new Date(ds);
      return format(new Date(d.getTime() + d.getTimezoneOffset() * 60000), pat);
   };

   const handleExportExcel = async () => {
      try {
         const res = await getOrders({ page: 1, limit: 10000, search });
         const allOrders = (res as any).data || [];

         const headers = ["MÃ ĐƠN HÀNG", "CHI NHÁNH", "THỜI GIAN", "TỔNG SỐ MÓN", "CHI TIẾT MÓN", "GIẢM GIÁ (VND)", "TỔNG THANH TOÁN (VND)", "THANH TOÁN", "HÌNH THỨC", "TRẠNG THÁI"];

         const rows = allOrders.map((o: any) => {
            const itemsStr = (o.items || []).map((i: any) => `${i.quantity}x ${i.product?.name_vi || 'Món'}`).join('; ');
            return [
               o.order_number,
               o.branch?.name || "N/A",
               formatExactDBTime(o.created_at, "HH:mm dd/MM/yyyy"),
               o.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0,
               itemsStr,
               o.discount_amount,
               o.final_amount,
               o.payment_method === "CASH" ? "Tiền mặt" : "Chuyển khoản",
               o.order_type === "TAKEAWAY" ? "Mang đi" : "Tại chỗ",
               "HOÀN TẤT"
            ];
         });

         const worksheetData = [headers, ...rows];
         const ws = XLSX.utils.aoa_to_sheet(worksheetData);
         const wb = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(wb, ws, "Orders");
         XLSX.writeFile(wb, `LichSuDonHang_${format(new Date(), "ddMMyyyy")}.xlsx`);
      } catch (err) {
         console.error("Export error", err);
         toastError("Có lỗi xảy ra khi xuất dữ liệu.");
      }
   };

   return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "32px 24px" : "40px 40px 60px 120px" }}>
         <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 24 : 0, justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: isMobile ? 32 : 40 }}>
               <div>
                  <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900 }}>Lịch sử đơn hàng</h1>
                  <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? 14 : 15, fontWeight: 700 }}>Theo dõi lịch sử đơn hàng</p>
               </div>
               <div style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", gap: 12, width: isMobile ? "100%" : "auto" }}>
                  {currentUser?.role === 'ADMIN' && (
                     <div style={{ position: "relative", flex: isMobile ? "1 1 calc(50% - 6px)" : "none" }}>
                        <select
                           value={selectedBranchId}
                           onChange={(e) => setSelectedBranchId(e.target.value)}
                           style={{ width: "fit-content", padding: isMobile ? "12px 16px" : "14px 24px", paddingRight: 40, borderRadius: 14, background: "white", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 14, fontWeight: 800, cursor: "pointer", outline: "none", appearance: "none", minWidth: isMobile ? "auto" : 240 }}
                        >
                           <option value="">Tất cả chi nhánh</option>
                           {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <HiTemplate size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
                     </div>
                  )}
                  <div style={{ position: "relative", width: isMobile ? "100%" : 280, order: isMobile ? -1 : 0 }}>
                     <HiSearch size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                     <input
                        type="text"
                        placeholder="Tìm mã đơn hàng..."
                        value={search}
                        onChange={handleSearchChange}
                        style={{ width: "100%", padding: isMobile ? "12px 16px 12px 48px" : "14px 16px 14px 48px", borderRadius: 14, border: "1px solid var(--border)", background: "white", fontSize: 14, fontWeight: 600 }}
                     />
                  </div>
                  <button onClick={handleExportExcel} style={{ flex: isMobile ? "1 1 auto" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: isMobile ? "12px 16px" : "14px 24px", borderRadius: 14, background: "white", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
                     <HiDownload size={20} /> <span style={{ whiteSpace: "nowrap" }}>{isMobile ? "XUẤT" : "XUẤT EXCEL"}</span>
                  </button>


                  <div style={{ position: "relative", flex: isMobile ? "1 1 auto" : "none" }}>
                     <button onClick={() => setShowColumnPicker(!showColumnPicker)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: isMobile ? "12px 16px" : "14px 24px", borderRadius: 14, background: "white", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
                        <HiViewColumns size={20} /> {isMobile ? "CỘT" : "CỘT HIỂN THỊ"}
                     </button>
                     {showColumnPicker && (
                        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 10, background: "white", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: 12, zIndex: 50, width: 220 }}>
                           <div style={{ padding: 16 }}>
                              <p style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", marginBottom: 12 }}>CHỌN CỘT HIỂN THỊ</p>
                              {allColumns.map(col => (
                                 <label key={col.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                                    <input
                                       type="checkbox"
                                       checked={visibleColumns.includes(col.key)}
                                       onChange={() => {
                                          if (visibleColumns.includes(col.key)) {
                                             setVisibleColumns(visibleColumns.filter(k => k !== col.key));
                                          } else {
                                             setVisibleColumns([...visibleColumns, col.key]);
                                          }
                                       }}
                                    />
                                    {col.label}
                                 </label>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
               {/* PAGINATION HEADER */}
               <div style={{ padding: isMobile ? "12px 16px" : "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0, justifyContent: "space-between", alignItems: "center", background: "var(--bg-primary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-start" }}>
                     <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--text-primary)" }}>{orders.length}</span> / {total} kết quả
                     </p>
                     <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 11, fontWeight: 800, outline: "none", cursor: "pointer", background: "white" }}
                     >
                        <option value={10}>10 bản ghi</option>
                        <option value={20}>20 bản ghi</option>
                        <option value={50}>50 bản ghi</option>
                     </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                     <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
                     >
                        <HiChevronLeft size={18} />
                     </button>

                     <div style={{ display: "flex", gap: 6 }}>
                        {[...Array(totalPages)].map((_, i) => {
                           const p = i + 1;
                           if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                              return (
                                 <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    style={{ minWidth: 32, height: 32, padding: "0 6px", borderRadius: 8, border: "1px solid var(--border)", background: page === p ? "var(--gold-gradient)" : "white", color: page === p ? "white" : "var(--text-primary)", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                                 >
                                    {p}
                                 </button>
                              );
                           }
                           if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: "var(--text-muted)", fontSize: 12 }}>...</span>;
                           return null;
                        })}
                     </div>

                     <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || totalPages === 0}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: (page === totalPages || totalPages === 0) ? "default" : "pointer", opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1 }}
                     >
                        <HiChevronRight size={18} />
                     </button>
                  </div>
               </div>

               <div style={{ flex: 1, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                     <thead>
                        <tr style={{ textAlign: "left", background: "var(--bg-primary)", borderBottom: "1px solid var(--border)" }}>
                           {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                              <th key={col.key} style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: isMobile ? 10 : 11, fontWeight: 900, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{col.label}</th>
                           ))}
                           <th style={{ padding: "20px 24px" }}></th>
                        </tr>
                     </thead>
                     <tbody style={{ position: "relative" }}>
                        {loading ? (
                           [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                              <tr key={i}>
                                 <td colSpan={visibleColumns.length + 1} style={{ padding: "16px 24px" }}>
                                    <div className="skeleton" style={{ height: 48, borderRadius: 12, width: "100%" }} />
                                 </td>
                              </tr>
                           ))
                        ) : (
                           orders.map((order, idx) => (
<tr
                                  key={order.id}
                                  style={{ borderBottom: "1px solid var(--border-light)", cursor: "pointer", animationDelay: `${idx * 0.05}s` }}
                                  onClick={async () => {
                                     const full = await getOrder(order.id);
                                     setSelectedOrder(full);
                                  }}
                                  className="animate-fade-in"
                              >
                                 {visibleColumns.includes('order_number') && <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontWeight: 800, fontSize: 16, whiteSpace: "nowrap" }}>{order.order_number}</td>}
                                 {visibleColumns.includes('branch') && <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{(order as any).branch?.name || "Chi nhánh chính"}</td>}
                                 {visibleColumns.includes('created_at') && <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: 15, color: "var(--text-secondary)", fontWeight: 600, whiteSpace: "nowrap" }}>{formatExactDBTime(order.created_at, "HH:mm • dd/MM/yyyy")}</td>}
                                 {visibleColumns.includes('items') && <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: 15, fontWeight: 700 }}>
                                        <div>{((order as any)._count?.items || 0)} món</div>
                                        {order.table_id && <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 900 }}>{((order as any).table?.name)}</div>}
                                     </td>}
                                 {visibleColumns.includes('payment_method') && (
                                    <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: 14, fontWeight: 800 }}>
                                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                          <MdPayment size={16} color="var(--accent)" />
                                          {order.payment_method === "CASH" ? "TIỀN MẶT" : "CHUYỂN KHOẢN"}
                                       </div>
                                    </td>
                                 )}
                                 {visibleColumns.includes('order_type') && (
                                    <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: 14, fontWeight: 800 }}>
                                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                          {order.order_type === "TAKEAWAY" ? <MdOutlineDeliveryDining size={18} color="var(--accent)" /> : <BiDish size={18} color="var(--accent)" />}
                                          {order.order_type === "TAKEAWAY" ? "MANG ĐI" : "TẠI CHỖ"}
                                       </div>
                                    </td>
                                 )}
                                 {visibleColumns.includes('discount_amount') && <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: 15, fontWeight: 700, color: "var(--danger)" }}>-{formatVND(order.discount_amount)}</td>}
{visibleColumns.includes('final_amount') && <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontWeight: 800, fontSize: 17, color: "var(--text-primary)" }}>{formatVND(order.final_amount)}</td>}
                                  {visibleColumns.includes('print_count') && <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", fontSize: 15, fontWeight: 700, color: "var(--text-muted)" }}>{order.print_count || 1}</td>}
                                  {visibleColumns.includes('status') && (
                                    <td style={{ padding: isMobile ? "12px 16px" : "20px 24px" }}>
                                       <span className="badge badge-success" style={{ fontSize: 12, whiteSpace: "nowrap" }}>HOÀN TẤT</span>
                                    </td>
                                 )}
                                 <td style={{ padding: isMobile ? "12px 16px" : "20px 24px", textAlign: "right", color: "var(--text-muted)" }}><HiEye size={20} /></td>
                              </tr>
                           ))
                        )}
                        {!loading && orders.length === 0 && (
                           <tr>
                              <td colSpan={visibleColumns.length + 1} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontWeight: 700 }}>Không tìm thấy đơn hàng nào</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
               <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                  <div style={{ background: "white", borderRadius: 32, width: "100%", maxWidth: 500, overflow: "hidden", display: "flex", flexDirection: "column" }} className="animate-fade-in">
                     <div style={{ padding: "32px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div>
                            <h3 style={{ fontSize: 18, fontWeight: 900 }}>Chi tiết đơn hàng</h3>
                            <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700 }}>{selectedOrder.order_number} • {(selectedOrder as any).branch?.name || "Tony Coffee & Tea"}</p>
                            {selectedOrder.order_type === "DINE_IN" && selectedOrder.table_id && <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 900, marginTop: 4 }}>BÀN: {selectedOrder.table?.name}</p>}
                         {selectedOrder.order_type === "TAKEAWAY" && <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 900, marginTop: 4 }}>MANG ĐI</p>}
                         </div>
                        <button onClick={() => setSelectedOrder(null)} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border)", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                           <HiX size={20} />
                        </button>
                     </div>

                     <div style={{ padding: 32, flex: 1, overflowY: "auto", maxHeight: "60vh" }}>
                        <div style={{ marginBottom: 32 }}>
                           <p style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 16 }}>SẢN PHẨM ĐÃ CHỌN</p>
                           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                              {(selectedOrder.items || []).map((item, i) => (
                                 <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1 }}>
                                       <div style={{ display: "flex", gap: 12 }}>
                                          <span style={{ fontWeight: 900, fontSize: 14, color: "var(--accent)" }}>{item.quantity}x</span>
                                          <div>
                                             <p style={{ fontWeight: 800, fontSize: 14 }}>{(item as any).product?.name_vi || "Món hỉ"}</p>
                                             {item.toppings && item.toppings.length > 0 && (
                                                <p style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>
                                                   + {item.toppings.map(t => t.name).join(", ")}
                                                </p>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: 14 }}>{formatVND(item.subtotal)}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div style={{ background: "var(--bg-primary)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>
                                 <HiCreditCard size={18} /> Phương thức
                              </div>
                              <span style={{ fontWeight: 800, fontSize: 13 }}>{selectedOrder.payment_method === "BANK_TRANSFER" ? "Chuyển khoản" : "Tiền mặt"}</span>
                           </div>

                           <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                 <span style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Tạm tính</span>
                                 <span style={{ fontWeight: 700, fontSize: 14 }}>{formatVND(selectedOrder.total_amount)}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--danger)" }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
                                    <HiTicket size={18} /> Giảm giá
                                 </div>
                                 <span style={{ fontWeight: 800, fontSize: 14 }}>-{formatVND(selectedOrder.discount_amount)}</span>
                              </div>
                           </div>

                           <div style={{ borderTop: "2px solid var(--border)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 900, fontSize: 15 }}>Tổng thanh toán</span>
                              <span style={{ fontWeight: 900, fontSize: 22, color: "var(--accent)" }}>{formatVND(selectedOrder.final_amount)}</span>
                           </div>
                        </div>
                     </div>

                     <div style={{ padding: 32, borderTop: "1px solid var(--border)" }}>
                        <button
                           onClick={() => handleReprint(selectedOrder)}
                           className="btn-primary"
                           style={{ width: "100%", padding: 18, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                        >
                           <HiPrinter size={20} /> IN LẠI HÓA ĐƠN
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* HIDDEN REPRINT TEMPLATE */}
            {selectedOrder && (
               <div id="reprint-content" style={{ display: "none" }}>
                  <div style={{ width: "80mm", padding: "16px", background: "white", color: "black", fontFamily: "Courier New", fontSize: "12px", lineHeight: "1.4" }}>
                     <div style={{ textAlign: "center", marginBottom: "15px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px" }}>TONY COFFEE & TEA</h2>
                        <p style={{ margin: "2px 0", fontSize: "11px" }}>{(selectedOrder as any).branch?.address || "Address Placeholder"}</p>
                        <p style={{ margin: "2px 0", fontSize: "11px" }}>ĐT: {(selectedOrder as any).branch?.phone || "Phone Placeholder"}</p>
                     </div>
                     <div style={{ textAlign: "center", marginBottom: "15px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>HÓA ĐƠN THANH TOÁN (IN LẠI)</h3>
                     </div>
                     <div style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                           <span>Số HĐ: {selectedOrder.order_number}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                           <span>Ngày: {format(new Date(selectedOrder.created_at), "dd/MM/yyyy")}</span>
                           <span>Giờ: {format(new Date(selectedOrder.created_at), "HH:mm:ss")}</span>
                        </div>
<div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px" }}>
                            <span>Thu ngân: {(selectedOrder as any).branch?.name || "Tony Coffee & Tea"}</span>
                            <span style={{ fontWeight: "bold" }}>Lần in: {selectedOrder.print_count || 1}</span>
                         </div>
{selectedOrder.order_type === "TAKEAWAY" ? "Mang đi" : (
                             <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px" }}>
                                <span>Bàn:</span>
                                <span style={{ fontWeight: "bold" }}>{selectedOrder.table?.name}</span>
                             </div>
                          )}
                     </div>
                     <table style={{ width: "100%", borderTop: "1px solid black", borderBottom: "1px solid black", borderCollapse: "collapse", marginTop: "10px" }}>
                        <thead>
                           <tr style={{ textAlign: "left", fontSize: "11px" }}>
                              <th style={{ padding: "6px 0" }}>TÊN HÀNG</th>
                              <th style={{ textAlign: "center" }}>SL</th>
                              <th style={{ textAlign: "right" }}>T.TIÊN</th>
                           </tr>
                        </thead>
                        <tbody style={{ fontSize: "11px" }}>
                           {(selectedOrder.items || []).map((item, i) => (
                              <tr key={i}>
                                 <td style={{ padding: "4px 0" }}>
                                    {i + 1}. {item.product?.name_vi || "Món"}
                                    {item.toppings && item.toppings.map(t => <div key={t.name} style={{ fontSize: "9px" }}>+ {t.name}</div>)}
                                 </td>
                                 <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                 <td style={{ textAlign: "right" }}>{item.subtotal.toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     <div style={{ marginTop: "10px", fontSize: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                           <span>TỔNG THANH TOÁN:</span>
                           <span>{selectedOrder.final_amount.toLocaleString()} ₫</span>
                        </div>
                     </div>
                     <div style={{ textAlign: "center", marginTop: "20px", borderTop: "1px dashed black", paddingTop: "15px" }}>
                        <p style={{ margin: "0", fontWeight: "bold" }}>Cảm Ơn Quý Khách!</p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
