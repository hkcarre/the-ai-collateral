/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUp, Heart, AlertTriangle, Layers, Quote, ShieldAlert } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onUpvote: (id: string) => void;
  key?: React.Key | null | undefined;
}

export default function StoryCard({ story, onUpvote }: StoryCardProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvoteClick = () => {
    if (hasUpvoted) return; // Only allow one click per session
    setHasUpvoted(true);
    onUpvote(story.id);
  };

  const formattedDate = new Date(story.dateSubmitted).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Decide colors based on category or severity
  const getSeverityBadge = (idx: number) => {
    if (idx >= 5) return 'bg-red-950/25 text-red-400 border-red-900/40';
    if (idx >= 4) return 'bg-amber-950/25 text-amber-400 border-amber-900/40';
    return 'bg-white/5 text-white/50 border-white/5';
  };

  return (
    <article className="rounded-sm border border-white/5 bg-white/[0.01] p-6 hover:bg-white/[0.02]/85 hover:border-white/10 transition-all space-y-5">
      
      {/* Category Heading & General Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-sm bg-white/10 px-2.5 py-1 text-[10px] font-mono font-medium text-white/95 uppercase tracking-wider border border-white/10">
            {story.category}
          </span>
          <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-mono font-medium ${getSeverityBadge(story.severityIndex)}`}>
            Severity: {story.severityIndex}/5
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/35">
          Archived: {formattedDate}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-lg font-light text-white leading-snug">
          {story.title}
        </h3>
        <p className="text-xs text-white/40 font-sans mt-1">
          filed by <strong className="text-white/70 font-medium">{story.alias}</strong> 
          {story.industry && <> in <strong className="text-white/70 font-medium">{story.industry}</strong></>}
        </p>
      </div>

      {/* Main Story Body */}
      <div className="text-sm font-sans text-[#cccccc] leading-relaxed bg-white/[0.01] p-4 rounded-sm border border-white/5 relative">
        <Quote className="absolute top-2 right-2 h-8 w-8 text-white/[0.02] pointer-events-none" />
        <p className="whitespace-pre-line relative z-10 font-light">{story.anonymizedText}</p>
      </div>

      {/* Interactive Systemic AI Analytical Audit */}
      <div className="border-t border-white/5 pt-4 bg-white/[0.01]/40 p-4 rounded-sm space-y-3">
        <div className="flex items-center space-x-2 text-[10px] font-mono font-medium text-white/40 uppercase tracking-[0.18em]">
          <Layers className="h-3.5 w-3.5 text-white/30" />
          <span>AI Human-Centric Analysis</span>
        </div>

        {/* Issue Origin */}
        {story.issueOrigin && (
          <div>
            <span className="text-[9px] font-mono text-white/30 block mb-1 uppercase tracking-wider">Source of Pressure:</span>
            <span className="bg-rose-950/20 text-[9px] font-mono border border-rose-900/30 px-2 py-0.5 rounded-sm text-rose-400 uppercase tracking-widest">
              {story.issueOrigin === 'mobbing' ? 'Mobbing (Teammates/Peers)' : 
               story.issueOrigin === 'company-discrimination' ? 'Company Policy / Discrimination' : 
               story.issueOrigin === 'manager' ? 'Direct Manager' : 
               story.issueOrigin === 'teammates' ? 'Teammates / Peers' : story.issueOrigin}
            </span>
          </div>
        )}

        {/* Patterns */}
        {story.extractedPatterns?.length > 0 && (
          <div>
            <span className="text-[9px] font-mono text-white/30 block mb-1 uppercase tracking-wider">Tactics Used:</span>
            <div className="flex flex-wrap gap-1.5">
              {story.extractedPatterns.map((pt, idx) => (
                <span key={idx} className="bg-amber-950/15 text-[9px] font-mono border border-amber-900/25 px-2 py-0.5 rounded-sm text-amber-400 uppercase tracking-widest">
                  {pt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Human Impact & Management Excuse */}
        <div className="space-y-2 mt-3">
          <div>
            <span className="text-[9px] font-mono text-white/30 block mb-0.5 uppercase tracking-wider">Human Toll:</span>
            <p className="text-xs font-serif text-white/80 leading-relaxed italic">
              "{story.humanImpact}"
            </p>
          </div>
          <div>
            <span className="text-[9px] font-mono text-white/30 block mb-0.5 uppercase tracking-wider">Management's Excuse:</span>
            <p className="text-xs font-sans text-white/60 leading-relaxed">
              {story.managementExcuse}
            </p>
          </div>
        </div>

        {/* Support Message */}
        <div className="mt-2 pt-2 border-t border-white/5 flex items-start text-xs text-white/50 leading-relaxed font-light">
          <Heart className="h-3.5 w-3.5 text-rose-500 mr-2 shrink-0 self-center" />
          <p className="italic">
            <strong className="text-[#e2e8f0] font-medium">Witness Response:</strong> {story.supportResponse}
          </p>
        </div>
      </div>

      {/* Upvotes / Witness Signatures Action Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <button
          onClick={handleUpvoteClick}
          disabled={hasUpvoted}
          className={`group flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider px-3.5 py-2 rounded-sm border transition-all cursor-pointer ${
            hasUpvoted 
              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
              : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/5'
          }`}
        >
          <ArrowUp className={`h-3 w-3 transition-transform ${hasUpvoted ? 'translate-y-[-1px]' : 'group-hover:translate-y-[-1px]'}`} />
          <span>{hasUpvoted ? 'Witnessed Entry' : 'Witness Support'} ({story.upvotes})</span>
        </button>
        
        <div className="flex items-center space-x-1.5 text-[10px] text-white/30 font-mono uppercase tracking-wider">
          <ShieldAlert className="h-3.5 w-3.5 text-white/20" />
          <span>Legled Public Ledger</span>
        </div>
      </div>

    </article>
  );
}
