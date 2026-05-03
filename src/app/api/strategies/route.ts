import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_STRATEGIES } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorizedResponse();

    return NextResponse.json({ strategies: MOCK_STRATEGIES });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { name, description, conditions, logic, action, risk, timeframe, cooldownSec, maxDailyTrades } = body;

    if (!name || !Array.isArray(conditions) || conditions.length === 0 || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newStrategy = {
      id: `strat-${Date.now()}`,
      name,
      description: description || '',
      conditions,
      logic: logic || 'AND',
      action,
      risk: risk || {},
      timeframe: timeframe || '5m',
      cooldownSec: cooldownSec ?? 30,
      maxDailyTrades: maxDailyTrades ?? 50,
    };

    MOCK_STRATEGIES.push(newStrategy);

    return NextResponse.json({ strategy: newStrategy });
  } catch (error) {
    console.error('Failed to create strategy:', error);
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
  }
}
