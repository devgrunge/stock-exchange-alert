import { useState } from 'react';
import type { AssetConfig } from '@repo/shared';
import { TICKERS } from '@repo/shared';
import { useSaveConfig } from '../hooks/useConfig';

interface ConfigPanelProps {
  configs: AssetConfig[];
}

export function ConfigPanel({ configs }: ConfigPanelProps) {
  const [open, setOpen] = useState(false);
  const save = useSaveConfig();

  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left font-medium"
      >
        ⚙️ Configurar alertas {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {TICKERS.map((ticker) => {
            const config = configs.find((c) => c.ticker === ticker);
            return (
              <AssetForm
                key={ticker}
                config={config}
                saving={save.isPending}
                onSave={(patch) => save.mutate({ ticker, patch })}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

interface AssetFormProps {
  config?: AssetConfig;
  saving: boolean;
  onSave: (patch: Partial<AssetConfig>) => void;
}

function AssetForm({ config, saving, onSave }: AssetFormProps) {
  const [purchase, setPurchase] = useState(config?.purchasePrice?.toString() ?? '');
  const [target, setTarget] = useState(config?.targetPrice?.toString() ?? '');
  const [dropEnabled, setDropEnabled] = useState(config?.dropAlertEnabled ?? true);
  const [targetEnabled, setTargetEnabled] = useState(config?.targetAlertEnabled ?? true);

  if (!config) return null;

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    onSave({
      purchasePrice: purchase === '' ? null : Number(purchase),
      targetPrice: target === '' ? null : Number(target),
      dropAlertEnabled: dropEnabled,
      targetAlertEnabled: targetEnabled,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-800 bg-slate-900 p-4"
    >
      <h3 className="font-semibold">{config.ticker}</h3>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-slate-400">Preço de compra</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={purchase}
            onChange={(e) => setPurchase(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            placeholder="0,00"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Preço-alvo</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            placeholder="0,00"
          />
        </label>
      </div>

      <div className="mt-3 flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={dropEnabled}
            onChange={(e) => setDropEnabled(e.target.checked)}
          />
          Alerta de queda
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={targetEnabled}
            onChange={(e) => setTargetEnabled(e.target.checked)}
          />
          Alerta de alvo
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  );
}
