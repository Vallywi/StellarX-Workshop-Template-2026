'use client';
import { useState } from 'react';
import {
  buildPaymentXDR,
  submitSignedXDR,
  pollTransaction,
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

type Status = 'idle' | 'building' | 'signing' | 'submitting' | 'polling' | 'success' | 'error';

const STATUS_LABEL: Record<Status, string> = {
  idle: 'Send Donation',
  building: 'Building transaction…',
  signing: 'Waiting for Freighter…',
  submitting: 'Submitting…',
  polling: 'Confirming on-chain…',
  success: 'Send Another Donation',
  error: 'Try Again',
};

export default function SendPayment({
  publicKey,
  onSent,
}: {
  publicKey: string;
  onSent: () => void;
}) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const busy = ['building', 'signing', 'submitting', 'polling'].includes(status);

  const handleSend = async () => {
    setStatus('building');
    setErrorMsg('');
    setTxHash('');
    try {
      const xdr = await buildPaymentXDR(publicKey, destination.trim(), amount, 'XLM');
      setStatus('signing');
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing was rejected');
      }
      setStatus('submitting');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      setTxHash(hash);
      setStatus('polling');
      await pollTransaction(hash);
      setStatus('success');
      onSent();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Donation failed');
      setStatus('error');
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Beneficiary Address
          </label>
          <input
            type="text"
            placeholder="G... (The family's Stellar account)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 font-mono text-sm text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Donation Amount (XLM)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-emerald-500/50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-4 py-3.5 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
            />
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={busy || !destination || !amount}
          className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:from-emerald-400 hover:to-teal-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="relative z-10 text-shadow-sm">{STATUS_LABEL[status]}</span>
        </button>
      </div>

      {status === 'success' && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-emerald-300">Donation Confirmed! Thank you.</p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-400/80 hover:text-emerald-300 hover:underline transition-colors block mt-1"
              >
                View on Stellar Expert →
              </a>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 backdrop-blur-md animate-in fade-in">
          <p className="text-sm font-medium text-red-400">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
