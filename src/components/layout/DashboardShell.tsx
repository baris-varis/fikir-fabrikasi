'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, LogOut, Menu, X, ChevronRight, Shield } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface Props {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/analyses', icon: LayoutDashboard, label: 'Analizlerim' },
  { href: '/new', icon: Plus, label: 'Yeni Analiz' },
  { href: '/admin', icon: Shield, label: 'Admin' },
];

export default function DashboardShell({ userName, userEmail, children }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-fab-surface border-r border-fab-border
          flex flex-col transition-transform duration-200 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-fab-border">
          <Link href="/analyses" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <div>
              <div className="font-display font-bold text-sm leading-tight">Ideactory.ai</div>
              <div className="text-[10px] text-fab-muted">v6.2</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-fab-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                  ${
                    isActive
                      ? 'bg-fab-accent/10 text-fab-accent font-medium'
                      : 'text-fab-muted-light hover:text-fab-text hover:bg-white/[0.03]'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-fab-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-fab-accent/20 flex items-center justify-center text-sm font-display font-bold">
              {userName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{userName}</div>
              <div className="text-xs text-fab-muted truncate">{userEmail}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-fab-muted text-xs hover:text-fab-danger transition-colors w-full px-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-fab-border bg-fab-surface">
          <button onClick={() => setSidebarOpen(true)} className="text-fab-muted-light">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-semibold text-sm">Ideactory.ai</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
