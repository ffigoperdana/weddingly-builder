import type { APIRoute } from 'astro';
import { requireSuperAdmin } from '../../../lib/auth';
import { adminErrorResponse } from '../../../lib/admin-api';
import prisma from '../../../lib/prisma';

export const GET: APIRoute = async (context) => {
  try {
    await requireSuperAdmin(context);

    const [
      userCount,
      activeUserCount,
      siteCount,
      publishedSiteCount,
      usage,
      templates,
    ] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.weddingSite.count(),
        prisma.weddingSite.count({ where: { isPublished: true } }),
        prisma.weddingSite.groupBy({
          by: ['templateId'],
          _count: { _all: true },
        }),
        prisma.weddingTemplate.findMany({
          orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
        }),
      ]);

    return new Response(
      JSON.stringify({
        stats: {
          userCount,
          activeUserCount,
          siteCount,
          publishedSiteCount,
        },
        templates: templates.map((template) => ({
          ...template,
          siteCount:
            usage.find((item) => item.templateId === template.id)?._count
              ._all ?? 0,
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return adminErrorResponse(error, 'Failed to load admin overview.');
  }
};
