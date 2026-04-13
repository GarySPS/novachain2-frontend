import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next"; // ADD THIS

// Fake data
const usernames = ['User123', 'Satoshi21', 'CryptoQueen', 'ElonX', 'Whale9', 'GaryBTC', 'NovaVIP'];
const coins = ['BTC', 'ETH', 'SOL', 'XRP', 'TON'];

export default function TradeTicker() {
  const { t } = useTranslation(); // ADD THIS
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const generateMessage = () => {
      const user = usernames[Math.floor(Math.random() * usernames.length)];
      const coin = coins[Math.floor(Math.random() * coins.length)];
      const amount = (Math.random() * 1000 + 100).toFixed(2);

      setMessages(prev => [
        { id: Date.now() + Math.random(), user, amount, coin },
        ...prev.slice(0, 8)
      ]);
    };

    generateMessage();
    const interval = setInterval(generateMessage, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[#050505]/40 backdrop-blur-md rounded-xl border border-white/5 my-4">
      
      {/* LEFT FADE (Darker for Exfacto theme) */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />

      {/* RIGHT FADE */}
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap py-3 px-6 overflow-hidden">
        <AnimatePresence initial={false}>
          {messages.map(({ id, user, amount, coin }) => (
            <motion.span
              key={id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center mx-6 font-medium text-[13px] tracking-wide"
            >
              <span className="text-gray-400 mr-2">⚡</span>
              <span className="text-white font-bold">{user}</span>
              <span className="mx-2 text-gray-500">{t("won")}</span> {/* UPDATED */}
              <span className="text-emerald-400 font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">${amount}</span>
              <span className="mx-2 text-gray-500">{t("on")}</span> {/* UPDATED */}
              <span className="text-cyan-400 font-bold">{coin}/USDT</span>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}