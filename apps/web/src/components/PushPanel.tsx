import type { usePush } from '../hooks/usePush';

type Push = ReturnType<typeof usePush>;

const LABELS: Record<Push['status'], string> = {
  unsupported: 'Web Push não suportado neste navegador',
  denied: 'Permissão de notificação negada',
  disabled: 'Notificações desativadas',
  subscribed: 'Notificações ativas',
  error: 'Erro ao configurar notificações',
  'not-configured': 'Push não configurado no servidor (faltam as chaves VAPID)',
};

export function PushPanel({ push }: { push: Push }) {
  const { status } = push;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="font-semibold">Notificações</h3>
      <p className="mt-0.5 text-xs text-slate-400">{LABELS[status]}</p>
      {push.error && <p className="mt-0.5 text-xs text-red-400">{push.error}</p>}

      <div className="mt-3 flex gap-2">
        {status !== 'subscribed' && status !== 'unsupported' && (
          <button
            type="button"
            onClick={() => void push.enable()}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Ativar
          </button>
        )}

        {status === 'subscribed' && (
          <>
            <button
              type="button"
              onClick={() => void push.test()}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
            >
              Testar
            </button>
            <button
              type="button"
              onClick={() => void push.disable()}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700"
            >
              Desativar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
