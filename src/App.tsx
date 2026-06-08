import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, ShieldAlert } from 'lucide-react';
import { Story } from './types';
import Header from './components/Header';
import StorySubmitForm from './components/StorySubmitForm';
import StoryCard from './components/StoryCard';
import InsightsDashboard from './components/InsightsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'submit' | 'dashboard'>('submit');
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // UX Alerts
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load initial pre-seeded stories
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

        const localSaved = localStorage.getItem('ai_collateral_user_stories');
        let userLocalStories: Story[] = [];
        if (localSaved) {
          try {
            userLocalStories = JSON.parse(localSaved);
          } catch (e) {
            console.error('Error parsing local stories dataset:', e);
          }
        }

        const merged: Story[] = [...userLocalStories];
        serverStories.forEach((srv) => {
          if (!merged.find((m) => m.id === srv.id)) {
            merged.push(srv);
          }
        });

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

  const handleStoryAdded = (newStory: Story) => {
    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);

    const localUserStories = updatedStories.filter((s) => !s.id.startsWith('seed-'));
    localStorage.setItem('ai_collateral_user_stories', JSON.stringify(localUserStories));

    setNotification('Testimony sanitized and committed to the archive ledger.');
    setTimeout(() => setNotification(null), 5000);

    setActiveTab('dashboard');
  };

  const handleUpvote = (id: string) => {
    const updated = stories.map((st) => {
      if (st.id === id) {
        return { ...st, upvotes: st.upvotes + 1 };
      }
      return st;
    });
    setStories(updated);

    const target = updated.find((st) => st.id === id);
    if (target && !target.id.startsWith('seed-')) {
      const userStories = updated.filter((s) => !s.id.startsWith('seed-'));
      localStorage.setItem('ai_collateral_user_stories', JSON.stringify(userStories));
    }
  };

  const filteredStories = stories.filter((st) => {
    const matchSafe = st.safetyStatus === 'approved';

    const matchSearch = searchQuery
      ? st.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.anonymizedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.industry && st.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (st.role && st.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        st.alias.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchCategory = selectedCategory ? st.category === selectedCategory : true;
    const matchTag = selectedTag ? st.extractedPatterns?.includes(selectedTag) || st.tags?.includes(selectedTag) : true;

    return matchSafe && matchSearch && matchCategory && matchTag;
  });

  const totalAuditedVectors = Array.from(new Set(stories.flatMap((s) => s.extractedPatterns || []))).length;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#e0e0e0] selection:bg-white selection:text-black flex flex-col font-sans">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        storyCount={stories.length}
        patternCount={totalAuditedVectors}
      />

      {notification && (
        <div className="bg-emerald-950/40 border-b border-emerald-800/30 text-emerald-400 text-[10px] uppercase tracking-wider px-4 py-3 font-mono text-center animate-fadeIn shadow flex items-center justify-center space-x-2">
          <span>{notification}</span>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'submit' && (
          <StorySubmitForm 
            onStoryAdded={handleStoryAdded} 
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-0">
            {/* 1. The Leaderboard and Data */}
            <InsightsDashboard 
              stories={stories} 
              onSelectCategoryFilter={(category) => {
                setSelectedCategory(category);
                const el = document.getElementById('archive-feed');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectTagFilter={(tag) => {
                setSelectedTag(tag);
                const el = document.getElementById('archive-feed');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* The Actual Feed of Stories is removed as requested - data is kept for internal verification only */}
            <div id="archive-feed" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
              <div className="p-12 text-center rounded-sm border border-dashed border-white/10 bg-white/[0.01] space-y-4">
                <ShieldAlert className="h-10 w-10 text-emerald-500/50 mx-auto" />
                <p className="font-sans font-light text-lg text-white">Public Feed Disabled for Safety</p>
                <p className="text-xs text-white/40 max-w-md mx-auto leading-relaxed">
                  To protect our contributors, individual evidence submissions are not displayed publicly. All data is securely routed to our team for internal verification, validation, and inclusion in the aggregated structural metrics above.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#0c0c0c] text-white/30 py-10 border-t border-white/5 mt-16 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-white font-sans uppercase tracking-[0.2em] text-xs font-semibold">The AI Collateral</h2>
              <p className="text-xs mt-1 text-white/40">Documenting human abuse hidden behind algorithms.</p>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] text-white/40 font-mono uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
              <span>Secure Server Verification Active</span>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider font-mono">
            <span>© 2026 The AI Collateral</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
