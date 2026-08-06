import { AuthError } from './auth';

export function adminErrorResponse(
  error: unknown,
  fallbackMessage: string,
): Response {
  if (error instanceof AuthError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    return new Response(
      JSON.stringify({ error: 'A record with that value already exists.' }),
      {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  console.error(fallbackMessage, error);
  return new Response(JSON.stringify({ error: fallbackMessage }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
