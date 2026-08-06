import type { APIRoute } from 'astro';
import { z } from 'zod';
import { hashPassword } from '../../../lib/password';
import { requireSuperAdmin } from '../../../lib/auth';
import { adminErrorResponse } from '../../../lib/admin-api';
import prisma from '../../../lib/prisma';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['USER', 'SUPER_ADMIN']).default('USER'),
});

const userSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  weddingSite: {
    select: {
      id: true,
      slug: true,
      templateId: true,
      isPublished: true,
      brideName: true,
      groomName: true,
      updatedAt: true,
    },
  },
} as const;

export const GET: APIRoute = async (context) => {
  try {
    await requireSuperAdmin(context);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    });

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return adminErrorResponse(error, 'Failed to load users.');
  }
};

export const POST: APIRoute = async (context) => {
  try {
    await requireSuperAdmin(context);
    const body = createUserSchema.parse(await context.request.json());
    const email = body.email.trim().toLowerCase();

    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(body.password),
        role: body.role,
      },
      select: userSelect,
    });

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues[0]?.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return adminErrorResponse(error, 'Failed to create user.');
  }
};
