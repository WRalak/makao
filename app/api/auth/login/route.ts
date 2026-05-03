import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
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

    await connectDB();

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.isBanned) {
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
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
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
