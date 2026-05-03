import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import {
  getUserIdFromRequest,
  getWalletForUser,
  unauthorizedResponse,
  walletResponse,
} from '@/lib/auth-helpers';
import type { TransactionEntry } from '@/lib/auth-helpers';

const METHOD_LABELS: Record<string, string> = {
  crypto: 'Crypto USDT',
  card: 'Bank Card',
  bank_transfer: 'Bank Transfer',
};

// POST /api/wallet/deposit
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { amount, method } = body;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a valid number greater than 0.' },
        { status: 400 }
      );
    }

    if (!method || !['crypto', 'card', 'bank_transfer'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid payment method.' },
        { status: 400 }
      );
    }

    const wallet = getWalletForUser(userId);
    const txId = `tx-${randomBytes(8).toString('hex')}`;
    const txHash = `0x${randomBytes(16).toString('hex')}...${randomBytes(4).toString('hex')}`;

    const newTransaction: TransactionEntry = {
      id: txId,
      type: 'deposit',
      amount: +amount,
      status: 'completed',
      description: `Deposit via ${METHOD_LABELS[method] || method}`,
      createdAt: new Date().toISOString(),
      txHash,
    };

    wallet.balance = +(wallet.balance + amount).toFixed(2);
    wallet.transactions = [newTransaction, ...wallet.transactions];

    return walletResponse(wallet);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
