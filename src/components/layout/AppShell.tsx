'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { useAuthStore, useNavStore, useLocaleStore } from '@/store';
import { useTheme } from 'next-themes';
import { t, getLocaleName } from '@/lib/i18n';
import {
  LayoutDashboard,
  Bot,
  LineChart,
  Shield,
  ShieldCheck,
  FlaskConical,
  Settings,
  TrendingUp,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Activity,
  Globe,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/store';

import type { NavPage } from '@/types';

interface NavItem {
  id: NavPage;
  labelKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'strategies', labelKey: 'nav.strategies', icon: LineChart },
  { id: 'bots', labelKey: 'nav.bots', icon: Bot },
  { id: 'trading', labelKey: 'nav.trading', icon: TrendingUp },
  { id: 'risk', labelKey: 'nav.risk', icon: Shield },
  { id: 'backtest', labelKey: 'nav.backtest', icon: FlaskConical },
  { id: 'wallet', labelKey: 'wallet.title', icon: Wallet },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
  { id: 'admin', labelKey: 'nav.admin', icon: ShieldCheck, adminOnly: true },
];

function TopBar() {
  const { theme, setTheme } = useTheme();
  const { name, logout } = useAuthStore();
  const { currentPage } = useNavStore();
  const { locale, setLocale } = useLocaleStore();
  const { unreadCount, notifications } = useNotificationsStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Close notifications on outside click
  useEffect(() => {
    if (!showNotifs) return;
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const pageTitle = navItems.find((n) => n.id === currentPage)?.labelKey || 'AutoTrade Pro';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MobileNav />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold">{t(pageTitle, locale)}</h1>
              <p className="text-[10px] text-muted-foreground">{t('nav.platform', locale)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-live" />
            <span className="hidden sm:inline">{t('nav.live', locale)}</span>
          </div>

          {/* Language switcher */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'uk' : 'en')}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{getLocaleName(locale)}</span>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifs(!showNotifs)}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
                <div className="p-3 font-semibold text-sm">{t('set.notifications', locale)}</div>
                <Separator />
                <ScrollArea className="max-h-72">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="border-b border-border/50 p-3 last:border-0">
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {!mounted ? <Moon className="h-4 w-4" /> : theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User avatar */}
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const { currentPage, navigate } = useNavStore();
  const { locale } = useLocaleStore();
  const { role } = useAuthStore();
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-14 items-center gap-2 px-4 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold">AutoTrade Pro</p>
            <p className="text-[10px] text-muted-foreground">{t('nav.platform', locale)}</p>
          </div>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey, locale)}
              </button>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t border-border p-3">
          <MobileLogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileLogoutButton() {
  const { logout } = useAuthStore();
  const { locale } = useLocaleStore();
  return (
    <button
      onClick={logout}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
    >
      <LogOut className="h-4 w-4" />
      {t('nav.logout', locale)}
    </button>
  );
}

function BottomNav() {
  const { currentPage, navigate } = useNavStore();
  const { locale } = useLocaleStore();
  const { role } = useAuthStore();

  const bottomItems = navItems.filter((item) => !item.adminOnly || role === 'admin').slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md sm:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-1">
        {bottomItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-[10px] font-medium">{t(item.labelKey, locale)}</span>
              {isActive && (
                <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SideNav() {
  const { currentPage, navigate } = useNavStore();
  const { name, role } = useAuthStore();
  const { locale } = useLocaleStore();
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <aside className="hidden sm:flex sm:w-56 lg:w-64 sm:flex-col sm:border-r sm:border-border sm:bg-card">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold">AutoTrade Pro</p>
          <p className="text-[10px] text-muted-foreground">v2.1.0</p>
        </div>
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                currentPage === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey, locale)}
            </button>
          ))}
        </nav>

        <Separator className="my-3 mx-3" />

        <div className="px-3 py-2">
          <div className="rounded-lg bg-accent p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold">{name || 'User'}</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <p className="text-[10px] text-muted-foreground">{t('set.proPlan', locale)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <SideLogoutButton />
      </div>
    </aside>
  );
}

function SideLogoutButton() {
  const { logout } = useAuthStore();
  const { locale } = useLocaleStore();
  return (
    <button
      onClick={logout}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
    >
      <LogOut className="h-4 w-4" />
      {t('nav.logout', locale)}
    </button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
