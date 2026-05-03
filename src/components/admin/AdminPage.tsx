'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore, useNavStore, useLocaleStore } from '@/store';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Users,
  Bot,
  BarChart3,
  DollarSign,
  Clock,
  TrendingUp,
  Radio,
  Database,
  HardDrive,
  Search,
  ShieldBan,
  ShieldCheck,
  Crown,
  Activity,
  LogIn,
  ArrowRightLeft,
  Settings2,
  AlertTriangle,
  Lock,
  Globe,
  CreditCard,
  Timer,
  Gauge,
  Megaphone,
  Zap,
  Cpu,
  Wifi,
  CheckCircle2,
  KeyRound,
  CalendarClock,
  Wallet,
  CandlestickChart,
  type LucideIcon,
} from 'lucide-react';

// ============================================================
// MOCK DATA
// ============================================================

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'premium';
  joined: string;
}

const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Oleksandr Kovalenko', email: 'oleksandr.k@gmail.com', role: 'admin', status: 'active', joined: '2024-01-15' },
  { id: 'u2', name: 'Maria Shevchenko', email: 'maria.s@outlook.com', role: 'premium_user', status: 'premium', joined: '2024-02-20' },
  { id: 'u3', name: 'Dmytro Bondarenko', email: 'dmytro.b@ukr.net', role: 'user', status: 'active', joined: '2024-03-08' },
  { id: 'u4', name: 'Anna Tkachenko', email: 'anna.t@yahoo.com', role: 'user', status: 'suspended', joined: '2024-03-22' },
  { id: 'u5', name: 'Ivan Lysenko', email: 'ivan.l@gmail.com', role: 'premium_user', status: 'premium', joined: '2024-04-10' },
  { id: 'u6', name: 'Olena Rudenko', email: 'olena.r@proton.me', role: 'user', status: 'active', joined: '2024-05-05' },
  { id: 'u7', name: 'Pavlo Moroz', email: 'pavlo.m@icloud.com', role: 'support', status: 'active', joined: '2024-05-18' },
  { id: 'u8', name: 'Yuliya Kravchenko', email: 'yuliya.k@gmail.com', role: 'user', status: 'suspended', joined: '2024-06-01' },
];

type LogType = 'auth' | 'trade' | 'system';

interface AuditLogEntry {
  id: string;
  time: string;
  event: string;
  user: string;
  details: string;
  ip: string;
  type: LogType;
}

const MOCK_LOGS: AuditLogEntry[] = [
  { id: 'l1', time: '2024-06-15 14:32:07', event: 'Login Success', user: 'oleksandr.k@gmail.com', details: 'Admin login from Chrome/Windows', ip: '192.168.1.105', type: 'auth' },
  { id: 'l2', time: '2024-06-15 14:30:15', event: 'Trade Executed', user: 'maria.s@outlook.com', details: 'CALL $50 EUR/USD — Won +$42.50', ip: '10.0.0.42', type: 'trade' },
  { id: 'l3', time: '2024-06-15 14:28:44', event: 'Login Failed', user: 'unknown@temp.com', details: 'Invalid credentials — attempt 3/5', ip: '203.45.67.89', type: 'auth' },
  { id: 'l4', time: '2024-06-15 14:25:31', event: 'Bot Started', user: 'dmytro.b@ukr.net', details: 'Bot "Scalper_v3" started on IQ Option', ip: '10.0.0.58', type: 'trade' },
  { id: 'l5', time: '2024-06-15 14:22:10', event: 'System Backup', user: 'system', details: 'Daily DB backup completed — 2.4GB', ip: '127.0.0.1', type: 'system' },
  { id: 'l6', time: '2024-06-15 14:18:55', event: 'Risk Alert', user: 'system', details: 'Global daily loss limit approaching 80% — $4,200/$5,000', ip: '127.0.0.1', type: 'system' },
  { id: 'l7', time: '2024-06-15 14:15:02', event: 'Trade Executed', user: 'ivan.l@gmail.com', details: 'PUT $30 GBP/JPY — Lost -$30.00', ip: '10.0.0.91', type: 'trade' },
  { id: 'l8', time: '2024-06-15 14:12:30', event: 'User Suspended', user: 'admin', details: 'User anna.t@yahoo.com suspended — TOS violation', ip: '192.168.1.105', type: 'auth' },
  { id: 'l9', time: '2024-06-15 14:08:17', event: 'Strategy Created', user: 'olena.r@proton.me', details: 'New strategy "Trend_RSI_Macro" created', ip: '10.0.0.33', type: 'trade' },
  { id: 'l10', time: '2024-06-15 14:05:44', event: 'System Update', user: 'system', details: 'WebSocket engine upgraded to v3.2.1', ip: '127.0.0.1', type: 'system' },
  { id: 'l11', time: '2024-06-15 14:01:22', event: 'Login Success', user: 'pavlo.m@icloud.com', details: 'Support login from Safari/macOS', ip: '10.0.0.77', type: 'auth' },
  { id: 'l12', time: '2024-06-15 13:58:09', event: 'Trade Executed', user: 'maria.s@outlook.com', details: 'CALL $75 USD/JPY — Won +$63.75', ip: '10.0.0.42', type: 'trade' },
  { id: 'l13', time: '2024-06-15 13:55:01', event: 'Emergency Stop', user: 'system', details: 'Bot "GridTrader" emergency stopped — max drawdown', ip: '127.0.0.1', type: 'system' },
];

// Revenue mock data
const MOCK_REVENUE_MONTHLY = [
  { month: 'Jan', revenue: 12400 },
  { month: 'Feb', revenue: 15200 },
  { month: 'Mar', revenue: 18900 },
  { month: 'Apr', revenue: 14600 },
  { month: 'May', revenue: 21300 },
  { month: 'Jun', revenue: 18432 },
];

const MOCK_REVENUE_BY_PLAN = [
  { plan: 'Free', count: 623, percentage: 49.9, color: 'bg-muted-foreground/60' },
  { plan: 'Starter', count: 312, percentage: 25.0, color: 'bg-sky-500' },
  { plan: 'Pro', count: 247, percentage: 19.8, color: 'bg-purple-500' },
  { plan: 'Enterprise', count: 65, percentage: 5.3, color: 'bg-emerald-500' },
];

const MOCK_BILLING_EVENTS = [
  { id: 'be1', time: '2024-06-15 13:45', user: 'maria.s@outlook.com', type: 'payment', detail: 'Pro plan renewal — $29.99' },
  { id: 'be2', time: '2024-06-15 12:30', user: 'ivan.l@gmail.com', type: 'upgrade', detail: 'Starter → Pro plan' },
  { id: 'be3', time: '2024-06-15 11:15', user: 'anna.t@yahoo.com', type: 'cancel', detail: 'Pro plan cancelled' },
  { id: 'be4', time: '2024-06-15 10:00', user: 'dmytro.b@ukr.net', type: 'payment', detail: 'Starter plan renewal — $14.99' },
  { id: 'be5', time: '2024-06-15 09:20', user: 'olena.r@proton.me', type: 'upgrade', detail: 'Free → Starter plan' },
  { id: 'be6', time: '2024-06-14 18:45', user: 'pavlo.m@icloud.com', type: 'refund', detail: 'Enterprise plan refund — $99.99' },
];

// Trading analytics mock data
const MOCK_TRADED_ASSETS = [
  { asset: 'EUR/USD', volume: 4231, percentage: 100 },
  { asset: 'GBP/JPY', volume: 3187, percentage: 75 },
  { asset: 'USD/JPY', volume: 2845, percentage: 67 },
  { asset: 'AUD/USD', volume: 1934, percentage: 46 },
  { asset: 'EUR/GBP', volume: 1422, percentage: 34 },
];

const MOCK_PEAK_HOURS = [
  { hour: '00', value: 120 },
  { hour: '02', value: 80 },
  { hour: '04', value: 45 },
  { hour: '06', value: 210 },
  { hour: '08', value: 580 },
  { hour: '10', value: 890 },
  { hour: '12', value: 1240 },
  { hour: '14', value: 1100 },
  { hour: '16', value: 920 },
  { hour: '18', value: 680 },
  { hour: '20', value: 430 },
  { hour: '22', value: 200 },
];

const MOCK_VOLUME_TREND = [
  { day: 'Mon', value: 3200 },
  { day: 'Tue', value: 4100 },
  { day: 'Wed', value: 3800 },
  { day: 'Thu', value: 5200 },
  { day: 'Fri', value: 4900 },
  { day: 'Sat', value: 1800 },
  { day: 'Sun', value: 1200 },
];

// System config mock
const MOCK_SYSTEM_CONFIG = {
  maxBotsPerUser: 5,
  globalMaxDailyLoss: 5000,
  globalMaxDrawdown: 25,
  maintenanceMode: false,
  apiRateLimit: 120,
  wsMaxConnections: 5000,
};

// Performance mock data
const MOCK_PERFORMANCE = {
  apiResponseCurrent: 42,
  apiResponseAvg: 38,
  apiResponseP95: 156,
  dbQueriesPerSec: 4231,
  dbAvgLatencyMs: 12,
  dbSlowQueries: 3,
  wsActiveConnections: 2847,
  wsMessagesPerSec: 1247,
  memoryUsed: 62,
  memoryTotal: 16384,
  cpuCurrent: 34,
  cpuAvg: 28,
  errorRate1h: 0.12,
  errorRate24h: 0.23,
  requests1h: 184320,
  requests24h: 3245671,
};

// Real-time activity mock data
type ActivityEventType = 'trade' | 'auth' | 'system' | 'billing' | 'risk';

interface ActivityEvent {
  id: string;
  time: string;
  type: ActivityEventType;
  message: string;
  user?: string;
}

const MOCK_ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: 'ae1', time: '14:32:15', type: 'trade', message: 'CALL $100 EUR/USD executed — Won +$85', user: 'maria.s@outlook.com' },
  { id: 'ae2', time: '14:31:08', type: 'auth', message: 'Login from 192.168.1.55', user: 'dmytro.b@ukr.net' },
  { id: 'ae3', time: '14:30:45', type: 'risk', message: 'User risk alert — drawdown 18%', user: 'ivan.l@gmail.com' },
  { id: 'ae4', time: '14:30:22', type: 'billing', message: 'Pro plan payment received — $29.99', user: 'maria.s@outlook.com' },
  { id: 'ae5', time: '14:29:55', type: 'system', message: 'WebSocket reconnected — node-03' },
  { id: 'ae6', time: '14:29:10', type: 'trade', message: 'PUT $50 GBP/JPY executed — Lost -$50', user: 'olena.r@proton.me' },
  { id: 'ae7', time: '14:28:33', type: 'auth', message: 'Failed login attempt — IP blocked', user: 'unknown@temp.com' },
  { id: 'ae8', time: '14:27:50', type: 'system', message: 'Auto-backup snapshot created — 1.2GB' },
  { id: 'ae9', time: '14:27:12', type: 'trade', message: 'CALL $75 USD/JPY executed — Won +$63.75', user: 'ivan.l@gmail.com' },
  { id: 'ae10', time: '14:26:40', type: 'billing', message: 'Starter plan upgrade processed', user: 'dmytro.b@ukr.net' },
  { id: 'ae11', time: '14:25:55', type: 'risk', message: 'Global risk limit at 72% capacity' },
  { id: 'ae12', time: '14:25:10', type: 'trade', message: 'Bot "Scalper_v3" executed 5 trades', user: 'dmytro.b@ukr.net' },
  { id: 'ae13', time: '14:24:30', type: 'system', message: 'Cache cleared — 247 keys purged' },
  { id: 'ae14', time: '14:23:55', type: 'auth', message: 'New user registered and verified', user: 'new.user@mail.com' },
  { id: 'ae15', time: '14:23:10', type: 'trade', message: 'PUT $200 EUR/GBP executed — Won +$170', user: 'maria.s@outlook.com' },
];

// Announcements mock data
interface Announcement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'maintenance';
  status: 'published' | 'scheduled';
  createdAt: string;
  scheduledAt?: string;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann1', title: 'Scheduled Maintenance Window', message: 'Platform will undergo maintenance on June 20, 2024 from 02:00 to 04:00 UTC. All bots will be automatically paused.', severity: 'maintenance', status: 'published', createdAt: '2024-06-15 10:00' },
  { id: 'ann2', title: 'New Strategy Templates Available', message: 'We have added 12 new pre-built strategy templates including Grid Trading, DCA, and Momentum strategies.', severity: 'info', status: 'published', createdAt: '2024-06-14 16:30' },
  { id: 'ann3', title: 'API Rate Limit Update', message: 'Starting July 1, API rate limits will be adjusted to 150 req/min for Pro users and 300 req/min for Enterprise users.', severity: 'warning', status: 'published', createdAt: '2024-06-13 09:00' },
  { id: 'ann4', title: 'Security Patch Deployed', message: 'Critical security patch v3.2.2 has been deployed. All sessions older than 24h have been invalidated.', severity: 'critical', status: 'published', createdAt: '2024-06-12 14:00' },
  { id: 'ann5', title: 'Weekend Trading Hours', message: 'Weekend binary options trading will be available starting this Saturday with limited asset pairs.', severity: 'info', status: 'scheduled', scheduledAt: '2024-06-17 08:00', createdAt: '2024-06-15 12:00' },
];

// User detail mock data
interface UserBot {
  id: string;
  name: string;
  status: string;
  pnl: number;
  trades: number;
  winRate: number;
}

interface UserActivity {
  id: string;
  time: string;
  action: string;
  detail: string;
}

function getUserDetailData(userId: string) {
  const userBotsMap: Record<string, UserBot[]> = {
    u1: [
      { id: 'b1', name: 'AdminMonitor', status: 'running', pnl: 0, trades: 0, winRate: 0 },
    ],
    u2: [
      { id: 'b2', name: 'TrendScalper_v2', status: 'running', pnl: 3420.5, trades: 487, winRate: 68.4 },
      { id: 'b3', name: 'RSI_Bollinger', status: 'paused', pnl: -210.3, trades: 89, winRate: 52.8 },
    ],
    u3: [
      { id: 'b4', name: 'Scalper_v3', status: 'running', pnl: 890.25, trades: 234, winRate: 62.4 },
    ],
    u4: [
      { id: 'b5', name: 'GridTrader', status: 'stopped', pnl: -1560.0, trades: 312, winRate: 41.2 },
    ],
    u5: [
      { id: 'b6', name: 'MomentumBot', status: 'running', pnl: 5210.75, trades: 678, winRate: 71.5 },
      { id: 'b7', name: 'DCA_Strategy', status: 'running', pnl: 1820.0, trades: 156, winRate: 65.3 },
      { id: 'b8', name: 'NewsTrader', status: 'error', pnl: -340.5, trades: 45, winRate: 48.9 },
    ],
    u6: [],
    u7: [],
    u8: [
      { id: 'b9', name: 'HighRiskBot', status: 'stopped', pnl: -4250.0, trades: 567, winRate: 38.2 },
    ],
  };

  const userStatsMap: Record<string, { totalTrades: number; totalPnl: number; winRate: number; plan: string; nextBilling: string }> = {
    u1: { totalTrades: 0, totalPnl: 0, winRate: 0, plan: 'Enterprise', nextBilling: '2024-07-15' },
    u2: { totalTrades: 576, totalPnl: 3210.2, winRate: 68.4, plan: 'Pro', nextBilling: '2024-07-20' },
    u3: { totalTrades: 234, totalPnl: 890.25, winRate: 62.4, plan: 'Starter', nextBilling: '2024-07-08' },
    u4: { totalTrades: 312, totalPnl: -1560.0, winRate: 41.2, plan: 'Free', nextBilling: '—' },
    u5: { totalTrades: 879, totalPnl: 6690.25, winRate: 70.1, plan: 'Enterprise', nextBilling: '2024-07-10' },
    u6: { totalTrades: 0, totalPnl: 0, winRate: 0, plan: 'Free', nextBilling: '—' },
    u7: { totalTrades: 0, totalPnl: 0, winRate: 0, plan: 'Starter', nextBilling: '2024-07-18' },
    u8: { totalTrades: 567, totalPnl: -4250.0, winRate: 38.2, plan: 'Free', nextBilling: '—' },
  };

  const userActivityMap: Record<string, UserActivity[]> = {
    u2: [
      { id: 'ua1', time: '2024-06-15 14:30', action: 'Trade Won', detail: 'CALL $50 EUR/USD — +$42.50' },
      { id: 'ua2', time: '2024-06-15 13:58', action: 'Trade Won', detail: 'CALL $75 USD/JPY — +$63.75' },
      { id: 'ua3', time: '2024-06-15 12:20', action: 'Bot Paused', detail: 'RSI_Bollinger paused by user' },
      { id: 'ua4', time: '2024-06-15 11:00', action: 'Login', detail: 'Chrome/Windows — 10.0.0.42' },
      { id: 'ua5', time: '2024-06-14 16:45', action: 'Strategy Created', detail: 'Created "Trend_RSI_Macro"' },
    ],
    u5: [
      { id: 'ua6', time: '2024-06-15 14:15', action: 'Trade Lost', detail: 'PUT $30 GBP/JPY — -$30.00' },
      { id: 'ua7', time: '2024-06-15 13:30', action: 'Bot Error', detail: 'NewsTrader encountered API error' },
      { id: 'ua8', time: '2024-06-15 10:15', action: 'Login', detail: 'Firefox/macOS — 10.0.0.91' },
      { id: 'ua9', time: '2024-06-14 20:00', action: 'Payment', detail: 'Enterprise plan renewal — $99.99' },
    ],
  };

  return {
    bots: userBotsMap[userId] || [],
    stats: userStatsMap[userId] || { totalTrades: 0, totalPnl: 0, winRate: 0, plan: 'Free', nextBilling: '—' },
    activities: userActivityMap[userId] || [],
  };
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accent?: string;
}) {
  return (
    <Card className="gap-4 py-4 px-4">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            accent || 'bg-primary/10'
          )}
        >
          <Icon className={cn('h-4 w-4', accent ? 'text-foreground' : 'text-primary')} />
        </div>
        {trend && trend !== 'neutral' && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5',
              trend === 'up'
                ? 'text-emerald-500 bg-emerald-500/10'
                : 'text-red-500 bg-red-500/10'
            )}
          >
            {trend === 'up' ? '↑' : '↓'} {trendValue || (trend === 'up' ? '+2.4%' : '-0.3%')}
          </div>
        )}
      </div>
      <div>
        <p className="text-xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground font-medium">{title}</p>
    </Card>
  );
}

// ============================================================
// SERVICE HEALTH CARD
// ============================================================

function ServiceCard({
  name,
  status,
  metricLabel,
  metricValue,
}: {
  name: string;
  status: string;
  metricLabel: string;
  metricValue: string;
}) {
  return (
    <Card className="gap-3 py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm font-medium">{name}</p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-normal border-emerald-500/25 text-emerald-500 bg-emerald-500/10"
        >
          {status}
        </Badge>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{metricLabel}</span>
        <span className="text-xs font-semibold text-foreground">{metricValue}</span>
      </div>
    </Card>
  );
}

// ============================================================
// STATUS BADGES
// ============================================================

function StatusBadge({ status, locale }: { status: string; locale: 'en' | 'uk' }) {
  const config: Record<string, string> = {
    active: 'border-emerald-500/25 text-emerald-500 bg-emerald-500/10',
    suspended: 'border-red-500/25 text-red-500 bg-red-500/10',
    premium: 'border-purple-500/25 text-purple-500 bg-purple-500/10',
  };
  const labels: Record<string, string> = {
    active: t('admin.statusActive', locale),
    suspended: t('admin.statusSuspended', locale),
    premium: status,
  };
  return (
    <Badge variant="outline" className={cn('text-[10px]', config[status] || '')}>
      {labels[status] || status}
    </Badge>
  );
}

function RoleBadge({ role, locale }: { role: string; locale: 'en' | 'uk' }) {
  const config: Record<string, string> = {
    admin: 'border-orange-500/25 text-orange-500 bg-orange-500/10',
    premium_user: 'border-purple-500/25 text-purple-500 bg-purple-500/10',
    support: 'border-sky-500/25 text-sky-500 bg-sky-500/10',
    user: 'border-muted-foreground/25 text-muted-foreground bg-muted',
  };
  const labels: Record<string, string> = {
    admin: t('admin.roleAdmin', locale),
    premium_user: t('admin.rolePremium', locale),
    support: t('admin.roleSupport', locale),
    user: t('admin.roleUser', locale),
  };
  return (
    <Badge variant="outline" className={cn('text-[10px]', config[role] || '')}>
      {labels[role] || role}
    </Badge>
  );
}

// ============================================================
// LOG TYPE BADGE & COLOR
// ============================================================

function LogTypeBadge({ type, locale }: { type: LogType; locale: 'en' | 'uk' }) {
  const config: Record<LogType, string> = {
    auth: 'border-blue-500/25 text-blue-500 bg-blue-500/10',
    trade: 'border-emerald-500/25 text-emerald-500 bg-emerald-500/10',
    system: 'border-muted-foreground/25 text-muted-foreground bg-muted',
  };
  const labels: Record<LogType, string> = {
    auth: t('admin.logTypeAuth', locale),
    trade: t('admin.logTypeTrade', locale),
    system: t('admin.logTypeSystem', locale),
  };
  return (
    <Badge variant="outline" className={cn('text-[10px]', config[type])}>
      {labels[type] || type}
    </Badge>
  );
}

const logRowBg: Record<LogType, string> = {
  auth: 'bg-blue-500/[0.03]',
  trade: 'bg-emerald-500/[0.03]',
  system: 'bg-muted/30',
};

const logEventIcon: Record<string, React.ElementType> = {
  'Login Success': LogIn,
  'Login Failed': Lock,
  'Trade Executed': ArrowRightLeft,
  'Bot Started': Bot,
  'System Backup': Database,
  'Risk Alert': AlertTriangle,
  'User Suspended': ShieldBan,
  'Strategy Created': BarChart3,
  'System Update': Settings2,
  'Emergency Stop': AlertTriangle,
};

// ============================================================
// ACTIVITY EVENT ICONS & COLORS
// ============================================================

const activityEventConfig: Record<ActivityEventType, { icon: LucideIcon; color: string; bg: string }> = {
  trade: { icon: ArrowRightLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  auth: { icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  system: { icon: Settings2, color: 'text-muted-foreground', bg: 'bg-muted' },
  billing: { icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  risk: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
};

// ============================================================
// BILLING EVENT BADGE
// ============================================================

function BillingEventBadge({ type, locale }: { type: string; locale: 'en' | 'uk' }) {
  const config: Record<string, string> = {
    payment: 'border-emerald-500/25 text-emerald-500 bg-emerald-500/10',
    upgrade: 'border-blue-500/25 text-blue-500 bg-blue-500/10',
    cancel: 'border-red-500/25 text-red-500 bg-red-500/10',
    refund: 'border-orange-500/25 text-orange-500 bg-orange-500/10',
  };
  const labels: Record<string, string> = {
    payment: t('admin.billingPayment', locale),
    upgrade: t('admin.billingUpgrade', locale),
    cancel: t('admin.billingCancel', locale),
    refund: t('admin.billingRefund', locale),
  };
  return (
    <Badge variant="outline" className={cn('text-[10px]', config[type] || '')}>
      {labels[type] || type}
    </Badge>
  );
}

// ============================================================
// ANNOUNCEMENT SEVERITY BADGE
// ============================================================

function SeverityBadge({ severity, locale }: { severity: string; locale: 'en' | 'uk' }) {
  const config: Record<string, string> = {
    info: 'border-sky-500/25 text-sky-500 bg-sky-500/10',
    warning: 'border-yellow-500/25 text-yellow-500 bg-yellow-500/10',
    critical: 'border-red-500/25 text-red-500 bg-red-500/10',
    maintenance: 'border-orange-500/25 text-orange-500 bg-orange-500/10',
  };
  const labels: Record<string, string> = {
    info: t('admin.severityInfo', locale),
    warning: t('admin.severityWarning', locale),
    critical: t('admin.severityCritical', locale),
    maintenance: t('admin.severityMaintenance', locale),
  };
  return (
    <Badge variant="outline" className={cn('text-[10px]', config[severity] || '')}>
      {labels[severity] || severity}
    </Badge>
  );
}

// ============================================================
// BOT STATUS BADGE FOR USER DETAIL
// ============================================================

function BotStatusBadge({ status, locale }: { status: string; locale: 'en' | 'uk' }) {
  const config: Record<string, string> = {
    running: 'border-emerald-500/25 text-emerald-500 bg-emerald-500/10',
    paused: 'border-yellow-500/25 text-yellow-500 bg-yellow-500/10',
    stopped: 'border-muted-foreground/25 text-muted-foreground bg-muted',
    error: 'border-red-500/25 text-red-500 bg-red-500/10',
  };
  const labels: Record<string, string> = {
    running: t('admin.botRunning', locale),
    paused: t('admin.botPaused', locale),
    stopped: t('admin.botStopped', locale),
    error: t('admin.botError', locale),
  };
  return (
    <Badge variant="outline" className={cn('text-[10px]', config[status] || '')}>
      {labels[status] || status}
    </Badge>
  );
}

// ============================================================
// ADMIN PAGE
// ============================================================

export default function AdminPage() {
  const { role } = useAuthStore();
  const { navigate } = useNavStore();
  const { locale } = useLocaleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Revenue state
  const [billingEventFilter, setBillingEventFilter] = useState('all');

  // User detail dialog
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);

  // System config state
  const [config, setConfig] = useState(MOCK_SYSTEM_CONFIG);
  const [configSaved, setConfigSaved] = useState(false);

  // Activity feed state
  const [activityFilter, setActivityFilter] = useState<ActivityEventType | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const activityEndRef = useRef<HTMLDivElement>(null);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementSeverity, setAnnouncementSeverity] = useState('info');
  const [announcementSchedule, setAnnouncementSchedule] = useState(false);

  useEffect(() => {
    if (role !== 'admin') {
      navigate('dashboard');
    }
  }, [role, navigate]);

  // Auto-scroll activity feed
  useEffect(() => {
    if (autoScroll && activityEndRef.current) {
      activityEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activityFilter, autoScroll]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_USERS;
    const q = searchQuery.toLowerCase();
    return MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') return MOCK_LOGS;
    return MOCK_LOGS.filter((l) => l.type === activeTab);
  }, [activeTab]);

  // Filter billing events
  const filteredBillingEvents = useMemo(() => {
    if (billingEventFilter === 'all') return MOCK_BILLING_EVENTS;
    return MOCK_BILLING_EVENTS.filter((e) => e.type === billingEventFilter);
  }, [billingEventFilter]);

  // Filter activity events
  const filteredActivityEvents = useMemo(() => {
    if (activityFilter === 'all') return MOCK_ACTIVITY_EVENTS;
    return MOCK_ACTIVITY_EVENTS.filter((e) => e.type === activityFilter);
  }, [activityFilter]);

  // User detail data
  const userDetailData = useMemo(() => {
    if (!selectedUser) return null;
    return getUserDetailData(selectedUser.id);
  }, [selectedUser]);

  // Revenue max for bar chart
  const maxRevenue = Math.max(...MOCK_REVENUE_MONTHLY.map((m) => m.revenue));

  // Peak hours max for visualization
  const maxPeakHour = Math.max(...MOCK_PEAK_HOURS.map((h) => h.value));

  // Volume trend max
  const maxVolume = Math.max(...MOCK_VOLUME_TREND.map((v) => v.value));

  const handleUserRowClick = (user: MockUser) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const handleSaveConfig = () => {
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handlePublishAnnouncement = () => {
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementSeverity('info');
    setAnnouncementSchedule(false);
  };

  if (role !== 'admin') return null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight">{t('admin.title', locale)}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.subtitle', locale)}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard
          title={t('admin.users', locale)}
          value="1,247"
          subtitle={t('admin.newThisWeek', locale).replace('{n}', '124')}
          icon={Users}
          trend="up"
          accent="bg-emerald-500/10"
        />
        <StatCard
          title={t('admin.activeBotsTitle', locale)}
          value="834"
          subtitle={t('admin.ofTotal', locale).replace('{pct}', '66.9')}
          icon={Bot}
          trend="up"
          accent="bg-sky-500/10"
        />
        <StatCard
          title={t('admin.totalTrades', locale)}
          value="12,456"
          subtitle={t('admin.today', locale)}
          icon={BarChart3}
          trend="up"
          accent="bg-orange-500/10"
        />
        <StatCard
          title={t('admin.platformBalance', locale)}
          value="$2.4M"
          subtitle={t('admin.thisMonthAmount', locale).replace('{amount}', '340K')}
          icon={DollarSign}
          trend="up"
          accent="bg-yellow-500/10"
        />
        <StatCard
          title={t('admin.uptime', locale)}
          value="99.97%"
          subtitle={t('admin.avg30d', locale)}
          icon={Clock}
          trend="neutral"
          accent="bg-teal-500/10"
        />
        <StatCard
          title={t('admin.revenue', locale)}
          value="$18,432"
          subtitle={t('admin.todaysRevenue', locale)}
          icon={TrendingUp}
          trend="up"
          accent="bg-emerald-500/10"
        />
      </div>

      {/* System Health */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-sm font-semibold">{t('admin.systemHealth', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ServiceCard
              name={t('admin.serviceApi', locale)}
              status={t('admin.statusOperational', locale)}
              metricLabel={t('admin.metricLatency', locale)}
              metricValue="45ms"
            />
            <ServiceCard
              name={t('admin.serviceWs', locale)}
              status={t('admin.statusOperational', locale)}
              metricLabel={t('admin.metricConnections', locale)}
              metricValue="2,847"
            />
            <ServiceCard
              name={t('admin.serviceDb', locale)}
              status={t('admin.statusHealthy', locale)}
              metricLabel={t('admin.metricQueriesPerSec', locale)}
              metricValue="4,231"
            />
            <ServiceCard
              name={t('admin.serviceRedis', locale)}
              status={t('admin.statusConnected', locale)}
              metricLabel={t('admin.metricMemory', locale)}
              metricValue="128MB / 256MB"
            />
          </div>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* REVENUE & BILLING SECTION                                */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Chart */}
        <Card className="gap-4 lg:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold">{t('admin.monthlyRevenue', locale)}</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {t('admin.revenueBilling', locale)} — {t('admin.revenueBreakdown', locale)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Bar chart */}
            <div className="flex items-end gap-3 h-40 mb-4">
              {MOCK_REVENUE_MONTHLY.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-foreground">
                    ${(m.revenue / 1000).toFixed(1)}K
                  </span>
                  <div
                    className="w-full rounded-t-md bg-emerald-500/80 transition-all hover:bg-emerald-500"
                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>

            {/* Revenue breakdown by plan */}
            <Separator className="my-3" />
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('admin.revenueBreakdown', locale)}</p>
            <div className="space-y-2">
              {MOCK_REVENUE_BY_PLAN.map((plan) => (
                <div key={plan.plan} className="flex items-center gap-3">
                  <span className="text-[11px] font-medium w-20 shrink-0">{plan.plan}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', plan.color)} style={{ width: `${plan.percentage}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-20 text-right shrink-0">{t('admin.revenueUsers', locale).replace('{count}', String(plan.count)).replace('{pct}', String(plan.percentage))}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MRR / ARR / Subscriptions */}
        <div className="space-y-4">
          <Card className="gap-3 py-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-purple-500" />
              <p className="text-xs font-medium text-muted-foreground">{t('admin.mrr', locale)}</p>
            </div>
            <p className="text-2xl font-bold tracking-tight">$48,720</p>
            <p className="text-[10px] text-emerald-500 font-medium">{t('admin.mrrChange', locale).replace('{pct}', '12.3')}</p>
          </Card>

          <Card className="gap-3 py-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-medium text-muted-foreground">{t('admin.arr', locale)}</p>
            </div>
            <p className="text-2xl font-bold tracking-tight">$584,640</p>
            <p className="text-[10px] text-emerald-500 font-medium">{t('admin.arrChange', locale).replace('{pct}', '8.7')}</p>
          </Card>

          <Card className="gap-3 py-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-sky-500" />
              <p className="text-xs font-medium text-muted-foreground">{t('admin.activeSubscriptions', locale)}</p>
            </div>
            <p className="text-2xl font-bold tracking-tight">624</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-[9px] border-purple-500/25 text-purple-500 bg-purple-500/10">{t('admin.subsProCount', locale).replace('{n}', '247')}</Badge>
              <Badge variant="outline" className="text-[9px] border-emerald-500/25 text-emerald-500 bg-emerald-500/10">{t('admin.subsEnterpriseCount', locale).replace('{n}', '65')}</Badge>
              <Badge variant="outline" className="text-[9px] border-sky-500/25 text-sky-500 bg-sky-500/10">{t('admin.subsStarterCount', locale).replace('{n}', '312')}</Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Billing Events */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm font-semibold">{t('admin.billingEvents', locale)}</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{MOCK_BILLING_EVENTS.length} {t('admin.eventsCount2', locale).replace('{n}', String(MOCK_BILLING_EVENTS.length))}</Badge>
            </div>
            <Tabs value={billingEventFilter} onValueChange={setBillingEventFilter}>
              <TabsList className="h-7">
                {(['all', 'payment', 'upgrade', 'cancel', 'refund'] as const).map((f) => {
                  const billingFilterLabels: Record<string, string> = {
                    all: t('admin.all', locale),
                    payment: t('admin.billingPayment', locale),
                    upgrade: t('admin.billingUpgrade', locale),
                    cancel: t('admin.billingCancel', locale),
                    refund: t('admin.billingRefund', locale),
                  };
                  return (
                  <TabsTrigger key={f} value={f} className="text-[10px] h-5 px-2">
                    {billingFilterLabels[f]}
                  </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">{t('admin.time', locale)}</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">{t('admin.user', locale)}</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">{t('admin.type', locale)}</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">{t('admin.details', locale)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBillingEvents.map((evt) => (
                  <TableRow key={evt.id}>
                    <TableCell className="text-[10px] text-muted-foreground py-2 whitespace-nowrap">{evt.time}</TableCell>
                    <TableCell className="text-[11px] font-medium py-2 truncate max-w-[150px]">{evt.user}</TableCell>
                    <TableCell className="py-2"><BillingEventBadge type={evt.type} locale={locale} /></TableCell>
                    <TableCell className="text-[11px] text-muted-foreground py-2">{evt.detail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* TRADING ANALYTICS SECTION                                */}
      {/* ======================================================= */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <CandlestickChart className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-sm font-semibold">{t('admin.tradingAnalytics', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Trading stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <div className="rounded-lg border bg-card p-3 text-center">
              <p className="text-lg font-bold">{t('admin.tradesToday', locale)}</p>
              <p className="text-xl font-bold text-emerald-500">12,456</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <p className="text-lg font-bold">{t('admin.tradesWeek', locale)}</p>
              <p className="text-xl font-bold text-sky-500">68,234</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <p className="text-lg font-bold">{t('admin.tradesMonth', locale)}</p>
              <p className="text-xl font-bold text-purple-500">284,512</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <p className="text-lg font-bold">{t('admin.platformWinRate', locale)}</p>
              <p className="text-xl font-bold text-emerald-500">63.4%</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <p className="text-lg font-bold">{t('admin.avgTradeSize', locale)}</p>
              <p className="text-xl font-bold text-foreground">$47.20</p>
            </div>
          </div>

          {/* Most traded assets */}
          <p className="text-xs font-medium text-muted-foreground mb-3">{t('admin.mostTradedAssets', locale)}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="space-y-2.5">
              {MOCK_TRADED_ASSETS.map((asset) => (
                <div key={asset.asset} className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold w-16 shrink-0">{asset.asset}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 to-emerald-400"
                      style={{ width: `${asset.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-14 text-right shrink-0 font-mono">
                    {asset.volume.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Peak trading hours */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t('admin.peakHours', locale)}</p>
              <div className="flex items-end gap-1 h-28">
                {MOCK_PEAK_HOURS.map((h) => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className={cn(
                        'w-full rounded-t-sm transition-all',
                        h.value === maxPeakHour ? 'bg-orange-500' : 'bg-orange-500/40 hover:bg-orange-500/60'
                      )}
                      style={{ height: `${(h.value / maxPeakHour) * 100}%` }}
                    />
                    <span className="text-[8px] text-muted-foreground">{h.hour}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Volume trend */}
          <Separator className="my-3" />
          <p className="text-xs font-medium text-muted-foreground mb-2">{t('admin.volumeTrend', locale)} ({t('admin.thisWeek', locale)})</p>
          <div className="flex items-end gap-3 h-24">
            {MOCK_VOLUME_TREND.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-medium">{(d.value / 1000).toFixed(1)}K</span>
                <div
                  className="w-full rounded-t-md bg-sky-500/60 transition-all hover:bg-sky-500/80"
                  style={{ height: `${(d.value / maxVolume) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* PLATFORM PERFORMANCE SECTION                             */}
      {/* ======================================================= */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-sky-500" />
            <CardTitle className="text-sm font-semibold">{t('admin.platformPerformance', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* API Response Time */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Timer className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs font-semibold">{t('admin.apiResponseTime', locale)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.current', locale)}</p>
                  <p className="text-sm font-bold text-emerald-500">{MOCK_PERFORMANCE.apiResponseCurrent}ms</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.average', locale)}</p>
                  <p className="text-sm font-bold">{MOCK_PERFORMANCE.apiResponseAvg}ms</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.p95', locale)}</p>
                  <p className="text-sm font-bold text-yellow-500">{MOCK_PERFORMANCE.apiResponseP95}ms</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{t('admin.requestLoad', locale)}</span>
                  <span>{MOCK_PERFORMANCE.requests1h.toLocaleString()} /h</span>
                </div>
                <Progress value={73} className="h-1.5" />
              </div>
            </div>

            {/* Database Performance */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-purple-500" />
                <p className="text-xs font-semibold">{t('admin.dbPerformance', locale)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.queriesPerSec2', locale)}</p>
                  <p className="text-sm font-bold">{MOCK_PERFORMANCE.dbQueriesPerSec.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.avgLatency2', locale)}</p>
                  <p className="text-sm font-bold text-emerald-500">{MOCK_PERFORMANCE.dbAvgLatencyMs}ms</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.slowQueries2', locale)}</p>
                  <p className="text-sm font-bold text-yellow-500">{MOCK_PERFORMANCE.dbSlowQueries}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{t('admin.connectionPool2', locale)}</span>
                  <span>18/25</span>
                </div>
                <Progress value={72} className="h-1.5" />
              </div>
            </div>

            {/* WebSocket Stats */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5 text-sky-500" />
                <p className="text-xs font-semibold">{t('admin.wsStats', locale)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.activeConnections', locale)}</p>
                  <p className="text-sm font-bold">{MOCK_PERFORMANCE.wsActiveConnections.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.messagesPerSec', locale)}</p>
                  <p className="text-sm font-bold">{MOCK_PERFORMANCE.wsMessagesPerSec.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{t('admin.connectionPool2', locale)}</span>
                  <span>2,847 / 5,000</span>
                </div>
                <Progress value={57} className="h-1.5" />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs font-semibold">{t('admin.memoryUsage', locale)}</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="62 38" strokeLinecap="round" className="text-emerald-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold">62%</span>
                    <span className="text-[8px] text-muted-foreground">{MOCK_PERFORMANCE.memoryUsed}MB</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {(MOCK_PERFORMANCE.memoryUsed / 1024).toFixed(1)}GB / {(MOCK_PERFORMANCE.memoryTotal / 1024).toFixed(0)}GB
              </p>
            </div>

            {/* CPU Usage */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-orange-500" />
                <p className="text-xs font-semibold">{t('admin.cpuUsage', locale)}</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="34 66" strokeLinecap="round" className="text-orange-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold">{MOCK_PERFORMANCE.cpuCurrent}%</span>
                    <span className="text-[8px] text-muted-foreground">{t('admin.avg', locale)} {MOCK_PERFORMANCE.cpuAvg}%</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {t('admin.cpuSpecs', locale).replace('{cores}', '4').replace('{threads}', '8')}
              </p>
            </div>

            {/* Error Rate */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <p className="text-xs font-semibold">{t('admin.errorRate', locale)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.lastHour', locale)}</p>
                  <p className="text-sm font-bold text-emerald-500">{MOCK_PERFORMANCE.errorRate1h}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{t('admin.last24h', locale)}</p>
                  <p className="text-sm font-bold text-yellow-500">{MOCK_PERFORMANCE.errorRate24h}%</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{t('admin.errorBudget2', locale)}</span>
                  <span>0.12% / 1.00%</span>
                </div>
                <Progress value={12} className="h-1.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* USERS MANAGEMENT (ENHANCED WITH CLICK-TO-DETAIL)         */}
      {/* ======================================================= */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                {t('admin.userManagement', locale)}
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {MOCK_USERS.length} {t('admin.usersCount', locale).replace('{n}', String(MOCK_USERS.length))}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground hidden sm:block">{t('admin.clickToView', locale)}</p>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('admin.search', locale)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">
                    {t('admin.name', locale)}
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">
                    {t('admin.email', locale)}
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">
                    {t('admin.role', locale)}
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">
                    {t('admin.status', locale)}
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8 hidden md:table-cell">
                    {t('admin.joined', locale)}
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground h-8 text-right">
                    {t('admin.actions', locale)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleUserRowClick(user)}
                  >
                    <TableCell className="text-xs font-medium py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[120px]">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground py-2.5 truncate max-w-[160px]">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <RoleBadge role={user.role} locale={locale} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <StatusBadge status={user.status} locale={locale} />
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground py-2.5 hidden md:table-cell">
                      {user.joined}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {user.status !== 'suspended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-yellow-600 border-yellow-500/25 hover:bg-yellow-500/10 hover:text-yellow-600"
                          >
                            <ShieldBan className="h-3 w-3 mr-1" />
                            {t('admin.suspend', locale)}
                          </Button>
                        )}
                        {user.status === 'suspended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/10 hover:text-emerald-600"
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            {t('admin.activate', locale)}
                          </Button>
                        )}
                        {user.status !== 'premium' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-purple-600 border-purple-500/25 hover:bg-purple-500/10 hover:text-purple-600"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            {t('admin.premium', locale)}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* USER DETAIL DIALOG                                       */}
      {/* ======================================================= */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {t('admin.userDetails', locale)}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedUser?.name} — {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && userDetailData && (
            <div className="space-y-4 mt-2">
              {/* User Profile */}
              <div className="rounded-lg border p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">{t('admin.userProfile', locale)}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('admin.name', locale)}</p>
                    <p className="text-xs font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('admin.email', locale)}</p>
                    <p className="text-xs font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('admin.role', locale)}</p>
                    <RoleBadge role={selectedUser.role} locale={locale} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('admin.status', locale)}</p>
                    <StatusBadge status={selectedUser.status} locale={locale} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('admin.joined', locale)}</p>
                    <p className="text-xs font-medium">{selectedUser.joined}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('admin.plan', locale)}</p>
                    <Badge variant="outline" className={cn(
                      'text-[10px]',
                      userDetailData.stats.plan === 'Enterprise' ? 'border-emerald-500/25 text-emerald-500 bg-emerald-500/10' :
                      userDetailData.stats.plan === 'Pro' ? 'border-purple-500/25 text-purple-500 bg-purple-500/10' :
                      userDetailData.stats.plan === 'Starter' ? 'border-sky-500/25 text-sky-500 bg-sky-500/10' :
                      'border-muted-foreground/25 text-muted-foreground bg-muted'
                    )}>
                      {userDetailData.stats.plan}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{t('admin.nextBilling', locale)}</p>
                    <p className="text-xs font-medium">{userDetailData.stats.nextBilling}</p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                  {selectedUser.status !== 'suspended' && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-yellow-600 border-yellow-500/25 hover:bg-yellow-500/10">
                      <ShieldBan className="h-3 w-3 mr-1" /> {t('admin.suspend', locale)}
                    </Button>
                  )}
                  {selectedUser.status === 'suspended' && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/10">
                      <ShieldCheck className="h-3 w-3 mr-1" /> {t('admin.activate', locale)}
                    </Button>
                  )}
                  {selectedUser.status !== 'premium' && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-purple-600 border-purple-500/25 hover:bg-purple-500/10">
                      <Crown className="h-3 w-3 mr-1" /> {t('admin.premium', locale)}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-muted-foreground border-muted-foreground/25 hover:bg-muted">
                    <KeyRound className="h-3 w-3 mr-1" /> {t('admin.resetPassword', locale)}
                  </Button>
                </div>
              </div>

              {/* Trading Stats */}
              <div className="rounded-lg border p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">{t('admin.userTradingStats', locale)}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{t('admin.totalTrades', locale)}</p>
                    <p className="text-lg font-bold">{userDetailData.stats.totalTrades.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{t('admin.totalPnl', locale)}</p>
                    <p className={cn('text-lg font-bold', userDetailData.stats.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                      {userDetailData.stats.totalPnl >= 0 ? '+' : ''}${userDetailData.stats.totalPnl.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{t('admin.totalWinRate', locale)}</p>
                    <p className="text-lg font-bold">{userDetailData.stats.winRate}%</p>
                  </div>
                </div>
              </div>

              {/* User's Bots */}
              <div className="rounded-lg border p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">{t('admin.userBots', locale)}</p>
                {userDetailData.bots.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">{t('admin.noBotsFound', locale)}</p>
                ) : (
                  <div className="space-y-2">
                    {userDetailData.bots.map((bot) => (
                      <div key={bot.id} className="flex items-center justify-between rounded-md border p-2.5">
                        <div className="flex items-center gap-2">
                          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{bot.name}</span>
                          <BotStatusBadge status={bot.status} locale={locale} />
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-muted-foreground">{bot.trades} {t('admin.trades', locale)}</span>
                          <span className="text-muted-foreground">{t('admin.percentWR', locale).replace('{pct}', String(bot.winRate))}</span>
                          <span className={cn('font-semibold', bot.pnl >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                            {bot.pnl >= 0 ? '+' : ''}${bot.pnl.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="rounded-lg border p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">{t('admin.userActivity', locale)}</p>
                {userDetailData.activities.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">{t('admin.noActivityFound', locale)}</p>
                ) : (
                  <div className="space-y-3">
                    {userDetailData.activities.map((act) => (
                      <div key={act.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary/50 mt-1 shrink-0" />
                          <div className="w-px flex-1 bg-muted" />
                        </div>
                        <div className="pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium">{act.action}</span>
                            <span className="text-[10px] text-muted-foreground">{act.time}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{act.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================= */}
      {/* AUDIT LOG                                               */}
      {/* ======================================================= */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">{t('admin.auditLog', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-6 px-3">
                {t('admin.allLogs', locale)}
              </TabsTrigger>
              <TabsTrigger value="auth" className="text-xs h-6 px-3">
                {t('admin.authLogs', locale)}
              </TabsTrigger>
              <TabsTrigger value="trade" className="text-xs h-6 px-3">
                {t('admin.tradeLogs', locale)}
              </TabsTrigger>
              <TabsTrigger value="system" className="text-xs h-6 px-3">
                {t('admin.systemLogs', locale)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ScrollArea className="max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">
                        {t('admin.time', locale)}
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">
                        {t('admin.event', locale)}
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground h-8">
                        {t('admin.user', locale)}
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground h-8 hidden md:table-cell">
                        {t('admin.details', locale)}
                      </TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground h-8 hidden lg:table-cell text-right">
                        {t('admin.ip', locale)}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const EventIcon = logEventIcon[log.event] || Activity;
                      return (
                        <TableRow key={log.id} className={logRowBg[log.type]}>
                          <TableCell className="text-[10px] text-muted-foreground py-2 whitespace-nowrap">
                            <span className="hidden sm:inline">{log.time}</span>
                            <span className="sm:hidden">{log.time.split(' ')[1]}</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1.5">
                              <EventIcon
                                className={cn(
                                  'h-3 w-3 shrink-0',
                                  log.type === 'auth'
                                    ? 'text-blue-500'
                                    : log.type === 'trade'
                                    ? 'text-emerald-500'
                                    : 'text-muted-foreground'
                                )}
                              />
                              <span className="text-[11px] font-medium whitespace-nowrap">
                                {log.event}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground py-2 truncate max-w-[150px]">
                            {log.user}
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground py-2 hidden md:table-cell truncate max-w-[260px]">
                            {log.details}
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground py-2 hidden lg:table-cell text-right font-mono">
                            {log.ip}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* SYSTEM CONFIGURATION                                     */}
      {/* ======================================================= */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">{t('admin.systemConfig', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bots & Risk */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('admin.maxBotsPerUser', locale)}</Label>
                <Input
                  type="number"
                  value={config.maxBotsPerUser}
                  onChange={(e) => setConfig({ ...config, maxBotsPerUser: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('admin.globalRiskLimit', locale)}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{t('admin.maxDailyLoss', locale)} ($)</Label>
                    <Input
                      type="number"
                      value={config.globalMaxDailyLoss}
                      onChange={(e) => setConfig({ ...config, globalMaxDailyLoss: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{t('admin.maxDrawdownGlobal', locale)}</Label>
                    <Input
                      type="number"
                      value={config.globalMaxDrawdown}
                      onChange={(e) => setConfig({ ...config, globalMaxDrawdown: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* API & WS */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('admin.apiRateLimit', locale)}</Label>
                <Input
                  type="number"
                  value={config.apiRateLimit}
                  onChange={(e) => setConfig({ ...config, apiRateLimit: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('admin.wsMaxConnections', locale)}</Label>
                <Input
                  type="number"
                  value={config.wsMaxConnections}
                  onChange={(e) => setConfig({ ...config, wsMaxConnections: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between rounded-lg border p-3 mt-4">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                {t('admin.maintenanceMode', locale)}
              </Label>
              <p className="text-[10px] text-muted-foreground">{t('admin.maintenanceDesc', locale)}</p>
            </div>
            <Switch
              checked={config.maintenanceMode}
              onCheckedChange={(checked) => setConfig({ ...config, maintenanceMode: checked })}
            />
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleSaveConfig} size="sm" className="h-8 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {t('admin.saveConfig', locale)}
            </Button>
            {configSaved && (
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {t('admin.configSaved', locale)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* ANNOUNCEMENTS                                            */}
      {/* ======================================================= */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-sm font-semibold">{t('admin.announcements', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Create announcement form */}
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-xs font-semibold">{t('admin.createAnnouncement', locale)}</p>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">{t('admin.announcementTitle', locale)}</Label>
                <Input
                  placeholder={t('admin.announcementTitlePlaceholder', locale)}
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">{t('admin.announcementMessage', locale)}</Label>
                <Textarea
                  placeholder={t('admin.announcementMessagePlaceholder', locale)}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="text-xs min-h-[80px] resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground">{t('admin.severity', locale)}</Label>
                  <Select value={announcementSeverity} onValueChange={setAnnouncementSeverity}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">{t('admin.severityInfo', locale)}</SelectItem>
                      <SelectItem value="warning">{t('admin.severityWarning', locale)}</SelectItem>
                      <SelectItem value="critical">{t('admin.severityCritical', locale)}</SelectItem>
                      <SelectItem value="maintenance">{t('admin.severityMaintenance', locale)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2.5">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{t('admin.scheduleAnnouncement', locale)}</span>
                </div>
                <Switch checked={announcementSchedule} onCheckedChange={setAnnouncementSchedule} />
              </div>
              <Button onClick={handlePublishAnnouncement} size="sm" className="h-8 text-xs w-full">
                <Radio className="h-3.5 w-3.5 mr-1.5" />
                {t('admin.publish', locale)}
              </Button>
            </div>

            {/* Recent announcements list */}
            <div>
              <p className="text-xs font-semibold mb-3">{t('admin.recentAnnouncements', locale)}</p>
              <ScrollArea className="max-h-[340px]">
                <div className="space-y-2">
                  {MOCK_ANNOUNCEMENTS.map((ann) => (
                    <div key={ann.id} className="rounded-lg border p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <SeverityBadge severity={ann.severity} locale={locale} />
                          <span className="text-[11px] font-medium truncate">{ann.title}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] shrink-0',
                            ann.status === 'published'
                              ? 'border-emerald-500/25 text-emerald-500 bg-emerald-500/10'
                              : 'border-yellow-500/25 text-yellow-500 bg-yellow-500/10'
                          )}
                        >
                          {ann.status === 'published' ? t('admin.published', locale) : t('admin.scheduled', locale)}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{ann.message}</p>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{ann.createdAt}</span>
                        {ann.scheduledAt && (
                          <>
                            <span>•</span>
                            <CalendarClock className="h-2.5 w-2.5" />
                            <span>{ann.scheduledAt}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================= */}
      {/* REAL-TIME ACTIVITY FEED                                  */}
      {/* ======================================================= */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-500 animate-pulse" />
              <CardTitle className="text-sm font-semibold">{t('admin.realtimeActivity', locale)}</CardTitle>
              <Badge variant="outline" className="text-[9px] border-red-500/25 text-red-500 bg-red-500/10 animate-pulse">{t('admin.live', locale)}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={activityFilter} onValueChange={(v) => setActivityFilter(v as ActivityEventType | 'all')}>
                <TabsList className="h-7">
                  <TabsTrigger value="all" className="text-[10px] h-5 px-2">{t('admin.allTypes', locale)}</TabsTrigger>
                  <TabsTrigger value="trade" className="text-[10px] h-5 px-2">{t('admin.tradeEvent', locale)}</TabsTrigger>
                  <TabsTrigger value="auth" className="text-[10px] h-5 px-2">{t('admin.authEvent', locale)}</TabsTrigger>
                  <TabsTrigger value="system" className="text-[10px] h-5 px-2">{t('admin.systemEvent', locale)}</TabsTrigger>
                  <TabsTrigger value="billing" className="text-[10px] h-5 px-2">{t('admin.billingEvent', locale)}</TabsTrigger>
                  <TabsTrigger value="risk" className="text-[10px] h-5 px-2">{t('admin.riskEvent', locale)}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground">{t('admin.liveFeed', locale)}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{t('admin.autoScroll', locale)}</span>
              <Switch checked={autoScroll} onCheckedChange={setAutoScroll} className="scale-75" />
            </div>
          </div>
          <ScrollArea className="max-h-72">
            <div className="space-y-1.5">
              {filteredActivityEvents.map((evt) => {
                const cfg = activityEventConfig[evt.type];
                const EventIcon = cfg.icon;
                return (
                  <div
                    key={evt.id}
                    className="flex items-start gap-2.5 rounded-md p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn('flex h-6 w-6 items-center justify-center rounded-md shrink-0 mt-0.5', cfg.bg)}>
                      <EventIcon className={cn('h-3 w-3', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium">{evt.message}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-muted-foreground font-mono">{evt.time}</span>
                        {evt.user && (
                          <>
                            <span className="text-[9px] text-muted-foreground">•</span>
                            <span className="text-[9px] text-muted-foreground truncate">{evt.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-[8px] shrink-0', cfg.bg, cfg.color, 'border-0')}>
                      {evt.type}
                    </Badge>
                  </div>
                );
              })}
              <div ref={activityEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
