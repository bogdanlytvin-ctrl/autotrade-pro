import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/lib/auth-helpers';
import { randomBytes } from 'crypto';

// In-memory API keys store
const apiKeys = [
  {
    id: 'key-1',
    name: 'Production Key',
    key: 'atp_live_sk_a1b2c3d4e5f6g7h8i9j0',
    prefix: 'atp_live_sk_',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastUsedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'key-2',
    name: 'Test Key',
    key: 'atp_test_sk_z9y8x7w6v5u4t3s2r1q0',
    prefix: 'atp_test_sk_',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastUsedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function generateKey() {
  return `atp_live_sk_${randomBytes(15).toString('hex')}`;
}

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  // Return keys with masked values
  return NextResponse.json({
    keys: apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      maskedKey: `${k.prefix}${'*'.repeat(20)}`,
      prefix: k.prefix,
      status: k.status,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    })),
  });
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'generate') {
      const newKey = generateKey();
      const keyEntry = {
        id: `key-${Date.now()}`,
        name: 'Production Key',
        key: newKey,
        prefix: 'atp_live_sk_',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };
      apiKeys.push(keyEntry);
      return NextResponse.json({ success: true, key: newKey, id: keyEntry.id });
    }

    if (action === 'revoke') {
      const { keyId } = body;
      const idx = apiKeys.findIndex((k) => k.id === keyId);
      if (idx !== -1) {
        apiKeys.splice(idx, 1);
        return NextResponse.json({ success: true, revoked: keyId });
      }
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to manage API keys' }, { status: 500 });
  }
}
