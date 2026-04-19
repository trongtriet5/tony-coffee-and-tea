"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiX, HiMenu, HiLogout, HiOfficeBuilding, HiUsers, HiViewGrid, HiTemplate, HiOutlineReceiptTax } from "react-icons/hi";
import { MdOutlineReceiptLong, MdOutlineSpaceDashboard, MdPayment, MdTableBar } from "react-icons/md";
import { FiBox, FiGitBranch } from "react-icons/fi";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function MobileNav() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!isMobile || pathname === '/login' || !currentUser) return null;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const menuItems = [
    { href: "/", icon: MdOutlineSpaceDashboard, label: "POS Bán hàng", roles: ["MANAGER", "STAFF"] },
    { href: "/orders", icon: MdOutlineReceiptLong, label: "Lịch sử đơn hàng", roles: ["ADMIN", "MANAGER", "STAFF"] },
    { href: "/dashboard", icon: MdPayment, label: "Báo cáo thống kê", roles: ["ADMIN"] },
    { href: "/products", icon: HiViewGrid, label: "Quản lý sản phẩm", roles: ["ADMIN", "MANAGER"] },
    { href: "/materials", icon: FiBox, label: "Nguyên vật liệu", roles: ["ADMIN", "MANAGER"] },
    { href: "/recipes", icon: FiGitBranch, label: "Công thức chế biến", roles: ["ADMIN", "MANAGER"] },
    { href: "/tables", icon: MdTableBar, label: "Quản lý sơ đồ bàn", roles: ["ADMIN", "MANAGER"] },
    { href: "/branches", icon: HiOfficeBuilding, label: "Quản lý chi nhánh", roles: ["ADMIN"] },
    { href: "/employees", icon: HiUsers, label: "Quản lý tài khoản", roles: ["ADMIN"] },
  ];

  const currentRole = currentUser?.role?.toUpperCase() || "MANAGER";
  const filteredMenu = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <>
      {/* Floating Hamburger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--gold-gradient)",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 2000,
            cursor: "pointer"
          }}
        >
          <HiMenu size={28} />
        </button>
      )}

      {/* Overlay Menu */}
      {isOpen && (
        <div 
          style={{ 
            position: "fixed", 
            inset: 0, 
            background: "rgba(0,0,0,0.6)", 
            zIndex: 3000, 
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "flex-end"
          }} 
          onClick={() => setIsOpen(false)}
        >
          <div 
            style={{ 
              width: "280px", 
              height: "100%", 
              background: "white", 
              padding: "40px 24px", 
              display: "flex", 
              flexDirection: "column",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.2)"
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--accent)" }}>TONY <span style={{ color: "black" }}>POS</span></h2>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ background: "#f3f4f6", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <HiX size={20} />
              </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto" }}>
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    style={{ 
                      fontSize: 15, 
                      fontWeight: 700, 
                      color: isActive ? "var(--accent)" : "var(--text-primary)", 
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: isActive ? "var(--accent-light)" : "transparent",
                      transition: "0.2s"
                    }}
                  >
                    <Icon size={22} /> {item.label}
                  </Link>
                );
              })}
            </nav>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                 <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "var(--accent)", border: "1px solid var(--border)" }}>
                    {currentUser?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                 </div>
                 <div>
                    <p style={{ fontWeight: 800, fontSize: 14 }}>{currentUser?.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>{currentUser?.role}</p>
                 </div>
              </div>
              <button 
                onClick={handleLogout} 
                style={{ 
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  background: "var(--danger-light)",
                  border: "none",
                  color: "var(--danger)",
                  fontWeight: 800,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer"
                }}
              >
                <HiLogout size={18} /> ĐĂNG XUẤT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
