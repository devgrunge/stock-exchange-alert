import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initDb } from './db';
import { env } from './env';
import { createProvider } from './providers';
import { QuoteService } from './services/quote-service';
import { PushService } from './services/push-service';
import { startScheduler } from './scheduler';
import { quoteRoutes } from './routes/quotes';
import { configRoutes } from './routes/config';
import { pushRoutes } from './routes/push';
import { healthRoutes } from './routes/health';

async function main(): Promise<void> {
  initDb();

  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });

  const quoteService = new QuoteService(createProvider());
  const pushService = new PushService();

  app.register((instance, _opts, done) => {
    quoteRoutes(instance, quoteService);
    configRoutes(instance);
    pushRoutes(instance, pushService);
    healthRoutes(instance);
    done();
  }, { prefix: '/api' });

  // Warm the quote cache on boot (regardless of trading hours).
  quoteService.refresh().catch((err) => {
    app.log.error(err, 'initial quote refresh failed');
  });

  startScheduler(quoteService, pushService);

  if (!pushService.configured) {
    app.log.warn('VAPID keys not set — Web Push notifications are disabled');
  }

  const address = await app.listen({ port: env.port, host: env.host });
  app.log.info(`API listening at ${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
