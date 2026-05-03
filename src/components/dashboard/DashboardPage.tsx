'use client';

import React, { useEffect, useState } from 'react';
import { useDashboardStore, useBotsStore, useNavStore, useLocaleStore } from '@/store';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatNumber(n: number, decimals = 2) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(decimals)}`;
}

function formatPercent(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const chartConfig: ChartConfig = {
  balance: {
    label: 'Balance',
    color: 'hsl(var(--chart-1))',
  },
};

const statusColors: Record<string, string> = {
  running: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  paused: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/25',
  stopped: 'bg-muted text-muted-foreground border-muted',
  error: 'bg-red-500/15 text-red-500 border-red-500/25',
  emergency_stop: 'bg-red-500/15 text-red-500 border-red-500/25',
};

const statusDot: Record<string, string> = {
  running: 'bg-emerald-500 animate-pulse',
  paused: 'bg-yellow-500',
  stopped: 'bg-muted-foreground',
  error: 'bg-red-500',
  emergency_stop: 'bg-red-500 animate-pulse',
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}) {
  return (
    <Card className="gap-4 py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend && trend !== 'neutral' && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-0.5',
              trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
            )}
          >
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ) : (
        <div>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground font-medium">{title}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const { stats, equityCurve, recentAlerts, isLoading, fetchDashboard } = useDashboardStore();
  const { bots } = useBotsStore();
  const { navigate } = useNavStore();
  const { locale } = useLocaleStore();
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    });
  }, [fetchDashboard]);

  const activeBots = bots.filter((b) => b.status === 'running');

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title={t('dash.totalBots', locale)}
          value={isLoading ? '—' : String(stats?.totalBots ?? 0)}
          subtitle={`${stats?.activeBots ?? 0} ${t('dash.active', locale)}`}
          icon={Bot}
          loading={isLoading}
        />
        <StatCard
          title={t('dash.activeBots', locale)}
          value={isLoading ? '—' : String(stats?.activeBots ?? 0)}
          subtitle={t('dash.currentlyRunning', locale)}
          icon={Zap}
          loading={isLoading}
        />
        <StatCard
          title={t('dash.totalPnL', locale)}
          value={isLoading ? '—' : formatNumber(stats?.totalPnL ?? 0)}
          subtitle={isLoading ? '' : formatPercent(stats?.todayPnL ?? 0) + ` ${t('dash.today', locale)}`}
          icon={stats && stats.totalPnL >= 0 ? TrendingUp : TrendingDown}
          trend={stats && stats.totalPnL >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
        <StatCard
          title={t('dash.winRate', locale)}
          value={isLoading ? '—' : `${(stats?.overallWinRate ?? 0).toFixed(1)}%`}
          subtitle={isLoading ? '' : `${stats?.totalTrades ?? 0} ${t('dash.totalTrades', locale)}`}
          icon={BarChart3}
          loading={isLoading}
        />
        <StatCard
          title={t('dash.todayTrades', locale)}
          value={isLoading ? '—' : String(stats?.todayTrades ?? 0)}
          subtitle={isLoading ? '' : `${(stats?.todayPnL ?? 0) >= 0 ? '+' : ''}${(stats?.todayPnL ?? 0).toFixed(2)}`}
          icon={Activity}
          loading={isLoading}
        />
        <StatCard
          title={t('dash.riskAlerts', locale)}
          value={isLoading ? '—' : String(stats?.riskAlerts ?? 0)}
          subtitle={isLoading ? '' : t('dash.activeAlerts', locale)}
          icon={AlertTriangle}
          trend={(stats?.riskAlerts ?? 0) > 0 ? 'down' : 'neutral'}
          loading={isLoading}
        />
      </div>

      {/* Equity Curve + Active Bots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <Card className="lg:col-span-2 gap-4">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t('dash.equityCurve', locale)}</CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">
                {t('dash.last30days', locale)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : equityCurve.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <AreaChart data={equityCurve} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    className="text-[10px]"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    className="text-[10px]"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                    domain={['auto', 'auto']}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--color-balance)"
                    fill="url(#balanceGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">
                {t('dash.noEquityData', locale)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Bots */}
        <Card className="gap-4">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t('dash.activeBotsTitle', locale)}</CardTitle>
              <button
                onClick={() => navigate('bots')}
                className="text-xs text-primary hover:underline font-medium"
              >
                {t('dash.viewAll', locale)}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : activeBots.length > 0 ? (
              <ScrollArea className="max-h-[260px]">
                <div className="space-y-2">
                  {activeBots.map((bot) => (
                    <div
                      key={bot.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-2 w-2 rounded-full', statusDot[bot.status])} />
                          <p className="text-sm font-medium truncate">{bot.name}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {bot.strategyName} · {bot.brokerName}
                        </p>
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            bot.stats.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                          )}
                        >
                          {bot.stats.profitLoss >= 0 ? '+' : ''}
                          {bot.stats.profitLoss.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          WR {bot.stats.winRate.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Bot className="h-8 w-8 opacity-40" />
                <p>{t('dash.noActiveBots', locale)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {recentAlerts.length > 0 && (
        <Card className="gap-4">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-sm font-semibold">{t('dash.recentAlerts', locale)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 text-sm',
                      alert.severity === 'emergency'
                        ? 'border-red-500/25 bg-red-500/5'
                        : alert.severity === 'critical'
                        ? 'border-orange-500/25 bg-orange-500/5'
                        : 'border-yellow-500/25 bg-yellow-500/5'
                    )}
                  >
                    <div className="mt-0.5">
                      {alert.severity === 'emergency' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : alert.severity === 'critical' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {timeAgo(alert.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] shrink-0',
                        alert.severity === 'emergency'
                          ? 'border-red-500/25 text-red-500'
                          : alert.severity === 'critical'
                          ? 'border-orange-500/25 text-orange-500'
                          : 'border-yellow-500/25 text-yellow-500'
                      )}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
