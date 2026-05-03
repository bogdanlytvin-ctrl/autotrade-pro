'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore, useBotsStore, useStrategiesStore, useLocaleStore } from '@/store';
import { t } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Play,
  Pause,
  Square,
  OctagonAlert,
  Loader2,
  Bot,
  Clock,
  Wifi,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { BotStatus } from '@/types';

function getStatusLabels(locale: 'en' | 'uk'): Record<BotStatus, string> {
  return {
    running: t('bots.running', locale),
    paused: t('bots.paused', locale),
    stopped: t('bots.stopped', locale),
    error: t('bots.error', locale),
    created: t('bots.created', locale),
    emergency_stop: t('bots.emergency', locale),
  };
}

const statusVisualConfig: Record<BotStatus, { color: string; bg: string; dot: string }> = {
  running: {
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-500 animate-pulse',
  },
  paused: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    dot: 'bg-yellow-500',
  },
  stopped: {
    color: 'text-muted-foreground',
    bg: 'bg-muted border-muted',
    dot: 'bg-muted-foreground',
  },
  error: {
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/20',
    dot: 'bg-red-500',
  },
  created: {
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-500',
  },
  emergency_stop: {
    color: 'text-red-600',
    bg: 'bg-red-600/10 border-red-600/20',
    dot: 'bg-red-600 animate-pulse',
  },
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return `${d}d ${h}h`;
}

export default function BotPage() {
  const { bots, isLoading, fetchBots, startBot, pauseBot, stopBot, emergencyStop } = useBotsStore();
  const { strategies, fetchStrategies } = useStrategiesStore();
  const { locale } = useLocaleStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBot, setNewBot] = useState({ name: '', strategyId: '', sessionId: '', initialBalance: '1000' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBots();
    fetchStrategies();
  }, [fetchBots, fetchStrategies]);

  const handleAction = async (botId: string, action: 'start' | 'pause' | 'stop' | 'emergency') => {
    setActionLoading(botId);
    try {
      switch (action) {
        case 'start':
          await startBot(botId);
          toast.success(t('bots.started', locale));
          break;
        case 'pause':
          await pauseBot(botId);
          toast.success(t('bots.pausedToast', locale));
          break;
        case 'stop':
          await stopBot(botId);
          toast.success(t('bots.stoppedToast', locale));
          break;
        case 'emergency':
          await emergencyStop(botId);
          toast.success(t('bots.emergencyActivated', locale));
          break;
      }
    } catch {
      toast.error(t('bots.actionFailed', locale));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async () => {
    if (!newBot.name.trim()) {
      toast.error(t('bots.botNameRequired', locale));
      return;
    }
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: newBot.name,
          strategyId: newBot.strategyId || 'strat-1',
          sessionId: newBot.sessionId || 'session-1',
          initialBalance: parseFloat(newBot.initialBalance) || 1000,
        }),
      });
      if (!res.ok) throw new Error('Failed to create bot');
      toast.success(t('bots.createdSuccess', locale));
      setDialogOpen(false);
      setNewBot({ name: '', strategyId: '', sessionId: '', initialBalance: '1000' });
      await fetchBots();
    } catch {
      toast.error(t('bots.actionFailed', locale));
    }
  };

  const totalBalance = bots.reduce((s, b) => s + b.stats.currentBalance, 0);
  const totalPnL = bots.reduce((s, b) => s + b.stats.profitLoss, 0);
  const activeBots = bots.filter((b) => b.status === 'running').length;
  const statusLabels = getStatusLabels(locale);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('bots.title', locale)}</h2>
          <p className="text-sm text-muted-foreground">{t('bots.subtitle', locale)}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('bots.newBot', locale)}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('bots.createTitle', locale)}</DialogTitle>
              <DialogDescription>{t('bots.createDesc', locale)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('bots.botName', locale)}</Label>
                <Input
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  placeholder="My Trading Bot"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('bots.strategy', locale)}</Label>
                <Select value={newBot.strategyId} onValueChange={(v) => setNewBot({ ...newBot, strategyId: v })}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={t('bots.selectStrategy', locale)} />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((s) => (
                      <SelectItem key={s.id} value={s.id ?? ''}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('bots.brokerSession', locale)}</Label>
                <Input
                  value={newBot.sessionId}
                  onChange={(e) => setNewBot({ ...newBot, sessionId: e.target.value })}
                  placeholder={t('bots.sessionPlaceholder', locale)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('bots.initialBalance', locale)}</Label>
                <Input
                  type="number"
                  value={newBot.initialBalance}
                  onChange={(e) => setNewBot({ ...newBot, initialBalance: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('strat.cancel', locale)}</Button>
              <Button onClick={handleCreate} disabled={!newBot.name.trim()}>
                {t('bots.createBot', locale)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">{bots.length}</p>
            <p className="text-[11px] text-muted-foreground">{t('bots.totalBots', locale)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{activeBots}</p>
            <p className="text-[11px] text-muted-foreground">{t('bots.active', locale)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            totalPnL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
          )}>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div>
            <p className={cn('text-lg font-bold', totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500')}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </p>
            <p className="text-[11px] text-muted-foreground">{t('bots.totalPnL', locale)}</p>
          </div>
        </div>
      </div>

      {/* Bot Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : bots.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t('bots.noBots', locale)}</p>
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t('bots.createFirst', locale)}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bots.map((bot) => {
            const sc = statusVisualConfig[bot.status];
            const isLoadingAction = actionLoading === bot.id;

            return (
              <Card
                key={bot.id}
                className={cn(
                  'gap-4 overflow-hidden transition-all',
                  bot.status === 'emergency_stop' && 'border-red-500/30 ring-1 ring-red-500/10'
                )}
              >
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full shrink-0', sc.dot)} />
                        <CardTitle className="text-sm truncate">{bot.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs mt-1 truncate">
                        {bot.strategyName} · {bot.brokerName}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] shrink-0 border', sc.bg, sc.color)}
                    >
                      {statusLabels[bot.status]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('bots.balance', locale)}</p>
                      <p className="text-sm font-semibold font-mono">
                        ${bot.stats.currentBalance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('bots.pnl', locale)}</p>
                      <p className={cn(
                        'text-sm font-semibold font-mono',
                        bot.stats.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {bot.stats.profitLoss >= 0 ? '+' : ''}{bot.stats.profitLoss.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('bots.winRate', locale)}</p>
                      <p className="text-sm font-semibold">{bot.stats.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('bots.trades', locale)}</p>
                      <p className="text-sm font-semibold">{bot.stats.totalTrades}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('bots.latency', locale)}</p>
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-semibold">{bot.stats.avgLatencyMs}ms</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('bots.uptime', locale)}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-semibold">{formatUptime(bot.stats.uptimeSeconds)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Drawdown Bar */}
                  {bot.status === 'running' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{t('bots.drawdown', locale)}</span>
                        <span className="font-mono font-medium">
                          {bot.stats.currentDrawdown.toFixed(1)}% / {bot.stats.maxDrawdown.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={(bot.stats.currentDrawdown / Math.max(bot.stats.maxDrawdown, 1)) * 100}
                        className="h-1.5"
                      />
                    </div>
                  )}

                  {/* Error Display */}
                  {bot.lastError && (
                    <div className="flex items-start gap-2 rounded-md bg-red-500/10 border border-red-500/20 p-2">
                      <OctagonAlert className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-red-500 line-clamp-2">{bot.lastError}</p>
                    </div>
                  )}
                </CardContent>

                {/* Actions */}
                <div className="flex items-center gap-2 px-6 pb-4">
                  {(bot.status === 'stopped' || bot.status === 'created' || bot.status === 'error') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 gap-1 text-xs text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/10"
                      disabled={isLoadingAction}
                      onClick={() => handleAction(bot.id, 'start')}
                    >
                      {isLoadingAction ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      {t('bots.start', locale)}
                    </Button>
                  )}
                  {bot.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 gap-1 text-xs text-yellow-500 border-yellow-500/25 hover:bg-yellow-500/10"
                      disabled={isLoadingAction}
                      onClick={() => handleAction(bot.id, 'pause')}
                    >
                      {isLoadingAction ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pause className="h-3 w-3" />}
                      {t('bots.pause', locale)}
                    </Button>
                  )}
                  {bot.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 gap-1 text-xs text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/10"
                      disabled={isLoadingAction}
                      onClick={() => handleAction(bot.id, 'start')}
                    >
                      {isLoadingAction ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      {t('bots.resume', locale)}
                    </Button>
                  )}
                  {(bot.status === 'running' || bot.status === 'paused') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      disabled={isLoadingAction}
                      onClick={() => handleAction(bot.id, 'stop')}
                    >
                      <Square className="h-3 w-3" />
                      {t('bots.stop', locale)}
                    </Button>
                  )}
                  {(bot.status === 'running' || bot.status === 'paused') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs text-red-500 border-red-500/25 hover:bg-red-500/10"
                      disabled={isLoadingAction}
                      onClick={() => handleAction(bot.id, 'emergency')}
                    >
                      {isLoadingAction ? <Loader2 className="h-3 w-3 animate-spin" /> : <OctagonAlert className="h-3 w-3" />}
                      <span className="hidden sm:inline">{t('bots.eStop', locale)}</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
