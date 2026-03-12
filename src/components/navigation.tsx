"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Wine,
  ClipboardList,
  BarChart3,
  Grid3X3,
  ExternalLink,
} from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-sidebar-border bg-sidebar">
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-2">
        <Image src="/isekado-logo-white.png" alt="ISEKADO" width={28} height={28} />
        <span className="text-sm font-medium text-sidebar-foreground">
          テイスティング
        </span>
      </div>
    </header>
  );
}

const navItems = [
  { href: "/tasting/new", label: "テイスティング", icon: Wine },
  { href: "/products", label: "充填一覧", icon: ClipboardList },
  { href: "/results", label: "結果", icon: BarChart3 },
];

const appSwitcherLinks = [
  { title: "セラー管理", url: "https://celler-manager.vercel.app" },
  { title: "セラーロット管理", url: "https://celler-lot-manager.vercel.app" },
  { title: "充填記録", url: "https://filling-recorder.vercel.app" },
  { title: "原材料在庫管理", url: "https://inventory-manager-seven-pi.vercel.app" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showApps, setShowApps] = useState(false);

  if (pathname === "/login") return null;

  return (
    <>
      {showApps && (
        <div
          className="fixed inset-0 z-50 bg-black/20"
          onClick={() => setShowApps(false)}
        >
          <div
            className="fixed bottom-14 left-1/2 -translate-x-1/2 w-64 rounded-lg border border-border bg-card p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Image src="/isekado-logo.png" alt="ISEKADO" width={20} height={20} />
              <p className="text-xs font-medium text-muted-foreground">
                ISEKADO Tools
              </p>
            </div>
            <div className="mt-1 space-y-0.5">
              {appSwitcherLinks.map((app) => (
                <a
                  key={app.url}
                  href={app.url}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  {app.title}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card">
        <div className="mx-auto flex max-w-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-accent font-medium text-primary"
                    : "text-muted-foreground hover:bg-background"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setShowApps(!showApps)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-background"
          >
            <Grid3X3 className="h-4 w-4" />
            他アプリ
          </button>
        </div>
      </nav>
    </>
  );
}
