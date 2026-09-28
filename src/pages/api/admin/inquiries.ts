import type { APIRoute } from 'astro';
import { getInquiriesData, saveInquiriesData } from '../../../lib/contentStore';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const inquiries = getInquiriesData();
    return new Response(JSON.stringify(inquiries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const inquiries = getInquiriesData();

    if (body.action === 'mark_all_read') {
      const updated = inquiries.map((inq) => ({ ...inq, unread: false }));
      saveInquiriesData(updated);
      return new Response(JSON.stringify({ success: true, inquiries: updated }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (Array.isArray(body)) {
      saveInquiriesData(body);
      return new Response(JSON.stringify({ success: true, inquiries: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
