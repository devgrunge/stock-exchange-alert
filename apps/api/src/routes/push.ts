import type { FastifyInstance } from 'fastify';
import type { PushSubscriptionPayload } from '@repo/shared';
import type { PushService } from '../services/push-service';

export function pushRoutes(app: FastifyInstance, pushService: PushService): void {
  app.get('/push/public-key', async () => {
    return {
      publicKey: pushService.publicKey,
      configured: pushService.configured,
    };
  });

  app.post('/push/subscribe', async (request, reply) => {
    const body = request.body as PushSubscriptionPayload | undefined;
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return reply.code(400).send({ error: 'Invalid subscription payload' });
    }
    await pushService.subscribe(body);
    return { ok: true };
  });

  app.delete('/push/subscribe', async (request, reply) => {
    const body = request.body as { endpoint?: string } | undefined;
    if (!body?.endpoint) {
      return reply.code(400).send({ error: 'endpoint is required' });
    }
    await pushService.unsubscribe(body.endpoint);
    return { ok: true };
  });

  app.post('/push/test', async (request, reply) => {
    try {
      await pushService.sendTestToAll();
      return { ok: true };
    } catch (err) {
      return reply
        .code(500)
        .send({ error: err instanceof Error ? err.message : 'failed to send test push' });
    }
  });
}
