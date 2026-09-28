import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get('admin_session')?.value;
  destroySession(token);

  cookies.delete('admin_session', { path: '/' });

  return new Response(JSON.stringify({ success: true, redirect: '/user/admin/login' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get('admin_session')?.value;
  destroySession(token);
  cookies.delete('admin_session', { path: '/' });
  return redirect('/user/admin/login');
};
