import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

const jsonHeaders = { 'Content-Type': 'application/json' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

async function getOwnerSite(userId: string) {
  return prisma.weddingSite.findUnique({
    where: { userId },
    select: { id: true },
  });
}

export const GET: APIRoute = async (context) => {
  try {
    const session = await requireAuth(context);
    const weddingSite = await getOwnerSite(session.userId);

    if (!weddingSite) {
      return json({ wishes: [] });
    }

    const wishes = await prisma.weddingWish.findMany({
      where: { siteId: weddingSite.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        message: true,
        isApproved: true,
        createdAt: true,
      },
    });

    return json({ wishes });
  } catch (error) {
    console.error('Wedding wishes management fetch error:', error);
    return json({ error: 'Unauthorized' }, 401);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    const session = await requireAuth(context);
    const weddingSite = await getOwnerSite(session.userId);

    if (!weddingSite) {
      return json({ error: 'Wedding site not found' }, 404);
    }

    const body = await context.request.json();
    const wishId = typeof body.id === 'string' ? body.id.trim() : '';

    if (!wishId) {
      return json({ error: 'Wish id is required' }, 400);
    }

    const deleted = await prisma.weddingWish.deleteMany({
      where: {
        id: wishId,
        siteId: weddingSite.id,
      },
    });

    if (deleted.count === 0) {
      return json({ error: 'Wish not found' }, 404);
    }

    return json({ deleted: true, id: wishId });
  } catch (error) {
    console.error('Wedding wish management delete error:', error);
    return json({ error: 'Failed to delete wedding wish' }, 500);
  }
};
