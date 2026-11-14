import webpush from 'web-push';
import type { AlertEvent, PushSubscriptionPayload } from '@repo/shared';
import { addSubscription, listSubscriptions, removeSubscription } from '../db';
import { env, pushConfigured } from '../env';

interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushService {
  constructor() {
    if (pushConfigured) {
      webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
    }
  }

  get configured(): boolean {
    return pushConfigured;
  }

  get publicKey(): string {
    return env.vapidPublicKey;
  }

  async subscribe(payload: PushSubscriptionPayload): Promise<void> {
    addSubscription(payload);
  }

  async unsubscribe(endpoint: string): Promise<void> {
    removeSubscription(endpoint);
  }

  async sendAlert(event: AlertEvent): Promise<void> {
    if (!pushConfigured) return;

    const title =
      event.kind === 'drop'
        ? `📉 ${event.ticker} em queda`
        : `🎯 ${event.ticker} próximo do alvo`;

    await this.broadcast({ title, body: event.message, tag: `${event.ticker}-${event.kind}` });
  }

  async sendTestToAll(): Promise<void> {
    if (!pushConfigured) {
      throw new Error('Web Push is not configured (VAPID keys missing)');
    }
    await this.broadcast({
      title: '✅ Stock Exchange Alert',
      body: 'Notificação de teste enviada com sucesso!',
      tag: 'test',
    });
  }

  private async broadcast(payload: { title: string; body: string; tag: string }): Promise<void> {
    const subs = listSubscriptions();
    if (subs.length === 0) return;

    const results = await Promise.allSettled(
      subs.map((sub) => {
        const subscription: WebPushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };
        return webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 3600 });
      }),
    );

    // Clean up subscriptions that the push service rejected (e.g. expired).
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        removeSubscription(subs[index].endpoint);
      }
    });
  }
}
