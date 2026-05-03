import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';

// POST /api/settings/notifications/[id]/read
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorizedResponse();

    const { id } = await params;
    const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (notification) notification.isRead = true;

    return NextResponse.json({ success: true, readId: id });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
