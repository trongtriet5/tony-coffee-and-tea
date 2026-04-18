import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { ToastProvider } from "@/components/ToastProvider";
import { SWRProvider } from "@/components/SWRProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: {
    default: "Tony Coffee & Tea POS",
    template: "%s | Tony Coffee & Tea",
  },
  description: "Hệ thống quản lý bán hàng Tony Coffee & Tea POS chuyên nghiệp",
  keywords: ["POS", "cà phê", "quản lý", "bán hàng"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <ErrorBoundary>
          <SWRProvider>
            <ToastProvider>
              <Sidebar />
              <MobileNav />
              <main style={{ minHeight: "100vh" }}>
                {children}
              </main>
            </ToastProvider>
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
