import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_BACKTESTS } from '@/lib/mock-data';

function addEquityCurve(bt: typeof MOCK_BACKTESTS[number]) {
  const days = 30;
  return {
    ...bt,
    trades: (bt as Record<string, unknown>).trades ?? [],
    equityCurve: Array.from({ length: days }, (_, i) => ({
      timestamp: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString(),
      balance: bt.initialBalance + (bt.totalProfit / days) * (i + 1) * (0.85 + Math.random() * 0.3),
    })),
  };
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorizedResponse();

    return NextResponse.json({ results: MOCK_BACKTESTS.map(addEquityCurve) });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const config = await request.json();
    const { name, initialBalance = 1000 } = config;

    // Generate realistic backtest results
    const totalTrades = Math.floor(80 + Math.random() * 100);
    const winRate = 55 + Math.random() * 15;
    const winTrades = Math.floor(totalTrades * (winRate / 100));
    const lossTrades = totalTrades - winTrades;
    const avgWin = 2 + Math.random() * 3;
    const avgLoss = 1 + Math.random() * 2;
    const totalProfit = (winTrades * avgWin) - (lossTrades * avgLoss);
    const maxDrawdown = 5 + Math.random() * 15;
    const profitFactor = (winTrades * avgWin) / (lossTrades * avgLoss || 1);
    const finalBalance = initialBalance + totalProfit;

    // Generate equity curve
    const days = 30;
    const equityCurve = Array.from({ length: days }, (_, i) => ({
      timestamp: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString(),
      balance: initialBalance + (totalProfit / days) * (i + 1) * (0.8 + Math.random() * 0.4),
    }));

    const result = {
      id: `bt-${Date.now()}`,
      name: name || 'Untitled Backtest',
      status: 'completed',
      initialBalance,
      finalBalance: Math.round(finalBalance * 100) / 100,
      totalTrades,
      winTrades,
      lossTrades,
      winRate: Math.round(winRate * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      sharpeRatio: Math.round((0.5 + Math.random() * 2) * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      largestWin: Math.round((avgWin * 2 + Math.random() * 5) * 100) / 100,
      largestLoss: Math.round((avgLoss * 2 + Math.random() * 3) * 100) / 100,
      equityCurve,
      trades: [],
    };

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Backtest failed:', error);
    return NextResponse.json({ error: 'Backtest failed' }, { status: 500 });
  }
}
