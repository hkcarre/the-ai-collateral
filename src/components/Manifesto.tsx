/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, ShieldAlert, ShieldCheck, Heart, UserX, ArrowRight } from 'lucide-react';

interface ManifestoProps {
  onStartSubmission: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: () => void;
}

export default function Manifesto({ 
  onStartSubmission, 
  searchQuery, 
  setSearchQuery,
  onSearchSubmit
}: ManifestoProps) {
  
  // Quick pre-packaged keywords user can click to run quick searches
  const suggestedQueries = [
    'gaslighting',
    'mobbing',
    'medical discrimination',
    'manager abuse',
    'retaliation',
    'union busting'
  ];

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] border-b border-white/5 py-12 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-8 animate-fadeIn">
        
        {/* Simple Brand Header - Centered Google-like Typography */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1 border border-white/10 text-white/40 bg-white/[0.02] px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 mr-1" />
            <span>Zero-Trace Safe Ledger</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight font-sans">
            The AI Collateral
          </h2>
          <p className="text-[10px] font-mono tracking-[0.25em] text-white/30 uppercase max-w-md mx-auto">
            A Safe Ledger for Victims of Workplace Mobbing, Bullying & Managerial Abuse
          </p>
        </div>

        {/* Minimalist Google Search Box */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative group mt-2">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/30 group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search testimonies by job roles, patterns, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-[#0f0f0f] border border-white/10 hover:border-white/15 focus:border-white/25 text-white placeholder-white/35 rounded-sm outline-none transition-all shadow-xl font-sans"
            />
          </div>

          {/* Micro Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onSearchSubmit}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer"
            >
              Search Archive
            </button>
            <button
              onClick={onStartSubmission}
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center space-x-2 shadow-md"
            >
              <span>Submit Anonymously</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick suggestions list */}
          <div className="pt-2 text-[11px] text-white/40 font-mono">
            <span>Try searching: </span>
            <span className="space-x-2">
              {suggestedQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setSearchQuery(q);
                    // Slight delay to allow state write first
                    setTimeout(onSearchSubmit, 50);
                  }}
                  className="text-white/60 hover:text-white underline cursor-pointer hover:bg-white/5 px-1 rounded-sm transition-all"
                >
                  {q}
                </button>
              ))}
            </span>
          </div>
        </div>

        {/* Streamlined, Ultra-simple Privacy & Anonymity Commitment Card */}
        <div className="max-w-xl mx-auto p-5 bg-white/[0.01] border border-white/5 rounded-sm space-y-3.5 text-left shadow-sm">
          <div className="flex items-center space-x-2 text-white/80 border-b border-white/5 pb-2">
            <UserX className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <h3 className="text-xs uppercase tracking-wider font-mono text-emerald-400">Our Privacy & Anonymity Pledge</h3>
          </div>
          <div className="space-y-2.5 text-xs text-white/50 leading-relaxed font-light">
            <p className="flex items-start">
              <span className="text-emerald-500 mr-2">✦</span>
              <span><strong>Zero-Trace Logging:</strong> No personal accounts or emails. We never log IP addresses, browser cookies, or system details.</span>
            </p>
            <p className="flex items-start">
              <span className="text-emerald-500 mr-2">✦</span>
              <span><strong>Automated AI Scrubbing:</strong> Prior to publish, our system scrubs names, coworker listings, specific managers, and target companies out of testimonies to ensure you remain fully safe from NDAs or employer retaliation.</span>
            </p>
            <p className="flex items-start">
              <span className="text-emerald-500 mr-2">✦</span>
              <span><strong>Granular Control:</strong> Select between three distinct levels of mask tiers for ultimate agency over your narrative presentation.</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
