import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireSuperAdmin } from '../../../../lib/auth';
import { adminErrorResponse } from '../../../../lib/admin-api';
import { isWeddingTemplateId } from '../../../../lib/templates';
import prisma from '../../../../lib/prisma';

const updateSiteSchema = z
  .object({
    templateId: z.string().refine(isWeddingTemplateId, 'Invalid template.'),
    isPublished: z.boolean().optional(),
    slug: z
      .string()
      .min(3)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug.')
      .optional(),
  })
  .strict();

export const PUT: APIRoute = async (context) => {
  try {
    await requireSuperAdmin(context);
    const id = context.params.id;
    if (!id) throw new Error('Site id is required.');

    const body = updateSiteSchema.parse(await context.request.json());
    const site = await prisma.weddingSite.update({
      where: { id },
      data: body,
      select: {
        id: true,
        slug: true,
        isPublished: true,
        templateId: true,
        brideName: true,
        groomName: true,
        weddingDate: true,
        updatedAt: true,
        user: { select: { id: true, email: true, isActive: true } },
      },
    });

    return new Response(JSON.stringify({ site }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues[0]?.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return adminErrorResponse(error, 'Failed to update wedding site.');
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireSuperAdmin(context);
    const id = context.params.id;
    if (!id) throw new Error('Site id is required.');

    await prisma.weddingSite.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return adminErrorResponse(error, 'Failed to delete wedding site.');
  }
};
