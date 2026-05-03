'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTradesStore, useLocaleStore } from '@/store';
import { t } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { TradeStatus, TradeDirection } from '@/types';

const directionConfig = {
  CALL: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/25', icon: ArrowUpRight },
  PUT: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/25', icon: ArrowDownRight },
};

const statusConfig: Record<TradeStatus, { color: string; bg: string }> = {
  pending: { color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/25' },
  won: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  lost: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/25' },
  refunded: { color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/25' },
  timeout: { color: 'text-muted-foreground', bg: 'bg-muted border-muted' },
  error: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/25' },
};

export default function TradingPage() {
  const { trades, isLoading, fetchTrades } = useTradesStore();
  const { locale } = useLocaleStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrades(undefined, 100).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    });
  }, [fetchTrades]);

  const filteredTrades = useMemo(() => {
    return trades.filter((tr) => {
      if (statusFilter !== 'all' && tr.status !== statusFilter) return false;
      if (directionFilter !== 'all' && tr.direction !== directionFilter) return false;
      return true;
    });
  }, [trades, statusFilter, directionFilter]);

  const performance = useMemo(() => {
    const closed = trades.filter((tr) => tr.status === 'won' || tr.status === 'lost');
    const wins = closed.filter((tr) => tr.status === 'won').length;
    const totalProfit = closed.reduce((s, tr) => s + (tr.profit || 0), 0);
    const avgProfit = closed.length > 0 ? totalProfit / closed.length : 0;
    return {
      total: closed.length,
      winRate: closed.length > 0 ? (wins / closed.length) * 100 : 0,
      avgProfit,
      totalPnL: totalProfit,
    };
  }, [trades]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t('trade.title', locale)}</h2>
          <p className="text-sm text-muted-foreground">{t('trade.subtitle', locale)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('trade.live', locale)}
          </div>
          <button
            onClick={() => fetchTrades(undefined, 100)}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            {t('trade.refresh', locale)}
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gap-4 py-4 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-xl font-bold">{performance.total}</p>
          )}
          <p className="text-[11px] text-muted-foreground font-medium">{t('trade.totalTrades', locale)}</p>
        </Card>
        <Card className="gap-4 py-4 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-xl font-bold">{performance.winRate.toFixed(1)}%</p>
          )}
          <p className="text-[11px] text-muted-foreground font-medium">{t('trade.winRate', locale)}</p>
        </Card>
        <Card className="gap-4 py-4 px-4">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            performance.avgProfit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
          )}>
            <DollarSign className={cn(
              'h-4 w-4',
              performance.avgProfit >= 0 ? 'text-emerald-500' : 'text-red-500'
            )} />
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className={cn(
              'text-xl font-bold',
              performance.avgProfit >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {performance.avgProfit >= 0 ? '+' : ''}{performance.avgProfit.toFixed(2)}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground font-medium">{t('trade.avgProfit', locale)}</p>
        </Card>
        <Card className="gap-4 py-4 px-4">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            performance.totalPnL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
          )}>
            {performance.totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className={cn(
              'text-xl font-bold',
              performance.totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {performance.totalPnL >= 0 ? '+' : ''}{performance.totalPnL.toFixed(2)}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground font-medium">{t('trade.totalPnL', locale)}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder={t('trade.direction', locale)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('trade.allDirections', locale)}</SelectItem>
            <SelectItem value="CALL">CALL</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder={t('trade.status', locale)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('trade.allStatuses', locale)}</SelectItem>
            <SelectItem value="won">{t('trade.won', locale)}</SelectItem>
            <SelectItem value="lost">{t('trade.lost', locale)}</SelectItem>
            <SelectItem value="pending">{t('trade.pending', locale)}</SelectItem>
            <SelectItem value="refunded">{t('trade.refunded', locale)}</SelectItem>
            <SelectItem value="timeout">{t('trade.timeout', locale)}</SelectItem>
            <SelectItem value="error">{t('trade.error', locale)}</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-[10px] h-6">
          {filteredTrades.length} {t('trade.trades', locale)}
        </Badge>
      </div>

      {/* Trades Table */}
      <Card className="gap-0 overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9">{t('trade.direction', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9">{t('trade.asset', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9 text-right">{t('trade.amount', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9 text-right hidden md:table-cell">{t('trade.entry', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9 text-right hidden md:table-cell">{t('trade.exit', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9 text-right">{t('trade.profit', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9">{t('trade.status', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9 text-right hidden sm:table-cell">{t('trade.latency', locale)}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-9 text-right hidden lg:table-cell">{t('trade.time', locale)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-muted-foreground text-sm">
                    {t('trade.noTrades', locale)}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrades.map((trade) => {
                  const dir = directionConfig[trade.direction];
                  const stat = statusConfig[trade.status];
                  const DirIcon = dir.icon;
                  return (
                    <TableRow key={trade.id} className="group">
                      <TableCell className="py-2.5">
                        <Badge variant="outline" className={cn('text-[10px] font-semibold gap-0.5 border', dir.bg, dir.color)}>
                          <DirIcon className="h-2.5 w-2.5" />
                          {trade.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-sm font-medium font-mono">{trade.asset}</span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <span className="text-sm font-mono">${trade.amount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right hidden md:table-cell">
                        <span className="text-xs font-mono text-muted-foreground">
                          {trade.entryPrice.toFixed(4)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right hidden md:table-cell">
                        <span className="text-xs font-mono text-muted-foreground">
                          {trade.exitPrice?.toFixed(4) ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <span className={cn(
                          'text-sm font-semibold font-mono',
                          trade.profit !== undefined && trade.profit !== null
                            ? trade.profit >= 0 ? 'text-emerald-500' : 'text-red-500'
                            : 'text-muted-foreground'
                        )}>
                          {trade.profit !== undefined && trade.profit !== null
                            ? `${trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}`
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge variant="outline" className={cn('text-[9px] border', stat.bg, stat.color)}>
                          {t(`trade.${trade.status}` as const, locale)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 text-right hidden sm:table-cell">
                        {trade.latencyMs ? (
                          <span className="text-xs font-mono text-muted-foreground">
                            {trade.latencyMs}ms
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 text-right hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground" title={trade.openedAt}>
                          {timeAgo(trade.openedAt, locale)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
