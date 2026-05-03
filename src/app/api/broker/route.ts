import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_BROKER_SESSIONS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorizedResponse();

    return NextResponse.json({ sessions: MOCK_BROKER_SESSIONS });
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
    const { brokerName, accountType } = body;

    if (!brokerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (accountType !== undefined && accountType !== 'demo' && accountType !== 'live') {
      return NextResponse.json({ error: 'accountType must be "demo" or "live"' }, { status: 400 });
    }

    const newSession = {
      id: `session-${Date.now()}`,
      brokerName,
      accountId: `${brokerName.slice(0, 2).toUpperCase()}-${Math.floor(Math.random() * 99999)}`,
      accountType: accountType || 'demo',
      balance: 10000,
      currency: 'USD',
      isActive: true,
      isConnected: true,
      lastHeartbeatAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Failed to create broker session:', error);
    return NextResponse.json({ error: 'Failed to create broker session' }, { status: 500 });
  }
}
