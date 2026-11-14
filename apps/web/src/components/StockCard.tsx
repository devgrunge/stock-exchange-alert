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
  const changePositive = (quote?.changePercent ?? 0) >= 0;
  const dropTriggered =
    config?.purchasePrice != null && quote != null && quote.price <= config.purchasePrice * 0.9;
  const targetTriggered =
    config?.targetPrice != null && quote != null && quote.price >= config.targetPrice * 0.98;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{ticker}</h2>
        {quote && (
          <span
            className={`text-sm font-medium ${changePositive ? 'text-green-400' : 'text-red-400'}`}
          >
            {quote.changePercent >= 0 ? '+' : ''}
            {quote.changePercent.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="mt-3 text-3xl font-bold tabular-nums">
        {quote ? formatBRL(quote.price) : '—'}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-slate-400">
        <div className="flex justify-between">
          <span>Preço de compra</span>
          <span className="tabular-nums">
            {config?.purchasePrice != null ? formatBRL(config.purchasePrice) : 'não definido'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Alvo</span>
          <span className="tabular-nums">
            {config?.targetPrice != null ? formatBRL(config.targetPrice) : 'não definido'}
          </span>
        </div>
      </div>

      {(dropTriggered || targetTriggered) && (
        <div className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
          {dropTriggered && '⚠️ Queda de 10% detectada'}
          {dropTriggered && targetTriggered && ' · '}
          {targetTriggered && '🎯 Próximo do alvo'}
        </div>
      )}
    </div>
  );
}
