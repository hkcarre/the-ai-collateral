/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Activity, BrainCircuit } from 'lucide-react';

interface HeaderProps {
  activeTab: 'feed' | 'submit' | 'insights' | 'safety';
  setActiveTab: (tab: 'feed' | 'submit' | 'insights' | 'safety') => void;
  storyCount: number;
  patternCount: number;
}

export default function Header({ activeTab, setActiveTab, storyCount, patternCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080808]/90 backdrop-blur-md text-[#e0e0e0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white text-black">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xs uppercase tracking-[0.3em] font-semibold text-white">
                The AI Collateral
              </h1>
              <p className="text-[9px] font-mono tracking-[0.15em] text-white/40 uppercase mt-0.5">
                Collective Witness & Systemic Audit
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-medium text-white/50">
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'feed'
                  ? 'text-white border-b border-white/40'
                  : 'hover:text-white'
              }`}
            >
              The Archive
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'submit'
                  ? 'text-white border-b border-white/40'
                  : 'hover:text-white'
              }`}
            >
              Share Testimony
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'insights'
                  ? 'text-white border-b border-white/40'
                  : 'hover:text-white'
              }`}
            >
              Pattern Lab
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'safety'
                  ? 'text-white border-b border-white/40'
                  : 'hover:text-white'
              }`}
            >
              Safety Hub
            </button>
          </nav>

          {/* Platform Metrics Ticker */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 py-1 px-2.5 rounded-sm bg-amber-950/20 border border-amber-900/30 text-amber-400">
              <Activity className="h-3 w-3 animate-pulse text-amber-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider">{storyCount} Stories Audited</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 py-1 px-2.5 rounded-sm bg-white/5 border border-white/5 text-white/60">
              <BrainCircuit className="h-3 w-3 text-white/40" />
              <span className="text-[10px] font-mono uppercase tracking-wider">{patternCount} AI Vectors</span>
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="block md:hidden border-t border-white/5 pb-3 pt-2">
          <div className="flex justify-around text-[10px] uppercase tracking-[0.15em] font-medium">
            <button
              className={`py-1 px-2.5 rounded-sm ${
                activeTab === 'feed' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              onClick={() => setActiveTab('feed')}
            >
              Archive
            </button>
            <button
              className={`py-1 px-2.5 rounded-sm ${
                activeTab === 'submit' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              onClick={() => setActiveTab('submit')}
            >
              Submit
            </button>
            <button
              className={`py-1 px-2.5 rounded-sm ${
                activeTab === 'insights' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              onClick={() => setActiveTab('insights')}
            >
              Insights
            </button>
            <button
              className={`py-1 px-2.5 rounded-sm ${
                activeTab === 'safety' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
              }`}
              onClick={() => setActiveTab('safety')}
            >
              Safety
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
