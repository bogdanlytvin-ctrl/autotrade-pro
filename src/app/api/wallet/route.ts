import { NextResponse } from 'next/server';
import { getUserIdFromRequest, getWalletForUser, unauthorizedResponse, walletResponse } from '@/lib/auth-helpers';

// GET /api/wallet — return current user's wallet
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const wallet = getWalletForUser(userId);
  return walletResponse(wallet);
}
