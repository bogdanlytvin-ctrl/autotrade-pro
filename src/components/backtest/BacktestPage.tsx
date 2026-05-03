'use client';

import React, { useEffect, useState } from 'react';
import { useBacktestStore, useStrategiesStore, useLocaleStore } from '@/store';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  FlaskConical,
  Play,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { BacktestConfig, BacktestResult, Timeframe } from '@/types';

const TIMEFRAMES: Timeframe[] = ['30s', '1m', '5m', '15m', '1h'];

const chartConfig: ChartConfig = {
  balance: {
    label: 'Balance',
    color: 'hsl(var(--chart-1))',
  },
};

function formatNumber(n: number, decimals = 2) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(decimals)}`;
}

function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        color ? `${color}/10` : 'bg-primary/10'
      )}>
        <Icon className={cn('h-4 w-4', color || 'text-primary')} />
      </div>
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={cn('text-base font-bold font-mono', color)}>{value}</p>
        {subValue && <p className="text-[10px] text-muted-foreground">{subValue}</p>}
      </div>
    </div>
  );
}

export default function BacktestPage() {
  const { results, isRunning, runBacktest, fetchResults } = useBacktestStore();
  const { strategies, fetchStrategies } = useStrategiesStore();
  const { locale } = useLocaleStore();
  const [selectedResult, setSelectedResult] = useState<BacktestResult | null>(null);
  const [config, setConfig] = useState<BacktestConfig>({
    name: '',
    strategyId: '',
    asset: 'EUR/USD',
    timeframe: '5m',
    startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    initialBalance: 1000,
  });

  useEffect(() => {
    fetchResults();
    fetchStrategies();
  }, [fetchResults, fetchStrategies]);

  const handleRun = async () => {
    if (!config.name.trim()) {
      toast.error(t('bt.nameRequired', locale));
      return;
    }
    if (!config.strategyId) {
      toast.error(t('bt.selectStrategy', locale));
      return;
    }
    try {
      await runBacktest(config);
      toast.success(t('bt.completed', locale));
    } catch {
      toast.error(t('bt.failed', locale));
    }
  };

  const result = selectedResult || results[0] || null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('bt.title', locale)}</h2>
          <p className="text-sm text-muted-foreground">{t('bt.subtitle', locale)}</p>
        </div>
        {isRunning && (
          <Badge variant="outline" className="border-yellow-500/25 text-yellow-500 text-xs gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('bt.running', locale)}
          </Badge>
        )}
      </div>

      {/* Run Backtest Form */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">{t('bt.runNew', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bt.name', locale)}</Label>
              <Input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="My Backtest"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bt.strategy', locale)}</Label>
              <Select value={config.strategyId} onValueChange={(v) => setConfig({ ...config, strategyId: v })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t('bt.selectStrategy', locale)} />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((s) => (
                    <SelectItem key={s.id} value={s.id ?? ''}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bt.asset', locale)}</Label>
              <Input
                value={config.asset}
                onChange={(e) => setConfig({ ...config, asset: e.target.value })}
                placeholder="EUR/USD"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bt.timeframe', locale)}</Label>
              <Select value={config.timeframe} onValueChange={(v) => setConfig({ ...config, timeframe: v as Timeframe })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((tf) => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bt.startDate', locale)}</Label>
              <Input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bt.endDate', locale)}</Label>
              <Input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bt.initialBalance', locale)}</Label>
              <Input
                type="number"
                value={config.initialBalance}
                onChange={(e) => setConfig({ ...config, initialBalance: parseFloat(e.target.value) || 1000 })}
                className="h-9 text-sm font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full h-9 gap-1.5"
                onClick={handleRun}
                disabled={isRunning || !config.name.trim() || !config.strategyId}
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {t('bt.run', locale)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results Table */}
        <Card className="lg:col-span-1 gap-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t('bt.pastResults', locale)}</CardTitle>
          </CardHeader>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-8">{t('bt.nameCol', locale)}</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-8 text-right">{t('bt.tradesCol', locale)}</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-8 text-right">WR</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider h-8 text-right">PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-sm">
                      {t('bt.noResults', locale)}
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((r) => (
                    <TableRow
                      key={r.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        result?.id === r.id && 'bg-primary/5'
                      )}
                      onClick={() => setSelectedResult(r)}
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px] h-4 border',
                              r.status === 'completed'
                                ? 'border-emerald-500/25 text-emerald-500'
                                : r.status === 'running'
                                ? 'border-yellow-500/25 text-yellow-500'
                                : r.status === 'error'
                                ? 'border-red-500/25 text-red-500'
                                : 'border-muted text-muted-foreground'
                            )}
                          >
                            {r.status}
                          </Badge>
                          <span className="text-xs font-medium truncate max-w-[100px]">{r.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs font-mono">{r.totalTrades}</TableCell>
                      <TableCell className="py-2 text-right text-xs font-mono">{r.winRate.toFixed(1)}%</TableCell>
                      <TableCell className={cn(
                        'py-2 text-right text-xs font-mono font-semibold',
                        r.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {r.totalProfit >= 0 ? '+' : ''}{r.totalProfit.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Result Detail */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Metrics Grid */}
              <Card className="gap-4">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{result.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] border',
                        result.status === 'completed'
                          ? 'border-emerald-500/25 text-emerald-500'
                          : 'border-yellow-500/25 text-yellow-500'
                      )}
                    >
                      {result.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MetricCard
                      label={t('bt.winRate', locale)}
                      value={`${result.winRate.toFixed(1)}%`}
                      subValue={`${result.winTrades}W / ${result.lossTrades}L`}
                      icon={Target}
                      color="text-emerald-500"
                    />
                    <MetricCard
                      label={t('bt.profitFactor', locale)}
                      value={result.profitFactor.toFixed(2)}
                      subValue={result.profitFactor >= 1.5 ? t('bt.strong', locale) : result.profitFactor >= 1 ? t('bt.moderate', locale) : t('bt.weak', locale)}
                      icon={BarChart3}
                      color={result.profitFactor >= 1 ? 'text-emerald-500' : 'text-red-500'}
                    />
                    <MetricCard
                      label={t('bt.sharpeRatio', locale)}
                      value={result.sharpeRatio.toFixed(2)}
                      subValue={result.sharpeRatio >= 2 ? t('bt.excellent', locale) : result.sharpeRatio >= 1 ? t('bt.good', locale) : t('bt.poor', locale)}
                      icon={Activity}
                      color={result.sharpeRatio >= 1 ? 'text-emerald-500' : 'text-orange-500'}
                    />
                    <MetricCard
                      label={t('bt.totalProfit', locale)}
                      value={`${result.totalProfit >= 0 ? '+' : ''}${formatNumber(result.totalProfit)}`}
                      subValue={`${formatNumber(result.initialBalance)} → ${formatNumber(result.finalBalance)}`}
                      icon={result.totalProfit >= 0 ? TrendingUp : TrendingDown}
                      color={result.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}
                    />
                    <MetricCard
                      label={t('bt.maxDrawdown', locale)}
                      value={`${result.maxDrawdown.toFixed(1)}%`}
                      icon={TrendingDown}
                      color="text-orange-500"
                    />
                    <MetricCard
                      label={t('bt.avgWinLoss', locale)}
                      value={`${result.avgWin.toFixed(2)} / ${result.avgLoss.toFixed(2)}`}
                      subValue={`Largest: +${result.largestWin.toFixed(2)} / -${result.largestLoss.toFixed(2)}`}
                      icon={DollarSign}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Equity Curve */}
              <Card className="gap-4">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-semibold">{t('bt.equityCurve', locale)}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {result.equityCurve && result.equityCurve.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[240px] w-full">
                      <AreaChart data={result.equityCurve} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="btBalanceGrad" x1="0" y1="0" x2="0" y2="1">
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
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => `$${v.toLocaleString()}`}
                          domain={['auto', 'auto']}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="balance"
                          stroke="var(--color-balance)"
                          fill="url(#btBalanceGrad)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">
                      {t('bt.noEquityCurve', locale)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FlaskConical className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t('bt.selectResult', locale)}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
