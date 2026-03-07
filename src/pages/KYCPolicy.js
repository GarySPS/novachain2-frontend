import React from 'react';
import { Link } from 'react-router-dom';

export default function KYCPolicy() {
  return (
    <div className="min-h-screen bg-[#1a1d1f] text-slate-300 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-800/40 rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl">
        <div className="mb-6">
          <Link to="/" className="text-sky-400 hover:text-sky-300 hover:underline text-sm font-bold">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">AML & KYC Policy</h1>
        <p className="mb-8 text-sm text-slate-400">Anti-Money Laundering and Know Your Customer Compliance.</p>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">1. Overview</h2>
            <p>NovaChain strictly adheres to global Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) regulations to ensure a safe, secure, and compliant trading environment for all users.</p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">2. Identity Verification (KYC)</h2>
            <p>To access full trading features, withdrawals, and high-limit deposits, users must complete our Identity Verification process. This requires submitting a valid government-issued ID and a recent proof of address.</p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">3. Transaction Monitoring</h2>
            <p>We actively monitor platform activity for suspicious transactions. NovaChain reserves the right to suspend accounts or delay withdrawals if unusual activity is detected, pending further verification.</p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">4. Prohibited Jurisdictions</h2>
            <p>NovaChain does not offer services to residents of restricted jurisdictions subject to international sanctions. Users are responsible for ensuring their use of the platform is legal in their home country.</p>
          </section>
        </div>
      </div>
    </div>
  );
}