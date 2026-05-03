import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import {
  getUserIdFromRequest,
  getWalletForUser,
  unauthorizedResponse,
  walletResponse,
} from '@/lib/auth-helpers';
import type { TransactionEntry } from '@/lib/auth-helpers';

// POST /api/wallet/withdraw
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { amount, address } = body;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a valid number greater than 0.' },
        { status: 400 }
      );
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json(
        { error: 'Wallet address is required.' },
        { status: 400 }
      );
    }

    const wallet = getWalletForUser(userId);

    if (amount > wallet.balance) {
      return NextResponse.json(
        { error: 'Insufficient funds.' },
        { status: 400 }
      );
    }

    const txId = `tx-${randomBytes(8).toString('hex')}`;
    const txHash = `0x${randomBytes(16).toString('hex')}...${randomBytes(4).toString('hex')}`;

    const shortAddress = address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

    const newTransaction: TransactionEntry = {
      id: txId,
      type: 'withdraw',
      amount: +amount,
      status: 'pending',
      description: `Withdrawal to ${shortAddress}`,
      createdAt: new Date().toISOString(),
      txHash,
    };

    wallet.balance = +(wallet.balance - amount).toFixed(2);
    wallet.transactions = [newTransaction, ...wallet.transactions];

    return walletResponse(wallet);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
