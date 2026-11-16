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
  const [dropEnabled, setDropEnabled] = useState(config?.dropAlertEnabled ?? true);
  const [riseEnabled, setRiseEnabled] = useState(config?.riseAlertEnabled ?? true);

  if (!config) return null;

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    onSave({
      dropAlertEnabled: dropEnabled,
      riseAlertEnabled: riseEnabled,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="font-semibold">{config.ticker}</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Dispara quando o preço varia ±10% em relação à abertura do dia.
      </p>

      <div className="mt-3 flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={dropEnabled}
            onChange={(e) => setDropEnabled(e.target.checked)}
          />
          Alerta de queda (−10%)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={riseEnabled}
            onChange={(e) => setRiseEnabled(e.target.checked)}
          />
          Alerta de alta (+10%)
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
