import type { APIRoute } from 'astro';
import { getProfileData, saveProfileData } from '../../../lib/contentStore';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = getProfileData();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();

    // Guard: refuse to wipe the profile with an empty / nameless payload.
    if (!payload || typeof payload !== 'object' || !payload.name || String(payload.name).trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Refusing to save: payload has no "name". If you intend to reset, set fields explicitly.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Merge over the existing profile so partial saves never drop fields.
    let current: any = {};
    try {
      current = getProfileData();
    } catch {}
    const merged = { ...current, ...payload };

    saveProfileData(merged);
    return new Response(JSON.stringify({ success: true, data: merged }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
