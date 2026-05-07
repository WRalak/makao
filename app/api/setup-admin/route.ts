import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Admin setup temporarily disabled during migration. Please configure database connection first.',
    error: 'Database connection required'
  }, { status: 503 });
}