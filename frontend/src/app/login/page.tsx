"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { HiLockClosed, HiUser } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const { error: toastError } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || "Đăng nhập thất bại";
      if (errorMessage === "Invalid credentials") {
        errorMessage = "Sai tài khoản hoặc mật khẩu";
      } else if (errorMessage === "User not found") {
        errorMessage = "Không tồn tại tài khoản";
      }
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "var(--bg-primary)", // Updated to use theme variable
      padding: "20px"
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        background: "var(--bg-secondary)", 
        borderRadius: "32px", 
        padding: "48px 40px",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "var(--text-primary)", fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>TONY <span style={{ color: "var(--accent)" }}>COFFEE & TEA</span></h1>
          <p style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Hệ thống quản lý bán hàng</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>


          <div style={{ position: "relative" }}>
            <HiUser style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={20} />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "16px 16px 16px 48px",
                color: "var(--text-primary)",
                fontSize: "15px",
                outline: "none",
                transition: "0.2s"
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <HiLockClosed style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={20} />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "16px 16px 16px 48px",
                color: "var(--text-primary)",
                fontSize: "15px",
                outline: "none",
                transition: "0.2s"
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: "var(--gold-gradient)",
              border: "none",
              borderRadius: "16px",
              padding: "16px",
              color: "white",
              fontSize: "16px",
              fontWeight: "900",
              cursor: "pointer",
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 10px 20px -5px rgba(212, 175, 55, 0.3)"
            }}
          >
            {loading ? <AiOutlineLoading3Quarters className="spin" size={20} /> : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        input:focus { border-color: var(--accent) !important; background: white !important; }
      `}</style>
    </div>
  );
}
