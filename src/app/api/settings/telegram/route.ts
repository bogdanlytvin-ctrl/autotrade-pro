import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';

// In-memory state
const state = { connected: false, telegramId: '' as string };

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return unauthorizedResponse();

    return NextResponse.json({ connected: state.connected, telegramId: state.telegramId });
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
    const { telegramId } = body;
    if (!telegramId?.trim()) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }
    state.connected = true;
    state.telegramId = telegramId;
    return NextResponse.json({ success: true, connected: true, telegramId: state.telegramId });
  } catch {
    return NextResponse.json({ error: 'Failed to connect Telegram' }, { status: 500 });
  }
}
