import { env } from '../env';
import { BrapiProvider } from './brapi';
import type { QuoteProvider } from './quote-provider';

export function createProvider(): QuoteProvider {
  return new BrapiProvider(env.brapiToken, env.brapiBaseUrl);
}

export type { QuoteProvider } from './quote-provider';
