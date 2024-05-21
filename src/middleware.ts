import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const publicRoutes = ['/', '/login', '/register'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = !publicRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const token = cookies().get('access-token')?.value;

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (isPublicRoute && !token && !req.nextUrl.pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/tables', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
};
