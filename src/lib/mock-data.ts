// Shared mock/demo data for API routes (used when no DB is available)

// ============================================================
// AUTH HELPERS
// ============================================================

function generateToken(userId: string, isDemo = false): string {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + (isDemo ? 7 : 1) * 24 * 60 * 60 * 1000,
    demo: isDemo,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'trading_salt_2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Simple in-memory user store for demo/registration
interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
}

const userStore = new Map<string, StoredUser>();
let initialized = false;

// Pre-seed demo user (called lazily)
async function ensureInit() {
  if (initialized) return;
  initialized = true;
  userStore.set('demo@autotrade.pro', {
    id: 'user-demo',
    email: 'demo@autotrade.pro',
    passwordHash: await hashPassword('demo123456'),
    name: 'Demo Trader',
    role: 'premium_user',
  });
  userStore.set('admin@autotrade.pro', {
    id: 'user-admin',
    email: 'admin@autotrade.pro',
    passwordHash: await hashPassword('admin123456'),
    name: 'Admin',
    role: 'admin',
  });
}

export async function findUser(email: string): Promise<StoredUser | undefined> {
  await ensureInit();
  return userStore.get(email);
}

export async function createUser(email: string, passwordHash: string, name: string): Promise<StoredUser> {
  await ensureInit();
  if (userStore.has(email)) throw new Error('User already exists');
  const user: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    passwordHash,
    name,
    role: 'user',
  };
  userStore.set(email, user);
  return user;
}

export { generateToken, hashPassword };

// ============================================================
// BOTS
// ============================================================

export const MOCK_BOTS = [
  {
    id: 'bot-1',
    name: 'RSI Scalper',
    status: 'running',
    strategyName: 'RSI Reversal',
    brokerName: 'PocketOption',
    stats: { totalTrades: 342, winTrades: 209, lossTrades: 133, winRate: 61.1, profitLoss: 1247.50, currentBalance: 11247.50, maxDrawdown: 8.2, currentDrawdown: 2.1, dailyLoss: 45.00, dailyTrades: 12, consecutiveLosses: 2, avgLatencyMs: 45, uptimeSeconds: 86400 },
    lastSignalAt: new Date(Date.now() - 30000).toISOString(),
    lastTradeAt: new Date(Date.now() - 120000).toISOString(),
    lastError: null as string | null,
    errorCount: 0,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'bot-2', name: 'MACD Trend', status: 'running', strategyName: 'MACD Cross',
    brokerName: 'PocketOption', stats: { totalTrades: 189, winTrades: 102, lossTrades: 87, winRate: 54.0, profitLoss: 523.80, currentBalance: 10523.80, maxDrawdown: 12.5, currentDrawdown: 4.3, dailyLoss: 22.00, dailyTrades: 8, consecutiveLosses: 1, avgLatencyMs: 38, uptimeSeconds: 172800 },
    lastSignalAt: new Date(Date.now() - 60000).toISOString(), lastTradeAt: new Date(Date.now() - 300000).toISOString(), lastError: null, errorCount: 0, startedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'bot-3', name: 'Bollinger Bounce', status: 'paused', strategyName: 'BB Squeeze',
    brokerName: 'Quotex', stats: { totalTrades: 95, winTrades: 58, lossTrades: 37, winRate: 61.1, profitLoss: 312.00, currentBalance: 10312.00, maxDrawdown: 6.8, currentDrawdown: 0, dailyLoss: 0, dailyTrades: 0, consecutiveLosses: 0, avgLatencyMs: 52, uptimeSeconds: 43200 },
    lastSignalAt: new Date(Date.now() - 7200000).toISOString(), lastTradeAt: new Date(Date.now() - 7260000).toISOString(), lastError: null, errorCount: 0, startedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'bot-4', name: 'Stochastic Hunter', status: 'stopped', strategyName: 'Stoch RSI',
    brokerName: 'PocketOption', stats: { totalTrades: 56, winTrades: 31, lossTrades: 25, winRate: 55.4, profitLoss: 145.20, currentBalance: 10145.20, maxDrawdown: 9.1, currentDrawdown: 0, dailyLoss: 0, dailyTrades: 0, consecutiveLosses: 0, avgLatencyMs: 41, uptimeSeconds: 0 },
    lastError: null, errorCount: 0,
  },
];

// ============================================================
// DASHBOARD
// ============================================================

export const MOCK_DASHBOARD_STATS = {
  totalBots: 4, activeBots: 2, totalTrades: 682, todayTrades: 20, todayPnL: 67.00,
  totalPnL: 2228.50, overallWinRate: 58.9, activeStrategies: 3, connectedBrokers: 2, totalBalance: 42228.50, riskAlerts: 2,
};

export const MOCK_EQUITY_CURVE = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  balance: 10000 + Math.sin(i * 0.3) * 200 + i * 15 + Math.random() * 50,
}));

export const MOCK_ALERTS = [
  { id: 'a1', type: 'daily_loss_limit', message: 'Bot RSI Scalper approaching daily loss limit ($45/$100)', severity: 'warning', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'a2', type: 'consecutive_losses', message: 'MACD Trend had 3 consecutive losses', severity: 'warning', createdAt: new Date(Date.now() - 3600000).toISOString() },
];

// ============================================================
// TRADES
// ============================================================

export const MOCK_TRADES = Array.from({ length: 50 }, (_, i) => {
  const directions = ['CALL', 'PUT'] as const;
  const statuses = ['won', 'lost', 'won', 'won', 'pending'] as const;
  const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'EUR/GBP', 'BTC/USD'];
  const dir = directions[Math.floor(Math.random() * 2)];
  const st = statuses[Math.floor(Math.random() * 5)];
  const profit = st === 'won' ? +(Math.random() * 10 + 1).toFixed(2) : st === 'lost' ? -(Math.random() * 8 + 1).toFixed(2) : 0;
  return {
    id: `trade-${i}`,
    botId: 'bot-1',
    direction: dir,
    asset: assets[Math.floor(Math.random() * assets.length)],
    amount: +(Math.random() * 20 + 5).toFixed(2),
    expiry: 60,
    entryPrice: +(1.08 + Math.random() * 0.02).toFixed(4),
    exitPrice: st === 'pending' ? undefined : +(1.08 + Math.random() * 0.02).toFixed(4),
    payout: st === 'won' ? +(Math.random() * 20 + 5).toFixed(2) : undefined,
    profit: +profit,
    status: st,
    openedAt: new Date(Date.now() - i * 300000 - Math.random() * 60000).toISOString(),
    closedAt: st === 'pending' ? undefined : new Date(Date.now() - i * 300000 + 60000).toISOString(),
    executionTimeMs: Math.floor(Math.random() * 200 + 20),
    latencyMs: Math.floor(Math.random() * 100 + 10),
  };
});

// ============================================================
// STRATEGIES
// ============================================================

export const MOCK_STRATEGIES = [
  {
    id: 'strat-1', name: 'RSI Reversal', description: 'Buy when RSI < 30 oversold, sell when RSI > 70 overbought',
    conditions: [
      { id: 'c1', indicator: 'RSI', operator: '<', value: 30 },
      { id: 'c2', indicator: 'MACD', operator: 'cross_up', value: 0 },
    ],
    logic: 'AND' as const, action: { type: 'CALL' as const, amount: 10, expiry: 60, asset: 'EUR/USD' },
    risk: { stopAfterLosses: 5, maxDailyLoss: 100, maxDrawdownPercent: 20, maxSimultaneousTrades: 3, tradeCooldownSec: 30, maxTradeSize: 50, volatilityProtection: true, emergencyStopMode: false },
    timeframe: '5m', cooldownSec: 30, maxDailyTrades: 50,
  },
  {
    id: 'strat-2', name: 'MACD Cross', description: 'Enter on MACD line crossover with confirmation',
    conditions: [{ id: 'c3', indicator: 'MACD', operator: 'cross_up', value: 0 }],
    logic: 'AND' as const, action: { type: 'PUT' as const, amount: 15, expiry: 120, asset: 'GBP/USD' },
    risk: { stopAfterLosses: 3, maxDailyLoss: 150, maxDrawdownPercent: 15, maxSimultaneousTrades: 2, tradeCooldownSec: 60, maxTradeSize: 30, volatilityProtection: true, emergencyStopMode: false },
    timeframe: '15m', cooldownSec: 60, maxDailyTrades: 30,
  },
  {
    id: 'strat-3', name: 'BB Squeeze', description: 'Trade Bollinger Band squeeze breakouts with volume confirmation',
    conditions: [
      { id: 'c4', indicator: 'BOLLINGER', operator: 'cross_up', value: 0 },
      { id: 'c5', indicator: 'ATR', operator: '>', value: 0.5 },
      { id: 'c6', indicator: 'RSI', operator: '<', value: 40 },
    ],
    logic: 'AND' as const, action: { type: 'CALL' as const, amount: 20, expiry: 300, asset: 'EUR/USD' },
    risk: { stopAfterLosses: 4, maxDailyLoss: 200, maxDrawdownPercent: 25, maxSimultaneousTrades: 2, tradeCooldownSec: 45, maxTradeSize: 40, volatilityProtection: false, emergencyStopMode: false },
    timeframe: '5m', cooldownSec: 45, maxDailyTrades: 20,
  },
];

// ============================================================
// RISK EVENTS
// ============================================================

export const MOCK_RISK_EVENTS = [
  { id: 'r1', type: 'daily_loss_limit', severity: 'warning', message: 'RSI Scalper daily loss approaching limit ($45/$100)', value: 45, threshold: 100, action: 'alert', resolved: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'r2', type: 'consecutive_losses', severity: 'warning', message: 'MACD Trend: 3 consecutive losses detected', value: 3, threshold: 5, action: 'alert', resolved: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'r3', type: 'volatility', severity: 'warning', message: 'High volatility detected on EUR/USD - ATR spike', value: 2.5, threshold: 2.0, action: 'alert', resolved: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

// ============================================================
// NOTIFICATIONS
// ============================================================

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'trade_won' as const, title: 'Trade Won', message: 'RSI Scalper: EUR/USD CALL +$8.50', isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'n2', type: 'trade_won' as const, title: 'Trade Won', message: 'MACD Trend: GBP/USD PUT +$12.30', isRead: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'n3', type: 'trade_lost' as const, title: 'Trade Lost', message: 'RSI Scalper: USD/JPY CALL -$5.00', isRead: true, createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'n4', type: 'bot_started' as const, title: 'Bot Started', message: 'MACD Trend has been started', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n5', type: 'risk_alert' as const, title: 'Risk Alert', message: 'Daily loss limit approaching for RSI Scalper', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
];

// ============================================================
// BACKTESTS
// ============================================================

export const MOCK_BACKTESTS = [
  {
    id: 'bt-1', name: 'RSI Strategy Test', status: 'completed', initialBalance: 1000, finalBalance: 1342.50,
    totalTrades: 156, winTrades: 95, lossTrades: 61, winRate: 60.9, maxDrawdown: 8.5,
    totalProfit: 342.50, profitFactor: 1.65, sharpeRatio: 1.82, avgWin: 8.20, avgLoss: 4.90,
    largestWin: 22.50, largestLoss: 12.00, trades: [], equityCurve: [],
  },
  {
    id: 'bt-2', name: 'MACD Backtest Q1', status: 'completed', initialBalance: 500, finalBalance: 578.30,
    totalTrades: 89, winTrades: 51, lossTrades: 38, winRate: 57.3, maxDrawdown: 11.2,
    totalProfit: 78.30, profitFactor: 1.35, sharpeRatio: 1.12, avgWin: 6.50, avgLoss: 4.20,
    largestWin: 15.00, largestLoss: 9.50, trades: [], equityCurve: [],
  },
];

// ============================================================
// BROKER SESSIONS
// ============================================================

export const MOCK_BROKER_SESSIONS = [
  {
    id: 'session-1', brokerName: 'PocketOption', accountId: 'PO-78234', accountType: 'demo',
    balance: 11247.50, currency: 'USD', isActive: true, isConnected: true,
    lastHeartbeatAt: new Date(Date.now() - 10000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'session-2', brokerName: 'Quotex', accountId: 'QT-10987', accountType: 'demo',
    balance: 10312.00, currency: 'USD', isActive: true, isConnected: true,
    lastHeartbeatAt: new Date(Date.now() - 60000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];
