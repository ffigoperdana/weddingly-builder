import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { isWeddingTemplateId } from '../../../lib/templates';

interface EventData {
  title: string;
  date: string | Date;
  time: string;
  location: string;
  address: string;
}

export const GET: APIRoute = async (context) => {
  try {
    const session = await requireAuth(context);

    const weddingSite = await prisma.weddingSite.findUnique({
      where: { userId: session.userId },
      include: {
        events: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return new Response(JSON.stringify({ weddingSite }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unauthorized';
    return new Response(JSON.stringify({ error: message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const session = await requireAuth(context);
    const data = await context.request.json();

    const {
      events,
      templateId,
      slug: requestedSlug,
      id: _ignoredId,
      userId: _ignoredUserId,
      createdAt: _ignoredCreatedAt,
      updatedAt: _ignoredUpdatedAt,
      ...siteData
    } = data;
    const requestedTemplate = isWeddingTemplateId(templateId)
      ? templateId
      : 'classic';
    const activeTemplate = await prisma.weddingTemplate.findFirst({
      where: { id: requestedTemplate, isActive: true },
      select: { id: true },
    });
    const selectedTemplate = activeTemplate?.id ?? 'classic';

    const requestedSlugValue =
      typeof requestedSlug === 'string' ? requestedSlug.trim() : '';

    // Save the site and its events atomically. The previous implementation
    // returned the site before replacing an empty event list and allowed
    // client-only fields to be spread into the write. Returning a fresh read
    // here also guarantees that the dashboard receives the exact published
    // snapshot that the guest page will read.
    const weddingSite = await prisma.$transaction(async (tx) => {
      const existingSite = await tx.weddingSite.findUnique({
        where: { userId: session.userId },
        select: { id: true, slug: true },
      });

      const savedSite = existingSite
        ? await tx.weddingSite.update({
            where: { id: existingSite.id },
            data: {
              ...siteData,
              slug: requestedSlugValue || existingSite.slug,
              templateId: selectedTemplate,
              weddingDate: siteData.weddingDate
                ? new Date(siteData.weddingDate)
                : null,
            },
          })
        : await tx.weddingSite.create({
            data: {
              userId: session.userId,
              ...siteData,
              slug: requestedSlugValue || `wedding-${Date.now()}`,
              templateId: selectedTemplate,
              weddingDate: siteData.weddingDate
                ? new Date(siteData.weddingDate)
                : null,
            },
          });

      if (Array.isArray(events)) {
        await tx.event.deleteMany({
          where: { siteId: savedSite.id },
        });

        if (events.length > 0) {
          await tx.event.createMany({
            data: events.map((event: EventData, index: number) => ({
              siteId: savedSite.id,
              title: event.title,
              date: new Date(event.date),
              time: event.time,
              location: event.location,
              address: event.address,
              order: index,
            })),
          });
        }
      }

      return tx.weddingSite.findUnique({
        where: { id: savedSite.id },
        include: {
          events: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    if (!weddingSite) {
      throw new Error('Wedding site could not be loaded after saving');
    }

    return new Response(JSON.stringify({ weddingSite }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to save wedding site';
    console.error('Wedding site save error:', error);
    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
