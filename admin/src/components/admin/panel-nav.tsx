"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/leis", label: "Leis" },
  { href: "/videos", label: "Vídeos" },
  { href: "/tipos-violencia", label: "Tipos de violência" },
  { href: "/rede-apoio", label: "Rede de apoio" },
] as const;

export function PanelNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções do painel" className="flex flex-wrap gap-1">
      {LINKS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 font-heading text-sm font-bold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
