import { db } from '@/lib/db';

async function seed() {
  console.log('Seeding database...');

  // Create demo user
  const user = await db.user.upsert({
    where: { email: 'demo@trading.io' },
    update: {},
    create: {
      email: 'demo@trading.io',
      passwordHash: 'demo_hash_' + Buffer.from('demo12345').toString('hex'),
      name: 'Demo Trader',
      role: 'premium_user',
      isVerified: true,
    },
  });

  // Create subscription
  await db.subscription.upsert({
    where: { id: 'sub_' + user.id },
    update: {},
    create: {
      id: 'sub_' + user.id,
      userId: user.id,
      plan: 'pro',
      maxBots: 10,
      maxStrategies: 50,
      maxSessions: 5,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create broker sessions
  const session1 = await db.brokerSession.create({
    data: {
      userId: user.id,
      brokerName: 'PocketOption',
      sessionTokenEnc: 'enc_demo_session_1',
      accountId: 'PO-78432',
      accountType: 'demo',
      balance: 10000,
      currency: 'USD',
      isActive: true,
      isConnected: true,
      lastHeartbeatAt: new Date(),
    },
  });

  const session2 = await db.brokerSession.create({
    data: {
      userId: user.id,
      brokerName: 'Quotex',
      sessionTokenEnc: 'enc_demo_session_2',
      accountId: 'QT-12456',
      accountType: 'demo',
      balance: 5000,
      currency: 'USD',
      isActive: true,
      isConnected: true,
      lastHeartbeatAt: new Date(Date.now() - 30000),
    },
  });

  // Create strategies
  const strategy1 = await db.strategy.create({
    data: {
      userId: user.id,
      name: 'RSI Overbought/Oversold',
      description: 'Buy when RSI drops below 30, sell when RSI rises above 70. Classic mean reversion with trend filter.',
      conditions: JSON.stringify([
        { id: 'c1', indicator: 'RSI', operator: '<', value: 30, params: { period: 14 } },
      ]),
      logic: 'AND',
      actionConfig: JSON.stringify({ type: 'CALL', amount: 5, expiry: 60, asset: 'EUR/USD' }),
      riskConfig: JSON.stringify({
        stopAfterLosses: 3,
        maxDailyLoss: 50,
        maxDrawdownPercent: 15,
        maxSimultaneousTrades: 2,
        tradeCooldownSec: 60,
        maxTradeSize: 10,
        volatilityProtection: true,
        emergencyStopMode: false,
      }),
      indicators: JSON.stringify(['RSI']),
      timeframe: '1m',
      cooldownSec: 60,
      maxDailyTrades: 30,
      executionWindowStart: '08:00',
      executionWindowEnd: '20:00',
      isActive: true,
    },
  });

  const strategy2 = await db.strategy.create({
    data: {
      userId: user.id,
      name: 'EMA Crossover Momentum',
      description: 'Fast EMA cross above slow EMA for CALL, cross below for PUT. Includes MACD confirmation.',
      conditions: JSON.stringify([
        { id: 'c1', indicator: 'EMA_CROSS', operator: 'cross_up', params: { fast: 9, slow: 21 } },
        { id: 'c2', indicator: 'MACD', operator: '>', value: 0, params: { fast: 12, slow: 26, signal: 9 } },
      ]),
      logic: 'AND',
      actionConfig: JSON.stringify({ type: 'CALL', amount: 3, expiry: 120, asset: 'GBP/USD' }),
      riskConfig: JSON.stringify({
        stopAfterLosses: 5,
        maxDailyLoss: 75,
        maxDrawdownPercent: 20,
        maxSimultaneousTrades: 3,
        tradeCooldownSec: 45,
        maxTradeSize: 8,
        volatilityProtection: true,
        emergencyStopMode: false,
      }),
      indicators: JSON.stringify(['EMA_CROSS', 'MACD']),
      timeframe: '5m',
      cooldownSec: 45,
      maxDailyTrades: 25,
      executionWindowStart: '09:00',
      executionWindowEnd: '21:00',
      isActive: true,
    },
  });

  const strategy3 = await db.strategy.create({
    data: {
      userId: user.id,
      name: 'Bollinger Bands Squeeze',
      description: 'Trade the breakout when Bollinger Bands squeeze. Entry on band touch with RSI confirmation.',
      conditions: JSON.stringify([
        { id: 'c1', indicator: 'BOLLINGER', operator: '<', value: -2, params: { period: 20, stdDev: 2 } },
        { id: 'c2', indicator: 'RSI', operator: '<', value: 35, params: { period: 14 } },
      ]),
      logic: 'AND',
      actionConfig: JSON.stringify({ type: 'CALL', amount: 4, expiry: 90, asset: 'USD/JPY' }),
      riskConfig: JSON.stringify({
        stopAfterLosses: 4,
        maxDailyLoss: 60,
        maxDrawdownPercent: 18,
        maxSimultaneousTrades: 2,
        tradeCooldownSec: 30,
        maxTradeSize: 7,
        volatilityProtection: true,
        emergencyStopMode: false,
      }),
      indicators: JSON.stringify(['BOLLINGER', 'RSI']),
      timeframe: '1m',
      cooldownSec: 30,
      maxDailyTrades: 40,
      executionWindowStart: '00:00',
      executionWindowEnd: '23:59',
      isActive: true,
    },
  });

  // Create bots with different statuses
  const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'EUR/GBP'];

  const bot1 = await db.bot.create({
    data: {
      userId: user.id,
      strategyId: strategy1.id,
      sessionId: session1.id,
      name: 'RSI-EUR Runner',
      status: 'running',
      initialBalance: 10000,
      currentBalance: 10247.5,
      profitLoss: 247.5,
      totalTrades: 156,
      winTrades: 94,
      lossTrades: 60,
      winRate: 60.26,
      maxDrawdown: 8.3,
      currentDrawdown: 1.2,
      dailyLoss: 12.5,
      dailyTrades: 8,
      consecutiveLosses: 0,
      avgLatencyMs: 142,
      uptimeSeconds: 86400,
      lastSignalAt: new Date(Date.now() - 120000),
      lastTradeAt: new Date(Date.now() - 300000),
      startedAt: new Date(Date.now() - 86400000),
    },
  });

  const bot2 = await db.bot.create({
    data: {
      userId: user.id,
      strategyId: strategy2.id,
      sessionId: session1.id,
      name: 'EMA-GBP Scalper',
      status: 'running',
      initialBalance: 5000,
      currentBalance: 5389.2,
      profitLoss: 389.2,
      totalTrades: 89,
      winTrades: 58,
      lossTrades: 31,
      winRate: 65.17,
      maxDrawdown: 5.7,
      currentDrawdown: 0.8,
      dailyLoss: 5.0,
      dailyTrades: 4,
      consecutiveLosses: 1,
      avgLatencyMs: 98,
      uptimeSeconds: 72000,
      lastSignalAt: new Date(Date.now() - 60000),
      lastTradeAt: new Date(Date.now() - 180000),
      startedAt: new Date(Date.now() - 72000000),
    },
  });

  const bot3 = await db.bot.create({
    data: {
      userId: user.id,
      strategyId: strategy3.id,
      sessionId: session2.id,
      name: 'BB-USDJPY Hunter',
      status: 'paused',
      initialBalance: 5000,
      currentBalance: 4892.3,
      profitLoss: -107.7,
      totalTrades: 72,
      winTrades: 38,
      lossTrades: 34,
      winRate: 52.78,
      maxDrawdown: 12.1,
      currentDrawdown: 2.2,
      dailyLoss: -32.0,
      dailyTrades: 6,
      consecutiveLosses: 2,
      avgLatencyMs: 165,
      uptimeSeconds: 43200,
      lastSignalAt: new Date(Date.now() - 600000),
      lastTradeAt: new Date(Date.now() - 900000),
      startedAt: new Date(Date.now() - 43200000),
      errorCount: 1,
      lastError: 'Broker timeout during trade execution',
    },
  });

  const bot4 = await db.bot.create({
    data: {
      userId: user.id,
      strategyId: strategy1.id,
      sessionId: session2.id,
      name: 'RSI-AUD Tester',
      status: 'stopped',
      initialBalance: 2000,
      currentBalance: 1956.8,
      profitLoss: -43.2,
      totalTrades: 34,
      winTrades: 17,
      lossTrades: 17,
      winRate: 50.0,
      maxDrawdown: 9.4,
      currentDrawdown: 0,
      dailyLoss: 0,
      dailyTrades: 0,
      consecutiveLosses: 0,
      avgLatencyMs: 155,
      stoppedAt: new Date(Date.now() - 3600000),
    },
  });

  // Create trades for each bot
  const allBots = [bot1, bot2, bot3, bot4];

  for (const bot of allBots) {
    const tradeCount = Math.floor(10 + Math.random() * 20);
    for (let i = 0; i < tradeCount; i++) {
      const isWin = Math.random() > 0.4;
      const direction = Math.random() > 0.5 ? 'CALL' : 'PUT';
      const amount = 2 + Math.floor(Math.random() * 8);
      const profit = isWin ? amount * (0.7 + Math.random() * 0.3) : -amount;
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const openTime = new Date(Date.now() - (i * (15 + Math.random() * 45) * 60000));

      await db.trade.create({
        data: {
          botId: bot.id,
          userId: user.id,
          sessionId: bot.sessionId,
          strategyId: bot.strategyId,
          direction,
          asset,
          amount,
          expiry: [30, 60, 120, 300][Math.floor(Math.random() * 4)],
          entryPrice: 1 + Math.random() * 0.3,
          exitPrice: isWin ? 1 + Math.random() * 0.3 : 1 + Math.random() * 0.3,
          payout: isWin ? amount + profit : 0,
          profit,
          status: isWin ? 'won' : 'lost',
          executionTimeMs: Math.floor(50 + Math.random() * 200),
          latencyMs: Math.floor(80 + Math.random() * 120),
          openedAt: openTime,
          closedAt: new Date(openTime.getTime() + (30 + Math.random() * 120) * 1000),
        },
      });
    }
  }

  // Create risk events
  await db.riskEvent.create({
    data: {
      userId: user.id,
      botId: bot3.id,
      type: 'consecutive_losses',
      severity: 'warning',
      message: 'Bot "BB-USDJPY Hunter" reached 2 consecutive losses',
      value: 2,
      threshold: 3,
      action: 'alert',
    },
  });

  await db.riskEvent.create({
    data: {
      userId: user.id,
      botId: bot3.id,
      type: 'connection_lost',
      severity: 'warning',
      message: 'Broker connection instability detected for Quotex session',
      action: 'alert',
      resolved: true,
      resolvedAt: new Date(Date.now() - 300000),
    },
  });

  // Create notifications
  const notifTypes = [
    { type: 'trade_won', title: 'Trade Won', message: 'RSI-EUR Runner: EUR/USD CALL +$4.50' },
    { type: 'trade_lost', title: 'Trade Lost', message: 'BB-USDJPY Hunter: USD/JPY PUT -$5.00' },
    { type: 'bot_started', title: 'Bot Started', message: 'RSI-EUR Runner started successfully' },
    { type: 'risk_alert', title: 'Risk Alert', message: 'Consecutive loss limit approaching for BB-USDJPY Hunter' },
    { type: 'daily_report', title: 'Daily Report', message: 'Today: 12 trades, 8 wins, PnL: +$34.20' },
    { type: 'system', title: 'System Update', message: 'Platform v2.1.0 deployed. New indicators available.' },
  ];

  for (const n of notifTypes) {
    await db.notification.create({
      data: {
        userId: user.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 86400000),
      },
    });
  }

  // Create a backtest
  await db.backtest.create({
    data: {
      userId: user.id,
      strategyId: strategy1.id,
      name: 'RSI Strategy - 30 Day Test',
      asset: 'EUR/USD',
      timeframe: '1m',
      startDate: new Date(Date.now() - 30 * 86400000),
      endDate: new Date(),
      initialBalance: 10000,
      finalBalance: 10547.30,
      totalTrades: 342,
      winTrades: 207,
      lossTrades: 135,
      winRate: 60.53,
      maxDrawdown: 6.2,
      totalProfit: 547.30,
      profitFactor: 1.68,
      sharpeRatio: 1.42,
      avgWin: 4.85,
      avgLoss: 2.90,
      largestWin: 12.50,
      largestLoss: 8.00,
      status: 'completed',
    },
  });

  console.log('Database seeded successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
