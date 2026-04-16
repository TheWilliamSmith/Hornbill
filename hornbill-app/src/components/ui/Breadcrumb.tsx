import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-black/40 hover:text-black/60 transition-colors duration-150"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-black font-medium" : "text-black/40"}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight size={14} className="text-black/20" />}
          </div>
        );
      })}
    </nav>
  );
}
