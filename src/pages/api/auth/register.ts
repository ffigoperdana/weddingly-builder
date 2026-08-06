import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      error: 'Public registration is disabled. Ask the super admin to create your account.',
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
