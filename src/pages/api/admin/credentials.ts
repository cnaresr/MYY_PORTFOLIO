import type { APIRoute } from 'astro';
import { getCertificatesData, saveCertificatesData } from '../../../lib/contentStore';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const certs = getCertificatesData();
    return new Response(JSON.stringify(certs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const cert = await request.json();
    const certs = getCertificatesData();
    const id = cert.id || `cert-${Date.now().toString(36)}`;
    const nextOrder = certs.length + 1;

    const newCert = {
      id,
      title: cert.title || 'New Certification',
      level: cert.level || 'Professional Level',
      issuer: cert.issuer || 'Certification Authority',
      icon: cert.icon || 'cloud_done',
      status: cert.status || 'ACTIVE',
      issued: cert.issued || new Date().getFullYear().toString(),
      validityLabel: cert.validityLabel || 'EXPIRY',
      validityValue: cert.validityValue || (new Date().getFullYear() + 3).toString(),
      hash: cert.hash || `${Math.random().toString(16).slice(2, 6)}..${Math.random().toString(16).slice(2, 8)}`,
      verifyUrl: cert.verifyUrl || 'https://example.com/verify',
      verifyButtonText: cert.verifyButtonText || 'Verify Credential',
      order: nextOrder,
    };

    certs.push(newCert);
    saveCertificatesData(certs);

    return new Response(JSON.stringify({ success: true, certificate: newCert }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const certs = await request.json();
    if (!Array.isArray(certs)) {
      return new Response(JSON.stringify({ error: 'Expected array of certificates' }), { status: 400 });
    }
    saveCertificatesData(certs);
    return new Response(JSON.stringify({ success: true, certificates: certs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
