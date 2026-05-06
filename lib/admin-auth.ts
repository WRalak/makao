import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { queryOne } from './database-helpers';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export async function verifyAdminAuth(request: NextRequest): Promise<{ user: AdminUser } | null> {
  try {
    // Try to get token from Authorization header first (for API calls)
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If not in headers, try cookies (for client-side requests)
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
    }

    if (!token) {
      return null;
    }

    // Verify JWT token using existing auth system
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Check if user exists and is admin
    const user = await queryOne(
      'SELECT id, email, name, role FROM users WHERE id = $1 AND role IN ($2, $3)',
      [decoded.userId, 'admin', 'super_admin']
    );

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

  } catch (error) {
    console.error('Admin auth verification error:', error);
    return null;
  }
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminUser> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    throw new Error('Unauthorized: Admin access required');
  }
  return auth.user;
}

// Middleware function for API routes
export function withAdminAuth(handler: (req: NextRequest, user: AdminUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, auth.user);
  };
}
