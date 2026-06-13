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
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const STATUSES: Status[] = ['Todo', 'Attempted', 'Solved'];
const CATEGORIES: Category[] = [
  'Arrays', 'Strings', 'Trees', 'Graphs',
  'Dynamic Programming', 'Math', 'Sorting',
  'Binary Search', 'Backtracking', 'Other',
];

const DIFF_STYLES: Record<Difficulty, { badge: string; bar: string; btn: string }> = {
  Easy:   { badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', btn: 'bg-emerald-500 text-white' },
  Medium: { badge: 'bg-amber-100 text-amber-700',     bar: 'bg-amber-500',   btn: 'bg-amber-500 text-white'   },
  Hard:   { badge: 'bg-red-100 text-red-700',         bar: 'bg-red-500',     btn: 'bg-red-500 text-white'     },
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
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
      <div
        className={`h-1.5 rounded-full ${color} transition-all duration-500`}
        style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
  );
}

function App() {
  const [problems, setProblems] = useState<Problem[]>([]);
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

  useEffect(() => {
    const saved = localStorage.getItem('dsa-tracker-v2');
    if (saved) setProblems(JSON.parse(saved));
  }, []);

  const save = (updated: Problem[]) => {
    setProblems(updated);
    localStorage.setItem('dsa-tracker-v2', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProblem) {
      save(problems.map(p =>
        p.id === editingProblem.id
          ? {
              ...editingProblem,
              ...form,
              solvedAt:
                form.status === 'Solved' && editingProblem.status !== 'Solved'
                  ? new Date().toISOString()
                  : editingProblem.solvedAt,
            }
          : p
      ));
    } else {
      save([
        ...problems,
        {
          id: crypto.randomUUID(),
          ...form,
          createdAt: new Date().toISOString(),
          solvedAt: form.status === 'Solved' ? new Date().toISOString() : null,
        },
      ]);
    }
    closeModal();
  };

  const openModal = (problem?: Problem) => {
    if (problem) {
      setEditingProblem(problem);
      setForm({
        number: problem.number,
        title: problem.title,
        difficulty: problem.difficulty,
        category: problem.category,
        status: problem.status,
        notes: problem.notes,
        link: problem.link,
        confidence: problem.confidence,
        flagged: problem.flagged,
      });
    } else {
      setEditingProblem(null);
      setForm({
        number: '',
        title: '',
        difficulty: 'Easy',
        category: 'Arrays',
        status: 'Todo',
        notes: '',
        link: '',
        confidence: 3,
        flagged: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProblem(null);
  };

  const cycleStatus = (problem: Problem) => {
    const cycle: Status[] = ['Todo', 'Attempted', 'Solved'];
    const next = cycle[(cycle.indexOf(problem.status) + 1) % cycle.length];
    save(
      problems.map(p =>
        p.id === problem.id
          ? {
              ...p,
              status: next,
              solvedAt: next === 'Solved' ? new Date().toISOString() : p.solvedAt,
            }
          : p
      )
    );
  };

  const toggleFlag = (id: string) => {
    save(problems.map(p => (p.id === id ? { ...p, flagged: !p.flagged } : p)));
  };

  // Stats
  const solved   = problems.filter(p => p.status === 'Solved').length;
  const attempted = problems.filter(p => p.status === 'Attempted').length;
  const easySolved = problems.filter(p => p.difficulty === 'Easy'   && p.status === 'Solved').length;
  const easyTotal  = problems.filter(p => p.difficulty === 'Easy').length;
  const medSolved  = problems.filter(p => p.difficulty === 'Medium' && p.status === 'Solved').length;
  const medTotal   = problems.filter(p => p.difficulty === 'Medium').length;
  const hardSolved = problems.filter(p => p.difficulty === 'Hard'   && p.status === 'Solved').length;
  const hardTotal  = problems.filter(p => p.difficulty === 'Hard').length;
  const flagged    = problems.filter(p => p.flagged).length;

  const getStreak = () => {
    const solveDates = [
      ...new Set(
        problems
          .filter(p => p.solvedAt)
          .map(p => new Date(p.solvedAt!).toDateString())
      ),
    ];
    if (solveDates.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (solveDates.includes(d.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();
  const thisWeek = problems.filter(p => {
    if (!p.solvedAt) return false;
    return (new Date().getTime() - new Date(p.solvedAt).getTime()) / 86400000 <= 7;
  }).length;

  const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
  const STATUS_ORDER = { Todo: 0, Attempted: 1, Solved: 2 };

  const filtered = problems
    .filter(p => {
      if (filterDifficulty !== 'All' && p.difficulty !== filterDifficulty) return false;
      if (filterStatus !== 'All' && p.status !== filterStatus) return false;
      if (filterCategory !== 'All' && p.category !== filterCategory) return false;
      if (filterFlagged && !p.flagged) return false;
      if (
        search &&
        !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.number.includes(search)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date')       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'title')      return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
      if (sortBy === 'status')     return STATUS_ORDER[b.status] - STATUS_ORDER[a.status];
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-sans">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs tracking-tight select-none">
              DSA
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">Problem Tracker</h1>
              <p className="text-xs text-gray-400">
                {solved} solved · {problems.length} total
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Problem
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{solved}</p>
            <p className="text-xs text-gray-500 mt-0.5">Problems Solved</p>
            <ProgressBar value={solved} max={problems.length} color="bg-blue-500" />
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold text-orange-500">{streak}</p>
              <p className="text-sm text-orange-300 mb-0.5">days</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Current Streak</p>
            <p className="text-xs text-orange-400 mt-1">{thisWeek} solved this week</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            {[
              { label: 'Easy',   solved: easySolved, total: easyTotal, color: 'text-emerald-600', bar: 'bg-emerald-500' },
              { label: 'Medium', solved: medSolved,  total: medTotal,  color: 'text-amber-600',   bar: 'bg-amber-500'   },
              { label: 'Hard',   solved: hardSolved, total: hardTotal, color: 'text-red-600',     bar: 'bg-red-500'     },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${d.color}`}>{d.label}</span>
                  <span className="text-gray-400">{d.solved}/{d.total}</span>
                </div>
                <ProgressBar value={d.solved} max={d.total} color={d.bar} />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-violet-600">{flagged}</p>
            <p className="text-xs text-gray-500 mt-0.5">Flagged for Review</p>
            <p className="text-xs text-gray-400 mt-1">{attempted} in progress</p>
          </div>

        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by title or problem #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Recent first</option>
              <option value="title">Title A-Z</option>
              <option value="difficulty">Difficulty</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Difficulty + Status + Flagged */}
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...DIFFICULTIES] as const).map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d as typeof filterDifficulty)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterDifficulty === d
                    ? d === 'All'
                      ? 'bg-gray-800 text-white'
                      : DIFF_STYLES[d as Difficulty].btn
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
            <span className="w-px bg-gray-200 mx-0.5" />
            {(['All', ...STATUSES] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s as typeof filterStatus)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
            <span className="w-px bg-gray-200 mx-0.5" />
            <button
              onClick={() => setFilterFlagged(!filterFlagged)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterFlagged ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Flagged
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterCategory === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Topics
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setFilterCategory(filterCategory === c ? 'All' : c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterCategory === c ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {problems.length > 0 && (
          <p className="text-xs text-gray-400 px-1">
            {filtered.length} of {problems.length} problems
          </p>
        )}

        {/* Problem list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-14 text-center">
            {problems.length === 0 ? (
              <>
                <p className="text-3xl mb-3">📋</p>
                <p className="font-medium text-gray-700">No problems yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first LeetCode problem to get started</p>
                <button
                  onClick={() => openModal()}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add First Problem
                </button>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-700">No problems match your filters</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting the search or filters above</p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filtered.map((problem, idx) => (
              <div
                key={problem.id}
                className={`group px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                  idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">

                  {/* Status cycle button */}
                  <button
                    onClick={() => cycleStatus(problem)}
                    title="Click to cycle status"
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      problem.status === 'Solved'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : problem.status === 'Attempted'
                        ? 'border-amber-400 text-amber-400 hover:bg-amber-50'
                        : 'border-gray-300 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {problem.status === 'Solved' ? '✓' : problem.status === 'Attempted' ? '~' : ''}
                  </button>

                  {/* Main info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => openModal(problem)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {problem.number && (
                        <span className="text-xs text-gray-400 font-mono tabular-nums">
                          #{problem.number}
                        </span>
                      )}
                      <span
                        className={`font-medium text-sm ${
                          problem.status === 'Solved' ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {problem.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFF_STYLES[problem.difficulty].badge}`}>
                        {problem.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        {problem.category}
                      </span>
                      {problem.flagged && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                          Review
                        </span>
                      )}
                    </div>
                    {problem.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">{problem.notes}</p>
                    )}
                  </div>

                  {/* Confidence dots */}
                  <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i <= problem.confidence ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Hover actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {problem.link && (
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Open
                      </a>
                    )}
                    <button
                      onClick={() => toggleFlag(problem.id)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                        problem.flagged
                          ? 'text-violet-600 bg-violet-50'
                          : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'
                      }`}
                    >
                      {problem.flagged ? 'Unflag' : 'Flag'}
                    </button>
                    <button
                      onClick={() => save(problems.filter(p => p.id !== problem.id))}
                      className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingProblem ? 'Edit Problem' : 'Add Problem'}
              </h2>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-lg leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

              {/* Number + Title */}
              <div className="flex gap-3">
                <div className="w-20 flex-shrink-0">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">#</label>
                  <input
                    type="text"
                    placeholder="1"
                    value={form.number}
                    onChange={e => setForm({ ...form, number: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Two Sum"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  LeetCode URL <span className="normal-case text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={form.link}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, difficulty: d })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.difficulty === d ? DIFF_STYLES[d].btn : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Status</label>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Category })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Confidence */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Confidence &mdash; {CONFIDENCE_LABELS[form.confidence]}
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm({ ...form, confidence: i })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        i <= form.confidence ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Notes <span className="normal-case text-gray-400">(optional)</span>
                </label>
                <textarea
                  placeholder="Key insight, approach used, edge cases to remember..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Flag toggle */}
              <button
                type="button"
                onClick={() => setForm({ ...form, flagged: !form.flagged })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.flagged
                    ? 'border-violet-300 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{form.flagged ? '⚑' : '⚐'}</span>
                {form.flagged ? 'Flagged for review' : 'Flag for review'}
              </button>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {editingProblem ? 'Save Changes' : 'Add Problem'}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;