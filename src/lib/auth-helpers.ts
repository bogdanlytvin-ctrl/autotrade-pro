// ============================================================
// Shared auth & wallet helpers for API routes
// ============================================================

// --- Token verification ---

interface TokenPayload {
  sub: string;   // userId
  iat: number;   // issued at
  exp: number;   // expires at
  demo: boolean;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf-8')
    );
    if (!payload.sub || !payload.exp) return null;
    if (Date.now() > payload.exp) return null; // expired
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const payload = verifyToken(token);
  return payload?.sub ?? null;
}

// --- Per-user wallet types ---

export interface TransactionEntry {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade_pnl' | 'subscription';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: string;
  txHash?: string;
}

export interface WalletState {
  balance: number;
  currency: string;
  walletAddress: string | null;
  transactions: TransactionEntry[];
}

// --- Per-user wallet storage ---

declare global {
  var __wallets: Map<string, WalletState> | undefined;
}

function getWalletsMap(): Map<string, WalletState> {
  if (!globalThis.__wallets) {
    globalThis.__wallets = new Map();
  }
  return globalThis.__wallets;
}

export function getWalletForUser(userId: string): WalletState {
  const wallets = getWalletsMap();
  if (!wallets.has(userId)) {
    // Seed new user wallet with demo data
    wallets.set(userId, {
      balance: 1250.00,
      currency: 'USDT',
      walletAddress: null,
      transactions: [
        {
          id: 'tx-seed-001',
          type: 'deposit',
          amount: 500,
          status: 'completed',
          description: 'Deposit via Crypto USDT',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          txHash: '0xabc123...def456',
        },
        {
          id: 'tx-seed-002',
          type: 'deposit',
          amount: 1000,
          status: 'completed',
          description: 'Deposit via Bank Card',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          txHash: '0x789abc...012def',
        },
        {
          id: 'tx-seed-003',
          type: 'withdraw',
          amount: 250,
          status: 'completed',
          description: 'Withdrawal to external wallet',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          txHash: '0xfedcba...987654',
        },
      ],
    });
  }
  return wallets.get(userId)!;
}

// --- Helpers for API responses ---

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized. Please log in.' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function walletResponse(wallet: WalletState) {
  return Response.json({
    balance: wallet.balance,
    currency: wallet.currency,
    walletAddress: wallet.walletAddress,
    transactions: wallet.transactions,
  });
}
