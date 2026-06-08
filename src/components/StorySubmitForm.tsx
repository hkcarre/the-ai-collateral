import { useState, FormEvent } from 'react';
import { ShieldAlert, AlertCircle, Loader2, Sparkles } from 'lucide-react';
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
  
  // API loading / result states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim() || !companyName.trim() || !issueOrigin) {
      setApiError('Please fill out all required fields (Title, Company, Issue Origin, and Story Text).');
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

        // Instantly publish
        onStoryAdded(newStory);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-sm border border-white/5 bg-white/[0.01] p-6 sm:p-8 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-2xl font-light text-white">Share Your Story</h3>
            <p className="mt-2 text-xs text-white/50 leading-relaxed font-light">
              Your psychological safety is our highest design mandate. Real names and identifying details will be stripped by our AI before anything is published.
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
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60">2. The Incident Details:</label>
            
            <div>
              <input
                type="text"
                required
                placeholder="Story Headline *"
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

          {apiError && (
            <div className="flex items-start bg-red-950/20 border border-red-900/30 p-3 rounded-sm text-red-400 text-xs">
              <AlertCircle className="h-4.5 w-4.5 mr-2 shrink-0 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.18em] rounded-sm hover:bg-zinc-200 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cleansing & Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Audit & Publish Securely</span>
                </>
              )}
            </button>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-emerald-500/70 shrink-0" />
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider text-center">
                Secure Ledger. IP Address not stored.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
