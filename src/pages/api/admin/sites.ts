import type { APIRoute } from 'astro';
import { requireSuperAdmin } from '../../../lib/auth';
import { adminErrorResponse } from '../../../lib/admin-api';
import prisma from '../../../lib/prisma';

export const GET: APIRoute = async (context) => {
  try {
    await requireSuperAdmin(context);

    const sites = await prisma.weddingSite.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        templateId: true,
        brideName: true,
        groomName: true,
        weddingDate: true,
        updatedAt: true,
        user: {
          select: { id: true, email: true, isActive: true },
        },
      },
    });

    return new Response(JSON.stringify({ sites }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return adminErrorResponse(error, 'Failed to load wedding sites.');
  }
};
