"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Target,
  Briefcase,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
  CreditCard,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SidebarNavProps {
  userEmail?: string;
}

export function SidebarNav({ userEmail }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "My CVs",
      href: "/dashboard/cvs",
      icon: FileText,
      active: pathname.startsWith("/dashboard/cvs"),
    },
    {
      label: "Optimize",
      href: "/dashboard/optimize",
      icon: Target,
      active: pathname.startsWith("/dashboard/optimize"),
    },
    {
      label: "Find Jobs",
      href: "/dashboard/jobs",
      icon: Briefcase,
      active: pathname.startsWith("/dashboard/jobs"),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings") || pathname === "/billing",
    },
  ];

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      toast.success("Oturum kapatıldı.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Çıkış yapılamadı");
      setLoggingOut(false);
    }
  };

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              item.active
                ? "bg-slate-100 text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                item.active ? "text-slate-900" : "text-slate-500"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">CV Optimizer</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-200 bg-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              CV Optimizer
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <NavLinks />

        {/* Footer Area: User Status & Sign Out */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold shrink-0">
              {userEmail ? userEmail.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 truncate">
                {userEmail || "User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-slate-500">7 Gün Deneme</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="w-full justify-start gap-2 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{loggingOut ? "Çıkış yapılıyor..." : "Oturumu Kapat"}</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
