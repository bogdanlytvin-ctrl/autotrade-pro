import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_DASHBOARD_STATS, MOCK_EQUITY_CURVE, MOCK_ALERTS } from '@/lib/mock-data';

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    return NextResponse.json({
      stats: MOCK_DASHBOARD_STATS,
      equityCurve: MOCK_EQUITY_CURVE,
      recentAlerts: MOCK_ALERTS,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
