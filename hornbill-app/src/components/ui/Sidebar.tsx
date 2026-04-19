"use client";

import { LayoutDashboard, Activity, Bitcoin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r border-black/10 px-4 py-6 shrink-0">
      <div className="mb-8 px-2">
        <span className="text-lg font-semibold tracking-tight">Hornbill</span>
      </div>

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

      <div className="border-t border-black/10 pt-4 px-2">
        <p className="text-sm font-medium text-black">@{user.username}</p>
        <p className="text-xs text-black/50 mt-0.5">
          {user.firstName} {user.lastName}
        </p>
      </div>
    </aside>
  );
}
