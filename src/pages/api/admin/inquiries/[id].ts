import type { APIRoute } from 'astro';
import { getInquiriesData, saveInquiriesData } from '../../../../lib/contentStore';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const inquiries = getInquiriesData();

    const index = inquiries.findIndex((inq) => inq.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Inquiry not found' }), { status: 404 });
    }

    inquiries[index] = { ...inquiries[index], ...body, id };
    saveInquiriesData(inquiries);

    return new Response(JSON.stringify({ success: true, inquiry: inquiries[index] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const inquiries = getInquiriesData();

    const filtered = inquiries.filter((inq) => inq.id !== id);
    if (filtered.length === inquiries.length) {
      return new Response(JSON.stringify({ error: 'Inquiry not found' }), { status: 404 });
    }

    saveInquiriesData(filtered);
    return new Response(JSON.stringify({ success: true, remaining: filtered.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
