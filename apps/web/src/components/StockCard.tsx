import type { AssetConfig, Quote } from '@repo/shared';

interface StockCardProps {
  quote?: Quote;
  config?: AssetConfig;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function StockCard({ quote, config }: StockCardProps) {
  const ticker = quote?.ticker ?? config?.ticker ?? '—';

  const changeFromOpen =
    quote?.open != null && quote.open > 0 ? (quote.price / quote.open - 1) * 100 : null;
  const changePositive = (changeFromOpen ?? 0) >= 0;

  const dropTriggered =
    quote?.open != null && quote.open > 0 && quote.price <= quote.open * 0.9;
  const riseTriggered =
    quote?.open != null && quote.open > 0 && quote.price >= quote.open * 1.1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{ticker}</h2>
        {changeFromOpen != null && (
          <span
            className={`text-sm font-medium ${changePositive ? 'text-green-400' : 'text-red-400'}`}
          >
            {changeFromOpen >= 0 ? '+' : ''}
            {changeFromOpen.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="mt-3 text-3xl font-bold tabular-nums">
        {quote ? formatBRL(quote.price) : '—'}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-slate-400">
        <div className="flex justify-between">
          <span>Abertura</span>
          <span className="tabular-nums">
            {quote?.open != null ? formatBRL(quote.open) : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Variação no dia</span>
          <span className="tabular-nums">
            {changeFromOpen != null ? `${changeFromOpen >= 0 ? '+' : ''}${changeFromOpen.toFixed(2)}%` : '—'}
          </span>
        </div>
      </div>

      {(dropTriggered || riseTriggered) && (
        <div className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
          {dropTriggered && '📉 Queda de 10% no dia'}
          {dropTriggered && riseTriggered && ' · '}
          {riseTriggered && '📈 Alta de 10% no dia'}
        </div>
      )}
    </div>
  );
}
