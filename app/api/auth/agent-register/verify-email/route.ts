import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Agent email verification temporarily disabled during migration' 
  }, { status: 503 });
}