import React from 'react';
import { Link } from 'react-router-dom';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-[#1a1d1f] text-slate-300 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-800/40 rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl">
        <div className="mb-6">
          <Link to="/" className="text-sky-400 hover:text-sky-300 hover:underline text-sm font-bold">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">Contact Us</h1>
        <p className="mb-8 text-sm text-slate-400">Our support team is available 24/7 to assist you.</p>
        
        <div className="space-y-8 text-sm md:text-base">
          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-3">Official Support Channels</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/16627053615"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl px-4 py-3 text-center font-bold text-white bg-[#25D366] hover:bg-[#22b95f] transition shadow"
              >
                Message on WhatsApp
              </a>
              <a
                href="https://t.me/novachainsingapore"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl px-4 py-3 text-center font-bold text-white bg-[#229ED9] hover:bg-[#178fca] transition shadow"
              >
                Join our Telegram
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-3">Email Support</h2>
            <p className="text-slate-300">
              For account issues, KYC verification, or general inquiries, please email us directly at:{' '}
              <a href="mailto:support@novachain.com" className="text-sky-400 hover:underline font-bold">
                support@novachain.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold text-white mb-3">Business Address</h2>
            <p className="text-slate-400 text-sm">
              NovaChain Technologies Ltd.<br />
              12 Marina Boulevard, Marina Bay Financial Centre<br />
              Singapore 018982
            </p>
            <p className="text-xs text-slate-500 mt-2 italic">
              * Note: This address is for legal and regulatory purposes. In-person support is not available at this location.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}