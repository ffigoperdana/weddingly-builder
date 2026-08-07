import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

const jsonHeaders = { 'Content-Type': 'application/json' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug;

    if (!slug) {
      return json({ error: 'Slug is required' }, 400);
    }

    const weddingSite = await prisma.weddingSite.findUnique({
      where: { slug },
      select: {
        id: true,
        isPublished: true,
        wishesEnabled: true,
        wishesDisplayEnabled: true,
      },
    });

    if (!weddingSite || !weddingSite.isPublished) {
      return json({ error: 'Wedding site not found' }, 404);
    }

    if (!weddingSite.wishesEnabled || !weddingSite.wishesDisplayEnabled) {
      return json({ wishes: [] });
    }

    const wishes = await prisma.weddingWish.findMany({
      where: {
        siteId: weddingSite.id,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        message: true,
        createdAt: true,
      },
    });

    return json({ wishes });
  } catch (error) {
    console.error('Wedding wishes fetch error:', error);
    return json({ error: 'Failed to fetch wedding wishes' }, 500);
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.slug;

    if (!slug) {
      return json({ error: 'Slug is required' }, 400);
    }

    const weddingSite = await prisma.weddingSite.findUnique({
      where: { slug },
      select: { id: true, isPublished: true, wishesEnabled: true },
    });

    if (!weddingSite || !weddingSite.isPublished) {
      return json({ error: 'Wedding site not found' }, 404);
    }

    if (!weddingSite.wishesEnabled) {
      return json({ error: 'Wedding wishes are disabled' }, 403);
    }

    const body = await request.json();
    const fullName =
      typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const message =
      typeof body.message === 'string' ? body.message.trim() : '';

    if (!fullName || !message) {
      return json({ error: 'Name and message are required' }, 400);
    }

    if (fullName.length > 100 || message.length > 500) {
      return json({ error: 'Name or message is too long' }, 400);
    }

    const wish = await prisma.weddingWish.create({
      data: {
        siteId: weddingSite.id,
        fullName,
        message,
        isApproved: true,
      },
      select: {
        id: true,
        fullName: true,
        message: true,
        createdAt: true,
      },
    });

    return json({ wish }, 201);
  } catch (error) {
    console.error('Wedding wish submission error:', error);
    return json({ error: 'Failed to submit wedding wish' }, 500);
  }
};
