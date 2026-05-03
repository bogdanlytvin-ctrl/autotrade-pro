'use client';

import React, { useEffect, useState } from 'react';
import { useRiskStore, useLocaleStore } from '@/store';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Save,
  CheckCircle2,
  Zap,
  Wind,
  Timer,
  DollarSign,
  TrendingDown,
  BarChart3,
  OctagonAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { RiskConfig } from '@/types';

const severityConfig = {
  warning: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/25',
    icon: AlertTriangle,
  },
  critical: {
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/25',
    icon: ShieldAlert,
  },
  emergency: {
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/25',
    icon: OctagonAlert,
  },
};

export default function RiskPage() {
  const { globalConfig, riskEvents, isLoading, fetchRiskEvents, updateGlobalConfig, resolveEvent } = useRiskStore();
  const { locale } = useLocaleStore();
  const [localConfig, setLocalConfig] = useState<RiskConfig>(globalConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRiskEvents().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to load risk events');
    });
  }, [fetchRiskEvents]);

  useEffect(() => {
    setLocalConfig(globalConfig);
  }, [globalConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGlobalConfig(localConfig);
      toast.success(t('risk.saved', locale));
    } catch {
      toast.error(t('risk.saveFailed', locale));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolve = async (eventId: string) => {
    try {
      await resolveEvent(eventId);
      toast.success(t('risk.eventResolved', locale));
    } catch {
      toast.error(t('risk.resolveFailed', locale));
    }
  };

  const unresolvedEvents = riskEvents.filter((e) => !e.resolved);
  const resolvedEvents = riskEvents.filter((e) => e.resolved);

  const activeProtections = [
    {
      name: t('risk.dailyLossLimit', locale),
      icon: DollarSign,
      active: localConfig.maxDailyLoss > 0,
      value: `$${localConfig.maxDailyLoss}`,
      desc: t('risk.dailyLossDesc', locale),
    },
    {
      name: t('risk.consecutiveLosses', locale),
      icon: TrendingDown,
      active: localConfig.stopAfterConsecutiveLosses > 0,
      value: `${localConfig.stopAfterConsecutiveLosses} ${t('risk.losses', locale)}`,
      desc: t('risk.consecutiveLossDesc', locale),
    },
    {
      name: t('risk.maxDrawdown', locale),
      icon: BarChart3,
      active: localConfig.maxDrawdownPercent > 0,
      value: `${localConfig.maxDrawdownPercent}%`,
      desc: t('risk.maxDrawdownDesc', locale),
    },
    {
      name: t('risk.maxSimultaneous', locale),
      icon: Zap,
      active: localConfig.maxSimultaneousTrades > 0,
      value: `${localConfig.maxSimultaneousTrades} ${t('risk.tradesLabel', locale)}`,
      desc: t('risk.maxSimDesc', locale),
    },
    {
      name: t('risk.cooldown', locale),
      icon: Timer,
      active: localConfig.tradeCooldownSec > 0,
      value: `${localConfig.tradeCooldownSec}s`,
      desc: t('risk.cooldownDesc', locale),
    },
    {
      name: t('risk.volatility', locale),
      icon: Wind,
      active: localConfig.volatilityProtection,
      value: localConfig.volatilityProtection ? 'ON' : 'OFF',
      desc: t('risk.volatilityDesc', locale),
    },
    {
      name: t('risk.emergency', locale),
      icon: OctagonAlert,
      active: localConfig.emergencyStopMode,
      value: localConfig.emergencyStopMode ? 'ON' : 'OFF',
      desc: t('risk.emergencyDesc', locale),
    },
    {
      name: t('risk.maxTradeSize', locale),
      icon: DollarSign,
      active: localConfig.maxTradeSize > 0,
      value: `$${localConfig.maxTradeSize}`,
      desc: t('risk.maxTradeSizeDesc', locale),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('risk.title', locale)}</h2>
          <p className="text-sm text-muted-foreground">{t('risk.subtitle', locale)}</p>
        </div>
        {unresolvedEvents.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {unresolvedEvents.length} {t('risk.activeAlertsPlural', locale)}
          </Badge>
        )}
      </div>

      {/* Active Protections */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">{t('risk.protections', locale)}</CardTitle>
          </div>
          <CardDescription className="text-xs">
            {activeProtections.filter((p) => p.active).length} of {activeProtections.length} {t('risk.protectionsActive', locale)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeProtections.map((protection) => {
              const Icon = protection.icon;
              return (
                <div
                  key={protection.name}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                    protection.active
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-border/50 bg-muted/30 opacity-60'
                  )}
                >
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    protection.active ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Icon className={cn('h-4 w-4', protection.active ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold truncate">{protection.name}</p>
                      {protection.active ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      ) : (
                        <ShieldOff className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-bold font-mono mt-0.5">{protection.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{protection.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Configuration */}
        <Card className="gap-4">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">{t('risk.config', locale)}</CardTitle>
              </div>
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {t('risk.save', locale)}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('risk.maxDailyLoss', locale)}</Label>
                <Input
                  type="number"
                  value={localConfig.maxDailyLoss}
                  onChange={(e) => setLocalConfig({ ...localConfig, maxDailyLoss: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('risk.stopAfterLosses', locale)}</Label>
                <Input
                  type="number"
                  value={localConfig.stopAfterConsecutiveLosses}
                  onChange={(e) => setLocalConfig({ ...localConfig, stopAfterConsecutiveLosses: parseInt(e.target.value) || 0 })}
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('risk.maxDrawdownPct', locale)}</Label>
                <Input
                  type="number"
                  value={localConfig.maxDrawdownPercent}
                  onChange={(e) => setLocalConfig({ ...localConfig, maxDrawdownPercent: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('risk.maxSimTrades', locale)}</Label>
                <Input
                  type="number"
                  value={localConfig.maxSimultaneousTrades}
                  onChange={(e) => setLocalConfig({ ...localConfig, maxSimultaneousTrades: parseInt(e.target.value) || 0 })}
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('risk.tradeCooldownSec', locale)}</Label>
                <Input
                  type="number"
                  value={localConfig.tradeCooldownSec}
                  onChange={(e) => setLocalConfig({ ...localConfig, tradeCooldownSec: parseInt(e.target.value) || 0 })}
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('risk.maxTradeSizeLabel', locale)}</Label>
                <Input
                  type="number"
                  value={localConfig.maxTradeSize}
                  onChange={(e) => setLocalConfig({ ...localConfig, maxTradeSize: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>

            <Separator />

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">{t('risk.volatility', locale)}</Label>
                  <p className="text-[10px] text-muted-foreground">{t('risk.volatilityDesc', locale)}</p>
                </div>
                <Switch
                  checked={localConfig.volatilityProtection}
                  onCheckedChange={(v) => setLocalConfig({ ...localConfig, volatilityProtection: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">{t('risk.emergency', locale)}</Label>
                  <p className="text-[10px] text-muted-foreground">{t('risk.emergencyDesc', locale)}</p>
                </div>
                <Switch
                  checked={localConfig.emergencyStopMode}
                  onCheckedChange={(v) => setLocalConfig({ ...localConfig, emergencyStopMode: v })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Events Log */}
        <Card className="gap-4">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-sm font-semibold">{t('risk.events', locale)}</CardTitle>
              <Badge variant="secondary" className="text-[10px] h-5">
                {unresolvedEvents.length} {t('risk.unresolved', locale)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[450px]">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : riskEvents.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                  <ShieldCheck className="h-8 w-8 opacity-40" />
                  <p>{t('risk.noEvents', locale)}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {riskEvents.map((event) => {
                    const sev = severityConfig[event.severity as keyof typeof severityConfig] || severityConfig.warning;
                    const SevIcon = sev.icon;
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'rounded-lg border p-3 transition-all',
                          event.resolved ? 'border-border/50 bg-muted/30 opacity-60' : 'border-border'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            sev.bg
                          )}>
                            <SevIcon className={cn('h-4 w-4', sev.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn('text-[9px] border capitalize', sev.bg, sev.color)}
                              >
                                {event.severity}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] capitalize">
                                {event.type.replace(/_/g, ' ')}
                              </Badge>
                              {event.resolved && (
                                <Badge variant="secondary" className="text-[9px]">
                                  {t('risk.resolvedBadge', locale)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium mt-1">{event.message}</p>
                          </div>
                        </div>
                        {!event.resolved && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleResolve(event.id)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {t('risk.resolve', locale)}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
