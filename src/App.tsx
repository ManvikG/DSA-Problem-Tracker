import { useState, useEffect } from 'react';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Status = 'Todo' | 'Attempted' | 'Solved';
type Category =
  | 'Arrays'
  | 'Strings'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Math'
  | 'Sorting'
  | 'Binary Search'
  | 'Backtracking'
  | 'Other';

interface Problem {
  id: string;
  number: string;
  title: string;
  difficulty: Difficulty;
  category: Category;
  status: Status;
  notes: string;
  link: string;
  confidence: number;
  flagged: boolean;
  createdAt: string;
  solvedAt: string | null;
  language: string; // 👈 Track language per problem
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const STATUSES: Status[] = ['Todo', 'Attempted', 'Solved'];
const CATEGORIES: Category[] = [
  'Arrays', 'Strings', 'Trees', 'Graphs',
  'Dynamic Programming', 'Math', 'Sorting',
  'Binary Search', 'Backtracking', 'Other',
];

const DIFF_STYLES: Record<Difficulty, { badge: string; bar: string; btn: string }> = {
  Easy:   { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', bar: 'bg-emerald-500', btn: 'bg-emerald-500 text-white' },
  Medium: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',     bar: 'bg-amber-500',   btn: 'bg-amber-500 text-white'   },
  Hard:   { badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',         bar: 'bg-red-500',     btn: 'bg-red-500 text-white'     },
};

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Just guessing',
  2: 'Shaky',
  3: 'Getting there',
  4: 'Pretty solid',
  5: 'Locked in',
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1 overflow-hidden">
      <div
        className={`h-1.5 rounded-full ${color} transition-all duration-500`}
        style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
  );
}

function App() {
  // --- EXISTING HOOKS & NEW THEME + LANGUAGE MANAGEMENT ---
  const [problems, setProblems] = useState<Problem[]>([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [trackers, setTrackers] = useState<string[]>(() => {
    const savedLangs = localStorage.getItem('dsa-trackers-languages');
    return savedLangs ? JSON.parse(savedLangs) : ['JavaScript', 'Python', 'Java', 'C++'];
  });
  const [activeTracker, setActiveTracker] = useState(() => trackers[0] || 'JavaScript');
  const [newLanguage, setNewLanguage] = useState('');
  const [showAddLanguage, setShowAddLanguage] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'difficulty' | 'status'>('date');
  
  const [form, setForm] = useState({
    number: '',
    title: '',
    difficulty: 'Easy' as Difficulty,
    category: 'Arrays' as Category,
    status: 'Todo' as Status,
    notes: '',
    link: '',
    confidence: 3,
    flagged: false,
  });

  // Load Main Local Storage Payload
  useEffect(() => {
    const saved = localStorage.getItem('dsa-tracker-v2');
    if (saved) setProblems(JSON.parse(saved));
  }, []);

  // Sync Global Document Classes For Theme Swapping
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const save = (updated: Problem[]) => {
    setProblems(updated);
    localStorage.setItem('dsa-tracker-v2', JSON.stringify(updated));
  };

  const handleAddLanguageTracker = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLang = newLanguage.trim();
    if (cleanLang && !trackers.includes(cleanLang)) {
      const updatedLangs = [...trackers, cleanLang];
      setTrackers(updatedLangs);
      localStorage.setItem('dsa-trackers-languages', JSON.stringify(updatedLangs));
      setActiveTracker(cleanLang);
      setNewLanguage('');
      setShowAddLanguage(false);
    }
  };

  const handleDeleteTracker = (langToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid switching tabs while deleting
    if (trackers.length <= 1) return; // Prevent empty layout states
    
    const updatedLangs = trackers.filter(t => t !== langToDelete);
    setTrackers(updatedLangs);
    localStorage.setItem('dsa-trackers-languages', JSON.stringify(updatedLangs));
    
    // Purge local tasks matching