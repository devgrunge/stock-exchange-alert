import { TRADING_END_HOUR, TRADING_START_HOUR } from '@repo/shared';
import { env } from './env';
import { evaluateAlerts } from './services/alert-service';
import { PushService } from './services/push-service';
import { QuoteService } from './services/quote-service';

interface BrazilTime {
  day: number; // 0 = Sunday ... 6 = Saturday
  hour: number;
  minute: number;
}

function brazilTime(now: Date): BrazilTime {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: env.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? '';

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    day: weekdays.indexOf(get('weekday')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
}

function isTradingTime(now: Date): boolean {
  const { day, hour, minute } = brazilTime(now);
  if (day === 0 || day === 6) return false; // weekend

  const minutes = hour * 60 + minute;
  const start = TRADING_START_HOUR * 60;
  const end = TRADING_END_HOUR * 60;
  return minutes >= start && minutes < end;
}

export function startScheduler(
  quoteService: QuoteService,
  pushService: PushService,
): NodeJS.Timeout {
  let running = false;

  async function tick(): Promise<void> {
    if (running) return;
    running = true;
    try {
      if (!isTradingTime(new Date())) return;

      const quotes = await quoteService.refresh();
      const events = evaluateAlerts(quotes);
      for (const event of events) {
        await pushService.sendAlert(event);
      }
    } catch (err) {
      console.error('[scheduler] tick failed:', err);
    } finally {
      running = false;
    }
  }

  // Run once shortly after boot (only refreshes during trading hours).
  void tick();

  return setInterval(tick, env.checkIntervalMs);
}
