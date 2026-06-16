import { useState, useEffect } from 'react';

const TOPICS = ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming', 'Math', 'Sorting', 'Binary Search', 'Backtracking', 'Other'];
const STATUSES = ['Todo', 'Attempted', 'Solved', 'Flagged'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [trackers, setTrackers] = useState(['JavaScript', 'Python']);
  const [activeTracker, setActiveTracker] = useState('JavaScript');
  const [newLanguage, setNewLanguage] = useState('');
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters for your main dashboard view
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Adding a New Problem
  const [formTitle, setFormTitle] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('Easy');
  const [formStatus, setFormStatus] = useState('Todo');
  const [formTopic, setFormTopic] = useState('Arrays');

  // --- DARK MODE EFFECT ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- HANDLERS ---
  const handleAddTracker = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLanguage.trim() && !trackers.includes(newLanguage.trim())) {
      setTrackers([...trackers, newLanguage.trim()]);
      setActiveTracker(newLanguage.trim());
      setNewLanguage('');
      setShowAddLanguage(false);
    }
  };

  const handleCreateProblem = (e: React.FormEvent) => {
    e.preventDefault();
    // This is where your Supabase insert code will go!
    console.log({
      title: formTitle,
      difficulty: formDifficulty,
      status: formStatus,
      topic: formTopic,
      language: activeTracker // Keeps it locked to the current tracker!
    });
    
    // Reset form and close
    setFormTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER BAR */}
        <header className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">🚀 DSA Problem Tracker</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Level up your coding grind</p>
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </header>

        {/* MULTI-LANGUAGE TRACKER TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-1 overflow-x-auto">
          {trackers.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTracker(lang)}
              className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap -mb-[2px] border-b-2 ${
                activeTracker === lang
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'
              }`}
            >
              {lang} Tracker
            </button>
          ))}

          {showAddLanguage ? (
            <form onSubmit={handleAddTracker} className="flex items-center gap-2 ml-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="e.g., C++"
                className="px-3 py-1 text-sm border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 outline-none"
                autoFocus
              />
              <button type="submit" className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium">Add</button>
              <button type="button" onClick={() => setShowAddLanguage(false)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 px-1">✕</button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddLanguage(true)}
              className="text-sm text-blue-600 dark:text-blue-400 font-semibold px-3 py-2 hover:underline whitespace-nowrap"
            >
              ➕ New Tracker
            </button>
          )}
        </div>

        {/* SEARCH AND FILTERS PANEL (Clean dashboard view) */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or problem #..."
              className="flex-1 p-3 border rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 outline-none focus:border-blue-500"
            />
            
            {/* ADD PROBLEM BUTTON TRIGGER */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/10 transition-all text-center whitespace-nowrap"
            >
              ➕ Add Problem
            </button>
          </div>

          {/* Filters Out In Open */}
          <div className="space-y-3 pt-2">
            {/* Difficulties & Statuses Row */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="font-bold text-gray-400 mr-2">Filters:</span>
              {['All', ...DIFFICULTIES].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-full border font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent'
                      : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {diff}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2 hidden sm:block"></div>

              {['All', ...STATUSES].map((stat) => (
                <button
                  key={stat}
                  onClick={() => setSelectedStatus(stat)}
                  className={`px-3 py-1.5 rounded-full border font-medium transition-all ${
                    selectedStatus === stat
                      ? 'bg-blue-600 text-white border-transparent'
                      : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>

            {/* Main Topics Selector Row */}
            <div className="flex flex-wrap gap-1.5 items-center text-xs pt-1">
              <span className="font-bold text-gray-400 mr-2">Topics:</span>
              {['All Topics', ...TOPICS].map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-2.5 py-1 rounded-md border font-medium transition-all ${
                    selectedTopic === topic
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                      : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WORKSPACE DISPLAY AREA */}
        <main className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 min-h-[300px] flex items-center justify-center text-center">
          <div className="text-gray-400 dark:text-gray-600">
            <p className="text-lg font-semibold">Displaying {activeTracker} problems</p>
            <p className="text-sm">Filtered by: {selectedTopic} • {selectedDifficulty} • {selectedStatus}</p>
            <p className="mt-4 text-xs italic text-gray-400/70">Connect your Supabase fetch query here to populate rows.</p>
          </div>
        </main>

        {/* --- MODAL DIALOG POPUP (Hidden by default, holds form options) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Track New Problem</h3>
                <p className="text-xs text-gray-500">Adding to your <span className="font-bold text-blue-500">{activeTracker}</span> tracker</p>
              </div>

              <form onSubmit={handleCreateProblem} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Problem Name / URL</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., 1. Two Sum"
                    className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Difficulty & Status Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Difficulty</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 outline-none"
                    >
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 outline-none"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Hidden Topics Selector inside popup form */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Problem Topic</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto border border-gray-100 dark:border-gray-800 p-2 rounded-xl bg-gray-50 dark:bg-gray-950">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setFormTopic(topic)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all ${
                          formTopic === topic
                            ? 'bg-blue-600 text-white border-transparent'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dialog Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold border rounded-xl border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    Save Problem
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}