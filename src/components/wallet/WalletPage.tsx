'use client';

import React, { useEffect, useState } from 'react';
import { useWalletStore, useLocaleStore } from '@/store';
import { t } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  Link2,
  Unplug,
  Loader2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatBalance, timeAgo } from '@/lib/utils';
import type { TransactionEntry } from '@/store';

// ============================================================
// Loading Skeleton
// ============================================================

function WalletSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Status Icon
// ============================================================

function TransactionStatusIcon({ status }: { status: TransactionEntry['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
}

function TransactionTypeIcon({ type }: { type: TransactionEntry['type'] }) {
  switch (type) {
    case 'deposit':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
          <ArrowDownCircle className="h-4.5 w-4.5 text-emerald-500" />
        </div>
      );
    case 'withdraw':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10">
          <ArrowUpCircle className="h-4.5 w-4.5 text-red-500" />
        </div>
      );
    case 'trade_pnl':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-4.5 w-4.5 text-primary" />
        </div>
      );
    default:
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <DollarSign className="h-4.5 w-4.5 text-muted-foreground" />
        </div>
      );
  }
}

function StatusBadge({ status, locale }: { status: TransactionEntry['status']; locale: 'en' | 'uk' }) {
  const label =
    status === 'completed'
      ? t('wallet.completed', locale)
      : status === 'pending'
        ? t('wallet.pending', locale)
        : t('wallet.failed', locale);

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] h-5 border gap-1',
        status === 'completed' && 'border-emerald-500/25 text-emerald-500',
        status === 'pending' && 'border-yellow-500/25 text-yellow-500',
        status === 'failed' && 'border-red-500/25 text-red-500'
      )}
    >
      <TransactionStatusIcon status={status} />
      {label}
    </Badge>
  );
}

// ============================================================
// Transaction Item
// ============================================================

function TransactionItem({
  tx,
  locale,
}: {
  tx: TransactionEntry;
  locale: 'en' | 'uk';
}) {
  const isPositive = tx.type === 'deposit' || (tx.type === 'trade_pnl' && tx.amount > 0);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent/50">
      <TransactionTypeIcon type={tx.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium truncate">{tx.description}</p>
          <StatusBadge status={tx.status} locale={locale} />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-[10px] text-muted-foreground">
            {timeAgo(tx.createdAt, locale)}
          </p>
          {tx.txHash && (
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              · {tx.txHash}
            </p>
          )}
        </div>
      </div>
      <p
        className={cn(
          'text-sm font-semibold font-mono whitespace-nowrap',
          isPositive ? 'text-emerald-500' : 'text-red-500'
        )}
      >
        {isPositive ? '+' : '-'}${formatBalance(Math.abs(tx.amount))}
      </p>
    </div>
  );
}

// ============================================================
// Main Wallet Page
// ============================================================

type TxFilter = 'all' | 'deposit' | 'withdraw';

export default function WalletPage() {
  const { locale } = useLocaleStore();
  const {
    balance,
    currency,
    walletAddress,
    transactions,
    isLoading,
    fetchWallet,
    deposit,
    withdraw,
    connectWallet,
  } = useWalletStore();

  // Dialog states
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('crypto');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [connectAddress, setConnectAddress] = useState('');

  // Transaction filter
  const [txFilter, setTxFilter] = useState<TxFilter>('all');

  // Processing states
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Handlers
  const handleDeposit = async (amount?: number) => {
    const finalAmount = amount || parseFloat(depositAmount);
    if (!finalAmount || finalAmount <= 0) {
      toast.error(t('wallet.invalidAmount', locale));
      return;
    }
    if (finalAmount < 10) {
      toast.error(t('wallet.minDeposit', locale));
      return;
    }
    try {
      setDepositing(true);
      await deposit(finalAmount, depositMethod);
      toast.success(t('wallet.depositSuccess', locale));
      setDepositOpen(false);
      setDepositAmount('');
      setDepositMethod('crypto');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('wallet.invalidAmount', locale));
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error(t('wallet.invalidAmount', locale));
      return;
    }
    if (amount < 20) {
      toast.error(t('wallet.minWithdraw', locale));
      return;
    }
    if (!withdrawAddress.trim()) {
      toast.error(t('wallet.addressRequired', locale));
      return;
    }
    try {
      setWithdrawing(true);
      await withdraw(amount, withdrawAddress);
      toast.success(t('wallet.withdrawSuccess', locale));
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('wallet.insufficientFunds', locale));
    } finally {
      setWithdrawing(false);
    }
  };

  const handleConnect = async () => {
    if (!connectAddress.trim()) {
      toast.error(t('wallet.addressRequired', locale));
      return;
    }
    try {
      setConnecting(true);
      await connectWallet(connectAddress);
      toast.success(t('wallet.connectSuccess', locale));
      setConnectOpen(false);
      setConnectAddress('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('wallet.connectFailed', locale));
    } finally {
      setConnecting(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).catch(() => {});
      toast.success(t('wallet.copyAddress', locale));
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'all') return true;
    if (txFilter === 'deposit') return tx.type === 'deposit';
    if (txFilter === 'withdraw') return tx.type === 'withdraw';
    return true;
  });

  if (isLoading && balance === 0 && transactions.length === 0) {
    return <WalletSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('wallet.title', locale)}</h2>
          <p className="text-sm text-muted-foreground">{t('wallet.subtitle', locale)}</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary-foreground/70">
                {t('wallet.balance', locale)}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tracking-tight">
                  ${formatBalance(balance)}
                </span>
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-[10px] font-semibold border-0">
                  {currency}
                </Badge>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          <Separator className="my-4 bg-primary-foreground/10" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {walletAddress ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t('wallet.connected', locale)}
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1 rounded-md bg-primary-foreground/10 px-2 py-1 text-[11px] font-mono text-primary-foreground/90 hover:bg-primary-foreground/20 transition-colors"
                  >
                    {walletAddress}
                    <Copy className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1.5 text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
                  onClick={() => setConnectOpen(true)}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {t('wallet.connectWallet', locale)}
                </Button>
              )}
            </div>
            {walletAddress && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[11px] text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setConnectOpen(true)}
              >
                <Unplug className="h-3 w-3" />
                {t('wallet.disconnect', locale)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="h-12 gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setDepositOpen(true)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          {t('wallet.deposit', locale)}
        </Button>
        <Button
          className="h-12 gap-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setWithdrawOpen(true)}
          disabled={isLoading}
        >
          <Minus className="h-4 w-4" />
          {t('wallet.withdraw', locale)}
        </Button>
      </div>

      {/* Quick Deposit */}
      <Card className="gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-sm font-semibold">{t('wallet.quickDeposit', locale)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 500].map((amt) => (
              <Button
                key={amt}
                variant="outline"
                className="h-10 text-sm font-semibold font-mono"
                onClick={() => handleDeposit(amt)}
                disabled={isLoading || depositing}
              >
                ${amt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t('wallet.transactionHistory', locale)}</h3>
          {transactions.length > 0 && (
            <p className="text-[11px] text-muted-foreground">{transactions.length} {t('wallet.transactionsCount', locale).replace('{n}', String(transactions.length))}</p>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
          {([
            ['all', t('wallet.all', locale)],
            ['deposit', t('wallet.deposits', locale)],
            ['withdraw', t('wallet.withdrawals', locale)],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTxFilter(key)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                txFilter === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{t('wallet.noTransactions', locale)}</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} locale={locale} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ====== DEPOSIT DIALOG ====== */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
              </div>
              {t('wallet.deposit', locale)}
            </DialogTitle>
            <DialogDescription>
              {t('wallet.minDeposit', locale)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Balance info */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{t('wallet.yourBalance', locale)}</p>
              <p className="text-lg font-bold font-mono">${formatBalance(balance)}</p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-xs">{t('wallet.amount', locale)}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 h-11 text-lg font-mono"
                  min={10}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-xs">{t('wallet.method', locale)}</Label>
              <Select value={depositMethod} onValueChange={setDepositMethod}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💰</span>
                      {t('wallet.crypto', locale)}
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💳</span>
                      {t('wallet.card', locale)}
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏦</span>
                      {t('wallet.bankTransfer', locale)}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t('wallet.estimatedTime', locale)}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDepositOpen(false)}
              className="flex-1"
            >
              {t('wallet.cancel', locale)}
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleDeposit()}
              disabled={depositing || !depositAmount}
            >
              {depositing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('wallet.processing', locale)}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t('wallet.confirm', locale)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== WITHDRAW DIALOG ====== */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <ArrowUpCircle className="h-4 w-4 text-red-500" />
              </div>
              {t('wallet.withdraw', locale)}
            </DialogTitle>
            <DialogDescription>
              {t('wallet.minWithdraw', locale)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Balance info */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{t('wallet.yourBalance', locale)}</p>
              <p className="text-lg font-bold font-mono">${formatBalance(balance)}</p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-xs">{t('wallet.amount', locale)}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 h-11 text-lg font-mono"
                  min={20}
                  max={balance}
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label className="text-xs">{t('wallet.withdrawTo', locale)}</Label>
              <Input
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={t('wallet.enterAddress', locale)}
                className="h-11 font-mono text-sm"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>⚡</span>
                {t('wallet.networkFee', locale)}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {t('wallet.estimatedTime', locale)}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(false)}
              className="flex-1"
            >
              {t('wallet.cancel', locale)}
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount || !withdrawAddress}
            >
              {withdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('wallet.processing', locale)}
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4" />
                  {t('wallet.confirm', locale)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== CONNECT WALLET DIALOG ====== */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              {t('wallet.connectWallet', locale)}
            </DialogTitle>
            <DialogDescription>
              {t('wallet.enterAddress', locale)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">{t('wallet.address', locale)}</Label>
              <Input
                value={connectAddress}
                onChange={(e) => setConnectAddress(e.target.value)}
                placeholder="0x..."
                className="h-11 font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConnectOpen(false)}
              className="flex-1"
            >
              {t('wallet.cancel', locale)}
            </Button>
            <Button
              className="flex-1"
              onClick={handleConnect}
              disabled={connecting || !connectAddress}
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('wallet.processing', locale)}
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  {t('wallet.confirm', locale)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
