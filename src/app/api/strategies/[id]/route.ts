import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { MOCK_STRATEGIES } from '@/lib/mock-data';

// DELETE /api/strategies/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const index = MOCK_STRATEGIES.findIndex((s) => s.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    MOCK_STRATEGIES.splice(index, 1);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Failed to delete strategy:', error);
    return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
  }
}

// PUT /api/strategies/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const index = MOCK_STRATEGIES.findIndex((s) => s.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }
    MOCK_STRATEGIES[index] = { ...MOCK_STRATEGIES[index], ...body };
    return NextResponse.json({ success: true, strategy: MOCK_STRATEGIES[index] });
  } catch (error) {
    console.error('Failed to update strategy:', error);
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
  }
}
