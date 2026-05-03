import { NextResponse } from 'next/server';
import { findUser, generateToken } from '@/lib/mock-data';

// POST /api/auth/demo — demo login with static data, no DB needed
export async function POST(request: Request) {
  try {
    const demoUser = await findUser('demo@autotrade.pro');

    return NextResponse.json({
      user: {
        id: demoUser?.id || 'user-demo',
        email: 'demo@autotrade.pro',
        name: demoUser?.name || 'Demo Trader',
        role: 'premium_user',
      },
      token: generateToken(demoUser?.id || 'user-demo', true),
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
  }
}
