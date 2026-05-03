import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_BOTS } from '@/lib/mock-data';

// GET /api/bots — List all bots (mock data)
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorizedResponse();

    return NextResponse.json({ bots: MOCK_BOTS });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bots — Create a new bot (returns mock)
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBot = {
      id: `bot-${Date.now()}`,
      name,
      status: 'stopped',
      strategyName: 'New Strategy',
      brokerName: 'PocketOption',
      stats: { totalTrades: 0, winTrades: 0, lossTrades: 0, winRate: 0, profitLoss: 0, currentBalance: 10000, maxDrawdown: 0, currentDrawdown: 0, dailyLoss: 0, dailyTrades: 0, consecutiveLosses: 0, avgLatencyMs: 0, uptimeSeconds: 0 },
      lastSignalAt: null,
      lastTradeAt: null,
      lastError: null,
      errorCount: 0,
      startedAt: null,
    };

    MOCK_BOTS.push(newBot);

    return NextResponse.json({ bot: newBot });
  } catch (error) {
    console.error('Failed to create bot:', error);
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 });
  }
}
