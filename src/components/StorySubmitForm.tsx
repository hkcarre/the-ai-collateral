/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { ShieldAlert, AlertCircle, RefreshCw, CheckCircle2, Heart, HelpCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { SharePreferenceType, ModerationResult, Story } from '../types';

interface StorySubmitFormProps {
  onStoryAdded: (story: Story) => void;
  onCancel: () => void;
}

export default function StorySubmitForm({ onStoryAdded, onCancel }: StorySubmitFormProps) {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [psychState, setPsychState] = useState<string>('');
  const [sharePref, setSharePref] = useState<SharePreferenceType>('role-only');
  
  // Text inputs
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [rawText, setRawText] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [issueOrigin, setIssueOrigin] = useState<'mobbing' | 'company-discrimination' | 'manager' | 'teammates' | null>(null);
  
  // API loading / result states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);

  // Psychological Safety options
  const emotionalStatusOptions = [
    { label: 'Quietly determined', color: 'border-stone-300 hover:border-stone-800' },
    { label: 'Exhausted but seeking answers', color: 'border-yellow-300 hover:border-yellow-850' },
    { label: 'Anxious but resolute', color: 'border-stone-300 hover:border-slate-800' },
    { label: 'Relieved to put this into words', color: 'border-emerald-300 hover:border-emerald-850' },
  ];

  const handleNextToStage2 = (e: FormEvent) => {
    e.preventDefault();
    if (!psychState) {
      // Allow moving forward silently, but select a default if empty
      setPsychState('Determined');
    }
    setStage(2);
  };

  const handleRunAiAudit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      setApiError('Please provide both a testimony title and story text to continue.');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          text: rawText,
          role: role || null,
          industry: industry || null,
          companyName: companyName || null,
          issueOrigin: issueOrigin || null,
        }),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        throw new Error('Failed to reach AI moderation route.');
      }

      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to reach AI moderation route.');
      }

      if (responseData.status === 'ok') {
        setModerationResult(responseData.result);
        setStage(4); // Move to review screen
      } else {
        throw new Error(responseData.error || 'Unknown server error.');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An unexpected error occurred while processing your testimony. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPublish = () => {
    if (!moderationResult) return;

    // Create Alias based on share preference
    let finalAlias = 'Anonymous Contributor';
    if (sharePref === 'role-only') {
      finalAlias = role ? `${role}` : 'Anonymous Professional';
    } else if (sharePref === 'public-alias') {
      finalAlias = customAlias.trim() || 'Anonymous Witness';
    } else {
      finalAlias = 'Completely Private Witness';
    }

    // Prepare tags
    const derivedTags = ['Audited'];
    if (industry) derivedTags.push(industry);
    if (moderationResult.extractedPatterns?.length > 0) {
      derivedTags.push(moderationResult.extractedPatterns[0]);
    }

    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: title.trim(),
      originalText: rawText.trim(),
      anonymizedText: moderationResult.anonymizedText,
      alias: finalAlias,
      sharePreference: sharePref,
      role: role.trim() || null,
      industry: industry.trim() || null,
      dateSubmitted: new Date().toISOString(),
      category: moderationResult.primaryCategory || 'Systemic Harm',
      isModerated: true,
      safetyStatus: moderationResult.isSafe ? 'approved' : 'needs-review',
      summary: moderationResult.summary,
      systemicTakeaway: moderationResult.systemicTakeaway,
      severityIndex: moderationResult.severityIndex || 3,
      extractedPatterns: moderationResult.extractedPatterns || ['automated labor constraints'],
      supportResponse: moderationResult.supportResponse,
      upvotes: 1,
      tags: derivedTags,
      companyName: companyName.trim() || null,
      issueOrigin: issueOrigin || null,
    };

    onStoryAdded(newStory);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      
      {/* Back to archive action */}
      <button
        onClick={onCancel}
        className="flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.18em] text-white/40 hover:text-white transition-all mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Testimony Archive</span>
      </button>

      {/* Progress indicators */}
      <div className="mb-8 block">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-2">
          <span>STEP {stage} OF 4</span>
          <span>
            {stage === 1 && 'Safety & Consent Agreement'}
            {stage === 2 && 'Narrative Input'}
            {stage === 3 && 'AI Safety Cleansing...'}
            {stage === 4 && 'Commit Audit & Publish'}
          </span>
        </div>
        <div className="flex h-1.5 w-full bg-white/5 rounded-sm overflow-hidden border border-white/5">
          <div className={`h-full bg-white transition-all duration-300 ${
            stage === 1 ? 'w-1/4' : stage === 2 ? 'w-2/4' : stage === 3 ? 'w-3/4' : 'w-full'
          }`} />
        </div>
      </div>

      {/* MAIN CONTAINER CARDS */}
      <div className="rounded-sm border border-white/5 bg-white/[0.01] p-6 sm:p-8 shadow-md">
        
        {/* ================= STAGE 1: AGREEMENT & MENTAL SAFETY ================= */}
        {stage === 1 && (
          <form onSubmit={handleNextToStage2} className="space-y-6">
            <div>
              <h3 className="text-xl font-light text-white">Your psychological safety is our highest design mandate.</h3>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-light">
                Before you share your workplace automated harm testimony, please define your level of privacy. This archive acts as a digital ledger for workers, not a target for company lawyers.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60">1. Select your preferred Anonymity Tier:</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                
                <div 
                  onClick={() => setSharePref('completely-anonymous')}
                  className={`cursor-pointer rounded-sm border p-4 transition-all ${
                    sharePref === 'completely-anonymous' 
                      ? 'border-white/30 bg-white/5' 
                      : 'border-white/5 bg-white/[0.01]/40 hover:bg-white/[0.01]/80'
                  }`}
                >
                  <span className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-widest">TIER 1</span>
                  <span className="block text-sm font-semibold text-white mt-1">Full Anonymity</span>
                  <span className="block text-xs text-white/55 mt-2 font-light leading-relaxed">
                    Job role and industry are censored. Your story is filed under a random ID.
                  </span>
                </div>

                <div 
                  onClick={() => setSharePref('role-only')}
                  className={`cursor-pointer rounded-sm border p-4 transition-all ${
                    sharePref === 'role-only' 
                      ? 'border-white/30 bg-white/5' 
                      : 'border-white/5 bg-white/[0.01]/40 hover:bg-white/[0.01]/80'
                  }`}
                >
                  <span className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-widest">TIER 2</span>
                  <span className="block text-sm font-semibold text-white mt-1">Role Focused</span>
                  <span className="block text-xs text-white/55 mt-2 font-light leading-relaxed">
                    Keeps raw role title (e.g. "Support Desk") to help locate professional industry patterns.
                  </span>
                </div>

                <div 
                  onClick={() => setSharePref('public-alias')}
                  className={`cursor-pointer rounded-sm border p-4 transition-all ${
                    sharePref === 'public-alias' 
                      ? 'border-white/30 bg-white/5' 
                      : 'border-white/5 bg-white/[0.01]/40 hover:bg-white/[0.01]/80'
                  }`}
                >
                  <span className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-widest">TIER 3</span>
                  <span className="block text-sm font-semibold text-white mt-1">Custom Pen Name</span>
                  <span className="block text-xs text-white/55 mt-2 font-light leading-relaxed">
                    Filer under a custom pen name to preserve continuous professional legacy across cases.
                  </span>
                </div>

              </div>
            </div>

            {sharePref === 'public-alias' && (
              <div className="animate-fadeIn space-y-1.5">
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">Enter your custom pen name (e.g., Courier-99):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Courier-99, TechFiler, SilencedVoice"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-[#222222] focus:border-white/20 transition-all font-mono"
                />
              </div>
            )}

            <div className="border-t border-white/5 pt-5 space-y-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60">
                2. Take back your narrative. How are you feeling as you recall this incident?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emotionalStatusOptions.map((opt) => (
                  <div
                    key={opt.label}
                    onClick={() => setPsychState(opt.label)}
                    className={`cursor-pointer border rounded-sm p-3 text-xs text-white/70 transition font-light ${
                      psychState === opt.label 
                        ? 'bg-white text-black border-white font-medium' 
                        : 'bg-white/[0.01]/30 border-white/5 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-5">
              <div className="flex items-start bg-white/[0.01] border border-white/5 p-4 rounded-sm">
                <ShieldAlert className="h-5 w-5 text-amber-500/70 mt-0.5 mr-3 shrink-0" />
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  <strong>Secure Ledger Ethics:</strong> Your IP address is never stored. We analyze structural issues, not corporate marketing. We run secure server-side AI filtering to ensure names of supervisors are stripped, keeping you shielded from retaliatory NDAs.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition cursor-pointer"
            >
              Securely Proceed to Story Draft →
            </button>
          </form>
        )}

        {/* ================= STAGE 2: NARRATIVE COMPOSITION ================= */}
        {stage === 2 && (
          <form onSubmit={handleRunAiAudit} className="space-y-6">
            <div>
              <h3 className="text-xl font-light text-white">Write your testimony.</h3>
              <p className="mt-1 text-xs text-white/50 leading-relaxed font-light">
                Describe carefully what happened. Our server-side AI scans safety parameters dynamically to protect your details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-[0.16em] mb-1.5">Testimony Heading *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Exhaustion metrics at Amazon Fulfillment, AI interview filter bias"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-none focus:border-white/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-[0.16em] mb-1.5">Your Job Role / Title {sharePref === 'completely-anonymous' && '(Censored, but aids trend math)'}</label>
                  <input
                    type="text"
                    placeholder="e.g., Customer Support Specialist, QA Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-none focus:border-white/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-[0.16em] mb-1.5">Industry Sector</label>
                  <input
                    type="text"
                    placeholder="e.g., Logistics, Software, Gig Economy"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-[0.16em] mb-1.5">Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., MegaCorp, SwiftTransit"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-none focus:border-white/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-[0.16em] mb-1.5">Issue Source / Origin</label>
                  <select
                    value={issueOrigin || ''}
                    onChange={(e) => setIssueOrigin(e.target.value as any)}
                    className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-none focus:border-white/20 transition-all appearance-none"
                  >
                    <option value="" disabled>Select the primary source of the issue</option>
                    <option value="mobbing">Many People (Mobbing)</option>
                    <option value="company-discrimination">The Company (Discrimination/Policy)</option>
                    <option value="manager">Direct Manager / Supervisor</option>
                    <option value="teammates">Teammates / Peers</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[9px] font-mono font-medium text-white/40 uppercase tracking-[0.16em]">The Raw Story Testimony *</label>
                  <span className="text-[9px] text-white/30 font-mono">Real names are stripped.</span>
                </div>
                <textarea
                  required
                  rows={8}
                  placeholder="Our company added a piece of productivity tracking software called... it began flagging bathroom breaks... my supervisor said she could not override it... the AI decided my speed index of 84 wasn't sufficient..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-[#dddddd] p-3 text-xs outline-none focus:border-white/20 transition-all font-sans leading-relaxed"
                />
                
                {/* Empathetic writing guidelines helper triggers */}
                <div className="mt-2.5 text-[10px] text-white/45 bg-white/[0.01]/70 p-4 rounded-sm border border-white/5 space-y-1.5 font-mono">
                  <p className="font-semibold text-white/70 uppercase tracking-widest text-[9px]">Recommended Guidance Prompts:</p>
                  <ul className="list-disc pl-4 space-y-1 text-white/50 leading-relaxed font-light">
                    <li>What was the name or type of the workplace AI software?</li>
                    <li>How did it constrain, judge, pressure, or fire you?</li>
                    <li>What crucial human elements did the algorithm discount or fail to recognize?</li>
                  </ul>
                </div>
              </div>
            </div>

            {apiError && (
              <div className="flex items-start bg-red-950/20 border border-red-900/30 p-3 rounded-sm text-red-400 text-xs">
                <AlertCircle className="h-4.5 w-4.5 mr-2 shrink-0 text-red-500" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStage(1)}
                className="px-5 py-3 border border-white/10 hover:border-white/20 rounded-sm text-xs font-mono uppercase tracking-wider text-white/80 hover:bg-white/5 transitioncursor-pointer"
              >
                Back to Privacy
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-white text-black font-bold text-xs uppercase tracking-[0.18em] rounded-sm hover:bg-zinc-200 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Auditing and Sanitizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Audit & Clean My Narrative →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STAGE 4: CONFIRM AI AUDIT & TAKEAWAYS ================= */}
        {stage === 4 && moderationResult && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/20 border border-emerald-900/35 p-2 px-3 rounded-sm mb-4 text-[9px] font-mono uppercase tracking-[0.15em] font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>AI Automated Cleansing Process Complete — Identifiers Stripped</span>
              </div>
              <h3 className="text-xl font-light text-white">Review Audited Ledger Entry</h3>
              <p className="mt-1 text-xs text-white/50 leading-relaxed font-light">
                Here is the parsed structural testimony. Confirm how our system translated your narrative into systemic labor evidence.
              </p>
            </div>

            {/* Split Screen Original vs Sanitized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-white/5 rounded-sm overflow-hidden bg-white/[0.01]/50 text-xs font-sans">
              <div className="p-4 border-b md:border-b-0 md:border-r border-white/5">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-white/35 mb-2">Original Story Submitted</span>
                <p className="text-white/40 italic line-clamp-6 font-light">{rawText}</p>
              </div>
              <div className="p-4 bg-[#0c0c0c]">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-emerald-400 mb-2">Processed / Sanitized Testimony</span>
                <p className="text-[#eeeeee] font-light leading-relaxed">{moderationResult.anonymizedText}</p>
              </div>
            </div>

            {/* AI Extracted Systemic Critique */}
            <div className="bg-white/[0.01] border border-white/5 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">AI Systemic Audit Takeaways</span>
                <span className="text-[10px] bg-white/10 font-medium px-2 py-0.5 rounded-sm text-white uppercase tracking-widest font-mono">
                  Severity score: {moderationResult.severityIndex}/5
                </span>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase tracking-wider text-white/40">Extracted AI Infraction Profile:</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {moderationResult.extractedPatterns?.map((pt, idx) => (
                    <span key={idx} className="bg-amber-950/15 border border-amber-900/25 rounded-sm px-2.5 py-1 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                      {pt}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase tracking-wider text-white/40">Systemic Labor Takeaway:</span>
                <p className="mt-1 text-sm text-[#eeeeee] font-serif leading-relaxed italic">
                  "{moderationResult.systemicTakeaway}"
                </p>
              </div>

              <div className="flex bg-[#0f0f0f] rounded-sm p-4 border border-white/5 text-xs font-light leading-relaxed text-white/60">
                <Heart className="h-4.5 w-4.5 text-rose-500 mr-2 shrink-0 self-center" />
                <p>
                  <strong className="text-white font-medium">The Platform's Witness:</strong> {moderationResult.supportResponse}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStage(2)}
                className="px-5 py-3 border border-white/10 hover:border-white/20 rounded-sm text-xs font-mono uppercase tracking-wider text-white hover:bg-white/5 cursor-pointer transition-all"
              >
                Modify Story Text
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-[0.18em] rounded-sm hover:bg-zinc-200 transition shadow cursor-pointer"
              >
                Commit to Public Audit Ledger →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
