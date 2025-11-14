"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import FloatingWhatsAppButton from "../ui/FloatingWhatsAppButton";
import TawkToChat from "../ui/TawkToChat";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

function LayoutWithSidebar({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <Header showLogo={false} />
        <main>{children}</main>
        <Footer />
      </div>
      <FloatingWhatsAppButton />
      <TawkToChat />
    </div>
  );
}

function LayoutWithoutSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header showLogo={true} />
      <main>{children}</main>
      <Footer />
      <FloatingWhatsAppButton />
      <TawkToChat />
    </div>
  );
}

export default function Layout({ children, showSidebar }: LayoutProps) {
  const pathname = usePathname();

  // Determine if sidebar should be shown based on pathname
  const shouldShowSidebar = () => {
    // If explicitly set, use that value
    if (showSidebar !== undefined) {
      return showSidebar;
    }

    // Exclude these routes from showing sidebar
    const excludedRoutes = [
      "/", // Homepage
      "/login",
      "/register",
      "/forgot-password",
    ];

    // Check if pathname starts with excluded routes
    if (excludedRoutes.includes(pathname)) {
      return false;
    }

    // Exclude blog pages
    if (pathname.startsWith("/blog")) {
      return false;
    }

    // Exclude admin panel
    if (pathname.startsWith("/admin")) {
      return false;
    }

    // Show sidebar for all other pages
    return true;
  };

  const sidebarEnabled = shouldShowSidebar();

  if (sidebarEnabled) {
    return (
      <SidebarProvider>
        <LayoutWithSidebar>{children}</LayoutWithSidebar>
      </SidebarProvider>
    );
  }

  return <LayoutWithoutSidebar>{children}</LayoutWithoutSidebar>;
}
