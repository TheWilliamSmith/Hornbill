"use client";

import { usePathname } from "next/navigation";
import Breadcrumb from "./Breadcrumb";
import NotificationBell from "./NotificationBell";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  weight: "Weight Tracker",
  crypto: "Crypto Tracker",
  profile: "Profile",
  settings: "Settings",
};

export default function Header() {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    let currentPath = "";
    for (let i = 0; i < paths.length; i++) {
      const segment = paths[i];
      currentPath += `/${segment}`;

      const label = routeLabels[segment] || segment;

      breadcrumbs.push({
        label,
        href: i < paths.length - 1 ? currentPath : undefined,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-black/[0.06] px-8 py-4">
      <div className="flex items-center justify-between">
        <Breadcrumb items={breadcrumbs} />
        <NotificationBell />
      </div>
    </header>
  );
}
