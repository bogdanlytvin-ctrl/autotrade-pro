import { NextRequest, NextResponse } from 'next/server';
import {
  getUserIdFromRequest,
  getWalletForUser,
  unauthorizedResponse,
  walletResponse,
} from '@/lib/auth-helpers';

// POST /api/wallet/connect
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json(
        { error: 'Wallet address is required.' },
        { status: 400 }
      );
    }

    const wallet = getWalletForUser(userId);
    // Store full address (not truncated)
    wallet.walletAddress = address.trim();

    return walletResponse(wallet);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
