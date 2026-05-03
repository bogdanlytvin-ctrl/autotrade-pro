import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_TRADES } from '@/lib/mock-data';

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const raw = searchParams.get('limit');
    const limit = Math.max(1, Math.min(parseInt(raw || '50', 10) || 50, 500));

    let filtered = MOCK_TRADES;
    if (botId) {
      filtered = MOCK_TRADES.filter((t) => t.botId === botId);
    }

    return NextResponse.json({ trades: filtered.slice(0, limit) });
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}
