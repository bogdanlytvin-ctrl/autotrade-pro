'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore, useNotificationsStore, useLocaleStore } from '@/store';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Send,
  Key,
  Check,
  CheckCheck,
  Plus,
  Trash2,
  Star,
  Crown,
  Gem,
  Zap,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, timeAgo } from '@/lib/utils';

// ============================================================
// SUBSCRIPTION UPGRADE DIALOG
// ============================================================

function UpgradeDialog({ plan, open, onClose, onSuccess }: {
  plan: { id: string; name: string; price: string; period: string } | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { locale } = useLocaleStore();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  const handleUpgrade = async () => {
    if (!plan) return;
    setStep('processing');
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep('success');
    // Update user role in store
    const roleMap: Record<string, string> = { starter: 'starter_user', pro: 'premium_user', enterprise: 'enterprise_user' };
    useAuthStore.setState({ role: roleMap[plan.id] || plan.id + '_user' });
    setTimeout(() => {
      onSuccess();
      setStep('confirm');
    }, 1500);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>{t('set.upgradeTo', locale).replace('{plan}', plan.name)}</DialogTitle>
              <DialogDescription>
                {plan.price}{plan.period !== 'forever' ? ` ${plan.period}` : ''} — {t('set.cancelAnytime', locale)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border border-border/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('set.plan', locale)}</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('set.amount', locale)}</span>
                  <span className="font-bold text-lg">{plan.price}</span>
                </div>
                {plan.period !== 'forever' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('set.billing', locale)}</span>
                    <span>{t('set.monthly', locale)}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t('set.paymentFromWallet', locale)}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>{t('strat.cancel', locale)}</Button>
              <Button onClick={handleUpgrade} className="gap-1.5">
                <CreditCard className="h-4 w-4" />
                {t('set.payNow', locale)}
              </Button>
            </DialogFooter>
          </>
        )}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium">{t('set.processingPayment', locale)}</p>
          </div>
        )}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{t('set.paymentSuccessful', locale)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('set.youAreOnPlan', locale).replace('{plan}', plan.name)}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    color: 'text-muted-foreground',
    features: ['1 Bot', '1 Strategy', 'Basic indicators', 'Community support'],
    featuresKey: 'set.planFree',
    current: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    icon: Star,
    color: 'text-blue-500',
    features: ['3 Bots', '5 Strategies', 'All indicators', 'Email support', 'Backtesting'],
    featuresKey: 'set.planStarter',
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/month',
    icon: Crown,
    color: 'text-yellow-500',
    features: ['10 Bots', 'Unlimited Strategies', 'All indicators', 'Priority support', 'Advanced backtesting', 'Risk management'],
    featuresKey: 'set.planPro',
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    icon: Gem,
    color: 'text-purple-500',
    features: ['Unlimited Bots', 'Unlimited Strategies', 'Custom indicators', '24/7 support', 'API access', 'White-label', 'Dedicated account manager'],
    featuresKey: 'set.planEnterprise',
    current: false,
  },
];

const notificationIcons: Record<string, React.ElementType> = {
  trade_executed: Zap,
  trade_won: CheckCircle2,
  trade_lost: Circle,
  bot_started: Zap,
  bot_stopped: Circle,
  risk_alert: Shield,
  system: Circle,
  daily_report: Star,
};

export default function SettingsPage() {
  const { name, email, role } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markRead,
    markAllRead,
  } = useNotificationsStore();
  const { locale } = useLocaleStore();
  const [brokerName, setBrokerName] = useState('');
  const [brokerToken, setBrokerToken] = useState('');
  const [brokerType, setBrokerType] = useState('demo');
  const [telegramId, setTelegramId] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState(() => typeof window !== 'undefined'
    ? `atp_live_sk_${crypto.randomUUID().replace(/-/g, '')}`
    : 'atp_live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  );
  const [upgradePlan, setUpgradePlan] = useState<typeof plans[number] | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState('pro');
  const [brokers] = useState([
    { id: '1', name: 'PocketOption Demo', type: 'demo', status: 'connected' },
    { id: '2', name: 'Quotex Live', type: 'live', status: 'connected' },
  ]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleAddBroker = async () => {
    if (!brokerName.trim()) {
      toast.error(t('set.brokerRequired', locale));
      return;
    }
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ brokerName, sessionToken: brokerToken, accountType: brokerType }),
      });
      if (!res.ok) throw new Error('Failed to add broker');
      toast.success(t('set.brokerAdded', locale));
      setBrokerName('');
      setBrokerToken('');
      setBrokerType('demo');
    } catch {
      toast.error(t('set.brokerFailed', locale));
    }
  };

  const handleSaveTelegram = async () => {
    if (!telegramId.trim()) return;
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/settings/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ telegramId }),
      });
      if (res.ok) toast.success(t('set.telegramSaved', locale));
      else toast.error(t('set.telegramFailed', locale));
    } catch {
      toast.error(t('set.telegramFailed', locale));
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/settings/twofa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        toast.success(enabled ? t('set.twoFAEnabled', locale) : t('set.twoFADisabled', locale));
        setTwoFA(enabled);
      } else {
        toast.error(t('set.twoFAFailed', locale));
      }
    } catch {
      toast.error(t('set.twoFAFailed', locale));
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ action: 'generate' }),
      });
      if (res.ok) {
        await res.json();
        toast.success(t('set.apiKeyGenerated', locale));
      }
    } catch {
      toast.error(t('set.apiKeyFailed', locale));
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{t('set.title', locale)}</h2>
        <p className="text-sm text-muted-foreground">{t('set.subtitle', locale)}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" />
            {t('set.profile', locale)}
          </TabsTrigger>
          <TabsTrigger value="brokers" className="gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5" />
            {t('set.brokers', locale)}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs relative">
            <Bell className="h-3.5 w-3.5" />
            {t('set.notifications', locale)}
            {unreadCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-1.5 text-xs">
            <Crown className="h-3.5 w-3.5" />
            {t('set.subscription', locale)}
          </TabsTrigger>
          <TabsTrigger value="telegram" className="gap-1.5 text-xs">
            <Send className="h-3.5 w-3.5" />
            {t('set.telegram', locale)}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />
            {t('set.security', locale)}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold">{t('set.profileInfo', locale)}</CardTitle>
              <CardDescription className="text-xs">{t('set.profileDesc', locale)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{email || 'user@example.com'}</p>
                  <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                    {role || 'user'}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('set.displayName', locale)}</Label>
                  <Input defaultValue={name || ''} className="h-9 text-sm" disabled />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('set.emailAddress', locale)}</Label>
                  <Input defaultValue={email || ''} className="h-9 text-sm" disabled />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t('set.contactSupport', locale)}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brokers Tab */}
        <TabsContent value="brokers" className="space-y-4">
          <Card className="gap-4">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{t('set.brokerSessions', locale)}</CardTitle>
                  <CardDescription className="text-xs">{t('set.brokerDesc', locale)}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px]">{brokers.length} {t('set.connected', locale)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Connected Brokers */}
              <div className="space-y-2">
                {brokers.map((broker) => (
                  <div
                    key={broker.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{broker.name}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{broker.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-emerald-500/25 text-emerald-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                        {broker.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Add Broker Form */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('set.addNewBroker', locale)}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('set.brokerName', locale)}</Label>
                    <Input
                      value={brokerName}
                      onChange={(e) => setBrokerName(e.target.value)}
                      placeholder={t('set.brokerNamePlaceholder', locale)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('set.sessionToken', locale)}</Label>
                    <Input
                      type="password"
                      value={brokerToken}
                      onChange={(e) => setBrokerToken(e.target.value)}
                      placeholder={t('set.sessionTokenPlaceholder', locale)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('set.accountType', locale)}</Label>
                    <Select value={brokerType} onValueChange={setBrokerType}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Demo</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button size="sm" className="gap-1" onClick={handleAddBroker} disabled={!brokerName.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                  {t('set.addBroker', locale)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="gap-4">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{t('set.notifications', locale)}</CardTitle>
                  <CardDescription className="text-xs">
                    {unreadCount > 0 ? `${unreadCount} ${t('set.unreadNotifications', locale)}` : t('set.allCaughtUp', locale)}
                  </CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => { markAllRead(); toast.success(t('set.allMarkedRead', locale)); }}
                  >
                    <CheckCheck className="h-3 w-3" />
                    {t('set.markAllRead', locale)}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-1">
                  {notifications.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                      <Bell className="h-6 w-6 opacity-40" />
                      <p>{t('set.noNotifications', locale)}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const NotifIcon = notificationIcons[notif.type] || Circle;
                      return (
                        <div
                          key={notif.id}
                          className={cn(
                            'flex items-start gap-3 rounded-lg p-3 transition-colors cursor-pointer',
                            notif.isRead ? 'hover:bg-accent/50' : 'bg-primary/5 border border-primary/10'
                          )}
                          onClick={() => !notif.isRead && markRead(notif.id)}
                        >
                          <div className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5',
                            notif.isRead ? 'bg-muted' : 'bg-primary/10'
                          )}>
                            <NotifIcon className={cn(
                              'h-4 w-4',
                              notif.isRead ? 'text-muted-foreground' : 'text-primary'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn('text-sm', notif.isRead ? 'font-medium' : 'font-semibold')}>
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notif.createdAt, locale)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'gap-4 relative overflow-hidden',
                    plan.current && 'border-primary ring-1 ring-primary/20'
                  )}
                >
                  {plan.current && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1 rounded-bl-lg">
                      {t('set.currentPlan', locale)}
                    </div>
                  )}
                  <CardHeader className="pb-0">
                    <div className="flex items-center gap-2">
                      <PlanIcon className={cn('h-5 w-5', plan.color)} />
                      <CardTitle className="text-sm">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {t(plan.featuresKey, locale).split(' · ').map((f: string) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.current || plan.id === currentPlanId ? 'outline' : 'default'}
                      className="w-full mt-4 h-9 text-xs"
                      disabled={plan.current || plan.id === currentPlanId}
                      onClick={() => !plan.current && plan.id !== currentPlanId && setUpgradePlan(plan)}
                    >
                      {plan.current || plan.id === currentPlanId ? t('set.currentPlan', locale) : t('set.upgrade', locale)}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Telegram Tab */}
        <TabsContent value="telegram" className="space-y-4">
          <Card className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold">{t('set.telegramTitle', locale)}</CardTitle>
              <CardDescription className="text-xs">{t('set.telegramDesc', locale)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-border/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Send className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t('set.notifications', locale)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('set.telegramNotifDesc', locale)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('set.telegramLabel', locale)}</Label>
                  <Input
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder={t('set.telegramPlaceholder', locale)}
                    className="h-9 text-sm font-mono"
                  />
                </div>
                <Button size="sm" className="gap-1" onClick={handleSaveTelegram} disabled={!telegramId.trim()}>
                  <Send className="h-3.5 w-3.5" />
                  {t('set.connectBot', locale)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {/* 2FA */}
          <Card className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold">{t('set.twoFA', locale)}</CardTitle>
              <CardDescription className="text-xs">{t('set.twoFADesc', locale)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('set.authenticator', locale)}</p>
                    <p className="text-xs text-muted-foreground">
                      {twoFA ? t('set.enabled', locale) : t('set.disabled', locale)}
                    </p>
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={(v) => handleToggle2FA(v)} />
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="gap-4">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{t('set.apiKeys', locale)}</CardTitle>
                  <CardDescription className="text-xs">{t('set.apiKeysDesc', locale)}</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={handleGenerateApiKey}
                >
                  <Plus className="h-3 w-3" />
                  {t('set.generateNew', locale)}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="rounded-lg border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium">{t('set.productionKey', locale)}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/25 text-emerald-500">{t('set.active', locale)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-xs">
                    {showApiKey ? apiKey : '••••••••••••••••••••••••••••••'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => { navigator.clipboard.writeText(apiKey).catch(() => {}); toast.success(t('set.copied', locale)); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {t('set.createdAgo', locale).replace('{time}', '30')} · {t('set.lastUsedAgo', locale).replace('{time}', '2h')}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium">{t('set.testKey', locale)}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/25 text-emerald-500">{t('set.active', locale)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-xs">
                    ••••••••••••••••••••••••••••••
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {t('set.createdAgo', locale).replace('{time}', '60')} · {t('set.lastUsedAgo', locale).replace('{time}', '5d')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UpgradeDialog
        plan={upgradePlan}
        open={!!upgradePlan}
        onClose={() => setUpgradePlan(null)}
        onSuccess={() => {
          if (upgradePlan) setCurrentPlanId(upgradePlan.id);
          setUpgradePlan(null);
          toast.success(t('set.subscriptionUpdated', locale));
        }}
      />
    </div>
  );
}
