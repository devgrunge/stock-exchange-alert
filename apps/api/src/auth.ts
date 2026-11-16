import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import { authConfigured, env } from './env';

export async function registerJwt(app: FastifyInstance): Promise<void> {
  await app.register(jwt, {
    // A fallback secret keeps the plugin registered even before the real
    // JWT_SECRET is configured (login will still be rejected until then).
    secret: env.jwtSecret || 'insecure-dev-secret',
    sign: { expiresIn: env.jwtExpiresIn },
  });
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

export function authRoutes(app: FastifyInstance): void {
  app.post('/auth/login', async (request, reply) => {
    const body = request.body as { username?: string; password?: string } | undefined;
    const username = body?.username ?? '';
    const password = body?.password ?? '';

    if (!authConfigured) {
      return reply.code(503).send({ error: 'Authentication is not configured' });
    }

    const valid =
      username === env.authUsername &&
      (await bcrypt.compare(password, env.authPasswordHash));

    if (!valid) {
      return reply.code(401).send({ error: 'Invalid username or password' });
    }

    return { token: app.jwt.sign({ username }), username };
  });
}
