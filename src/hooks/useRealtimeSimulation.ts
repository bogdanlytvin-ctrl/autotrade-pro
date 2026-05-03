'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore, useBotsStore, useTradesStore, useDashboardStore } from '@/store';

/**
 * Simulates real-time trading activity by periodically:
 * - Updating bot stats (balance, PnL, latency, trade counts)
 * - Adding new trades to the feed
 * - Refreshing dashboard stats
 *
 * Runs every 5-15 seconds only when the user is authenticated.
 * Uses refs to avoid dependency loops.
 */
export function useRealtimeSimulation() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Use a ref to avoid re-triggering effect when bots update
  const botsRef = useRef(useBotsStore.getState().bots);

  useEffect(() => {
    botsRef.current = useBotsStore.getState().bots;
  });

  useEffect(() => {
    if (!isAuthenticated || botsRef.current.length === 0) return;

    const simulate = () => {
      // Read current bots from store via ref to avoid dependency loop
      const currentBots = useBotsStore.getState().bots;
      if (currentBots.length === 0) return;

      const runningBots = currentBots.filter((b) => b.status === 'running');
      runningBots.forEach((bot) => {
        const balanceChange = (Math.random() - 0.45) * 5;
        const wonTrade = Math.random() > 0.42;
        const newTotalTrades = bot.stats.totalTrades + (Math.random() > 0.6 ? 1 : 0);

        useBotsStore.getState().updateBotData({
          ...bot,
          stats: {
            ...bot.stats,
            currentBalance: Math.max(100, bot.stats.currentBalance + balanceChange),
            profitLoss: +(bot.stats.profitLoss + balanceChange).toFixed(2),
            totalTrades: newTotalTrades,
            winTrades: wonTrade ? bot.stats.winTrades + 1 : bot.stats.winTrades,
            lossTrades: wonTrade ? bot.stats.lossTrades : bot.stats.lossTrades + 1,
            winRate: newTotalTrades > 0 ? +((wonTrade ? bot.stats.winTrades + 1 : bot.stats.winTrades) / newTotalTrades * 100).toFixed(1) : 0,
            dailyTrades: bot.stats.dailyTrades + (Math.random() > 0.7 ? 1 : 0),
            dailyLoss: Math.max(0, bot.stats.dailyLoss + (balanceChange < 0 ? Math.abs(balanceChange) : 0)),
            avgLatencyMs: Math.floor(30 + Math.random() * 40),
            uptimeSeconds: bot.stats.uptimeSeconds + 5,
            currentDrawdown: +(Math.random() * bot.stats.maxDrawdown * 0.6).toFixed(1),
          },
          lastSignalAt: new Date(Date.now() - Math.random() * 60000).toISOString(),
          lastTradeAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 120000).toISOString() : bot.lastTradeAt,
        });

        // Occasionally add a new trade
        if (Math.random() > 0.7) {
          const directions = ['CALL', 'PUT'] as const;
          const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'BTC/USD'];
          const dir = directions[Math.floor(Math.random() * 2)];
          const asset = assets[Math.floor(Math.random() * assets.length)];
          const profit = wonTrade ? +(Math.random() * 12 + 1).toFixed(2) : -(+((Math.random() * 8 + 1).toFixed(2)));
          useTradesStore.getState().addTrade({
            id: `trade-live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            botId: bot.id,
            direction: dir,
            asset,
            amount: +(Math.random() * 20 + 5).toFixed(2),
            expiry: 60,
            entryPrice: +(1.08 + Math.random() * 0.02).toFixed(4),
            exitPrice: +(1.08 + Math.random() * 0.02).toFixed(4),
            payout: wonTrade ? +(Math.random() * 20 + 5).toFixed(2) : undefined,
            profit: +profit,
            status: wonTrade ? 'won' : 'lost',
            openedAt: new Date(Date.now() - 60000).toISOString(),
            closedAt: new Date().toISOString(),
            executionTimeMs: Math.floor(Math.random() * 150 + 20),
            latencyMs: Math.floor(Math.random() * 80 + 10),
          });
        }
      });

      // Refresh dashboard periodically
      if (Math.random() > 0.5) {
        useDashboardStore.getState().fetchDashboard();
      }
    };

    // Start simulation with a random interval between 5-15 seconds
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 10000;
      intervalRef.current = setTimeout(() => {
        simulate();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isAuthenticated]); // Only depend on auth, not on bots
}
