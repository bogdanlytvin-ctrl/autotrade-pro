'use client';

import React, { useEffect, useState } from 'react';
import { useStrategiesStore, useLocaleStore } from '@/store';
import { t } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
  Trash2,
  Loader2,
  Zap,
  Shield,
  Clock,
  GitBranch,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type {
  StrategyConfig,
  StrategyCondition,
  IndicatorName,
  ConditionOperator,
  ConditionLogic,
  TradeActionType,
  Timeframe,
} from '@/types';

const INDICATORS: IndicatorName[] = [
  'RSI', 'MACD', 'EMA', 'SMA', 'BOLLINGER', 'ATR', 'STOCHASTIC', 'EMA_CROSS',
];

const OPERATORS: ConditionOperator[] = [
  '<', '>', '<=', '>=', '==', 'cross_up', 'cross_down',
];

const TIMEFRAMES: Timeframe[] = ['30s', '1m', '5m', '15m', '1h'];

function defaultCondition(): StrategyCondition {
  return {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    indicator: 'RSI',
    operator: '<',
    value: 30,
  };
}

function defaultRisk() {
  return {
    stopAfterLosses: 5,
    maxDailyLoss: 100,
    maxDrawdownPercent: 20,
    maxSimultaneousTrades: 3,
    tradeCooldownSec: 30,
    maxTradeSize: 50,
    volatilityProtection: true,
    emergencyStopMode: false,
  };
}

function defaultStrategy(): StrategyConfig {
  return {
    name: '',
    description: '',
    conditions: [defaultCondition()],
    logic: 'AND',
    action: { type: 'CALL', amount: 10, expiry: 60, asset: 'EUR/USD' },
    risk: defaultRisk(),
    timeframe: '5m',
    cooldownSec: 30,
    maxDailyTrades: 50,
  };
}

function ConditionRow({
  condition,
  onChange,
  onRemove,
  showRemove,
}: {
  condition: StrategyCondition;
  onChange: (c: StrategyCondition) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={condition.indicator}
        onValueChange={(v) => onChange({ ...condition, indicator: v as IndicatorName })}
      >
        <SelectTrigger className="w-[120px] h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {INDICATORS.map((ind) => (
            <SelectItem key={ind} value={ind} className="text-xs">
              {ind}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={condition.operator}
        onValueChange={(v) => onChange({ ...condition, operator: v as ConditionOperator })}
      >
        <SelectTrigger className="w-[110px] h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map((op) => (
            <SelectItem key={op} value={op} className="text-xs">
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        value={condition.value ?? ''}
        onChange={(e) => onChange({ ...condition, value: parseFloat(e.target.value) || 0 })}
        placeholder="Value"
        className="h-9 w-24 text-xs"
      />

      {showRemove && (
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export default function StrategyPage() {
  const { strategies, isLoading, fetchStrategies, createStrategy, deleteStrategy } = useStrategiesStore();
  const { locale } = useLocaleStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<StrategyConfig>(defaultStrategy());
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error(t('strat.nameRequired', locale));
      return;
    }
    if (form.conditions.length === 0) {
      toast.error(t('strat.conditionRequired', locale));
      return;
    }
    setIsCreating(true);
    try {
      await createStrategy(form);
      toast.success(t('strat.created', locale));
      setDialogOpen(false);
      setForm(defaultStrategy());
    } catch {
      toast.error(t('strat.createFailed', locale));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStrategy(id);
      toast.success(t('strat.deleted', locale));
    } catch {
      toast.error(t('strat.deleteFailed', locale));
    }
  };

  const updateConditions = (conditions: StrategyCondition[]) => {
    setForm({ ...form, conditions });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('strat.title', locale)}</h2>
          <p className="text-sm text-muted-foreground">{t('strat.subtitle', locale)}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('strat.newStrategy', locale)}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('strat.createTitle', locale)}</DialogTitle>
              <DialogDescription>
                {t('strat.createDesc', locale)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('strat.basicInfo', locale)}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.name', locale)}</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="My RSI Strategy"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.timeframe', locale)}</Label>
                    <Select value={form.timeframe} onValueChange={(v) => setForm({ ...form, timeframe: v as Timeframe })}>
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
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('strat.description', locale)}</Label>
                  <Textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your strategy..."
                    className="text-sm min-h-[60px]"
                  />
                </div>
              </div>

              <Separator />

              {/* Conditions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('strat.conditions', locale)}</Label>
                  <Select value={form.logic} onValueChange={(v) => setForm({ ...form, logic: v as ConditionLogic })}>
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {form.conditions.map((cond, i) => (
                    <ConditionRow
                      key={cond.id}
                      condition={cond}
                      onChange={(c) => {
                        const newConds = [...form.conditions];
                        newConds[i] = c;
                        updateConditions(newConds);
                      }}
                      onRemove={() => updateConditions(form.conditions.filter((_, j) => j !== i))}
                      showRemove={form.conditions.length > 1}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => updateConditions([...form.conditions, defaultCondition()])}
                >
                  <Plus className="h-3 w-3" />
                  {t('strat.addCondition', locale)}
                </Button>
              </div>

              <Separator />

              {/* Action Config */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('strat.actionConfig', locale)}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.direction', locale)}</Label>
                    <Select value={form.action.type} onValueChange={(v) => setForm({ ...form, action: { ...form.action, type: v as TradeActionType } })}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CALL">CALL</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.amount', locale)}</Label>
                    <Input
                      type="number"
                      value={form.action.amount}
                      onChange={(e) => setForm({ ...form, action: { ...form.action, amount: parseFloat(e.target.value) || 0 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.expiry', locale)}</Label>
                    <Input
                      type="number"
                      value={form.action.expiry}
                      onChange={(e) => setForm({ ...form, action: { ...form.action, expiry: parseInt(e.target.value) || 60 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.asset', locale)}</Label>
                    <Input
                      value={form.action.asset || ''}
                      onChange={(e) => setForm({ ...form, action: { ...form.action, asset: e.target.value } })}
                      placeholder="EUR/USD"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.maxDailyTrades', locale)}</Label>
                    <Input
                      type="number"
                      value={form.maxDailyTrades}
                      onChange={(e) => setForm({ ...form, maxDailyTrades: parseInt(e.target.value) || 50 })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.cooldown', locale)}</Label>
                    <Input
                      type="number"
                      value={form.cooldownSec}
                      onChange={(e) => setForm({ ...form, cooldownSec: parseInt(e.target.value) || 30 })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Risk Config */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('strat.riskManagement', locale)}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.stopAfterLosses', locale)}</Label>
                    <Input
                      type="number"
                      value={form.risk.stopAfterLosses}
                      onChange={(e) => setForm({ ...form, risk: { ...form.risk, stopAfterLosses: parseInt(e.target.value) || 5 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.maxDailyLoss', locale)}</Label>
                    <Input
                      type="number"
                      value={form.risk.maxDailyLoss}
                      onChange={(e) => setForm({ ...form, risk: { ...form.risk, maxDailyLoss: parseFloat(e.target.value) || 100 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.maxDrawdown', locale)}</Label>
                    <Input
                      type="number"
                      value={form.risk.maxDrawdownPercent}
                      onChange={(e) => setForm({ ...form, risk: { ...form.risk, maxDrawdownPercent: parseFloat(e.target.value) || 20 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.maxTradeSize', locale)}</Label>
                    <Input
                      type="number"
                      value={form.risk.maxTradeSize}
                      onChange={(e) => setForm({ ...form, risk: { ...form.risk, maxTradeSize: parseFloat(e.target.value) || 50 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.maxSimultaneous', locale)}</Label>
                    <Input
                      type="number"
                      value={form.risk.maxSimultaneousTrades}
                      onChange={(e) => setForm({ ...form, risk: { ...form.risk, maxSimultaneousTrades: parseInt(e.target.value) || 3 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('strat.tradeCooldown', locale)}</Label>
                    <Input
                      type="number"
                      value={form.risk.tradeCooldownSec}
                      onChange={(e) => setForm({ ...form, risk: { ...form.risk, tradeCooldownSec: parseInt(e.target.value) || 30 } })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('strat.cancel', locale)}
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !form.name.trim()}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('strat.create', locale)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategy List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <GitBranch className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t('strat.noStrategies', locale)}</p>
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t('strat.createFirst', locale)}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => {
            const isExpanded = expandedId === strategy.id;
            return (
              <Card key={strategy.id} className="gap-4 overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm truncate">{strategy.name}</CardTitle>
                      {strategy.description && (
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {strategy.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">{strategy.timeframe}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Conditions */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      <Zap className="h-3 w-3" />
                      {t('strat.conditionsLabel', locale)}
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                        {strategy.logic}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {strategy.conditions.slice(0, isExpanded ? undefined : 2).map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs"
                        >
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-mono">
                            {c.indicator}
                          </Badge>
                          <span className="font-mono text-muted-foreground">{c.operator}</span>
                          <span className="font-mono font-medium">{c.value}</span>
                        </div>
                      ))}
                      {!isExpanded && strategy.conditions.length > 2 && (
                        <p className="text-[10px] text-muted-foreground pl-1">
                          +{strategy.conditions.length - 2} more
                        </p>
                      )}
                    </div>
                    {strategy.conditions.length > 2 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : strategy.id ?? null)}
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" /> {t('strat.showLess', locale)}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" /> {t('strat.showAll', locale)}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Action & Risk Summary */}
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <GitBranch className="h-2.5 w-2.5" />
                        {t('strat.action', locale)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px]',
                            (strategy.action?.type ?? 'CALL') === 'CALL'
                              ? 'border-emerald-500/25 text-emerald-500'
                              : 'border-red-500/25 text-red-500'
                          )}
                        >
                          {strategy.action?.type ?? 'CALL'}
                        </Badge>
                        <span className="text-xs font-mono">${strategy.action?.amount ?? 0}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <Shield className="h-2.5 w-2.5" />
                        {t('strat.risk', locale)}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Max DD {strategy.risk?.maxDrawdownPercent ?? 0}% · Stop {strategy.risk?.stopAfterLosses ?? 0}L
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 border-t border-border/50 mt-0 gap-0">
                  <div className="flex items-center justify-between w-full py-2">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {strategy.cooldownSec}s cooldown
                      </span>
                      <span>{strategy.maxDailyTrades} trades/day</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => strategy.id && handleDelete(strategy.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
