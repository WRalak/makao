import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Subscription callback temporarily disabled during migration' 
  }, { status: 503 });
}