'use client';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import BayanihanFund from '@/components/BayanihanFund';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>
      
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-2xl px-6 py-16 relative z-10">
        <header className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-100 drop-shadow-sm mb-2">
              Bayanihan Fund
            </h1>
            <p className="text-emerald-100/70 text-sm md:text-base font-medium uppercase tracking-widest">
              Community Crowdfund on Stellar
            </p>
          </div>
          <ConnectWallet {...wallet} />
        </header>

        {!publicKey && !connecting && (
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20">
            <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <svg className="w-12 h-12 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Connect to Contribute</h2>
            <p className="text-emerald-100/60 max-w-sm mx-auto leading-relaxed">
              Link your Freighter wallet to view the community tracker and make a secure on-chain donation.
            </p>
          </div>
        )}

        {publicKey && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-xl transition-colors hover:bg-white/10">
                 <FundAccount publicKey={publicKey} onFunded={refresh} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-xl transition-colors hover:bg-white/10">
                 <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="relative rounded-3xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl p-8 shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)]">1</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Send the Funds</h3>
                    <p className="text-sm text-emerald-100/60">Donate directly to the beneficiary.</p>
                  </div>
                </div>
                <SendPayment publicKey={publicKey} onSent={refresh} />
              </div>
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl transition-opacity opacity-50 group-hover:opacity-100"></div>
               <div className="relative rounded-3xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl p-8 shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)]">2</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Log your Contribution</h3>
                    <p className="text-sm text-blue-100/60">Update the smart contract tracker.</p>
                  </div>
                </div>
                <BayanihanFund publicKey={publicKey} />
              </div>
            </div>

          </div>
        )}

        <footer className="mt-24 text-center text-xs font-medium text-white/30 tracking-[0.2em] uppercase">
          <p>Built on Stellar • For the Community</p>
        </footer>
      </div>
    </main>
  );
}
