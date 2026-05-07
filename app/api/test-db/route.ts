import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: 'Could not establish database connection'
      }, { status: 500 });
    }

    // Test simple query
    const result = await db.query('SELECT NOW() as current_time');
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0]?.current_time
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
