import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/auth';
import prisma from '../../lib/prisma';

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const templates = await prisma.weddingTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        rendererId: true,
      },
    });

    return new Response(JSON.stringify({ templates }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return new Response(JSON.stringify({ error: message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
