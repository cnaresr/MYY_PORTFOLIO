import { defineMiddleware } from 'astro:middleware';
import { verifySession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Protect /user/admin routes
  if (pathname.startsWith('/user/admin')) {
    // Allow login page and auth assets
    if (pathname === '/user/admin/login' || pathname === '/user/admin/login/') {
      // If already logged in, redirect to overview
      const sessionCookie = context.cookies.get('admin_session')?.value;
      if (sessionCookie && verifySession(sessionCookie)) {
        return context.redirect('/user/admin/overview');
      }
      return next();
    }

    const sessionCookie = context.cookies.get('admin_session')?.value;
    if (!sessionCookie || !verifySession(sessionCookie)) {
      return context.redirect('/user/admin/login');
    }
  }

  // Protect /api/admin/* endpoints
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = context.cookies.get('admin_session')?.value;
    if (!sessionCookie || !verifySession(sessionCookie)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});
