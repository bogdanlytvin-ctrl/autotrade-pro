import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  NavPage,
  BotMonitorData,
  TradeEntry,
  DashboardStats,
  RiskConfig,
  StrategyConfig,
  NotificationType,
  BacktestResult,
} from '@/types';

// ============================================================
// DEMO DATA — used as fallback when API is unavailable
// ============================================================

const DEMO_BOTS: BotMonitorData[] = [
  {
    id: 'bot-1',
    name: 'RSI Scalper',
    status: 'running',
    strategyName: 'RSI Reversal',
    brokerName: 'PocketOption',
    stats: { totalTrades: 342, winTrades: 209, lossTrades: 133, winRate: 61.1, profitLoss: 1247.50, currentBalance: 11247.50, maxDrawdown: 8.2, currentDrawdown: 2.1, dailyLoss: 45.00, dailyTrades: 12, consecutiveLosses: 2, avgLatencyMs: 45, uptimeSeconds: 86400 },
    lastSignalAt: new Date(Date.now() - 30000).toISOString(),
    lastTradeAt: new Date(Date.now() - 120000).toISOString(),
    errorCount: 0,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'bot-2', name: 'MACD Trend', status: 'running', strategyName: 'MACD Cross',
    brokerName: 'PocketOption', stats: { totalTrades: 189, winTrades: 102, lossTrades: 87, winRate: 54.0, profitLoss: 523.80, currentBalance: 10523.80, maxDrawdown: 12.5, currentDrawdown: 4.3, dailyLoss: 22.00, dailyTrades: 8, consecutiveLosses: 1, avgLatencyMs: 38, uptimeSeconds: 172800 },
    lastSignalAt: new Date(Date.now() - 60000).toISOString(), lastTradeAt: new Date(Date.now() - 300000).toISOString(), errorCount: 0, startedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'bot-3', name: 'Bollinger Bounce', status: 'paused', strategyName: 'BB Squeeze',
    brokerName: 'Quotex', stats: { totalTrades: 95, winTrades: 58, lossTrades: 37, winRate: 61.1, profitLoss: 312.00, currentBalance: 10312.00, maxDrawdown: 6.8, currentDrawdown: 0, dailyLoss: 0, dailyTrades: 0, consecutiveLosses: 0, avgLatencyMs: 52, uptimeSeconds: 43200 },
    lastSignalAt: new Date(Date.now() - 7200000).toISOString(), lastTradeAt: new Date(Date.now() - 7260000).toISOString(), errorCount: 0, startedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'bot-4', name: 'Stochastic Hunter', status: 'stopped', strategyName: 'Stoch RSI',
    brokerName: 'PocketOption', stats: { totalTrades: 56, winTrades: 31, lossTrades: 25, winRate: 55.4, profitLoss: 145.20, currentBalance: 10145.20, maxDrawdown: 9.1, currentDrawdown: 0, dailyLoss: 0, dailyTrades: 0, consecutiveLosses: 0, avgLatencyMs: 41, uptimeSeconds: 0 },
    errorCount: 0,
  },
];

const DEMO_DASHBOARD_STATS: DashboardStats = {
  totalBots: 4, activeBots: 2, totalTrades: 682, todayTrades: 20, todayPnL: 67.00,
  totalPnL: 2228.50, overallWinRate: 58.9, activeStrategies: 3, connectedBrokers: 2, totalBalance: 42228.50, riskAlerts: 2,
};

const DEMO_EQUITY_CURVE = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  balance: 10000 + Math.sin(i * 0.3) * 200 + i * 15 + Math.random() * 50,
}));

const DEMO_ALERTS = [
  { id: 'a1', type: 'daily_loss_limit', message: 'Bot RSI Scalper approaching daily loss limit ($45/$100)', severity: 'warning', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'a2', type: 'consecutive_losses', message: 'MACD Trend had 3 consecutive losses', severity: 'warning', createdAt: new Date(Date.now() - 3600000).toISOString() },
];

const DEMO_TRADES: TradeEntry[] = Array.from({ length: 50 }, (_, i) => {
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

const DEMO_STRATEGIES: StrategyConfig[] = [
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

const DEMO_RISK_EVENTS = [
  { id: 'r1', type: 'daily_loss_limit', severity: 'warning', message: 'RSI Scalper daily loss approaching limit ($45/$100)', value: 45, threshold: 100, action: 'alert', resolved: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'r2', type: 'consecutive_losses', severity: 'warning', message: 'MACD Trend: 3 consecutive losses detected', value: 3, threshold: 5, action: 'alert', resolved: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'r3', type: 'volatility', severity: 'warning', message: 'High volatility detected on EUR/USD - ATR spike', value: 2.5, threshold: 2.0, action: 'alert', resolved: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

const DEMO_NOTIFICATIONS = [
  { id: 'n1', type: 'trade_won' as const, title: 'Trade Won', message: 'RSI Scalper: EUR/USD CALL +$8.50', isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'n2', type: 'trade_won' as const, title: 'Trade Won', message: 'MACD Trend: GBP/USD PUT +$12.30', isRead: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'n3', type: 'trade_lost' as const, title: 'Trade Lost', message: 'RSI Scalper: USD/JPY CALL -$5.00', isRead: true, createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'n4', type: 'bot_started' as const, title: 'Bot Started', message: 'MACD Trend has been started', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n5', type: 'risk_alert' as const, title: 'Risk Alert', message: 'Daily loss limit approaching for RSI Scalper', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
];

const DEMO_BACKTESTS: BacktestResult[] = [
  {
    id: 'bt-1', name: 'RSI Strategy Test', status: 'completed', initialBalance: 1000, finalBalance: 1342.50,
    totalTrades: 156, winTrades: 95, lossTrades: 61, winRate: 60.9, maxDrawdown: 8.5,
    totalProfit: 342.50, profitFactor: 1.65, sharpeRatio: 1.82, avgWin: 8.20, avgLoss: 4.90,
    largestWin: 22.50, largestLoss: 12.00,
    equityCurve: Array.from({ length: 30 }, (_, i) => ({ timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(), balance: 1000 + (342.50 / 30) * (i + 1) * (0.85 + Math.random() * 0.3) })),
    trades: [],
  },
  {
    id: 'bt-2', name: 'MACD Backtest Q1', status: 'completed', initialBalance: 500, finalBalance: 578.30,
    totalTrades: 89, winTrades: 51, lossTrades: 38, winRate: 57.3, maxDrawdown: 11.2,
    totalProfit: 78.30, profitFactor: 1.35, sharpeRatio: 1.12, avgWin: 6.50, avgLoss: 4.20,
    largestWin: 15.00, largestLoss: 9.50,
    equityCurve: Array.from({ length: 30 }, (_, i) => ({ timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(), balance: 500 + (78.30 / 30) * (i + 1) * (0.8 + Math.random() * 0.4) })),
    trades: [],
  },
];

// ============================================================
// AUTH STORE
// ============================================================

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      email: null,
      name: null,
      role: null,
      token: null,

  login: async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Authentication failed' }));
      throw new Error(err.error || 'Authentication failed');
    }
    const data = await res.json();
    if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
    set({
      isAuthenticated: true,
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      token: data.token,
    });
  },

  register: async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
    set({
      isAuthenticated: true,
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      token: data.token,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({
      isAuthenticated: false,
      userId: null,
      email: null,
      name: null,
      role: null,
      token: null,
    });
  },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
        email: state.email,
        name: state.name,
        role: state.role,
        token: state.token,
      }),
    }
  )
);

// ============================================================
// NAVIGATION STORE
// ============================================================

interface NavState {
  currentPage: NavPage;
  previousPage: NavPage | null;
  navigate: (page: NavPage) => void;
  goBack: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  currentPage: 'dashboard',
  previousPage: null,

  navigate: (page: NavPage) => {
    set((state) => ({
      previousPage: state.currentPage,
      currentPage: page,
    }));
  },

  goBack: () => {
    const { previousPage } = get();
    if (previousPage) {
      set((state) => ({
        currentPage: state.previousPage!,
        previousPage: null,
      }));
    }
  },
}));

// ============================================================
// BOTS STORE
// ============================================================

interface BotsState {
  bots: BotMonitorData[];
  selectedBotId: string | null;
  isLoading: boolean;
  fetchBots: () => Promise<void>;
  startBot: (botId: string) => Promise<void>;
  pauseBot: (botId: string) => Promise<void>;
  stopBot: (botId: string) => Promise<void>;
  emergencyStop: (botId: string) => Promise<void>;
  selectBot: (botId: string | null) => void;
  updateBotData: (bot: BotMonitorData) => void;
}

export const useBotsStore = create<BotsState>((set, get) => ({
  bots: [],
  selectedBotId: null,
  isLoading: false,

  fetchBots: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/bots', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({ bots: data.bots });
      } else {
        // API responded but with error — fall back to demo data
        set({ bots: DEMO_BOTS });
      }
    } catch (err) {
      // Network error / no database — fall back to demo data
      set({ bots: DEMO_BOTS });
    } finally {
      set({ isLoading: false });
    }
  },

  startBot: async (botId: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/bots/${botId}/start`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to start bot');
    await get().fetchBots();
  },

  pauseBot: async (botId: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/bots/${botId}/pause`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to pause bot');
    await get().fetchBots();
  },

  stopBot: async (botId: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/bots/${botId}/stop`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to stop bot');
    await get().fetchBots();
  },

  emergencyStop: async (botId: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/bots/${botId}/emergency`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to emergency stop bot');
    await get().fetchBots();
  },

  selectBot: (botId: string | null) => set({ selectedBotId: botId }),

  updateBotData: (bot: BotMonitorData) => {
    set((state) => ({
      bots: state.bots.map((b) => (b.id === bot.id ? bot : b)),
    }));
  },
}));

// ============================================================
// TRADES STORE
// ============================================================

interface TradesState {
  trades: TradeEntry[];
  recentTrades: TradeEntry[];
  isLoading: boolean;
  fetchTrades: (botId?: string, limit?: number) => Promise<void>;
  addTrade: (trade: TradeEntry) => void;
  updateTrade: (trade: TradeEntry) => void;
}

export const useTradesStore = create<TradesState>((set) => ({
  trades: [],
  recentTrades: [],
  isLoading: false,

  fetchTrades: async (botId?: string, limit = 50) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const params = new URLSearchParams();
      if (botId) params.set('botId', botId);
      params.set('limit', limit.toString());
      const res = await fetch(`/api/trades?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({ trades: data.trades, recentTrades: data.trades.slice(0, 10) });
      } else {
        set({ trades: DEMO_TRADES, recentTrades: DEMO_TRADES.slice(0, 10) });
      }
    } catch (err) {
      // silent fallback to demo data
      set({ trades: DEMO_TRADES, recentTrades: DEMO_TRADES.slice(0, 10) });
    } finally {
      set({ isLoading: false });
    }
  },

  addTrade: (trade: TradeEntry) => {
    set((state) => ({
      trades: [trade, ...state.trades],
      recentTrades: [trade, ...state.recentTrades].slice(0, 10),
    }));
  },

  updateTrade: (trade: TradeEntry) => {
    set((state) => ({
      trades: state.trades.map((t) => (t.id === trade.id ? trade : t)),
      recentTrades: state.recentTrades.map((t) => (t.id === trade.id ? trade : t)),
    }));
  },
}));

// ============================================================
// DASHBOARD STORE
// ============================================================

interface DashboardState {
  stats: DashboardStats | null;
  equityCurve: { timestamp: string; balance: number }[];
  recentAlerts: { id: string; type: string; message: string; severity: string; createdAt: string }[];
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  equityCurve: [],
  recentAlerts: [],
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/bots/dashboard', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({
          stats: data.stats,
          equityCurve: data.equityCurve,
          recentAlerts: data.recentAlerts,
        });
      } else {
        set({
          stats: DEMO_DASHBOARD_STATS,
          equityCurve: DEMO_EQUITY_CURVE,
          recentAlerts: DEMO_ALERTS,
        });
      }
    } catch (err) {
      // silent fallback to demo data
      set({
        stats: DEMO_DASHBOARD_STATS,
        equityCurve: DEMO_EQUITY_CURVE,
        recentAlerts: DEMO_ALERTS,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ============================================================
// RISK STORE
// ============================================================

interface RiskState {
  globalConfig: RiskConfig;
  riskEvents: { id: string; type: string; severity: string; message: string; resolved: boolean }[];
  isLoading: boolean;
  fetchRiskEvents: () => Promise<void>;
  updateGlobalConfig: (config: Partial<RiskConfig>) => Promise<void>;
  resolveEvent: (eventId: string) => Promise<void>;
}

export const useRiskStore = create<RiskState>((set, get) => ({
  globalConfig: {
    maxDailyLoss: 100,
    stopAfterConsecutiveLosses: 5,
    maxDrawdownPercent: 20,
    maxSimultaneousTrades: 3,
    tradeCooldownSec: 30,
    maxTradeSize: 50,
    volatilityProtection: true,
    emergencyStopMode: false,
    minBalanceProtection: 10,
  },
  riskEvents: [],
  isLoading: false,

  fetchRiskEvents: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/risk', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({ riskEvents: data.events });
      } else {
        set({ riskEvents: DEMO_RISK_EVENTS });
      }
    } catch (err) {
      // silent fallback to demo data
      set({ riskEvents: DEMO_RISK_EVENTS });
    } finally {
      set({ isLoading: false });
    }
  },

  updateGlobalConfig: async (config: Partial<RiskConfig>) => {
    const token = useAuthStore.getState().token;
    const res = await fetch('/api/risk/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update risk config');
    const data = await res.json();
    set({ globalConfig: { ...get().globalConfig, ...data.config } });
  },

  resolveEvent: async (eventId: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/risk/${eventId}/resolve`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (res.ok) {
      set((state) => ({
        riskEvents: state.riskEvents.map((e) =>
          e.id === eventId ? { ...e, resolved: true } : e
        ),
      }));
    }
  },
}));

// ============================================================
// STRATEGIES STORE
// ============================================================

interface StrategiesState {
  strategies: StrategyConfig[];
  isLoading: boolean;
  fetchStrategies: () => Promise<void>;
  createStrategy: (strategy: StrategyConfig) => Promise<StrategyConfig>;
  updateStrategy: (id: string, strategy: Partial<StrategyConfig>) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
}

export const useStrategiesStore = create<StrategiesState>((set, get) => ({
  strategies: [],
  isLoading: false,

  fetchStrategies: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/strategies', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({ strategies: data.strategies });
      } else {
        set({ strategies: DEMO_STRATEGIES });
      }
    } catch (err) {
      // silent fallback to demo data
      set({ strategies: DEMO_STRATEGIES });
    } finally {
      set({ isLoading: false });
    }
  },

  createStrategy: async (strategy: StrategyConfig) => {
    const token = useAuthStore.getState().token;
    const res = await fetch('/api/strategies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify(strategy),
    });
    if (!res.ok) throw new Error('Failed to create strategy');
    const data = await res.json();
    set((state) => ({ strategies: [...state.strategies, data.strategy] }));
    return data.strategy;
  },

  updateStrategy: async (id: string, strategy: Partial<StrategyConfig>) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/strategies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify(strategy),
    });
    if (!res.ok) throw new Error('Failed to update strategy');
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.id === id ? { ...s, ...strategy } : s
      ),
    }));
  },

  deleteStrategy: async (id: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/strategies/${id}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to delete strategy');
    set((state) => ({
      strategies: state.strategies.filter((s) => s.id !== id),
    }));
  },
}));

// ============================================================
// BACKTEST STORE
// ============================================================

interface BacktestState {
  results: BacktestResult[];
  isRunning: boolean;
  runBacktest: (config: import('@/types').BacktestConfig) => Promise<void>;
  fetchResults: () => Promise<void>;
}

export const useBacktestStore = create<BacktestState>((set) => ({
  results: [],
  isRunning: false,

  runBacktest: async (config) => {
    set({ isRunning: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Backtest failed');
      const data = await res.json();
      set((state) => ({ results: [data.result, ...state.results] }));
    } finally {
      set({ isRunning: false });
    }
  },

  fetchResults: async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/backtest', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({ results: data.results });
      } else {
        set({ results: DEMO_BACKTESTS });
      }
    } catch (err) {
      // silent fallback to demo data
      set({ results: DEMO_BACKTESTS });
    }
  },
}));

// ============================================================
// NOTIFICATIONS STORE
// ============================================================

interface NotificationEntry {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: NotificationEntry[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (notif: NotificationEntry) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/settings/notifications', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({
          notifications: data.notifications,
          unreadCount: data.notifications.filter((n: NotificationEntry) => !n.isRead).length,
        });
      } else {
        set({
          notifications: DEMO_NOTIFICATIONS,
          unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.isRead).length,
        });
      }
    } catch (err) {
      // silent fallback to demo data
      set({
        notifications: DEMO_NOTIFICATIONS,
        unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.isRead).length,
      });
    }
  },

  markRead: async (id: string) => {
    const token = useAuthStore.getState().token;
    await fetch(`/api/settings/notifications/${id}/read`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    const token = useAuthStore.getState().token;
    await fetch('/api/settings/notifications/read-all', { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (notif: NotificationEntry) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

// ============================================================
// WALLET STORE
// ============================================================

export interface TransactionEntry {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade_pnl' | 'subscription';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: string;
  txHash?: string;
}

interface WalletState {
  balance: number;
  currency: string;
  walletAddress: string | null;
  transactions: TransactionEntry[];
  isLoading: boolean;
  fetchWallet: () => Promise<void>;
  deposit: (amount: number, method: string) => Promise<void>;
  withdraw: (amount: number, address: string) => Promise<void>;
  connectWallet: (address: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  currency: 'USDT',
  walletAddress: null,
  transactions: [],
  isLoading: false,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      const res = await fetch('/api/wallet', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        set({
          balance: data.balance,
          currency: data.currency,
          walletAddress: data.walletAddress,
          transactions: data.transactions,
        });
      }
    } catch (err) {
      // silent fallback
    } finally {
      set({ isLoading: false });
    }
  },

  deposit: async (amount: number, method: string) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount, method }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Deposit failed');
      }
      const data = await res.json();
      set({
        balance: data.balance,
        currency: data.currency,
        walletAddress: data.walletAddress,
        transactions: data.transactions,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  withdraw: async (amount: number, address: string) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount, address }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Withdrawal failed');
      }
      const data = await res.json();
      set({
        balance: data.balance,
        currency: data.currency,
        walletAddress: data.walletAddress,
        transactions: data.transactions,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  connectWallet: async (address: string) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to connect wallet');
      }
      const data = await res.json();
      set({
        walletAddress: data.walletAddress,
        balance: data.balance,
        currency: data.currency,
        transactions: data.transactions,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ============================================================
// LOCALE STORE
// ============================================================

interface LocaleState {
  locale: import('@/lib/i18n').Locale;
  setLocale: (locale: import('@/lib/i18n').Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => {
        set({ locale });
      },
    }),
    {
      name: 'locale-storage',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);
