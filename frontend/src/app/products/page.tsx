"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createProduct, updateProduct, getProducts, getCategories, createTopping, updateTopping, getToppings, deleteProduct, deleteTopping } from "@/lib/api";
import { useProducts, useCategories, useToppings, optimisticCreateProduct, optimisticUpdateProduct, optimisticDeleteProduct, optimisticCreateTopping, optimisticUpdateTopping, optimisticDeleteTopping, refreshProducts } from "@/lib/useProducts";
import type { Product, Topping } from "@/types";
import { HiPlus, HiCollection, HiSparkles, HiCheck, HiPencilAlt, HiBadgeCheck, HiBan, HiTrash } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";

export default function ProductsManagementPage() {
  const currentUser = useCurrentUser();
  const { success: toastSuccess, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"product" | "topping">("product");
  const [listFilter, setListFilter] = useState<"all" | "product" | "topping">("all");

  const [loading, setLoading] = useState(false);
  const { products, isLoading: productsLoading, mutate: mutateProducts } = useProducts(true);
  const { categories, isLoading: categoriesLoading, mutate: mutateCategories } = useCategories();
  const { toppings, isLoading: toppingsLoading, mutate: mutateToppings } = useToppings(true);
  const fetchLoading = productsLoading || categoriesLoading || toppingsLoading;

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ name_vi: "", name_en: "", price: "", category: "Cà Phê", available: true });

  const [editingToppingId, setEditingToppingId] = useState<string | null>(null);
  const [toppingForm, setToppingForm] = useState({ name: "", price: "", available: true });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshProducts();
    mutateProducts();
    mutateCategories();
    mutateToppings();
  }, [mutateProducts, mutateCategories, mutateToppings]);

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name_vi || !productForm.price) return;
    setLoading(true);
    try {
      const payload = {
        name_vi: productForm.name_vi,
        name_en: productForm.name_en || productForm.name_vi,
        price: parseFloat(productForm.price),
        category: productForm.category,
        available: productForm.available
      };

      if (editingProductId) {
        await optimisticUpdateProduct(editingProductId, payload as any);
        toastSuccess("Cập nhật món thành công!");
      } else {
        await optimisticCreateProduct(payload as any);
        toastSuccess("Đã thêm món mới thành công!");
      }

      setProductForm({ name_vi: "", name_en: "", price: "", category: productForm.category, available: true });
      setEditingProductId(null);
    } catch (error) {
      toastError("Có lỗi xảy ra khi xử lý món");
    } finally { setLoading(false); }
  };

  const handleCreateOrUpdateTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toppingForm.name || !toppingForm.price) return;
    setLoading(true);
    try {
      const payload = {
        name: toppingForm.name,
        price: parseFloat(toppingForm.price),
        available: toppingForm.available
      };
      if (editingToppingId) {
        await optimisticUpdateTopping(editingToppingId, payload);
        toastSuccess("Cập nhật topping thành công!");
      } else {
        await optimisticCreateTopping(payload);
        toastSuccess("Đã thêm topping mới thành công!");
      }
      setToppingForm({ name: "", price: "", available: true });
      setEditingToppingId(null);
    } catch (error) {
      toastError("Có lỗi xảy ra khi xử lý topping");
    } finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    const Swal = (window as any).Swal;
    if (!Swal) return;

    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Bạn chắc chắn muốn xóa món này? Tất cả công thức liên quan cũng sẽ bị xóa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await optimisticDeleteProduct(id);
        toastSuccess("Xóa món thành công!");
      } catch (error: any) {
        toastError(error.response?.data?.message || "Có lỗi xảy ra khi xóa món");
      } finally { setLoading(false); }
    }
  };

  const handleDeleteTopping = async (id: string) => {
    const Swal = (window as any).Swal;
    if (!Swal) return;

    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Bạn chắc chắn muốn xóa topping này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await optimisticDeleteTopping(id);
        toastSuccess("Xóa topping thành công!");
      } catch (error: any) {
        toastError(error.response?.data?.message || "Có lỗi xảy ra khi xóa topping");
      } finally { setLoading(false); }
    }
  };

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    const basePrice = (p as any).price ?? (p.variants?.length > 0 ? Math.min(...p.variants.map(v => v.price)) : 0);
    setProductForm({ name_vi: p.name_vi, name_en: p.name_en, price: basePrice.toString(), category: p.category, available: p.available });
    setActiveTab("product");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditTopping = (t: Topping) => {
    setEditingToppingId(t.id);
    setToppingForm({ name: t.name, price: t.price.toString(), available: t.available });
    setActiveTab("topping");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditingToppingId(null);
    setProductForm({ name_vi: "", name_en: "", price: "", category: "Cà Phê", available: true });
    setToppingForm({ name: "", price: "", available: true });
  };

  const inputStyle = { width: "100%", padding: "14px 18px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 15, fontWeight: 700, outline: "none", transition: "0.2s", background: "var(--bg-primary)" };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "32px 24px" : "40px 40px 60px 120px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Quản lý món</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 700 }}>Quản lý danh mục Sản phẩm & Topping</p>
          </div>
        </div>


        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>

          {/* LEFT: FORM SECTION */}
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 24, background: "white", padding: 6, borderRadius: 16, border: "1px solid var(--border)" }}>
              <button onClick={() => { setActiveTab("product"); cancelEdit(); }} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: activeTab === "product" ? "var(--accent)" : "transparent", color: activeTab === "product" ? "white" : "var(--text-muted)", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "0.2s" }}>
                <HiCollection size={16} /> MÓN CHÍNH
              </button>
              <button onClick={() => { setActiveTab("topping"); cancelEdit(); }} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: activeTab === "topping" ? "var(--accent)" : "transparent", color: activeTab === "topping" ? "white" : "var(--text-muted)", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "0.2s" }}>
                <HiSparkles size={16} /> TOPPING
              </button>
            </div>

            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, position: "sticky", top: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {activeTab === "product" ? (editingProductId ? "SỬA MÓN CHÍNH" : (currentUser?.role === 'ADMIN' ? "THÊM MÓN CHÍNH" : "CHỌN MÓN ĐỂ SỬA")) : (editingToppingId ? "SỬA TOPPING" : (currentUser?.role === 'ADMIN' ? "THÊM TOPPING" : "CHỌN TOPPING ĐỂ SỬA"))}
                {(editingProductId || editingToppingId) && (
                  <button onClick={cancelEdit} style={{ background: "var(--bg-primary)", color: "var(--text-muted)", fontSize: 13, border: "none", padding: "6px 12px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>HỦY</button>
                )}
              </h3>

              {activeTab === "product" ? (
                <form onSubmit={handleCreateOrUpdateProduct}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
                    <div>
                      <label style={labelStyle}>Tên món (Tiếng Việt)</label>
                      <input required placeholder="VD: Cà phê sữa đá" style={inputStyle} value={productForm.name_vi} onChange={e => setProductForm({ ...productForm, name_vi: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tên món (Tiếng Anh)</label>
                      <input required placeholder="VD: Vietnamese iced coffee" style={inputStyle} value={productForm.name_en} onChange={e => setProductForm({ ...productForm, name_en: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Giá bán (VNĐ)</label>
                      <input disabled={currentUser?.role !== 'ADMIN'} required type="number" placeholder="VD: 35000" style={{ ...inputStyle, opacity: currentUser?.role !== 'ADMIN' ? 0.6 : 1 }} value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Danh mục</label>
                      <select disabled={currentUser?.role !== 'ADMIN'} style={{ ...inputStyle, opacity: currentUser?.role !== 'ADMIN' ? 0.6 : 1 }} value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                        {categories.map(c => <option key={c.category} value={c.category}>{c.category || "KHÁC"}</option>)}
                        {!categories.find(c => c.category === "Cà Phê") && <option value="Cà Phê">Cà Phê</option>}
                      </select>
                      {currentUser?.role === 'ADMIN' && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            placeholder="+ Thêm danh mục mới (ghi vào đây nếu chưa có)"
                            style={{ ...inputStyle, fontSize: 11, padding: "8px 12px" }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                setProductForm({ ...productForm, category: e.target.value });
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", width: "fit-content", marginBottom: 32 }}>
                    <input type="checkbox" checked={productForm.available} onChange={e => setProductForm({ ...productForm, available: e.target.checked })} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>Khả dụng (Hiện trên Menu)</span>
                  </label>

                  {(!editingProductId && currentUser?.role !== 'ADMIN') ? null : (
                    <button disabled={loading} type="submit" style={{ width: "100%", padding: 16, background: "var(--accent)", color: "white", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", transition: "0.2s" }} className="hover-btn">
                      {loading ? <AiOutlineLoading3Quarters size={18} className="spin" /> : editingProductId ? <><HiPencilAlt size={18} /> LƯU THAY ĐỔI</> : <><HiPlus size={18} /> LƯU MÓN MỚI</>}
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleCreateOrUpdateTopping}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
                    <div>
                      <label style={labelStyle}>Tên topping</label>
                      <input required placeholder="VD: Trân châu" style={inputStyle} value={toppingForm.name} onChange={e => setToppingForm({ ...toppingForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Giá bán (VNĐ)</label>
                      <input disabled={currentUser?.role !== 'ADMIN'} required type="number" placeholder="VD: 10000" style={{ ...inputStyle, opacity: currentUser?.role !== 'ADMIN' ? 0.6 : 1 }} value={toppingForm.price} onChange={e => setToppingForm({ ...toppingForm, price: e.target.value })} />
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", width: "fit-content", marginBottom: 32 }}>
                    <input type="checkbox" checked={toppingForm.available} onChange={e => setToppingForm({ ...toppingForm, available: e.target.checked })} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>Khả dụng (Cho phép Order)</span>
                  </label>

                  {(!editingToppingId && currentUser?.role !== 'ADMIN') ? null : (
                    <button disabled={loading} type="submit" style={{ width: "100%", padding: 16, background: "var(--accent)", color: "white", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", transition: "0.2s" }} className="hover-btn">
                      {loading ? <AiOutlineLoading3Quarters size={18} className="spin" /> : editingToppingId ? <><HiPencilAlt size={18} /> LƯU THAY ĐỔI</> : <><HiPlus size={18} /> LƯU TOPPING MỚI</>}
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: LIST SECTION */}
          <div>
            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: "24px 8px 32px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingRight: 24 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900 }}>Danh sách hiện có</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 700 }}>Nhấn vào dòng để chỉnh sửa thông tin món hoặc topping.</p>
                </div>
                <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--bg-primary)", borderRadius: 10 }}>
                  <button onClick={() => setListFilter('all')} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: listFilter === 'all' ? "white" : "transparent", color: listFilter === 'all' ? "var(--accent)" : "var(--text-muted)", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "0.2s" }}>TẤT CẢ</button>
                  <button onClick={() => setListFilter('product')} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: listFilter === 'product' ? "white" : "transparent", color: listFilter === 'product' ? "var(--accent)" : "var(--text-muted)", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "0.2s" }}>MÓN CHÍNH</button>
                  <button onClick={() => setListFilter('topping')} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: listFilter === 'topping' ? "white" : "transparent", color: listFilter === 'topping' ? "var(--accent)" : "var(--text-muted)", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "0.2s" }}>TOPPING</button>
                </div>
              </div>

              {fetchLoading ? (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 16 }}>
                  <div style={{ marginBottom: 32 }}>
                    <div className="skeleton" style={{ height: 20, width: 150, marginBottom: 16, borderRadius: 4 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
                    </div>
                  </div>
                  <div>
                    <div className="skeleton" style={{ height: 20, width: 120, marginBottom: 16, borderRadius: 4 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 16 }} className="custom-scroll animate-fade-in">
                  {/* PRODUCTS */}
                  {(listFilter === 'all' || listFilter === 'product') && (
                    <div style={{ marginBottom: 32 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><HiCollection size={16} /> SẢN PHẨM CHÍNH ({products.length})</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {products.map((p, idx) => (
                          <div
                            key={p.id}
                            onClick={() => startEditProduct(p)}
                            style={{
                              padding: "16px 20px",
                              borderRadius: 16,
                              background: "var(--bg-primary)",
                              border: editingProductId === p.id ? "2px solid var(--accent)" : "2px solid transparent",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              transition: "0.2s",
                              animationDelay: `${idx * 0.05}s`
                            }}
                            className="list-item animate-fade-in"
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 16, fontWeight: 900 }}>{(p as any).name_vi}</span>
                                {p.available ? <HiBadgeCheck size={16} color="var(--success)" /> : <HiBan size={16} color="var(--danger)" />}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-secondary)", display: "flex", gap: 8 }}>
                                <span style={{ background: "white", padding: "2px 8px", borderRadius: 6 }}>{(p as any).category || "KHÁC"}</span>
                                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((p as any).price ?? (p.variants?.length > 0 ? Math.min(...p.variants.map((v: any) => v.price)) : 0))}</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <HiPencilAlt size={20} color={editingProductId === p.id ? "var(--accent)" : "var(--text-muted)"} />
                              {currentUser?.role === 'ADMIN' && (
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <HiTrash size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOPPINGS */}
                  {(listFilter === 'all' || listFilter === 'topping') && (
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><HiSparkles size={16} /> TOPPING ({toppings.length})</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {toppings.map((t, idx) => (
                          <div
                            key={t.id}
                            onClick={() => startEditTopping(t)}
                            style={{
                              padding: "16px 20px",
                              borderRadius: 16,
                              background: "var(--bg-primary)",
                              border: editingToppingId === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              transition: "0.2s",
                              animationDelay: `${(products.length + idx) * 0.05}s`
                            }}
                            className="list-item animate-fade-in"
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 900 }}>{t.name}</span>
                                {t.available ? <HiBadgeCheck size={16} color="var(--success)" /> : <HiBan size={16} color="var(--danger)" />}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.price)}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <HiPencilAlt size={20} color={editingToppingId === t.id ? "var(--accent)" : "var(--text-muted)"} />
                              {currentUser?.role === 'ADMIN' && (
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteTopping(t.id); }} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <HiTrash size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hover-btn:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(202, 162, 26, 0.2); }
        .hover-btn:active { transform: translateY(0); }
        .list-item:hover { transform: translateX(4px); background: #fdfbf7 !important; border-color: rgba(202, 162, 26, 0.3) !important; }
        input:focus, select:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(202, 162, 26, 0.1); }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
