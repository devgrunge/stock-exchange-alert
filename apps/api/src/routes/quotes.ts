import type { FastifyInstance } from 'fastify';
import type { QuoteService } from '../services/quote-service';

export function quoteRoutes(app: FastifyInstance, quoteService: QuoteService): void {
  app.get('/quotes', async (request) => {
    const { refresh } = request.query as { refresh?: string };
    if (refresh === '1' || refresh === 'true') {
      await quoteService.refresh();
    }
    return {
      quotes: quoteService.getLatest(),
      lastRefresh: quoteService.getLastRefresh()?.toISOString() ?? null,
    };
  });
}
