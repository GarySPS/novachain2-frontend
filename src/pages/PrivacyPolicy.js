import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#1a1d1f] text-slate-300 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-800/40 rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl">
        <div className="mb-6">
          <Link to="/" className="text-sky-400 hover:text-sky-300 hover:underline text-sm font-bold">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="mb-8 text-sm text-slate-400">Last updated: March 2026</p>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">1. Information We Collect</h2>
            <p>NovaChain collects personal information required to comply with global regulatory standards, including your name, email address, identification documents (KYC), and transaction history.</p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">2. How We Use Your Information</h2>
            <p>Your data is used strictly for account management, processing trades, enhancing platform security, and meeting legal obligations. We do not sell your personal data to third-party marketers.</p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">3. Data Security</h2>
            <p>We implement institutional-grade security protocols, including end-to-end encryption and secure database management, to protect your personal and financial data from unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-2">4. Your Rights</h2>
            <p>You retain the right to request access to, correction of, or deletion of your personal data. For privacy-related inquiries, please reach out via our official contact channels.</p>
          </section>
        </div>
      </div>
    </div>
  );
}