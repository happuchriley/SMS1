import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ScrollToTop from "./ScrollToTop";
import { useResponsive, useViewportHeight } from "../hooks/useResponsive";

const Layout = ({ children }) => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  useViewportHeight();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    !isMobile && localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
    } else {
      const saved = localStorage.getItem("sidebarCollapsed") === "true";
      setSidebarCollapsed(saved);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
      document.body.style.overflow = !sidebarOpen ? "hidden" : "";
    } else {
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem("sidebarCollapsed", newState.toString());
    }
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (e) => {
      const sidebar = document.getElementById("sidebar");
      const menuToggle = e.target.closest('button[aria-label="Toggle menu"]');

      if (sidebar && !sidebar.contains(e.target) && !menuToggle) {
        setSidebarOpen(false);
        document.body.style.overflow = "";
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
          }}
          aria-label="Close sidebar"
        />
      )}
      <main
        className={`w-full min-h-screen min-h-[calc(var(--vh,1vh)*100)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col flex-1 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-[72px]" : "ml-[280px]"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 w-full overflow-x-hidden box-border ${
            isMobile ? "p-4" : "p-8"
          }`}
        >
          {children}
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
};

export default Layout;
