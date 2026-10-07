"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminMobileDrawer from "./AdminMobileDrawer";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cookieMatch = document.cookie.match(/kopsyah_sidebar_collapsed=([^;]+)/);
        if (cookieMatch) {
          return cookieMatch[1] === "true";
        }
        return localStorage.getItem("kopsyah_sidebar_collapsed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const [animateToggle, setAnimateToggle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kopsyah_sidebar_collapsed");
      if (saved === "true" && !collapsed) {
        setCollapsed(true);
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }, []);

  const toggleSidebar = () => {
    setAnimateToggle(true);
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("kopsyah_sidebar_collapsed", String(next));
        document.cookie = `kopsyah_sidebar_collapsed=${next}; path=/; max-age=31536000`;
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 print:bg-white print:p-0">
      <div className="print:hidden sticky top-0 z-40">
        <AdminNavbar
          onToggleSidebar={toggleSidebar}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      <div className="flex-1 flex w-full print:max-w-none print:w-full print:mx-0">
        {/* Desktop Collapsible Sidebar */}
        <div className="print:hidden shrink-0 self-stretch">
          <AdminSidebar collapsed={collapsed} onToggle={toggleSidebar} animateToggle={animateToggle} />
        </div>

        {/* Mobile Slide-out Drawer Sidebar */}
        <div className="print:hidden">
          <AdminMobileDrawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-32 md:pb-8 w-full min-w-0 overflow-x-hidden print:p-0 print:overflow-visible transition-all duration-300">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
