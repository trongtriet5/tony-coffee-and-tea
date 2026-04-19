"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  getProductRecipes, getToppingRecipes, createProductRecipe, getRecipesByVariant,
  createToppingRecipe, deleteProductRecipe, deleteToppingRecipe,
  getProducts, getToppings, getMaterials,
  importRecipes, getRecipeTemplateUrl, exportRecipesExcel
} from "@/lib/api";
import { Product, Topping, Material } from "@/types";
import { HiPlus, HiCollection, HiSparkles, HiCheck, HiPencilAlt, HiTrash, HiUpload, HiDownload, HiDocumentText, HiEye } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";

export default function RecipePage() {
  const currentUser = useCurrentUser();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [activeTab, setActiveTab] = useState<"product" | "topping">("product");
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedToppingId, setSelectedToppingId] = useState<string>("");
  const [recipes, setRecipes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeFilter, setRecipeFilter] = useState<'all' | 'has' | 'no'>('all');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recipeForm, setRecipeForm] = useState({ material_id: "", quantity: "" });
  const [batchMode, setBatchMode] = useState(false);
  const [batchMaterials, setBatchMaterials] = useState<{ material_id: string; quantity: string }[]>([{ material_id: "", quantity: "" }]);

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role?.toUpperCase() === 'MANAGER') setActiveTab('product');
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === "product" && selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product && product.variants?.length > 0) {
        setSelectedVariantId(product.variants[0].id);
      } else {
        setSelectedVariantId("");
      }
    }
  }, [selectedProductId, activeTab, products]);

  useEffect(() => {
    if (activeTab === "product" && selectedVariantId) {
      loadProductRecipes(selectedVariantId);
    }
  }, [selectedVariantId, activeTab]);

  useEffect(() => {
    if (activeTab === "topping" && selectedToppingId) {
      loadToppingRecipes(selectedToppingId);
    }
  }, [selectedToppingId, activeTab]);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const [prods, tops, mats] = await Promise.all([
        getProducts({ all: true }),
        getToppings({ all: true }),
        getMaterials(),
      ]);
      setProducts(prods);
      setToppings(tops);
      setMaterials(mats);
    } catch (e) { console.error(e); }
    finally { setFetchLoading(false); }
  };


  const loadProductRecipes = async (variantId: string) => {
    setRecipeLoading(true);
    try {
      const data = await getRecipesByVariant(variantId);
      setRecipes(data);
    } catch (err) { console.error(err); }
    finally { setRecipeLoading(false); }
  };

  const loadToppingRecipes = async (toppingId: string) => {
    setRecipeLoading(true);
    try {
      const data = await getToppingRecipes(toppingId);
      setRecipes(data);
    } catch (err) { console.error(err); }
    finally { setRecipeLoading(false); }
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeForm.material_id || !recipeForm.quantity) return;
    setLoading(true);
    try {
      if (activeTab === "product") {
        if (!selectedVariantId) {
          toastWarning("Vui lòng chọn Size cho sản phẩm");
          setLoading(false);
          return;
        }
        await createProductRecipe({
          variant_id: selectedVariantId,
          material_id: recipeForm.material_id,
          quantity: parseFloat(recipeForm.quantity),
        });
        loadProductRecipes(selectedVariantId);
      } else {
        await createToppingRecipe({
          topping_id: selectedToppingId,
          material_id: recipeForm.material_id,
          quantity: parseFloat(recipeForm.quantity),
        });
        loadToppingRecipes(selectedToppingId);
      }
      setRecipeForm({ material_id: "", quantity: "" });
      toastSuccess("Thêm công thức thành công!");
      fetchData(); // Refresh list để cập nhật trạng thái "Có công thức"
    } catch (error) {
      toastError("Có lỗi xảy ra khi thêm công thức");
    } finally { setLoading(false); }
  };

  const handleBatchAddRecipe = async () => {
    const validItems = batchMaterials.filter(m => m.material_id && m.quantity);
    if (validItems.length === 0) {
      toastWarning("Vui lòng nhập ít nhất một nguyên liệu hợp lệ");
      return;
    }
    if (activeTab === "product" && !selectedVariantId) {
      toastWarning("Vui lòng chọn Size cho sản phẩm");
      return;
    }
    setLoading(true);
    try {
      for (const item of validItems) {
        if (activeTab === "product") {
          await createProductRecipe({
            variant_id: selectedVariantId,
            material_id: item.material_id,
            quantity: parseFloat(item.quantity),
          });
        } else {
          await createToppingRecipe({
            topping_id: selectedToppingId,
            material_id: item.material_id,
            quantity: parseFloat(item.quantity),
          });
        }
      }
      if (activeTab === "product") {
        loadProductRecipes(selectedVariantId);
      } else {
        loadToppingRecipes(selectedToppingId);
      }
      setBatchMaterials([{ material_id: "", quantity: "" }]);
      setBatchMode(false);
      toastSuccess(`Thêm ${validItems.length} công thức thành công!`);
      fetchData();
    } catch (error) {
      toastError("Có lỗi xảy ra khi thêm công thức");
    } finally { setLoading(false); }
  };

  const addBatchRow = () => {
    setBatchMaterials([...batchMaterials, { material_id: "", quantity: "" }]);
  };

  const updateBatchRow = (index: number, field: "material_id" | "quantity", value: string) => {
    const updated = [...batchMaterials];
    updated[index][field] = value;
    setBatchMaterials(updated);
  };

  const removeBatchRow = (index: number) => {
    if (batchMaterials.length > 1) {
      setBatchMaterials(batchMaterials.filter((_, i) => i !== index));
    }
  };

  const handleDeleteRecipe = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    const name = recipe?.material?.name || 'công thức này';
    setDeleteConfirm({ id, name });
  };

  const confirmDeleteRecipe = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      if (activeTab === "product") {
        await deleteProductRecipe(deleteConfirm.id);
        loadProductRecipes(selectedVariantId);
      } else {
        await deleteToppingRecipe(deleteConfirm.id);
        loadToppingRecipes(selectedToppingId);
      }
      toastSuccess("Xóa công thức thành công!");
      setDeleteConfirm(null);
    } catch (error) {
      toastError("Có lỗi xảy ra khi xóa công thức");
    } finally { setLoading(false); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await importRecipes(file);
      toastSuccess(`Import thành công!`);
      if (res.errors.length > 0) {
        toastWarning(`Có ${res.errors.length} lỗi mapping — Kiểm tra file import.`);
      }
      fetchData();
      if (selectedProductId) loadProductRecipes(selectedProductId);
      if (selectedToppingId) loadToppingRecipes(selectedToppingId);
    } catch (err) {
      toastError("Lỗi import file recipe.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, fontWeight: 700, outline: "none", transition: "0.2s", background: "var(--bg-primary)" };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? "24px 16px" : "40px 40px 60px 120px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Quản lý công thức pha chế</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 700 }}>Quản lý công thức và định lượng nguyên liệu cho sản phẩm & topping</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {currentUser?.role?.toUpperCase() === 'ADMIN' && (
              <>
                <a href={getRecipeTemplateUrl()} target="_blank" style={{ textDecoration: "none", background: "white", color: "var(--accent)", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  <HiDocumentText size={18} /> TEMPLATE
                </a>
                <button onClick={() => fileInputRef.current?.click()} style={{ background: "white", color: "var(--text-primary)", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
                  <HiUpload size={18} /> IMPORT
                  <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: "none" }} accept=".xlsx,.xls" />
                </button>
                <a href={exportRecipesExcel()} target="_blank" style={{ textDecoration: "none", background: "var(--accent)", color: "white", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, border: "none", boxShadow: "var(--shadow-sm)" }}>
                  <HiDownload size={18} /> EXPORT ALL
                </a>
              </>
            )}
          </div>
        </div>


        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>

          {/* LEFT: FORM & ITEM SELECTION */}
          <div>
            {/* Tab Switcher */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, background: "white", padding: 6, borderRadius: 16, border: "1px solid var(--border)" }}>
              <button onClick={() => { setActiveTab("product"); setSelectedProductId(""); setRecipes([]); }} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: activeTab === "product" ? "var(--accent)" : "transparent", color: activeTab === "product" ? "white" : "var(--text-muted)", fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "0.2s" }}>
                <HiCollection size={16} /> SẢN PHẨM
              </button>
              {currentUser?.role?.toUpperCase() === 'ADMIN' && (
                <button onClick={() => { setActiveTab("topping"); setSelectedToppingId(""); setRecipes([]); }} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: activeTab === "topping" ? "var(--accent)" : "transparent", color: activeTab === "topping" ? "white" : "var(--text-muted)", fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "0.2s" }}>
                  <HiSparkles size={16} /> TOPPING
                </button>
              )}
            </div>

            {/* Recipe Filter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--bg-primary)", borderRadius: 12 }}>
                <button onClick={() => setRecipeFilter('all')} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", background: recipeFilter === 'all' ? "white" : "transparent", color: recipeFilter === 'all' ? "var(--text-primary)" : "var(--text-muted)", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s", boxShadow: recipeFilter === 'all' ? "var(--shadow-sm)" : "none", whiteSpace: "nowrap" }}>TẤT CẢ</button>
                <button onClick={() => setRecipeFilter('has')} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", background: recipeFilter === 'has' ? "white" : "transparent", color: recipeFilter === 'has' ? "var(--text-primary)" : "var(--text-muted)", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s", boxShadow: recipeFilter === 'has' ? "var(--shadow-sm)" : "none", whiteSpace: "nowrap" }}>CÓ CÔNG THỨC</button>
                <button onClick={() => setRecipeFilter('no')} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", background: recipeFilter === 'no' ? "white" : "transparent", color: recipeFilter === 'no' ? "var(--text-primary)" : "var(--text-muted)", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s", boxShadow: recipeFilter === 'no' ? "var(--shadow-sm)" : "none", whiteSpace: "nowrap" }}>CHƯA CÓ CÔNG THỨC</button>
              </div>
            </div>

            {/* Item Selection */}
            <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, position: "sticky", top: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }} className="custom-scroll">
              <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 16, color: "var(--text-muted)" }}>CHỌN {activeTab === "product" ? "SẢN PHẨM" : "TOPPING"}</h3>

              {fetchLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}><AiOutlineLoading3Quarters size={24} className="spin" color="var(--accent)" /></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeTab === "product" ? (
                    (() => {
                      const orderMap: Record<string, number> = {
                        "CÀ PHÊ": 1, "TRÀ": 2, "TRÀ LẠNH": 2, "TRÀ NÓNG": 2,
                        "NƯỚC NGỌT": 3, "SINH TỐ": 4, "NƯỚC ÉP": 5,
                        "YOGURT": 6, "KHÁC": 7, "TOPPING": 8, "ĐỒ ĂN": 9
                      };
                      const sortedCats = Array.from(new Set(products.map(p => p.category)))
                        .sort((a, b) => (orderMap[a.toUpperCase()] || 99) - (orderMap[b.toUpperCase()] || 99));

                      return sortedCats.map(cat => {
                        const itemsInCat = products.filter(p => {
                          if (p.category !== cat) return false;
                          if (recipeFilter === 'has') return (p as any).has_recipe;
                          if (recipeFilter === 'no') return !(p as any).has_recipe;
                          return true;
                        });

                        if (itemsInCat.length === 0) return null;

                        return (
                          <div key={cat} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--accent)", marginBottom: 10, paddingLeft: 8, letterSpacing: 1.5 }}>{cat.toUpperCase()}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {itemsInCat.map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedProductId(item.id)}
                                  style={{
                                    padding: "12px 16px",
                                    borderRadius: 14,
                                    border: selectedProductId === item.id ? "2px solid var(--accent)" : "2px solid transparent",
                                    background: selectedProductId === item.id ? "var(--bg-primary)" : "white",
                                    color: "var(--text-primary)",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "0.2s",
                                    boxShadow: selectedProductId === item.id ? "none" : "var(--shadow-sm)",
                                    opacity: (item as any).has_recipe ? 1 : 0.6
                                  }}
                                  className="list-item"
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>{item.name_vi}</span>
                                    {(item as any).has_recipe && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }}></div>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()
                  ) : (
                    toppings
                      .filter(t => {
                        if (recipeFilter === 'has') return (t as any).has_recipe;
                        if (recipeFilter === 'no') return !(t as any).has_recipe;
                        return true;
                      })
                      .map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedToppingId(item.id)}
                          style={{
                            padding: "12px 16px",
                            borderRadius: 12,
                            border: selectedToppingId === item.id ? "2px solid var(--accent)" : "2px solid transparent",
                            background: selectedToppingId === item.id ? "var(--bg-primary)" : "white",
                            color: "var(--text-primary)",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "0.2s",
                            opacity: (item as any).has_recipe ? 1 : 0.6
                          }}
                          className="list-item"
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{item.name}</span>
                            {(item as any).has_recipe && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }}></div>}
                          </div>
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RECIPE LIST & FORM */}
          <div>
            {(activeTab === "product" && selectedProductId) || (activeTab === "topping" && selectedToppingId) ? (
              <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: "24px 24px 32px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ marginBottom: 24, paddingRight: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900 }}>
                    Công thức - {activeTab === "product"
                      ? products.find(p => p.id === selectedProductId)?.name_vi
                      : toppings.find(t => t.id === selectedToppingId)?.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700 }}>Danh sách nguyên liệu và định lượng cần thiết.</p>
                </div>

                <div style={{ flex: 1, overflowY: "auto", paddingRight: 12, marginBottom: 24, minHeight: 0 }} className="custom-scroll">
                  {recipeLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ padding: "16px 20px", borderRadius: 16, background: "var(--bg-primary)" }}>
                          <div style={{ height: 14, width: "60%", background: "var(--border)", borderRadius: 4, marginBottom: 8, opacity: 0.5 }}></div>
                          <div style={{ height: 10, width: "30%", background: "var(--border)", borderRadius: 4, opacity: 0.3 }}></div>
                        </div>
                      ))}
                    </div>
                  ) : recipes.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}>
                      Chưa có công thức nào. Thêm nguyên liệu ở dưới.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {recipes.map(r => (
                        <div key={r.id} style={{ padding: "16px 20px", borderRadius: 16, background: "var(--bg-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4 }}>{r.material?.name || r.material_name}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700 }}>
                              {Number(r.quantity).toFixed(3).replace(/\.?0+$/, "")} {r.material?.unit || r.material_unit}
                              {currentUser?.role?.toUpperCase() === 'ADMIN' && (
                                <> • ₫{(r.quantity * (r.material?.cost_per_unit || r.cost_per_unit || 0)).toLocaleString("vi-VN")}</>
                              )}
                            </div>
                          </div>
                          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
                            <button onClick={() => handleDeleteRecipe(r.id)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }} title="Xóa">
                              <HiTrash size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Recipe Form */}
                {currentUser?.role?.toUpperCase() === 'ADMIN' && (
                  <div style={{ paddingTop: 20, borderTop: "2px solid var(--bg-primary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h4 style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)" }}>THÊM NGUYÊN LIỆU MỚI</h4>
                      <button
                        onClick={() => setBatchMode(!batchMode)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: batchMode ? "var(--accent)" : "var(--bg-primary)",
                          color: batchMode ? "white" : "var(--text-secondary)",
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <HiEye size={14} /> {batchMode ? "THÊM TỪNG" : "THÊM NHIỀU"}
                      </button>
                    </div>

                    {!batchMode ? (
                      <form onSubmit={handleAddRecipe}>
                        <div style={{ display: "grid", gridTemplateColumns: activeTab === "product" ? "1.2fr 1fr 1fr" : "1.2fr 1fr", gap: 12, marginBottom: 16 }}>
                          {activeTab === "product" && (
                            <div>
                              <label style={labelStyle}>SIZE</label>
                              <select
                                style={{ ...inputStyle, padding: "10px 12px" }}
                                value={selectedVariantId}
                                onChange={e => setSelectedVariantId(e.target.value)}
                                required
                              >
                                <option value="">-- Chọn Size --</option>
                                {products.find(p => p.id === selectedProductId)?.variants?.map(v => (
                                  <option key={v.id} value={v.id}>{v.size}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div>
                            <label style={labelStyle}>NGUYÊN LIỆU</label>
                            <select
                              style={{ ...inputStyle, padding: "10px 12px" }}
                              value={recipeForm.material_id}
                              onChange={e => setRecipeForm({ ...recipeForm, material_id: e.target.value })}
                              required
                            >
                              <option value="">-- Chọn --</option>
                              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>ĐỊNH LƯỢNG</label>
                            <input
                              type="number"
                              step="0.001"
                              placeholder="Số lượng..."
                              style={{ ...inputStyle, padding: "10px 12px" }}
                              value={recipeForm.quantity}
                              onChange={e => setRecipeForm({ ...recipeForm, quantity: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="submit" disabled={loading} style={{ flex: 2, padding: 14, background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", transition: "0.2s" }} className="hover-btn">
                            {loading ? <AiOutlineLoading3Quarters size={16} className="spin" /> : <><HiPlus size={18} /> THÊM</>}
                          </button>
                          <button
                            onClick={() => { setBatchMode(true); if (!selectedVariantId && activeTab === "product" && products.find(p => p.id === selectedProductId)?.variants?.length) setSelectedVariantId(products.find(p => p.id === selectedProductId)?.variants?.[0]?.id || ""); }}
                            style={{ flex: 1, padding: 14, background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                            title="Thêm nhiều nguyên liệu 1 lúc"
                          >
                            + THÊM NHIỀU NGUYÊN LIỆU
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        {activeTab === "product" && (
                          <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>SIZE</label>
                            <select
                              style={{ ...inputStyle, padding: "10px 12px" }}
                              value={selectedVariantId}
                              onChange={e => setSelectedVariantId(e.target.value)}
                              required
                            >
                              <option value="">-- Chọn Size --</option>
                              {products.find(p => p.id === selectedProductId)?.variants?.map(v => (
                                <option key={v.id} value={v.id}>{v.size}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
                          {batchMaterials.map((row, idx) => (
                            <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, alignItems: "center" }}>
                              <select
                                style={{ ...inputStyle, padding: "8px 10px" }}
                                value={row.material_id}
                                onChange={e => updateBatchRow(idx, "material_id", e.target.value)}
                              >
                                <option value="">-- Chọn --</option>
                                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                              </select>
                              <input
                                type="number"
                                step="0.001"
                                placeholder="SL..."
                                style={{ ...inputStyle, padding: "8px 10px" }}
                                value={row.quantity}
                                onChange={e => updateBatchRow(idx, "quantity", e.target.value)}
                              />
                              <button
                                onClick={() => removeBatchRow(idx)}
                                style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: 8 }}
                                disabled={batchMaterials.length === 1}
                              >
                                <HiTrash size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={addBatchRow}
                            style={{ flex: 1, padding: 12, background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                          >
                            + THÊM DÒNG
                          </button>
                          <button
                            onClick={handleBatchAddRecipe}
                            disabled={loading}
                            style={{ flex: 2, padding: 12, background: "var(--accent)", color: "white", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer", display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}
                          >
                            {loading ? <AiOutlineLoading3Quarters size={16} className="spin" /> : "THÊM TẤT CẢ"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: 32, height: "calc(100vh - 160px)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-secondary)" }}>
                <div>
                  <div style={{ fontSize: 40, marginBottom: 16, display: "flex", justifyContent: "center", opacity: 0.2 }}><HiCollection /></div>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>Chọn một {activeTab === "product" ? "sản phẩm" : "topping"} ở bên trái để xem và quản lý công thức</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: "white", borderRadius: 24, padding: 32, maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Xác nhận xóa?</h3>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 24 }}>
              Bạn chắc chắn muốn xóa công thức <strong>{deleteConfirm.name}</strong>?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>HỦY</button>
              <button onClick={confirmDeleteRecipe} disabled={loading} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "var(--danger)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Đang xóa..." : "XÓA"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
);
}

