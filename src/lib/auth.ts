import type { APIContext } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { UserRole } from '@prisma/client';
import prisma from './prisma';
import { hashPassword, verifyPassword } from './password';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface Session {
  userId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403 = 401,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

function getSessionSecret(): string {
  const configuredSecret = import.meta.env.SESSION_SECRET;

  if (configuredSecret) return configuredSecret;
  if (import.meta.env.PROD) {
    throw new Error('SESSION_SECRET must be configured in production');
  }

  return 'weddingly-local-session-secret-change-me';
}

function signSession(payload: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
}

function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${signSession(payload)}`;
}

function decodeSession(value: string): Session | null {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = signSession(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as Session;

    if (
      !session.userId ||
      !session.email ||
      !session.expiresAt ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new AuthError('User is not active');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  return encodeSession({
    userId,
    email: user.email,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_SECONDS,
  });
}

export function getSession(context: APIContext): Session | null {
  const sessionCookie = context.cookies.get('session')?.value;
  if (!sessionCookie) return null;

  return decodeSession(sessionCookie);
}

export async function getCurrentUser(
  context: APIContext,
): Promise<AuthenticatedUser | null> {
  const session = getSession(context);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

export async function requireAuth(
  context: APIContext,
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser(context);
  if (!user) throw new AuthError('Unauthorized');
  return user;
}

export async function requireSuperAdmin(
  context: APIContext,
): Promise<AuthenticatedUser> {
  const user = await requireAuth(context);
  if (user.role !== 'SUPER_ADMIN') {
    throw new AuthError('Super admin access required', 403);
  }
  return user;
}

export async function login(
  email: string,
  password: string,
): Promise<{ userId: string; email: string; role: UserRole } | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || !user.isActive) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  if (!user.password.startsWith('scrypt$')) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(password) },
    });
  }

  return { userId: user.id, email: user.email, role: user.role };
}

export async function register(email: string, password: string) {
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'USER',
    },
    select: { id: true, email: true, role: true },
  });

  return { userId: user.id, email: user.email, role: user.role };
}
