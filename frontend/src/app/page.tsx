"use client";
import { useState, useEffect, useCallback, useMemo, useDeferredValue } from "react";
import { getCategories, getToppings, createOrder, getAvailableTables, getOrder, addItemsToOrder, getBranches } from "@/lib/api";
import { useProducts, useToppings } from "@/lib/useProducts";
import type { Product, Topping, CartItem, PaymentMethod, OrderType, Table, Branch, ProductVariant, Order } from "@/types";
import {
  HiChevronLeft, HiPlus, HiMinus, HiTrash, HiShoppingCart,
  HiSearch, HiCheckCircle, HiX, HiPlusCircle, HiOfficeBuilding
} from "react-icons/hi";
import { MdOutlineReceiptLong, MdPayment } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiCoffeeTogo, BiDish } from "react-icons/bi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/components/ToastProvider";
import { useRouter, usePathname } from "next/navigation";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const CATEGORY_ICONS: Record<string, any> = {
  "Cà phê": BiCoffeeTogo, "Trà": BiCoffeeTogo, "Sinh tố": BiCoffeeTogo, "Nước ép": BiCoffeeTogo, "Đồ ăn": BiDish, "Topping": HiPlusCircle
};


const numberToWords = (num: number): string => {
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
  const units_vn = ["", "nghìn", "triệu", "tỷ"];

  if (num === 0) return "không đồng";

  let str = "";
  let unitIdx = 0;

  const readThreeDigits = (n: number) => {
    let res = "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) res += units[h] + " trăm ";
    if (t > 1) {
      res += tens[t] + " ";
      if (u === 1) res += "mốt";
      else if (u === 5) res += "lăm";
      else if (u > 0) res += units[u];
    } else if (t === 1) {
      res += "mười ";
      if (u === 5) res += "lăm";
      else if (u > 0) res += units[u];
    } else if (h > 0 && u > 0) {
      res += "lẻ " + units[u];
    } else if (u > 0) {
      res += units[u];
    }
    return res;
  };

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      str = readThreeDigits(chunk) + " " + units_vn[unitIdx] + " " + str;
    }
    num = Math.floor(num / 1000);
    unitIdx++;
  }

  const result = str.trim().charAt(0).toUpperCase() + str.trim().slice(1) + " đồng./";
  return result.replace(/\s+/g, ' ');
};

const ReceiptTemplate = ({ order, branch }: { order: Order; branch?: Branch }) => {
  const totalQty = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const bankCode = process.env.NEXT_PUBLIC_BANK_CODE || 'Techcombank';
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '19038133016013';
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Tony Coffee & Tea';
  const businessAddress = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || branch?.address || '123 Đường ABC, Quận 1, TP.HCM';
  const businessPhone = branch?.phone || '0123456789';
  const wifiName = process.env.NEXT_PUBLIC_WIFI_NAME || 'leanhxuan';
  const qrUrl = order.payment_method === 'BANK_TRANSFER'
    ? `https://img.vietqr.io/image/${bankCode}-${bankAccount}-qr_only.png?amount=${order.final_amount}&addInfo=Thanh toan don hang ${order.order_number}`
    : null;

  return (
    <div id="receipt-print" style={{
      width: "80mm",
padding: "16px",
      background: "white",
      color: "black",
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: "12px",
      lineHeight: "1.4"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px" }}>{businessName}</h2>
        <p style={{ margin: "2px 0", fontSize: "11px" }}>{businessAddress}</p>
        <p style={{ margin: "2px 0", fontSize: "11px" }}>ĐT: {businessPhone}</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>HÓA ĐƠN THANH TOÁN</h3>
      </div>

      {/* Bill Info */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "bold" }}>Số HĐ: {order.order_number}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
          <span>Ngày: {new Date(order.created_at).toLocaleDateString("vi-VN")}</span>
          <span>Giờ: {new Date(order.created_at).toLocaleTimeString("vi-VN")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          <span style={{ fontWeight: "bold" }}>Bàn:</span>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>{order.order_type === "TAKEAWAY" ? "Mang đi" : ((order as any).table?.name || order.table_id || "Mang đi")}</span>
        </div>
        <div style={{ fontSize: "11px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
          <span>Thu ngân: {branch?.name || businessName}</span>
          <span style={{ fontWeight: "bold" }}>Lần in: {order.print_count || 1}</span>
        </div>
      </div>

      {/* Table Header */}
      <table style={{ width: "100%", borderTop: "1px solid black", borderBottom: "1px solid black", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ textAlign: "left", fontSize: "11px" }}>
            <th style={{ padding: "6px 0", width: "50%" }}>TÊN HÀNG</th>
            <th style={{ textAlign: "center", padding: "6px 0" }}>SL</th>
            <th style={{ textAlign: "right", padding: "6px 0" }}>Đơn Giá</th>
            <th style={{ textAlign: "right", padding: "6px 0" }}>T.TIÊN</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: "11px" }}>
          {order.items?.map((item, i) => (
            <tr key={i} style={{ verticalAlign: "top" }}>
              <td style={{ padding: "4px 0" }}>
                {i + 1}) {item.product?.name_vi || "Món hỉ"}
                {item.toppings && item.toppings.length > 0 && (
                  <div style={{ fontSize: "9px", fontStyle: "italic", paddingLeft: "12px" }}>
                    + {item.toppings.map((t: any) => t.name).join(", ")}
                  </div>
                )}
              </td>
              <td style={{ textAlign: "center", padding: "4px 0" }}>{item.quantity}</td>
              <td style={{ textAlign: "right", padding: "4px 0" }}>{item.unit_price.toLocaleString()}</td>
              <td style={{ textAlign: "right", padding: "4px 0" }}>{item.subtotal.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ marginTop: "10px", fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <span>T.Cộng</span>
          <span>{totalQty}</span>
          <span>{order.total_amount.toLocaleString()}</span>
        </div>

        {order.discount_amount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "4px" }}>
            <span>Giảm giá:</span>
            <span>-{order.discount_amount.toLocaleString()}</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "10px" }}>
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>
            {order.payment_method === 'CASH' ? 'TIỀN MẶT' : 'CHUYỂN KHOẢN'}
          </span>
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>{order.final_amount.toLocaleString()}</span>
        </div>

        <p style={{ margin: "10px 0", fontSize: "11px", fontStyle: "italic" }}>
          {numberToWords(order.final_amount)}
        </p>
      </div>

      {/* QR Code section */}
      {qrUrl && (
        <div style={{ textAlign: "center", marginTop: "15px", borderTop: "1px dashed #ccc", paddingTop: "15px" }}>
          <p style={{ fontSize: "10px", marginBottom: "8px", fontWeight: "bold" }}>QUÉT MÃ ĐỂ THANH TOÁN</p>
          <img src={qrUrl} alt="VietQR" style={{ width: "120px", height: "120px" }} />
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "20px", borderTop: "1px dashed black", paddingTop: "15px" }}>
        <p style={{ margin: "0", fontWeight: "bold" }}>Cảm Ơn Quý Khách - Hẹn Gặp Lại</p>
        <p style={{ margin: "4px 0 0", fontSize: "10px" }}>{businessName} - Đánh thức mọi giác quan</p>
        <p style={{ margin: "4px 0 0", fontSize: "10px" }}>Wifi: {wifiName}</p>
      </div>
    </div>
  );
};

export default function POSPage() {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const { products, isLoading: productsLoading } = useProducts(false);
  const toppings = useToppings(false).toppings;
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Record<string, number>>({});

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [paymentPending, setPaymentPending] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [orderType, setOrderType] = useState<OrderType>("TAKEAWAY");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [showTableActionModal, setShowTableActionModal] = useState<Table | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.branch_id) setSelectedBranchId(currentUser.branch_id);
      if (currentUser.role === 'ADMIN' && pathname !== '/dashboard') {
        window.location.href = '/dashboard';
        return;
      }
    }
  }, [currentUser, pathname]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Initial data fetch
    Promise.all([getBranches(), getCategories()]).then(([brs, cats]) => {
      setBranches(brs || []);
      setPageLoading(false);
      
      const orderMap: Record<string, number> = {
        "CÀ PHÊ": 1,
        "TRÀ": 2,
        "TRÀ LẠNH": 2,
        "TRÀ NÓNG": 2,
        "NƯỚC NGỌT": 3,
        "SINH TỐ": 4, 
        "NƯỚC ÉP": 5, 
        "YOGURT": 6, 
        "KHÁC": 7, 
        "TOPPING": 8, 
        "ĐỒ ĂN": 9
      };

      const sortedCats = cats
        .map(c => typeof c === 'string' ? c : (c as any).category)
        .filter(c => c && c.toUpperCase() !== "TOPPING")
        .sort((a, b) => (orderMap[a.toUpperCase()] || 99) - (orderMap[b.toUpperCase()] || 99));

      setCategories([...new Set([...sortedCats, "Topping"])]);
      setPageLoading(false);

      const params = new URLSearchParams(window.location.search);
      const tId = params.get("tableId");
      const oId = params.get("orderId");

      if (oId && tId) {
        setActiveOrderId(oId);
        setSelectedTableId(tId);
        setOrderType("DINE_IN");
        setIsCartOpen(true);

        getOrder(oId).then(order => {
          if (order) {
            setSelectedBranchId(order.branch_id);
            const existingItems = (order.items || []).map((item: any) => ({
              product: item.product,
              variant_id: item.variant_id,
              quantity: item.quantity,
              selectedToppings: item.toppings?.map((t: any) => ({
                id: (t as any).topping_id,
                name: (t as any).name,
                price: (t as any).price
              })),
              isExisting: true
            }));
            setCart(existingItems);
          }
        });
      } else if (tId) {
        setSelectedTableId(tId);
        setOrderType("DINE_IN");
        if (currentUser?.role?.toUpperCase() !== 'ADMIN' && currentUser?.branch_id) {
          setSelectedBranchId(currentUser.branch_id);
        } else if (brs.length > 0) {
          setSelectedBranchId(brs[0].id);
        }
      } else {
        if (currentUser?.role?.toUpperCase() !== 'ADMIN' && currentUser?.branch_id) {
          setSelectedBranchId(currentUser.branch_id);
        } else if (brs.length > 0) {
          setSelectedBranchId(brs[0].id);
        }
      }
    });

    return () => window.removeEventListener("resize", checkMobile);
  }, [currentUser]);

  // Fetch branch-specific data when branch changes
  useEffect(() => {
    if (selectedBranchId) {
      setCart([]); // Clear cart when branch changes
      getAvailableTables(selectedBranchId).then(setTables);
    }
  }, [selectedBranchId]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Topping") {
      return toppings.map(t => ({
        id: t.id, name_vi: t.name, name_en: "Topping", price: t.price, category: "Topping", available: t.available, variants: []
      } as any)).filter(p => p.name_vi.toLowerCase().includes(deferredSearchQuery.toLowerCase()));
    }
    return products.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchSearch = p.name_vi.toLowerCase().includes(deferredSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, toppings, selectedCategory, deferredSearchQuery]);

  const addToCart = useCallback((product: Product, variantId: string | undefined, selectedTops: Topping[]) => {
    setCart((prev) => {
      const topIds = selectedTops.map(t => t.id).sort().join(',');
      const existing = prev?.find((i: any) =>
        !i.isExisting &&
        i.product?.id === product.id &&
        i.variant_id === variantId &&
        (i.selectedToppings || []).map((t: any) => t.id).sort().join(',') === topIds
      );

      if (existing) {
        return prev.map((i: any) => (i === existing) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...(prev || []), { product, variant_id: variantId, quantity: 1, selectedToppings: selectedTops }];
    });
  }, []);

  const updateQty = useCallback((item: CartItem, delta: number) => {
    setCart((prev) => prev.map((i) => i === item ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));
  }, []);

  const calculateItemPrice = useCallback((item: CartItem) => {
    const variant = item.product?.variants?.find(v => v.id === item.variant_id);
    const base = variant ? variant.price : (item.product as any).price || 0;
    const tops = (item.selectedToppings || []).reduce((s, t) => s + t.price, 0);
    return base + tops;
  }, []);

  const handleItemClick = useCallback((p: Product) => {
    if (p.category === "Đồ Ăn" || p.category === "Topping") {
      const dummyVariantId = p.variants?.[0]?.id;
      addToCart(p, dummyVariantId, []);
    } else {
      setActiveProduct(p);
      setSelectedVariant(p.variants?.[0] || null);
      setSelectedToppings({});
    }
  }, [addToCart]);

  const updateToppingQty = useCallback((tId: string, delta: number) => {
    setSelectedToppings(prev => {
      const current = prev[tId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [tId]: next };
    });
  }, []);

  const confirmAddToCart = useCallback(() => {
    if (activeProduct) {
      const topsArr: Topping[] = [];
      Object.entries(selectedToppings).forEach(([id, qty]) => {
        const t = toppings?.find(x => x.id === id);
        if (t && qty > 0) {
          for (let i = 0; i < qty; i++) topsArr.push(t);
        }
      });
      addToCart(activeProduct, selectedVariant?.id, topsArr);
      setActiveProduct(null);
      setSelectedVariant(null);
    }
  }, [activeProduct, selectedVariant, selectedToppings, toppings, addToCart]);

  const totalAmount = useMemo(() => cart.reduce((s, i) => {
    if (i.isExisting) return s;
    return s + calculateItemPrice(i) * i.quantity;
  }, 0), [cart, calculateItemPrice]);
  const finalAmount = Math.max(0, totalAmount - discount);

  const checkout = async () => {
    if (cart.length === 0) return;
    if (!selectedBranchId) { toastWarning("Vui lòng chọn chi nhánh"); return; }
    if (orderType === "DINE_IN" && !selectedTableId) { toastWarning("Vui lòng chọn bàn"); return; }

    const isAddingToExisting = !!activeOrderId;

    if (isAddingToExisting && paymentMethod === "BANK_TRANSFER") {
      toastWarning("Vui lòng chọn tiền mặt cho món thêm vào bàn đang phục vụ");
      return;
    }

    setIsCheckingOut(true);
    try {
      const items = cart.map(i => ({
        product_id: i.product.id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        topping_ids: i.selectedToppings?.map(t => t.id)
      }));

      let order;
      if (isAddingToExisting) {
        order = await addItemsToOrder(activeOrderId, items, paymentMethod);
        toastSuccess(`Đã thêm ${cart.length} món vào bàn!`);
        setCart([]); setDiscount(0);
      } else {
        const payload = {
          branch_id: selectedBranchId,
          items,
          payment_method: paymentMethod,
          order_type: orderType,
          table_id: selectedTableId || undefined,
          discount_amount: discount
        };
        order = await createOrder(payload);
        
        // Nếu là order_type DINE_IN và có table_id, giữ nguyên table ở trạng thái OCCUPIED (không set lại về AVAILABLE)
        if (orderType !== "DINE_IN" || !selectedTableId) {
          setSelectedTableId(null);
        }
        
        if (paymentMethod === "BANK_TRANSFER") {
          setPaymentPending(order);
        } else {
          toastSuccess("Thanh toán thành công!");
          setOrderSuccess(order);
        }
        setCart([]); setDiscount(0); setIsCartOpen(false); setActiveOrderId(null); setOrderType("TAKEAWAY");
      }
    } catch (err) { toastError("Lỗi hệ thống khi thanh toán"); } finally { setIsCheckingOut(false); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-print");
    if (!printContent) return;

    // Create a hidden iframe
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
    doc.write('<html><head><title>In hóa đơn</title>');
    doc.write('<style>');
    doc.write(`
      @page { size: 80mm auto; margin: 0; }
      body { margin: 0; padding: 0; }
      #receipt-print {
        width: 80mm !important;
        margin: 0 !important;
        padding: 5mm !important;
        box-sizing: border-box !important;
      }
      table { width: 100%; border-collapse: collapse; }
      * { font-family: 'Courier New', Courier, monospace !important; box-sizing: border-box; font-size: 13px; }
    `);
    doc.write('</style></head><body>');
    doc.write(printContent.innerHTML);
    doc.write('</body></html>');
    doc.close();

    // Wait for content (especially fonts/images if any) to render
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 300);
  };



  if (pageLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <AiOutlineLoading3Quarters size={40} className="spin" color="var(--accent)" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100dvh", background: "var(--bg-primary)", overflow: "hidden", paddingLeft: isMobile ? 0 : 80 }}>

      {/* Hidden Receipt for Printing */}
      <div style={{ display: "none" }}>
        {(orderSuccess || paymentPending) && (
          <ReceiptTemplate
            order={orderSuccess || paymentPending!}
            branch={branches?.find(b => b.id === (orderSuccess || paymentPending!).branch_id)}
          />
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: isMobile ? "0" : "32px 40px" }}>
        {/* Header - Upgraded with Branch Selector */}
        <div style={{ padding: isMobile ? "16px 20px" : "0 0 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900 }}>Tony <span style={{ color: "var(--accent)" }}>Coffee & Tea</span></h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <HiOfficeBuilding color="var(--accent)" size={16} />
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  disabled={!!activeOrderId || currentUser?.role === 'ADMIN'}
                  style={{ background: "none", border: "none", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", outline: "none", cursor: "pointer", opacity: (activeOrderId || currentUser?.role === 'ADMIN') ? 0.6 : 1 }}
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", width: isMobile ? "120px" : "320px" }}>
            <HiSearch size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="text" placeholder="Tìm..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ width: "100%", background: "white", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px 12px 42px", fontSize: 14, fontWeight: 600, outline: "none" }} />
          </div>
        </div>

        {/* Categories Scroller */}
        <div style={{ display: "flex", gap: 10, padding: isMobile ? "12px 20px" : "0 0 28px", overflowX: "auto" }}>
          <button onClick={() => setSelectedCategory("all")} style={{ padding: "10px 22px", borderRadius: 12, border: selectedCategory === "all" ? "none" : "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 800, fontSize: 14, background: selectedCategory === "all" ? "var(--gold-gradient)" : "white", color: selectedCategory === "all" ? "white" : "var(--text-secondary)" }}>TẤT CẢ</button>
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              style={{ 
                padding: "10px 22px", 
                borderRadius: 12, 
                border: selectedCategory === cat ? "none" : "1px solid var(--border)", 
                cursor: "pointer", 
                whiteSpace: "nowrap", 
                fontWeight: 800, 
                fontSize: 14, 
                background: selectedCategory === cat ? "var(--gold-gradient)" : "white", 
                color: selectedCategory === cat ? "white" : "var(--text-secondary)" 
              }}
            >
              {(cat || "KHÁC").toUpperCase()}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "4px 8px 12px 4px", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))", gap: isMobile ? 16 : 20, alignItems: "start", alignContent: "start" }}>
          {filteredProducts.map((p) => {
            const Icon = CATEGORY_ICONS[p.category] || BiCoffeeTogo;
            const minPrice = p.variants?.length 
              ? Math.min(...p.variants.map((v: ProductVariant) => v.price)) 
              : (p as any).price || 0;
            
            // Final safety check to avoid NaN
            const safePrice = isNaN(minPrice) ? 0 : minPrice;
            return (
              <div key={p.id} onClick={() => handleItemClick(p)} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", cursor: "pointer", display: "flex", flexDirection: "column", height: "fit-content", minHeight: "200px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={28} color="var(--accent)" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{p.name_vi}</p>
                {p.variants?.length > 1 && <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>{p.variants.length} CỠ SIZE</p>}
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "var(--accent)" }}>{formatVND(safePrice || 0)}{p.variants?.length > 1 ? '+' : ''}</span>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--gold-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><HiPlus size={20} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Panel */}
      {(isCartOpen || !isMobile) && (
        <div style={{ width: isMobile ? "100%" : "360px", height: isMobile ? "100dvh" : "100%", position: isMobile ? "fixed" : "relative", top: 0, right: 0, background: "white", zIndex: 200, display: "flex", flexDirection: "column", borderLeft: isMobile ? "none" : "1px solid var(--border)", boxShadow: isMobile ? "none" : "-10px 0 30px rgba(0,0,0,0.02)" }}>
          <div style={{ padding: "32px 28px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Giỏ hàng</h2>
            {isMobile && <button onClick={() => setIsCartOpen(false)} style={{ border: "none", background: "none" }}><HiChevronLeft size={28} /></button>}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {cart.map((item, idx) => {
              const variant = item.product?.variants?.find(v => v.id === item.variant_id);
              return (
                <div key={idx} style={{ display: "flex", gap: 16, marginBottom: 16, borderBottom: "1px solid var(--border-light)", paddingBottom: 16, alignItems: "center", opacity: item.isExisting ? 0.7 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontWeight: 800, fontSize: 15 }}>{item.product.name_vi} {variant && `(${variant.size})`}</p>
                      {item.isExisting && (
                        <span style={{ fontSize: 9, fontWeight: 900, background: "var(--bg-primary)", color: "var(--text-muted)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border)" }}>ĐÃ PHỤC VỤ</span>
                      )}
                    </div>
                    {(item.selectedToppings || []).length > 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                        + {Object.entries(item.selectedToppings?.reduce((acc: any, t) => { acc[t.name] = (acc[t.name] || 0) + 1; return acc; }, {}) || {}).map(([name, qty]) => `${name} x${qty}`).join(', ')}
                      </p>
                    )}
                  </div>
                  {!item.isExisting ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => updateQty(item, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><HiMinus size={14} /></button>
                      <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item, 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><HiPlus size={14} /></button>
                    </div>
                  ) : (
                    <div style={{ fontWeight: 900, fontSize: 15, paddingRight: 10 }}>x{item.quantity}</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Billing Area */}
          <div style={{ padding: "32px 28px", background: "var(--bg-primary)", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-secondary)" }}>TỔNG CỘNG</span>
              <span style={{ fontWeight: 800, fontSize: 15 }}>{formatVND(totalAmount)}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-secondary)" }}>GIẢM GIÁ</span>
              <input 
                type="number" 
                value={discount || ""} 
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0"
                style={{ width: 120, textAlign: "right", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 800, outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
              <span style={{ fontWeight: 900, fontSize: 18 }}>THANH TOÁN</span>
              <span style={{ fontWeight: 900, fontSize: 26, color: "var(--accent)" }}>{formatVND(finalAmount)}</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setOrderType("TAKEAWAY")}
                disabled={!!activeOrderId}
                style={{ flex: 1, padding: "12px", borderRadius: 12, fontWeight: 900, fontSize: 13, border: orderType === "TAKEAWAY" ? "2px solid var(--accent)" : "1px solid var(--border)", background: orderType === "TAKEAWAY" ? "var(--accent-light)" : "white", color: orderType === "TAKEAWAY" ? "var(--accent)" : "black", opacity: activeOrderId && orderType !== "TAKEAWAY" ? 0.5 : 1 }}
              >
                MANG ĐI
              </button>
              <button
                onClick={() => { setOrderType("DINE_IN"); setIsCartOpen(true); }}
                disabled={!!activeOrderId}
                style={{ flex: 1, padding: "12px", borderRadius: 12, fontWeight: 900, fontSize: 13, border: orderType === "DINE_IN" ? "2px solid var(--accent)" : "1px solid var(--border)", background: orderType === "DINE_IN" ? "var(--accent-light)" : "white", color: orderType === "DINE_IN" ? "var(--accent)" : "black", opacity: activeOrderId && orderType !== "TAKEAWAY" ? 0.5 : 1 }}
              >
                {activeOrderId ? "ĐANG PHỤC VỤ" : "TẠI CHỖ"} {selectedTableId && `(${tables?.find(t => t.id === selectedTableId)?.name || "Bàn"})`}
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 12, letterSpacing: 0.5 }}>PHƯƠNG THỨC THANH TOÁN</p>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: 'CASH', label: 'TIỀN MẶT' },
                  { id: 'BANK_TRANSFER', label: 'CHUYỂN KHOẢN' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    style={{
                      flex: 1, padding: "14px 4px", borderRadius: 12, fontSize: 12, fontWeight: 800,
                      border: paymentMethod === m.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: paymentMethod === m.id ? "var(--accent-light)" : "white",
                      color: paymentMethod === m.id ? "var(--accent)" : "var(--text-secondary)",
                      transition: "0.2s"
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={checkout} disabled={cart.length === 0 || isCheckingOut || (orderType === "DINE_IN" && !selectedTableId && !activeOrderId)} className="btn-primary" style={{ width: "100%", padding: 18 }}>
              {isCheckingOut ? <AiOutlineLoading3Quarters size={22} className="spin" /> : "XÁC NHẬN ĐƠN HÀNG"}
            </button>
          </div>
        </div>
      )}

      {/* Product Options Modal (Size + Toppings) */}
      {activeProduct && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(8px)" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 32, maxWidth: 500, width: "95%", boxShadow: "var(--shadow-lg)" }} className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 900 }}>{activeProduct.name_vi}</h3>
                <p style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{activeProduct.name_en}</p>
              </div>
              <button onClick={() => setActiveProduct(null)} style={{ background: "#f3f4f6", border: "none", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><HiX size={24} /></button>
            </div>

            {/* Size Selection */}
            {activeProduct.variants?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontWeight: 900, fontSize: 13, marginBottom: 12, color: "var(--text-muted)" }}>CHỌN SIZE</p>
                <div style={{ display: "flex", gap: 12 }}>
                  {activeProduct.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{ flex: 1, padding: "16px 8px", borderRadius: 16, border: selectedVariant?.id === v.id ? "2px solid var(--accent)" : "1px solid var(--border)", background: selectedVariant?.id === v.id ? "var(--accent-light)" : "white", color: selectedVariant?.id === v.id ? "var(--accent)" : "black", transition: "0.2s" }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{v.size}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{formatVND(v.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Topping Selection */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontWeight: 900, fontSize: 13, marginBottom: 12, color: "var(--text-muted)" }}>TOÀN BỘ TOPPING</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 240, overflowY: "auto", paddingRight: 8 }} className="custom-scroll">
                {toppings.map(t => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 14, border: (selectedToppings[t.id] || 0) > 0 ? "1px solid var(--accent)" : "1px solid var(--border)", background: (selectedToppings[t.id] || 0) > 0 ? "var(--bg-primary)" : "white" }}>
                    <span style={{ fontWeight: 700 }}>{t.name} <span style={{ color: "var(--accent)", fontSize: 12 }}>({formatVND(t.price)})</span></span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button onClick={() => updateToppingQty(t.id, -1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "white", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}><HiMinus size={12} /></button>
                      <span style={{ fontWeight: 900, fontSize: 14 }}>{selectedToppings[t.id] || 0}</span>
                      <button onClick={() => updateToppingQty(t.id, 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-gradient)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><HiPlus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={confirmAddToCart} className="btn-primary" style={{ width: "100%", padding: 18, fontSize: 16 }}>
              THÊM VÀO GIỎ • {formatVND((selectedVariant?.price || 0) + toppings.reduce((s, t) => s + t.price * (selectedToppings[t.id] || 0), 0))}
            </button>
          </div>
        </div>
      )}

      {/* Table Selection Modal */}
      {orderType === "DINE_IN" && !selectedTableId && isCartOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 28, width: "90%", maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900 }}>CHỌN BÀN PHỤC VỤ</h3>
              <button onClick={() => setOrderType("TAKEAWAY")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontWeight: 700, cursor: "pointer" }}>HỦY</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12, maxHeight: 400, overflowY: "auto", padding: 4 }}>
              {tables.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  style={{
                    padding: 16, borderRadius: 16, border: "1px solid var(--border)",
                    background: t.status === "OCCUPIED" ? "var(--bg-primary)" : "white",
                    opacity: t.status === "OCCUPIED" ? 0.5 : 1,
                    cursor: t.status === "OCCUPIED" ? "not-allowed" : "pointer"
                  }}
                  disabled={t.status === "OCCUPIED"}
                >
                  <p style={{ fontWeight: 900 }}>{t.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Pending Modal (Bank Transfer) */}
      {paymentPending && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100dvw", height: "100dvh", background: "rgba(0,0,0,0.8)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: 32, width: "100%", maxWidth: 400, textAlign: "center", maxHeight: "90dvh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>XÁC NHẬN THANH TOÁN</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Vui lòng quét mã QR và xác nhận đã nhận tiền</p>

            <div style={{ background: "white", padding: 12, borderRadius: 16, border: "1px solid var(--border)", marginBottom: 20 }}>
              <img
                src={`https://img.vietqr.io/image/${process.env.NEXT_PUBLIC_BANK_CODE || 'Techcombank'}-${process.env.NEXT_PUBLIC_BANK_ACCOUNT || '19038133016013'}-print.jpg?amount=${paymentPending.final_amount}&addInfo=Thanh toan don hang ${paymentPending.order_number}&accountName=${process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Tony Coffee'}`}
                alt="VietQR"
                style={{ width: "100%", borderRadius: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", background: "var(--bg-primary)", borderRadius: 16, marginBottom: 24 }}>
              <span style={{ fontWeight: 800, color: "var(--text-muted)", fontSize: 13 }}>SỐ TIỀN</span>
              <span style={{ fontWeight: 900, fontSize: 18, color: "var(--accent)" }}>{formatVND(paymentPending.final_amount)}</span>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setPaymentPending(null)} style={{ flex: 1, padding: 16, borderRadius: 14, background: "var(--bg-primary)", border: "none", fontWeight: 800, cursor: "pointer" }}>HỦY</button>
              <button onClick={() => { setOrderSuccess(paymentPending); setPaymentPending(null); }} style={{ flex: 2, padding: 16, borderRadius: 14, background: "black", color: "white", border: "none", fontWeight: 900, cursor: "pointer" }}>XÁC NHẬN ĐÃ NHẬN</button>
            </div>
            <button onClick={handlePrint} style={{ width: "100%", marginTop: 12, padding: 14, borderRadius: 14, background: "var(--accent-light)", color: "var(--accent)", border: "1px solid var(--accent)", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <MdOutlineReceiptLong size={20} /> IN TẠM TÍNH
            </button>
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {orderSuccess && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100dvw", height: "100dvh", background: "rgba(0,0,0,0.8)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", padding: "32px", borderRadius: 32, width: "100%", maxWidth: 400, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, background: "rgba(34, 197, 94, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <HiCheckCircle size={40} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>HOÀN TẤT ĐƠN HÀNG</h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 700, marginBottom: 24, fontSize: 13 }}>Mã đơn: <span style={{ color: "black", fontWeight: 900 }}>{orderSuccess.order_number}</span></p>

            <div style={{ background: "var(--bg-primary)", padding: 20, borderRadius: 20, marginBottom: 24, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: 12 }}>TỔNG BILL</span>
                <span style={{ fontWeight: 900, fontSize: 15 }}>{formatVND(orderSuccess.final_amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: 12 }}>HÌNH THỨC</span>
                <span style={{ fontWeight: 900, fontSize: 15 }}>{orderSuccess.payment_method === "CASH" ? "TIỀN MẶT" : "CHUYỂN KHOẢN"}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={handlePrint} style={{ width: "100%", padding: 18, background: "var(--accent)", color: "white", border: "none", borderRadius: 16, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <MdOutlineReceiptLong size={22} /> IN HÓA ĐƠN
              </button>
              <button onClick={() => setOrderSuccess(null)} style={{ width: "100%", padding: 16, background: "black", color: "white", border: "none", borderRadius: 16, fontWeight: 900, cursor: "pointer" }}>
                QUAY LẠI MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button for Mobile */}
      {isMobile && !isCartOpen && cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            position: "fixed", bottom: 20, right: 20, left: 20,
            background: "black", color: "white", padding: "16px 24px",
            borderRadius: "16px", border: "none", display: "flex",
            justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)", zIndex: 150
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <HiShoppingCart size={24} />
              <span style={{ position: "absolute", top: -8, right: -8, background: "var(--accent)", color: "white", fontSize: 10, fontWeight: 900, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid black" }}>
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <span style={{ fontWeight: 800 }}>XEM GIỎ HÀNG</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16 }}>{formatVND(finalAmount)}</span>
        </button>
      )}

      <style jsx>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
