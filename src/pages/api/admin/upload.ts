import type { APIRoute } from 'astro';
import { verifySession } from '../../../lib/auth';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST: APIRoute = async ({ request, cookies }) => {
  // Verify session
  const sessionToken = cookies.get('admin_session')?.value;
  if (!verifySession(sessionToken)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: invalid or expired session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = (formData.get('image') || formData.get('file')) as File | null;

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No image file provided in form data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP, SVG, GIF`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return new Response(JSON.stringify({ error: 'File exceeds maximum limit of 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Clean filename
    const ext = path.extname(file.name) || '.jpg';
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const safeFilename = `${baseName}-${Date.now().toString().slice(-6)}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write to public/images (source of truth) and, when a build output exists
    // (astro preview / production standalone), also mirror into its client dir
    // so the fresh asset is served immediately without a rebuild.
    const targets = [path.resolve(process.cwd(), 'public', 'images')];
    const builtClientImages = path.resolve(process.cwd(), 'dist_app', 'client', 'images');
    if (fs.existsSync(path.resolve(process.cwd(), 'dist_app', 'client'))) {
      targets.push(builtClientImages);
    }

    for (const targetDir of targets) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      await fs.promises.writeFile(path.resolve(targetDir, safeFilename), buffer);
    }

    const publicUrl = `/images/${safeFilename}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        path: publicUrl,
        filename: safeFilename,
        size: file.size,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'File upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};