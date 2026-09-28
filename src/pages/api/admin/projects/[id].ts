import type { APIRoute } from 'astro';
import { getProjectsData, saveProjectsData } from '../../../../lib/contentStore';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const projects = getProjectsData();

    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    projects[index] = { ...projects[index], ...body, id };
    saveProjectsData(projects);

    return new Response(JSON.stringify({ success: true, project: projects[index] }), {
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
    const projects = getProjectsData();

    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    saveProjectsData(filtered);
    return new Response(JSON.stringify({ success: true, remaining: filtered.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
