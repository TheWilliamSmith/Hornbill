"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Activity,
  Bitcoin,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  removeAccessToken,
  removeRefreshToken,
} from "@/utils/cookie.utils";

interface SidebarProps {
  user: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/weight", label: "Weight Tracker", icon: Activity },
  { href: "/dashboard/crypto", label: "Crypto Tracker", icon: Bitcoin },
];

const bottomItems = [
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
  },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  const handleLogout = () => {
    removeAccessToken();
    removeRefreshToken();
    document.cookie =
      "accessToken=; path=/; Secure; SameSite=Strict; Max-Age=0";
    document.cookie =
      "refreshToken=; path=/; Secure; SameSite=Strict; Max-Age=0";
    document.cookie =
      "refreshTokenClient=; path=/; Secure; SameSite=Strict; Max-Age=0";
    router.push("/auth/login");
  };

  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r border-black/10 px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="mb-8 px-2">
        <span className="text-lg font-semibold tracking-tight">Hornbill</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="space-y-1">
        {/* Bottom nav items */}
        {bottomItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Profile card */}
        <div className="relative pt-3 mt-2 border-t border-black/[0.08]" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-black/80 to-black/60 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-black truncate">
                @{user.username}
              </p>
              <p className="text-[11px] text-black/40 truncate">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </button>

          {/* Profile popup */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-black/[0.08] shadow-lg shadow-black/10 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-black/[0.06]">
                <p className="text-sm font-medium text-black">
                  @{user.username}
                </p>
                <p className="text-xs text-black/40 mt-0.5">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
