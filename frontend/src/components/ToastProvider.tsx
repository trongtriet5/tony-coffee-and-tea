"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { HiCheckCircle, HiXCircle, HiExclamationCircle, HiX } from "react-icons/hi";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <HiCheckCircle size={20} />,
  error: <HiXCircle size={20} />,
  warning: <HiExclamationCircle size={20} />,
  info: <HiExclamationCircle size={20} />,
};

const COLORS: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: { bg: "#f0faf5", color: "#346739", border: "#9FCB98" },
  error: { bg: "#fff5f5", color: "#c0392b", border: "#f5c6c6" },
  warning: { bg: "#fffbf0", color: "#e67e22", border: "#fde8a0" },
  info: { bg: "#f0f4ff", color: "#2980b9", border: "#b9d4f7" },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-remove after 3.5s
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3500);

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onRemove]);

  const c = COLORS[toast.type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        minWidth: 280,
        maxWidth: 400,
        fontWeight: 700,
        fontSize: 13,
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
      }}
    >
      <span style={{ flexShrink: 0 }}>{ICONS[toast.type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          opacity: 0.6,
          padding: 0,
          display: "flex",
          flexShrink: 0,
        }}
      >
        <HiX size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    if (typeof window !== "undefined" && (window as any).Swal) {
      const Swal = (window as any).Swal;
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast: any) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      Toast.fire({
        icon: type,
        title: message
      });
    }
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
