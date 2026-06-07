/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, ShieldAlert, Heart, PlusCircle, Sparkles } from 'lucide-react';
import { Story } from './types';
import Header from './components/Header';
import Manifesto from './components/Manifesto';
import StorySubmitForm from './components/StorySubmitForm';
import StoryCard from './components/StoryCard';
import InsightsDashboard from './components/InsightsDashboard';
import SafetyHub from './components/SafetyHub';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'submit' | 'insights' | 'safety'>('feed');
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // UX Alerts
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load initial pre-seeded stories from physical Node API, merge with user local storage entries
  useEffect(() => {
    async function loadDataset() {
      setIsSyncing(true);
      try {
        const response = await fetch('/api/stories');
        let serverStories: Story[] = [];
        
        if (response.ok) {
          const data = await response.json();
          serverStories = data.stories || [];
        }

        // Get local state stories
        const localSaved = localStorage.getItem('ai_collateral_user_stories');
        let userLocalStories: Story[] = [];
        if (localSaved) {
          try {
            userLocalStories = JSON.parse(localSaved);
          } catch (e) {
            console.error('Error parsing local stories dataset:', e);
          }
        }

        // Merge keeping user local stories first, then server stories- avoids duplicates
        const merged: Story[] = [...userLocalStories];
        serverStories.forEach((srv) => {
          if (!merged.find((m) => m.id === srv.id)) {
            merged.push(srv);
          }
        });

        // Sort by date descending
        merged.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
        setStories(merged);

      } catch (err) {
        console.error('Failed to sync stories index from server, loading safe client fallback data.', err);
      } finally {
        setIsSyncing(false);
      }
    }

    loadDataset();
  }, []);

  // Handle addition of a new audited story
  const handleStoryAdded = (newStory: Story) => {
    // Add to state and save to local storage
    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);

    // Save user custom stories to local storage
    const localUserStories = updatedStories.filter((s) => !s.id.startsWith('seed-'));
    localStorage.setItem('ai_collateral_user_stories', JSON.stringify(localUserStories));

    // Display positive alert
    setNotification('Testimony sanitized and committed to the archive ledger.');
    setTimeout(() => setNotification(null), 5000);

    // Redirect back to archive list feed page
    setActiveTab('feed');
  };

  // Upvote testimony signature
  const handleUpvote = (id: string) => {
    const updated = stories.map((st) => {
      if (st.id === id) {
        return { ...st, upvotes: st.upvotes + 1 };
      }
      return st;
    });
    setStories(updated);

    // Update LocalStorage if it is a user story to persist
    const target = updated.find((st) => st.id === id);
    if (target && !target.id.startsWith('seed-')) {
      const userStories = updated.filter((s) => !s.id.startsWith('seed-'));
      localStorage.setItem('ai_collateral_user_stories', JSON.stringify(userStories));
    }
  };

  // Filters logic
  const filteredStories = stories.filter((st) => {
    // Safety check - never display stories that failed safety audit
    const matchSafe = st.safetyStatus === 'approved';

    // Search keyword query
    const matchSearch = searchQuery
      ? st.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.anonymizedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.industry && st.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (st.role && st.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        st.alias.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // Category selection
    const matchCategory = selectedCategory ? st.category === selectedCategory : true;

    // Tag list pattern selection
    const matchTag = selectedTag ? st.extractedPatterns?.includes(selectedTag) || st.tags?.includes(selectedTag) : true;

    return matchSafe && matchSearch && matchCategory && matchTag;
  });

  // Unique pattern lists for metrics summary
  const totalAuditedVectors = Array.from(new Set(stories.flatMap((s) => s.extractedPatterns || []))).length;

  // Clear all filters action
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  // Google Search-style scroll handler
  const handleSearchSubmit = () => {
    const el = document.getElementById('archive-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#e0e0e0] selection:bg-white selection:text-black flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        storyCount={stories.length}
        patternCount={totalAuditedVectors}
      />

      {/* Global alert notifications banner */}
      {notification && (
        <div className="bg-emerald-950/40 border-b border-emerald-800/30 text-emerald-400 text-[10px] uppercase tracking-wider px-4 py-3 font-mono text-center animate-fadeIn shadow flex items-center justify-center space-x-2">
          <span>{notification}</span>
        </div>
      )}

      {/* VIEW DEPUTIZATION ROUTERS */}
      <main className="flex-1">
        
        {/* VIEW 1: TESTIMONY ARCHIVE ARCHITECTURE */}
        {activeTab === 'feed' && (
          <div className="space-y-0">
            
            {/* Mission manifesto intro on top of the feed */}
            <Manifesto 
              onStartSubmission={() => setActiveTab('submit')} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />

            {/* Stories Archive Catalog Search Filter Layout */}
            <div id="archive-feed" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-8">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-light text-white tracking-tight">Worker Testimony Archive</h3>
                  <p className="text-xs text-white/40 mt-1">
                    Audited and cataloged records of automated de-humanization and management AI harms.
                  </p>
                </div>

                {/* Submit Trigger Callout */}
                <button
                  onClick={() => setActiveTab('submit')}
                  className="flex items-center space-x-2 px-6 py-3 rounded-sm bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-[0.18em] cursor-pointer shadow-sm transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>File Workplace Harm</span>
                </button>
              </div>

              {/* Dynamic Filter bar and custom panels */}
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-sm space-y-4">
                
                {/* Search Text Input Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search testimonies by job role, keywords (e.g., bossware, algorithm, deactivation, PIP)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#0f0f0f] border border-white/10 text-white placeholder-white/20 focus:border-white/25 rounded-sm outline-none transition"
                  />
                </div>

                {/* Selected Category Tags pills list */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9px] text-white/35 uppercase tracking-[0.2em] font-medium mr-1">Categories:</span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1 rounded-sm text-[10px] uppercase font-mono tracking-wider transition cursor-pointer ${
                        selectedCategory === null 
                          ? 'bg-white text-black font-semibold' 
                          : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedCategory('Automated Performance Pressure')}
                      className={`px-3 py-1 rounded-sm text-[10px] uppercase font-mono tracking-wider transition cursor-pointer ${
                        selectedCategory === 'Automated Performance Pressure' 
                          ? 'bg-white text-black font-semibold' 
                          : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Performance Pressure
                    </button>
                    <button
                      onClick={() => setSelectedCategory('Unfair Redundancy & Automation Layoffs')}
                      className={`px-3 py-1 rounded-sm text-[10px] uppercase font-mono tracking-wider transition cursor-pointer ${
                        selectedCategory === 'Unfair Redundancy & Automation Layoffs' 
                          ? 'bg-white text-black font-semibold' 
                          : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Automation Layoffs
                    </button>
                    <button
                      onClick={() => setSelectedCategory('Discriminatory Hiring Bias')}
                      className={`px-3 py-1 rounded-sm text-[10px] uppercase font-mono tracking-wider transition cursor-pointer ${
                        selectedCategory === 'Discriminatory Hiring Bias' 
                          ? 'bg-white text-black font-semibold' 
                          : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Hiring Bias
                    </button>
                    <button
                      onClick={() => setSelectedCategory('Loss of Dignity & Automated Mobbing')}
                      className={`px-3 py-1 rounded-sm text-[10px] uppercase font-mono tracking-wider transition cursor-pointer ${
                        selectedCategory === 'Loss of Dignity & Automated Mobbing' 
                          ? 'bg-white text-black font-semibold' 
                          : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      Automated Mobbing
                    </button>
                  </div>

                  {/* RESET BUTTON */}
                  {(searchQuery || selectedCategory || selectedTag) && (
                    <button
                      onClick={handleClearFilters}
                      className="text-white/40 hover:text-white flex items-center space-x-1 cursor-pointer font-medium font-mono text-[10px] uppercase tracking-wider"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Selected Tag Active alert block */}
                {selectedTag && (
                  <div className="bg-amber-950/25 border border-amber-900/35 rounded-sm px-3 py-1.5 text-xs text-amber-400 flex items-center justify-between font-mono">
                    <span>Active Pattern Filtering Profile: <strong>#{selectedTag}</strong></span>
                    <button onClick={() => setSelectedTag(null)} className="text-amber-500 hover:text-amber-300 underline cursor-pointer">Clear Tag Filter</button>
                  </div>
                )}
              </div>

              {/* Stories Ledger List Display Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStories.map((story) => (
                  <StoryCard 
                    key={story.id} 
                    story={story} 
                    onUpvote={handleUpvote} 
                  />
                ))}
              </div>

              {/* Feed Empty States Handling */}
              {filteredStories.length === 0 && (
                <div className="p-12 text-center rounded-sm border border-dashed border-white/10 bg-white/[0.01] space-y-4 animate-fadeIn">
                  <ShieldAlert className="h-10 w-10 text-white/30 mx-auto" />
                  <p className="font-sans font-light text-lg text-white">No matching testimonies audited.</p>
                  <p className="text-xs text-white/40 max-w-md mx-auto">
                    Try refining your search keyword selection or resetting active category filter parameters to display stories.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="border border-white/10 rounded-sm px-4.5 py-2 text-[10px] uppercase font-mono tracking-wider text-white hover:bg-white/5 inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Ledger Search</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 2: SHARE TESTIMONY MULTI-STAGE FORM SUBMISSION */}
        {activeTab === 'submit' && (
          <StorySubmitForm 
            onStoryAdded={handleStoryAdded} 
            onCancel={() => setActiveTab('feed')} 
          />
        )}

        {/* VIEW 3: SYSTEMIC INSIGHTS AND DATA CHARTS DASHBOARD */}
        {activeTab === 'insights' && (
          <InsightsDashboard 
            stories={stories} 
            onSelectCategoryFilter={(category) => {
              setSelectedCategory(category);
              setActiveTab('feed');
              // Auto scroll down to catalog anchor
              const el = document.getElementById('archive-feed');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectTagFilter={(tag) => {
              setSelectedTag(tag);
              setActiveTab('feed');
              const el = document.getElementById('archive-feed');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 4: SAFETY RESOURCES hub INFO DIRECTORY */}
        {activeTab === 'safety' && <SafetyHub />}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0c0c0c] text-white/30 py-10 border-t border-white/5 mt-16 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-white font-sans uppercase tracking-[0.2em] text-xs font-semibold">The AI Collateral</h2>
              <p className="text-xs mt-1 text-white/40">Documenting the digital-surveillance and automation displacement of humane labor.</p>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] text-white/40 font-mono uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
              <span>Secure Server Verification Active</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] uppercase tracking-wider font-mono">
            <span>© 2026 The AI Collateral Network for Human-Dignified Autonomic Labor.</span>
            <div className="flex space-x-6 text-white/50">
              <a href="#archive-feed" onClick={() => setActiveTab('safety')} className="hover:text-white transition">Security Protocol</a>
              <span className="text-white/10">|</span>
              <a href="#archive-feed" onClick={() => setActiveTab('feed')} className="hover:text-white transition">Witness Archive</a>
              <span className="text-white/10">|</span>
              <a href="#archive-feed" onClick={() => setActiveTab('insights')} className="hover:text-white transition">Pattern Lab</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
