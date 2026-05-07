import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Stripe webhooks temporarily disabled during migration' 
  }, { status: 503 });
}

export const runtime = 'nodejs';
