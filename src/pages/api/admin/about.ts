import type { APIRoute } from 'astro';
import { saveAboutMeData } from '../../../lib/contentStore';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    saveAboutMeData(data);

    try {
      const { generateCvPdf } = await import('../../../../scripts/generate-cv.mjs');
      generateCvPdf();
    } catch (cvErr) {
      console.warn('Auto-generate CV failed:', cvErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
