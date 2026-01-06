import React, { useState, useEffect, MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ScrollToTop from "./ScrollToTop";
import { useResponsive, useViewportHeight } from "../hooks/useResponsive";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  useViewportHeight();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    !isMobile && localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
    } else {
      const saved = localStorage.getItem("sidebarCollapsed") === "true";
      setSidebarCollapsed(saved);
    }
  }, [isMobile]);

  const toggleSidebar = (): void => {
    if (isMobile) {
      const newOpenState = !sidebarOpen;
      setSidebarOpen(newOpenState);
      // Prevent background scroll when sidebar is open
      if (newOpenState) {
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
      } else {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
      }
    } else {
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem("sidebarCollapsed", newState.toString());
    }
  };

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (e: MouseEvent | Event): void => {
      const target = e.target as HTMLElement;
      const sidebar = document.getElementById("sidebar");
      const menuToggle = target.closest('button[aria-label="Toggle menu"]');

      if (sidebar && !sidebar.contains(target) && !menuToggle) {
        setSidebarOpen(false);
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
      }
    };

    document.addEventListener("click", handleClickOutside as EventListener);
    return () => document.removeEventListener("click", handleClickOutside as EventListener);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="flex w-full min-h-screen min-h-[calc(var(--vh,1vh)*100)] relative overflow-x-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        open={sidebarOpen}
        toggleSidebar={toggleSidebar}
        currentPath={location.pathname}
        isMobile={isMobile}
      />
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] backdrop-blur-sm"
          onClick={() => {
            setSidebarOpen(false);
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
          }}
          aria-label="Close sidebar"
        />
      )}
      <main
        className={`w-full max-w-full min-h-screen min-h-[calc(var(--vh,1vh)*100)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col flex-1 overflow-x-hidden ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-[72px]" : "ml-[280px]"
        }`}
        style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
      >
        <Header toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 w-full max-w-full overflow-x-hidden box-border p-4 sm:p-5 md:p-6 lg:p-8`}
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
};

export default Layout;
