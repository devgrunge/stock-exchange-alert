import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useQueryClient } from '@tanstack/react-query';
import { TICKERS } from '@repo/shared';
import { useAuth } from './hooks/useAuth';
import { useQuotes } from './hooks/useQuotes';
import { useConfig } from './hooks/useConfig';
import { usePush } from './hooks/usePush';
import { StockCard } from './components/StockCard';
import { ConfigPanel } from './components/ConfigPanel';
import { PushPanel } from './components/PushPanel';
import { LoginScreen } from './components/LoginScreen';
import { fetchQuotes } from './lib/api';

export default function App() {
  const { auth, login, logout } = useAuth();

  if (!auth) {
    return <LoginScreen onLogin={login} />;
  }

  return <Dashboard username={auth.username} onLogout={logout} />;
}

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

function Dashboard({ username, onLogout }: DashboardProps) {
  const queryClient = useQueryClient();
  const quotesQuery = useQuotes();
  const configQuery = useConfig();
  const push = usePush();

  const [refreshing, setRefreshing] = useState(false);

  async function refresh(): Promise<void> {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const data = await fetchQuotes(true);
      queryClient.setQueryData(['quotes'], data);
    } finally {
      setRefreshing(false);
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedDown: () => {
      // Pull-to-refresh: only trigger when the page is already at the top.
      if (window.scrollY <= 0) {
        void refresh();
      }
    },
    delta: 40,
  });

  const configs = configQuery.data?.config ?? [];

  return (
    <div className="mx-auto max-w-md px-4 py-6" {...swipeHandlers}>
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Stock Exchange Alert</h1>
        <span className="text-xs text-slate-400">deslize p/ baixo = atualizar</span>
      </header>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">logado como {username}</span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
        >
          Sair
        </button>
      </div>

      {refreshing && <div className="mt-2 text-xs text-indigo-400">Atualizando…</div>}

      <main className="mt-6 space-y-4">
        {TICKERS.map((ticker) => (
          <StockCard
            key={ticker}
            quote={quotesQuery.data?.quotes.find((q) => q.ticker === ticker)}
            config={configs.find((c) => c.ticker === ticker)}
          />
        ))}
      </main>

      <ConfigPanel configs={configs} />

      <section className="mt-6">
        <PushPanel push={push} />
      </section>

      <footer className="mt-8 text-center text-xs text-slate-500">
        {quotesQuery.data?.lastRefresh
          ? `Última atualização: ${new Date(quotesQuery.data.lastRefresh).toLocaleString('pt-BR')}`
          : 'Sem dados ainda'}
      </footer>
    </div>
  );
}
