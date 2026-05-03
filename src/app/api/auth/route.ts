import { NextResponse } from 'next/server';

// This file is kept as a redirect/fallback.
// Actual login: POST /api/auth/login
// Actual register: POST /api/auth/register
// Demo: POST /api/auth/demo

export async function GET() {
  return NextResponse.json({
    message: 'Auth API',
    endpoints: {
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      demo: 'GET /api/auth/demo',
    },
  });
}
