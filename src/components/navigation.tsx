"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tasting/new", label: "テイスティング" },
  { href: "/products", label: "充填一覧" },
  { href: "/results", label: "結果" },
];

const appSwitcherLinks = [
  { title: "仕込み管理", url: "https://brewing-app.vercel.app" },
  { title: "セラー管理", url: "https://celler-manager.vercel.app" },
  { title: "セラーロット管理", url: "https://celler-lot-manager.vercel.app" },
  { title: "原材料在庫管理", url: "https://inventory-manager-seven-pi.vercel.app" },
  { title: "充填記録", url: "https://filling-recorder.vercel.app" },
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
            className="fixed bottom-14 left-1/2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-2 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-3 py-1 text-xs font-medium text-gray-400">
              アプリ切替
            </p>
            {appSwitcherLinks.map((app) => (
              <a
                key={app.url}
                href={app.url}
                className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {app.title}
              </a>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-lg">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 items-center justify-center py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setShowApps(!showApps)}
            className="flex flex-1 items-center justify-center py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            他アプリ
          </button>
        </div>
      </nav>
    </>
  );
}
