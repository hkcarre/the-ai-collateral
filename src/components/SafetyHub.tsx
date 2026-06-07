/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeartHandshake, EyeOff, Scale, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function SafetyHub() {
  const steps = [
    {
      title: 'Keep evidence outside company equipment',
      desc: 'Never capture screenshots, write journal entries, or compile spreadsheets on corporate laptops, cloud drives, or work phones. Active bossware tracking loops routinely flag local drives or clipboard actions.',
      icon: EyeOff,
    },
    {
      title: 'Draft in a neutral, safe format',
      desc: 'Avoid writing specific names of peers or manager emails in the original text where possible. Focus instead on structural system action thresholds (e.g., "the dispatch software logged out the user after 8 minutes").',
      icon: HelpCircle,
    },
    {
      title: 'Understand legal rights and NDAs',
      desc: 'Many NDAs do not legally extend to shielding systemic civil discrimination or unsafe workplace environments. Consult professional independent worker advisory legal centers before acting.',
      icon: Scale,
    },
  ];

  const groups = [
    {
      name: 'Tech Workers Coalition',
      role: 'Labor Advocacy & Union Support',
      desc: 'A community of tech workers, coordinators, and contractors organizing for decent work conditions and democratic control of systems.',
      url: 'https://techworkerscoalition.org',
    },
    {
      name: 'Coworker.org',
      role: 'Workplace Campaigning Platform',
      desc: 'Provides training, technology, and strategic advocacy tools to help worker collectives address algorithmic policy changes securely.',
      url: 'https://coworker.org',
    },
    {
      name: 'Whistleblower Network Partners',
      role: 'Legal Defense Support',
      desc: 'Independent legal counsel specializing in shielding employees documenting automated abuses, unlawful surveillance, and bias.',
      url: '#',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Upper Brand Header */}
      <div>
        <div className="border border-white/10 text-white/50 bg-[#0f0f0f] px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded-sm inline-flex">
          <HeartHandshake className="h-3 w-3 mr-1 self-center" />
          <span>Support Framework</span>
        </div>
        <h2 className="text-2xl font-light text-white tracking-tight mt-2">Psychological & Legal Safety Hub</h2>
        <p className="mt-1 text-xs text-white/40 font-light leading-relaxed">
          Documenting automated harm can be an exhausting, isolating process. You are not alone. These guidelines help insulate your narrative and career from retaliatory loops.
        </p>
      </div>

      {/* Structured Tactical Safeguards */}
      <div className="bg-white/[0.01] rounded-sm border border-white/5 p-6 shadow-md space-y-6">
        <h3 className="text-base font-light text-white border-b border-white/5 pb-2.5">
          Tactical Safeguards for Story Writing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st, idx) => {
            const IconComponent = st.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/5 text-white">
                  <IconComponent className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-medium text-white">{st.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advocacy & Counseling Organizations */}
      <div className="space-y-4">
        <h3 className="text-base font-light text-white">
          Independent Labor & Advocacy Networks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map((gr, idx) => (
            <div key={idx} className="bg-white/[0.01]/45 rounded-sm border border-white/5 p-5 shadow-xs space-y-3 hover:border-white/20 hover:bg-white/[0.01]/80 transition-all duration-150">
              <div>
                <span className="text-[9px] font-mono text-white/40 block uppercase tracking-widest">{gr.role}</span>
                <span className="text-white text-sm block font-semibold mt-0.5">{gr.name}</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                {gr.desc}
              </p>
              {gr.url !== '#' && (
                <a
                  href={gr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/70 hover:text-white hover:underline font-mono tracking-wide pt-1 block"
                >
                  Visit Channel →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Safety hub message warning */}
      <div className="bg-amber-950/15 border border-amber-900/30 rounded-sm p-4.5 flex items-start text-xs leading-relaxed text-amber-400/80">
        <Scale className="h-5 w-5 text-amber-500/80 mt-0.5 mr-3 shrink-0" />
        <div className="font-light">
          <p className="font-bold text-amber-400">Important Notice regarding Evidence Preservation:</p>
          <p className="mt-1">
            While "The AI Collateral" acts as an accountability ledger and compiles press dossiers, it does not constitute direct formal legal representation. Always back up your materials securely in multiple offline drives, and consult an attorney or certified labor representative if you are filing a legal suit.
          </p>
        </div>
      </div>

    </div>
  );
}
