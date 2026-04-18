"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiLogout, HiOfficeBuilding, HiUsers, HiViewGrid } from "react-icons/hi";
import { MdOutlineReceiptLong, MdOutlineSpaceDashboard, MdTableBar } from "react-icons/md";
import { FiBox, FiBook } from "react-icons/fi";
import { BiTrendingUp } from "react-icons/bi";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [pathname]); // RE-RUN ON ROUTE CHANGE TO DETECT LOGIN/LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Wait for initial mount before deciding to return null
  if (pathname.startsWith('/staff-portal') || pathname === '/login') return null;

  const menuItems = [
    { href: "/", icon: MdOutlineSpaceDashboard, label: "Bán hàng", roles: ["MANAGER", "STAFF"] },
    { href: "/orders", icon: MdOutlineReceiptLong, label: "Lịch sử", roles: ["ADMIN", "MANAGER", "STAFF"] },
    { href: "/dashboard", icon: BiTrendingUp, label: "Báo cáo", roles: ["ADMIN"] },
    { href: "/products", icon: HiViewGrid, label: "Sản phẩm", roles: ["ADMIN", "MANAGER"] },
    { href: "/materials", icon: FiBox, label: "Nguyên liệu", roles: ["ADMIN", "MANAGER"] },
    { href: "/recipes", icon: FiBook, label: "Công thức", roles: ["ADMIN", "MANAGER"] },
    { href: "/tables", icon: MdTableBar, label: "Bàn", roles: ["ADMIN", "MANAGER"] },
    { href: "/branches", icon: HiOfficeBuilding, label: "Chi nhánh", roles: ["ADMIN"] },
    { href: "/employees", icon: HiUsers, label: "Tài khoản", roles: ["ADMIN"] },
  ];

  // Robust filtering: default to nothing if no user, but match case-insensitively
  const currentRole = user?.role?.toUpperCase() || "";
  const filteredMenu = menuItems.filter(item => item.roles.includes(currentRole));

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={{
      width: 80,
      minWidth: 80,
      height: "100vh",
      background: "white",
      borderRight: "1px solid var(--border)",
      display: isMobile ? "none" : "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 0",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
      boxShadow: "4px 0 10px rgba(0,0,0,0.01)"
    }}>
      {/* Logo Placeholder */}
      <div style={{ fontWeight: 900, color: "var(--accent)", fontSize: 16 }}>TONY</div>

      {/* Nav Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 40 }}>
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={{ 
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "0.2s"
            }} title={item.label}>
              <Icon size={28} />
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
        <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} title="Đăng xuất">
          <HiLogout size={24} />
        </button>
        
        <div style={{ 
          width: 44, 
          height: 44, 
          borderRadius: "16px", 
          background: "var(--bg-primary)", 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: 13, 
          fontWeight: 900, 
          color: "var(--accent)", 
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)"
        }} title={user?.name}>
          {getInitials(user?.name)}
        </div>
      </div>
    </div>
  );
}
