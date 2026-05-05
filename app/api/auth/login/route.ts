import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/database-helpers';
import { comparePassword, generateToken, createAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Get user from database
    const user = await queryOne(
      'SELECT id, name, email, password, role, status, email_verified, subscription FROM users WHERE email = $1',
      [validatedData.email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status === 'banned') {
      return NextResponse.json(
        { error: 'Account has been banned' },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken(user);
    const cookie = createAuthCookie(token);

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified,
        subscription: user.subscription,
      },
    });

    response.headers.set('Set-Cookie', cookie);
    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export const runtime = 'nodejs';
