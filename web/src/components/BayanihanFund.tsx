'use client';
import { useState, useEffect, useCallback } from 'react';
import { contractConfigured, readFundState, buildContributeXDR, type FundState } from '@/lib/contract';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function BayanihanFund({ publicKey }: { publicKey: string | null }) {
  const configured = contractConfigured();
  const [state, setState] = useState<FundState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError('');
    try {
      setState(await readFundState());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to read contract');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const contribute = async () => {
    if (!publicKey) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const xdr = await buildContributeXDR(publicKey, Number(amount));
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing was rejected');
      }
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      setMsg('Contribution recorded on-chain!');
      setAmount('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Contribution failed');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-white/40 font-medium">Contract not configured. Set ID in .env.local</p>
      </div>
    );
  }

  const pct = state && state.target > 0 ? Math.min(100, Math.round((state.raised / state.target) * 100)) : 0;

  return (
    <div className="w-full">
      {loading && <p className="text-sm font-medium text-blue-300/60 animate-pulse mb-4">Syncing with Soroban…</p>}

      {!loading && state && (
        <div className="space-y-8">
          <div className="relative">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs font-bold text-blue-300/80 uppercase tracking-widest mb-1">Total Raised</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{state.raised}</span>
                  <span className="text-lg font-bold text-blue-300/60">XLM</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-blue-300/80 uppercase tracking-widest mb-1">Goal</p>
                <span className="text-2xl font-bold text-white/80">{state.target}</span>
              </div>
            </div>
            
            <div className="h-5 w-full overflow-hidden rounded-full bg-black/50 border border-white/5 p-1 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 relative overflow-hidden transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                style={{ width: `${pct}%` }}
              >
              </div>
            </div>
            
            <div className="mt-3 text-right">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-sm font-bold text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                {pct}% Completed
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <label className="mb-3 block text-xs font-bold text-blue-300 uppercase tracking-wider">
              Amount to Log
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="number"
                placeholder="0.00 XLM"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
              />
              <button
                onClick={contribute}
                disabled={busy || !publicKey || !amount}
                className="sm:w-auto w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
              >
                {busy ? 'Syncing...' : 'Log on Soroban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <p className="font-bold text-blue-300">{msg}</p>
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 backdrop-blur-md animate-in fade-in">
          <p className="text-sm font-medium text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
