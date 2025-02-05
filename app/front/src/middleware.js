import { NextResponse, NextRequest } from 'next/server'

export function middleware(request) {
  let cookieObj = request.cookies.get('login-cookie')?.value;
  const cookieObjParsed = cookieObj ? JSON.parse(cookieObj) : null;

  if (cookieObjParsed) {
    try {
      const username = cookieObjParsed.username;
      const userRole = cookieObjParsed.user_role;

      if (request.nextUrl.pathname.startsWith('/admin')) {
        if (userRole === 'Administrator') {
          return NextResponse.next(); 
        } else {
          return NextResponse.redirect(new URL('/unauthorized', request.url)); 
        }
      }

      if (request.nextUrl.pathname.startsWith('/user')) {
        if (userRole === 'Worker') {
          return NextResponse.next(); 
        } else {
          return NextResponse.redirect(new URL('/unauthorized', request.url)); 
        }
      }
    } catch (e) {
      console.error('Error with cookie:', e);
      return NextResponse.redirect(new URL('/login', request.url)); 
    }
  } else {
    return NextResponse.redirect(new URL('/login', request.url)); 
  }
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'] 
}
