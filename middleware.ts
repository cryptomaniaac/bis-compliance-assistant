import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'bis-assist-fallback-secret-change-in-prod-32chars!';

// Public routes accessible without logging in
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/verify-otp',
  '/about',
  '/browse',
  '/scan',
];

// Public API routes accessible without logging in
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/standards/search', // Public standards index search for /browse page
  '/api/scan',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public static assets, images, Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|svg|css|js|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicApi) {
    return NextResponse.next();
  }

  // 3. Verify session token cookie or Authorization Bearer header for protected routes
  let token = req.cookies.get('bis_auth_token')?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  let isAuthenticated = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch (err) {
      isAuthenticated = false;
    }
  }

  // 4. Handle API Route Protection (return 401 Unauthorized for API requests)
  if (pathname.startsWith('/api/')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to access this feature.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 5. Handle Page Route Protection (redirect to login with return URL)
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
