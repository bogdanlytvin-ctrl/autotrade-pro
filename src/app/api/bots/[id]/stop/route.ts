import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_BOTS } from '@/lib/mock-data';

// POST /api/bots/[id]/stop
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const bot = MOCK_BOTS.find((b) => b.id === id);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    bot.status = 'stopped';

    return NextResponse.json({ success: true, status: 'stopped', botId: id });
  } catch (error) {
    console.error('Failed to stop bot:', error);
    return NextResponse.json({ error: 'Failed to stop bot' }, { status: 500 });
  }
}
