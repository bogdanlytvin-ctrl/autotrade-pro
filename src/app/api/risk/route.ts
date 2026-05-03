import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_RISK_EVENTS } from '@/lib/mock-data';

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    return NextResponse.json({ events: MOCK_RISK_EVENTS });
  } catch (error) {
    console.error('Failed to fetch risk events:', error);
    return NextResponse.json({ error: 'Failed to fetch risk events' }, { status: 500 });
  }
}
