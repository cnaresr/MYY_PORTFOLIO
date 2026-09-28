import type { APIRoute } from 'astro';
import { getProjectsData, saveProjectsData } from '../../../lib/contentStore';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const projects = getProjectsData();
    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const newProject = await request.json();
    const projects = getProjectsData();

    if (!newProject.title) {
      return new Response(JSON.stringify({ error: 'Project title is required' }), { status: 400 });
    }

    const id = newProject.id || `proj-${Date.now().toString(36)}`;

    const defaultMetrics = [
      { label: 'Availability', value: '99.99%' },
      { label: 'Latency P99', value: '< 5ms' },
      { label: 'Scaling', value: 'Horizontal' },
    ];

    const projectToSave = {
      id,
      status: newProject.status || 'published',
      startDate: newProject.startDate || '2024',
      endDate: newProject.endDate || '2024',
      title: newProject.title,
      description: newProject.description || '',
      technologies: newProject.technologies || ['Astro', 'TypeScript', 'Tailwind'],
      githubUrl: newProject.githubUrl || 'https://github.com',
      image: newProject.image || '/images/project-veloce.jpg',
      abstract: newProject.abstract || 'Architectural specification for the system.',
      metrics: Array.isArray(newProject.metrics) && newProject.metrics.length > 0
        ? newProject.metrics
        : defaultMetrics,
    };

    projects.push(projectToSave);
    saveProjectsData(projects);

    return new Response(JSON.stringify({ success: true, project: projectToSave }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const updatedProjects = await request.json();
    if (!Array.isArray(updatedProjects)) {
      return new Response(JSON.stringify({ error: 'Expected an array of projects' }), { status: 400 });
    }
    saveProjectsData(updatedProjects);
    return new Response(JSON.stringify({ success: true, projects: updatedProjects }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
