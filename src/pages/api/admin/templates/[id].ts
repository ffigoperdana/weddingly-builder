import type { APIRoute } from 'astro';
import { requireSuperAdmin } from '../../../../lib/auth';
import { adminErrorResponse } from '../../../../lib/admin-api';
import prisma from '../../../../lib/prisma';

export const DELETE: APIRoute = async (context) => {
  try {
    await requireSuperAdmin(context);
    const id = context.params.id;
    if (!id) throw new Error('Template id is required.');

    const template = await prisma.weddingTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return new Response(JSON.stringify({ error: 'Template not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const siteCount = await prisma.weddingSite.count({
      where: { templateId: id },
    });

    if (siteCount > 0) {
      await prisma.weddingTemplate.update({
        where: { id },
        data: { isActive: false },
      });

      return new Response(
        JSON.stringify({
          success: true,
          archived: true,
          message: 'Template is still in use, so it was archived instead of deleted.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    await prisma.weddingTemplate.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true, archived: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return adminErrorResponse(error, 'Failed to delete template.');
  }
};
