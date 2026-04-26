import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './icon';

export default function AIPerformance({ totalEarnUsd, currentEarnRate }) {
  const { t } = useTranslation();
  
  // Performance state with realistic starting values
  const [performance, setPerformance] = useState({
    totalTrades: 1247,
    totalProfit: 28450,
    avgResponseTime: 0.3,
    winRate: 98.2,
    lastUpdate: new Date(),
    dailyChange: 0
  });
  
  // Animation refs
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Generate realistic random changes
  const generateRandomChange = () => {
    // Random time between 3-8 seconds
    const interval = 3000 + Math.random() * 5000;
    
    animationRef.current = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastUpdate = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;
      
      setPerformance(prev => {
        // Randomly decide what to update (60% new trade, 30% profit update, 10% win rate update)
        const updateType = Math.random();
        
        let newTrades = prev.totalTrades;
        let newProfit = prev.totalProfit;
        let newWinRate = prev.winRate;
        let newResponseTime = prev.avgResponseTime;
        
        if (updateType < 0.6) { // New trade executed
          // Random trade amount between $50 and $5000 based on totalEarnUsd
          const maxTradeAmount = Math.min(5000, Math.max(50, totalEarnUsd * 0.02));
          const tradeAmount = 50 + Math.random() * (maxTradeAmount - 50);
          
          // 98% win rate chance
          const isWin = Math.random() < (prev.winRate / 100);
          
          if (isWin) {
            // Win: 0.5% to 3% profit on trade amount
            const profitPercent = 0.005 + Math.random() * 0.025;
            const profit = tradeAmount * profitPercent;
            newProfit = prev.totalProfit + profit;
            
            // Win rate stays same or slightly improves
            if (Math.random() < 0.3) {
              newWinRate = Math.min(99.5, prev.winRate + (Math.random() * 0.1));
            }
          } else {
            // Loss: 1% to 5% loss on trade amount
            const lossPercent = 0.01 + Math.random() * 0.04;
            const loss = tradeAmount * lossPercent;
            newProfit = Math.max(0, prev.totalProfit - loss);
            
            // Win rate drops slightly
            if (Math.random() < 0.5) {
              newWinRate = Math.max(95, prev.winRate - (Math.random() * 0.15));
            }
          }
          
          newTrades = prev.totalTrades + 1;
          
          // Response time varies (0.1ms to 2ms)
          newResponseTime = 0.1 + Math.random() * 1.9;
          
          // Update daily change
          const dailyChangePercent = prev.totalProfit > 0 ? ((newProfit - prev.totalProfit) / prev.totalProfit) * 100 : 0;
          
          return {
            totalTrades: newTrades,
            totalProfit: newProfit,
            avgResponseTime: parseFloat(newResponseTime.toFixed(1)),
            winRate: parseFloat(newWinRate.toFixed(1)),
            lastUpdate: new Date(),
            dailyChange: parseFloat(dailyChangePercent.toFixed(2))
          };
        } else if (updateType < 0.85) { // Profit update (interest accrual)
          // Interest accrual based on totalEarnUsd and rate
          const hourlyRate = (currentEarnRate / 100) / (365 * 24);
          const interestEarned = totalEarnUsd * hourlyRate * (timeSinceLastUpdate / 3600);
          newProfit = prev.totalProfit + interestEarned;
          
          return {
            ...prev,
            totalProfit: newProfit,
            lastUpdate: new Date()
          };
        } else { // Win rate adjustment only
          const winRateChange = (Math.random() - 0.5) * 0.05;
          newWinRate = Math.min(99.5, Math.max(95, prev.winRate + winRateChange));
          
          return {
            ...prev,
            winRate: parseFloat(newWinRate.toFixed(1)),
            lastUpdate: new Date()
          };
        }
      });
      
      // Schedule next update
      generateRandomChange();
    }, interval);
  };
  
  // Start/stop animation based on whether funds are deployed
  useEffect(() => {
    if (totalEarnUsd > 0) {
      generateRandomChange();
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [totalEarnUsd]);
  
  // Reset when funds become 0
  useEffect(() => {
    if (totalEarnUsd === 0) {
      setPerformance({
        totalTrades: 1247,
        totalProfit: 28450,
        avgResponseTime: 0.3,
        winRate: 98.2,
        lastUpdate: new Date(),
        dailyChange: 0
      });
    }
  }, [totalEarnUsd]);

  // Format numbers with animation effect
  const formatNumber = (num, decimals = 0) => {
    if (decimals === 0) {
      return num.toLocaleString();
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };
  
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Trades */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon name="activity" className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{t("total_trades")}</div>
          <div className="font-bold text-white text-base font-mono">
            {formatNumber(Math.floor(performance.totalTrades))}
          </div>
        </div>
        {performance.dailyChange !== 0 && (
          <div className={`text-[10px] ${performance.dailyChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {performance.dailyChange > 0 ? '↑' : '↓'} {Math.abs(performance.dailyChange).toFixed(1)}%
          </div>
        )}
      </div>
      
      {/* Total Profit */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon name="trending-up" className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{t("total_profit")}</div>
          <div className="font-bold text-blue-400 text-base font-mono">
            {formatCurrency(performance.totalProfit)}
          </div>
        </div>
      </div>
      
      {/* Win Rate */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon name="shield" className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{t("win_rate_24h")}</div>
          <div className="font-bold text-purple-400 text-base font-mono">
            {performance.winRate}%
          </div>
        </div>
        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${performance.winRate}%` }}
          />
        </div>
      </div>
      
      {/* Avg Response Time */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon name="clock" className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{t("avg_response")}</div>
          <div className="font-bold text-cyan-400 text-base font-mono">
            {performance.avgResponseTime}ms
          </div>
        </div>
      </div>
    </div>
  );
}