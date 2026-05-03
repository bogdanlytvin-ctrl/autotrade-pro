import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_RISK_EVENTS } from '@/lib/mock-data';

// POST /api/risk/[id]/resolve
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const event = MOCK_RISK_EVENTS.find((e) => e.id === id);
    if (!event) {
      return NextResponse.json({ error: 'Risk event not found' }, { status: 404 });
    }

    event.resolved = true;

    return NextResponse.json({ success: true, resolvedId: id });
  } catch (error) {
    console.error('Failed to resolve risk event:', error);
    return NextResponse.json({ error: 'Failed to resolve risk event' }, { status: 500 });
  }
}
