import { useState, FormEvent } from 'react';
import { ShieldAlert, AlertCircle, Loader2, Sparkles, CheckSquare, ShieldCheck, Scale, FileText } from 'lucide-react';
import { SharePreferenceType, Story } from '../types';

interface StorySubmitFormProps {
  onStoryAdded: (story: Story) => void;
}

export default function StorySubmitForm({ onStoryAdded }: StorySubmitFormProps) {
  const [sharePref, setSharePref] = useState<SharePreferenceType>('completely-anonymous');
  
  // Text inputs
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [rawText, setRawText] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [issueOrigin, setIssueOrigin] = useState<'mobbing' | 'company-discrimination' | 'manager' | 'teammates' | null>(null);
  
  // Legal acknowledgement
  const [legalAcknowledged, setLegalAcknowledged] = useState(false);

  // API loading / result states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim() || !companyName.trim() || !issueOrigin) {
      setApiError('Please fill out all required fields (Title, Company, Issue Origin, and Evidence Text).');
      return;
    }
    
    if (!legalAcknowledged) {
      setApiError('You must acknowledge the legal disclaimer before submitting evidence.');
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
        const moderationResult = responseData.result;
        
        let finalAlias = 'Anonymous Contributor';
        if (sharePref === 'role-only') {
          finalAlias = role ? `${role}` : 'Anonymous Professional';
        } else if (sharePref === 'public-alias') {
          finalAlias = customAlias.trim() || 'Anonymous Witness';
        } else {
          finalAlias = 'Completely Private Witness';
        }

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
          humanImpact: moderationResult.humanImpact,
          managementExcuse: moderationResult.managementExcuse,
          severityIndex: moderationResult.severityIndex || 3,
          extractedPatterns: moderationResult.extractedPatterns || ['automated labor constraints'],
          supportResponse: moderationResult.supportResponse,
          upvotes: 1,
          tags: derivedTags,
          companyName: companyName.trim() || null,
          issueOrigin: issueOrigin || null,
        };

        onStoryAdded(newStory);

      } else {
        throw new Error(responseData.error || 'Unknown server error.');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An unexpected error occurred while processing your evidence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-sm border border-white/5 bg-white/[0.01] p-6 sm:p-10 shadow-md">
        
        <div className="mb-10 text-center space-y-3">
          <h3 className="text-3xl font-light text-white tracking-tight">Submit Evidence of Algorithmic Abuse</h3>
          <p className="text-sm text-white/50 leading-relaxed font-light max-w-2xl mx-auto">
            Your psychological safety is our highest design mandate. Submitted evidence is NOT immediately published. 
            It is securely routed to our team for verification and validation.
          </p>
        </div>

        {/* STEP-BY-STEP EXPLANATION */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10 border-y border-white/5 py-8">
          <div className="text-center space-y-2">
            <div className="mx-auto bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-white">1. Submit</h4>
            <p className="text-xs text-white/40 leading-relaxed">Securely share your experience.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">2. AI Cleansing</h4>
            <p className="text-xs text-white/40 leading-relaxed">System instantly strips identifying details.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white mb-3">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-white">3. Verification</h4>
            <p className="text-xs text-white/40 leading-relaxed">Our team privately reviews structural abuse.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white mb-3">
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-400">4. Action</h4>
            <p className="text-xs text-white/40 leading-relaxed">Validated data builds accountability rankings.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60">Anonymity Tier:</label>
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
                <span className="block text-[10px] text-white/55 mt-2 font-light leading-relaxed">
                  Completely censored.
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
                <span className="block text-[10px] text-white/55 mt-2 font-light leading-relaxed">
                  Keeps your job title.
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
                <span className="block text-sm font-semibold text-white mt-1">Pen Name</span>
                <span className="block text-[10px] text-white/55 mt-2 font-light leading-relaxed">
                  Use a custom alias.
                </span>
              </div>
            </div>

            {sharePref === 'public-alias' && (
              <div className="animate-fadeIn mt-2">
                <input
                  type="text"
                  required
                  placeholder="Enter custom pen name (e.g., Courier-99)"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-[#222222] focus:border-white/20 transition-all font-mono"
                />
              </div>
            )}
            
            {sharePref === 'role-only' && (
              <div className="animate-fadeIn mt-2">
                <input
                  type="text"
                  required
                  placeholder="Enter your Job Role (e.g., Warehouse Worker)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-2.5 text-xs outline-[#222222] focus:border-white/20 transition-all font-mono"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-white/5 pt-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60">Evidence Details:</label>
            
            <div>
              <input
                type="text"
                required
                placeholder="Evidence Headline *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-3 text-xs outline-none focus:border-white/20 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Company Name *"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-3 text-xs outline-none focus:border-white/20 transition-all font-sans"
              />
              <select
                required
                value={issueOrigin || ''}
                onChange={(e) => setIssueOrigin(e.target.value as any)}
                className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-white p-3 text-xs outline-none focus:border-white/20 transition-all appearance-none font-sans"
              >
                <option value="" disabled>Primary Source of Abuse *</option>
                <option value="mobbing">Many People (Mobbing)</option>
                <option value="company-discrimination">The Company (Discrimination/Policy)</option>
                <option value="manager">Direct Manager / Supervisor</option>
                <option value="teammates">Teammates / Peers</option>
              </select>
            </div>

            <textarea
              required
              rows={8}
              placeholder="Describe what happened here... (Your text will be safely cleansed by AI to protect identities) *"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full rounded-sm border border-white/10 bg-[#0f0f0f] text-[#dddddd] p-3 text-xs outline-none focus:border-white/20 transition-all font-sans leading-relaxed"
            />
          </div>

          <div className="border border-amber-900/40 bg-amber-950/10 p-4 rounded-sm flex items-start gap-3">
            <input 
              type="checkbox" 
              id="legalCheckbox"
              checked={legalAcknowledged}
              onChange={(e) => setLegalAcknowledged(e.target.checked)}
              className="mt-1 bg-[#0f0f0f] border-white/20 accent-amber-500 rounded-sm cursor-pointer" 
            />
            <label htmlFor="legalCheckbox" className="text-[10px] text-amber-400/80 font-mono leading-relaxed cursor-pointer select-none">
              <strong>LEGAL DISCLAIMER:</strong> By submitting this evidence, I acknowledge that my allegations will be aggregated into structural data for advocacy. I am sharing my subjective experience. This platform does not verify claims as factual truth, nor does it provide legal representation.
            </label>
          </div>

          {apiError && (
            <div className="flex items-start bg-red-950/20 border border-red-900/30 p-3 rounded-sm text-red-400 text-xs">
              <AlertCircle className="h-4.5 w-4.5 mr-2 shrink-0 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isLoading || !legalAcknowledged}
              className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.18em] rounded-sm hover:bg-zinc-200 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cleansing & Submitting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Submit Evidence Securely</span>
                </>
              )}
            </button>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-emerald-500/70 shrink-0" />
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider text-center">
                Secure Ledger. IP Address not stored. Internal Verification Only.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
