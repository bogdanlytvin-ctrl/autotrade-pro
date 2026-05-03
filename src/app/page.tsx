'use client';

import React from 'react';
import { useAuthStore, useNavStore } from '@/store';
import { useRealtimeSimulation } from '@/hooks/useRealtimeSimulation';
import AppShell from '@/components/layout/AppShell';
import AuthPage from '@/components/auth/AuthPage';
import DashboardPage from '@/components/dashboard/DashboardPage';
import StrategyPage from '@/components/strategy/StrategyPage';
import BotPage from '@/components/bot/BotPage';
import TradingPage from '@/components/trading/TradingPage';
import RiskPage from '@/components/risk/RiskPage';
import BacktestPage from '@/components/backtest/BacktestPage';
import WalletPage from '@/components/wallet/WalletPage';
import SettingsPage from '@/components/settings/SettingsPage';
import AdminPage from '@/components/admin/AdminPage';

function PageRouter() {
  const { currentPage } = useNavStore();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'strategies':
      return <StrategyPage />;
    case 'bots':
      return <BotPage />;
    case 'trading':
      return <TradingPage />;
    case 'risk':
      return <RiskPage />;
    case 'backtest':
      return <BacktestPage />;
    case 'wallet':
      return <WalletPage />;
    case 'settings':
      return <SettingsPage />;
    case 'admin':
      return <AdminPage />;
    case 'auth':
      return <AuthPage />;
    default:
      return <DashboardPage />;
  }
}

export default function Home() {
  // Activate real-time simulation when authenticated
  useRealtimeSimulation();

  return (
    <AppShell>
      <PageRouter />
    </AppShell>
  );
}
