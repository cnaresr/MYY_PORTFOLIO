import type { APIRoute } from 'astro';
import {
  getSkillsData,
  saveSkillsData,
  getTechStackData,
  saveTechStackData,
} from '../../../lib/contentStore';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const skills = getSkillsData();
    const techStack = getTechStackData();
    return new Response(JSON.stringify({ skills, techStack }), {
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
    if (body.skills) {
      saveSkillsData(body.skills);
    }
    if (body.techStack) {
      saveTechStackData(body.techStack);
    }
    return new Response(
      JSON.stringify({
        success: true,
        skills: getSkillsData(),
        techStack: getTechStackData(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
