// ============================================================
// CORE TYPES - Trading Platform
// ============================================================

export type UserRole = 'admin' | 'support' | 'user' | 'premium_user';

export type BotStatus = 'created' | 'running' | 'paused' | 'stopped' | 'error' | 'emergency_stop';

export type TradeDirection = 'CALL' | 'PUT';

export type TradeStatus = 'pending' | 'won' | 'lost' | 'refunded' | 'timeout' | 'error';

export type RiskSeverity = 'warning' | 'critical' | 'emergency';

export type RiskType =
  | 'daily_loss_limit'
  | 'consecutive_losses'
  | 'drawdown_limit'
  | 'max_trades'
  | 'emergency'
  | 'volatility'
  | 'connection_lost';

export type NotificationType =
  | 'trade_executed'
  | 'trade_won'
  | 'trade_lost'
  | 'bot_started'
  | 'bot_stopped'
  | 'risk_alert'
  | 'system'
  | 'daily_report';

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type Timeframe = '30s' | '1m' | '5m' | '15m' | '1h';

export type IndicatorName =
  | 'RSI'
  | 'MACD'
  | 'EMA'
  | 'SMA'
  | 'BOLLINGER'
  | 'ATR'
  | 'STOCHASTIC'
  | 'EMA_CROSS';

export type ConditionOperator =
  | '<'
  | '>'
  | '<='
  | '>='
  | '=='
  | 'cross_up'
  | 'cross_down'
  | 'divergence';

export type ConditionLogic = 'AND' | 'OR';

export type TradeActionType = 'CALL' | 'PUT';

// ============================================================
// STRATEGY TYPES
// ============================================================

export interface StrategyCondition {
  id: string;
  indicator: IndicatorName;
  operator: ConditionOperator;
  value?: number;
  params?: Record<string, number>;
}

export interface StrategyAction {
  type: TradeActionType;
  amount: number;
  expiry: number; // seconds
  asset?: string;
}

export interface StrategyRisk {
  stopAfterLosses: number;
  maxDailyLoss: number;
  maxDrawdownPercent: number;
  maxSimultaneousTrades: number;
  tradeCooldownSec: number;
  maxTradeSize: number;
  volatilityProtection: boolean;
  emergencyStopMode: boolean;
}

export interface StrategyConfig {
  id?: string;
  name: string;
  description?: string;
  conditions: StrategyCondition[];
  logic: ConditionLogic;
  action: StrategyAction;
  risk: StrategyRisk;
  timeframe: Timeframe;
  cooldownSec: number;
  maxDailyTrades: number;
  executionWindowStart?: string;
  executionWindowEnd?: string;
}

// ============================================================
// BOT TYPES
// ============================================================

export interface BotConfig {
  name: string;
  strategyId: string;
  sessionId: string;
  initialBalance: number;
  config?: Record<string, unknown>;
}

export interface BotStats {
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  winRate: number;
  profitLoss: number;
  currentBalance: number;
  maxDrawdown: number;
  currentDrawdown: number;
  dailyLoss: number;
  dailyTrades: number;
  consecutiveLosses: number;
  avgLatencyMs: number;
  uptimeSeconds: number;
}

export interface BotMonitorData {
  id: string;
  name: string;
  status: BotStatus;
  stats: BotStats;
  strategyName: string;
  brokerName: string;
  lastSignalAt?: string;
  lastTradeAt?: string;
  lastError?: string;
  errorCount: number;
  startedAt?: string;
}

// ============================================================
// TRADE TYPES
// ============================================================

export interface TradeEntry {
  id: string;
  botId: string;
  direction: TradeDirection;
  asset: string;
  amount: number;
  expiry: number;
  entryPrice: number;
  status: TradeStatus;
  openedAt: string;
  closedAt?: string;
  exitPrice?: number;
  payout?: number;
  profit?: number;
  executionTimeMs?: number;
  latencyMs?: number;
  errorReason?: string;
}

export interface TradeValidation {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    reason?: string;
  }[];
  rejectReason?: string;
}

// ============================================================
// RISK TYPES
// ============================================================

export interface RiskConfig {
  maxDailyLoss: number;
  stopAfterConsecutiveLosses: number;
  maxDrawdownPercent: number;
  maxSimultaneousTrades: number;
  tradeCooldownSec: number;
  maxTradeSize: number;
  volatilityProtection: boolean;
  emergencyStopMode: boolean;
  minBalanceProtection: number;
}

export interface RiskCheckResult {
  passed: boolean;
  checkName: string;
  reason?: string;
  action?: 'allow' | 'reject' | 'pause' | 'emergency_stop';
}

// ============================================================
// WEBSOCKET EVENT TYPES
// ============================================================

export type WSEventType =
  | 'bot:status'
  | 'trade:executed'
  | 'trade:result'
  | 'bot:signal'
  | 'bot:error'
  | 'risk:alert'
  | 'notification'
  | 'market:update'
  | 'connection:status'
  | 'system:health';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  data: T;
  timestamp: string;
  userId?: string;
}

export interface MarketUpdate {
  asset: string;
  price: number;
  change: number;
  timestamp: number;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  totalBots: number;
  activeBots: number;
  totalTrades: number;
  todayTrades: number;
  todayPnL: number;
  totalPnL: number;
  overallWinRate: number;
  activeStrategies: number;
  connectedBrokers: number;
  totalBalance: number;
  riskAlerts: number;
}

export interface PortfolioChart {
  timestamp: string;
  balance: number;
  pnl: number;
}

export interface PerformanceMetrics {
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgLatencyMs: number;
  totalTrades: number;
  profitableDays: number;
  losingDays: number;
}

// ============================================================
// BACKTEST TYPES
// ============================================================

export interface BacktestConfig {
  name: string;
  strategyId: string;
  asset: string;
  timeframe: Timeframe;
  startDate: string;
  endDate: string;
  initialBalance: number;
  commissionRate?: number;
}

export interface BacktestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  initialBalance: number;
  finalBalance: number;
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  winRate: number;
  maxDrawdown: number;
  totalProfit: number;
  profitFactor: number;
  sharpeRatio: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  equityCurve: { timestamp: string; balance: number }[];
  trades: {
    timestamp: string;
    direction: TradeDirection;
    amount: number;
    profit: number;
    status: TradeStatus;
  }[];
}

// ============================================================
// NAVIGATION
// ============================================================

export type NavPage =
  | 'dashboard'
  | 'strategies'
  | 'bots'
  | 'trading'
  | 'risk'
  | 'backtest'
  | 'wallet'
  | 'settings'
  | 'admin'
  | 'auth';
