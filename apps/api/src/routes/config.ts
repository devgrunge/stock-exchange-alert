import type { FastifyInstance } from 'fastify';
import { isTicker } from '@repo/shared';
import type { AssetConfig } from '@repo/shared';
import { getConfig, updateConfig } from '../db';

export function configRoutes(app: FastifyInstance): void {
  app.get('/config', async () => {
    return { config: getConfig() };
  });

  app.put('/config/:ticker', async (request, reply) => {
    const { ticker } = request.params as { ticker: string };
    if (!isTicker(ticker)) {
      return reply.code(400).send({ error: `Unknown ticker: ${ticker}` });
    }

    const body = request.body as Partial<Omit<AssetConfig, 'ticker'>> | undefined;
    if (!body || typeof body !== 'object') {
      return reply.code(400).send({ error: 'Request body is required' });
    }

    const updated = updateConfig(ticker, body);
    return { config: updated };
  });
}
