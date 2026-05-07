import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth-simple';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login', 
    '/register', 
    '/', 
    '/properties', 
    '/about',
    '/contact',
    '/careers',
    '/blog',
    '/help',
    '/faqs',
    '/terms',
    '/privacy',
    '/cookies'
  ];
  
  // Check if path is public or starts with a public route
  const isPublicRoute = publicRoutes.some(route => {
    if (route === pathname) return true;
    if (route === '/properties' && pathname.startsWith('/properties')) return true;
    if (route === '/property/[id]' && /^\/property\/[^\/]+$/.test(pathname)) return true;
    return false;
  });

  // Admin-only routes
  const adminRoutes = ['/admin', '/api/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Agent-only routes
  const agentRoutes = ['/agent', '/api/agent'];
  const isAgentRoute = agentRoutes.some(route => pathname.startsWith(route));

  // Tenant-only routes
  const tenantRoutes = ['/tenant', '/api/tenant'];
  const isTenantRoute = tenantRoutes.some(route => pathname.startsWith(route));

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      // Clear invalid token for all routes
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      
      // Only redirect to login if trying to access protected route
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      return response;
    }

    // Role-based access control
    if (decoded) {
      // Admin routes
      if (isAdminRoute && decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Agent routes
      if (isAgentRoute && decoded.role !== 'agent') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Tenant routes
      if (isTenantRoute && decoded.role !== 'tenant') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
