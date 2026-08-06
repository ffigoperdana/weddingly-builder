import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireSuperAdmin } from '../../../../lib/auth';
import { adminErrorResponse } from '../../../../lib/admin-api';
import { hashPassword } from '../../../../lib/password';
import prisma from '../../../../lib/prisma';

const updateUserSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(['USER', 'SUPER_ADMIN']).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

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

export const PUT: APIRoute = async (context) => {
  try {
    const currentUser = await requireSuperAdmin(context);
    const id = context.params.id;
    if (!id) throw new Error('User id is required.');

    const body = updateUserSchema.parse(await context.request.json());
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });

    if (!target) {
      return new Response(JSON.stringify({ error: 'User not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const demotingOrDeactivatingAdmin =
      target.role === 'SUPER_ADMIN' &&
      (body.role === 'USER' || body.isActive === false);

    if (
      currentUser.userId === id &&
      (body.role === 'USER' || body.isActive === false)
    ) {
      return new Response(
        JSON.stringify({ error: 'You cannot remove your own super admin access.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (demotingOrDeactivatingAdmin) {
      const activeSuperAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });

      if (activeSuperAdminCount <= 1) {
        return new Response(
          JSON.stringify({ error: 'At least one active super admin is required.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }

    const data: {
      email?: string;
      password?: string;
      role?: 'USER' | 'SUPER_ADMIN';
      isActive?: boolean;
    } = {};

    if (body.email) data.email = body.email.trim().toLowerCase();
    if (body.password) data.password = await hashPassword(body.password);
    if (body.role) data.role = body.role;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return new Response(JSON.stringify({ user }), {
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
    return adminErrorResponse(error, 'Failed to update user.');
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    const currentUser = await requireSuperAdmin(context);
    const id = context.params.id;
    if (!id) throw new Error('User id is required.');

    if (currentUser.userId === id) {
      return new Response(
        JSON.stringify({ error: 'You cannot delete your own account.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!target) {
      return new Response(JSON.stringify({ error: 'User not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (target.role === 'SUPER_ADMIN') {
      const activeSuperAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });

      if (activeSuperAdminCount <= 1) {
        return new Response(
          JSON.stringify({ error: 'At least one active super admin is required.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }

    await prisma.user.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return adminErrorResponse(error, 'Failed to delete user.');
  }
};
