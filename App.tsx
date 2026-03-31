
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ClipboardCopy, 
  Calendar, 
  StickyNote, 
  Bug, 
  Lightbulb, 
  Bell, 
  Check, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { NotesMap, AppSettings, Todo, DailyData, TodoCategory } from './types';
import { getTodayKey, getPreviousDays, formatDateFr } from './utils/dateUtils';
import { HistoryCard } from './components/HistoryCard';

const STORAGE_KEY_NOTES = 'standup_memo_v3_notes';
const STORAGE_KEY_SETTINGS = 'standup_memo_settings';

const App: React.FC = () => {
  const [notes, setNotes] = useState<NotesMap>({});
  const [settings, setSettings] = useState<AppSettings>({ windowSize: 6 });
  const [isSaving, setIsSaving] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState<TodoCategory>('task');

  const todayKey = getTodayKey();
  const previousDays = useMemo(() => getPreviousDays(settings.windowSize), [settings.windowSize]);
  const yesterdayKey = previousDays[0];
  const archiveKeys = previousDays.slice(1);

  // Initialisation et report automatique des tâches
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    
    let currentNotes: NotesMap = {};
    if (savedNotes) {
      currentNotes = JSON.parse(savedNotes);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const today = getTodayKey();
    const lastBusinessDay = getPreviousDays(1)[0];

    // Logique de report : si aujourd'hui est vide, on récupère les tâches de la dernière fois
    if (!currentNotes[today]) {
      const lastData = currentNotes[lastBusinessDay];
      const rolledTodos: Todo[] = [];
      
      if (lastData && lastData.todos) {
        lastData.todos.forEach(t => {
          if (!t.completed) {
            rolledTodos.push({ ...t, id: `rolled-${Date.now()}-${t.id}` });
          }
        });
      }

      currentNotes[today] = {
        note: '',
        todos: rolledTodos
      };
      
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(currentNotes));
    }

    setNotes(currentNotes);
  }, []);

  const saveToDisk = (updatedNotes: NotesMap) => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updatedNotes));
    setTimeout(() => setIsSaving(false), 500);
  };

  const updateDailyNote = (date: string, text: string) => {
    const updated = { 
      ...notes, 
      [date]: { 
        ...(notes[date] || { todos: [] }), 
        note: text 
      } 
    };
    setNotes(updated);
    saveToDisk(updated);
  };

  const toggleTodo = (date: string, todoId: string) => {
    const dayData = notes[date] || { note: '', todos: [] };
    const updatedTodos = dayData.todos.map(t => 
      t.id === todoId ? { ...t, completed: !t.completed } : t
    );
    const updated = { ...notes, [date]: { ...dayData, todos: updatedTodos } };
    setNotes(updated);
    saveToDisk(updated);
  };

  const addTodo = (date: string) => {
    if (!newTodoText.trim()) return;
    const dayData = notes[date] || { note: '', todos: [] };
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      completed: false,
      category: newTodoCategory
    };
    const updated = { ...notes, [date]: { ...dayData, todos: [...dayData.todos, newTodo] } };
    setNotes(updated);
    setNewTodoText('');
    saveToDisk(updated);
  };

  const deleteTodo = (date: string, todoId: string) => {
    const dayData = notes[date];
    if (!dayData) return;
    const updatedTodos = dayData.todos.filter(t => t.id !== todoId);
    const updated = { ...notes, [date]: { ...dayData, todos: updatedTodos } };
    setNotes(updated);
    saveToDisk(updated);
  };

  const getCategoryIcon = (category: TodoCategory) => {
    switch (category) {
      case 'bugfix': return <Bug size={14} />;
      case 'idea': return <Lightbulb size={14} />;
      case 'reminder': return <Bell size={14} />;
      default: return <Check size={14} />;
    }
  };

  const getCategoryColor = (category: TodoCategory) => {
    switch (category) {
      case 'bugfix': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'idea': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'reminder': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getCategoryBadge = (category: TodoCategory) => {
    switch (category) {
      case 'bugfix': return 'BUG';
      case 'idea': return 'IDÉE';
      case 'reminder': return 'RAPPEL';
      default: return 'TÂCHE';
    }
  };

  const renderDailyColumn = (date: string, title: string, isMain: boolean = false) => {
    const data = notes[date] || { note: '', todos: [] };
    const isToday = date === todayKey;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col h-full bg-white border-2 ${isMain ? 'border-indigo-500 shadow-2xl shadow-indigo-100' : 'border-slate-200'} rounded-[2.5rem] overflow-hidden transition-all`}
      >
        <div className={`px-10 py-8 border-b-2 ${isMain ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-900 border-slate-100'} flex justify-between items-center`}>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{title}</h2>
            <div className="flex items-center gap-2">
              <Calendar size={12} className="opacity-60" />
              <p className={`text-xs font-bold uppercase opacity-80 tracking-widest`}>{formatDateFr(date)}</p>
            </div>
          </div>
          {isSaving && isMain && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-[10px] font-black backdrop-blur-md"
             >
               <motion.div 
                 animate={{ scale: [1, 1.5, 1] }}
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="w-2 h-2 bg-white rounded-full"
               ></motion.div>
               SAUVEGARDE...
             </motion.div>
          )}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 overflow-hidden">
          {/* Todo Section - NOW MORE PROMINENT */}
          <div className="flex-[3] p-10 flex flex-col bg-slate-50/50 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={18} strokeWidth={3} />
                To-Do List
              </h3>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <span className="text-[10px] font-black text-slate-400">
                  {data.todos.filter(t => t.completed).length} / {data.todos.length} COMPLÉTÉES
                </span>
              </div>
            </div>
            
            {isToday && (
              <div className="space-y-4 mb-10">
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      placeholder="Qu'allez-vous accomplir aujourd'hui ?"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTodo(date)}
                      className="w-full text-sm bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:outline-none transition-all shadow-sm placeholder:text-slate-300 font-semibold pr-12"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-indigo-500 transition-colors">
                      {getCategoryIcon(newTodoCategory)}
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addTodo(date)} 
                    className="px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </motion.button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(['task', 'bugfix', 'idea', 'reminder'] as TodoCategory[]).map((cat) => (
                    <motion.button
                      key={cat}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      onClick={() => setNewTodoCategory(cat)}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                        newTodoCategory === cat 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      {getCategoryBadge(cat)}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-3">
              <AnimatePresence mode="popLayout">
                {data.todos.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="h-full flex flex-col items-center justify-center text-slate-300"
                  >
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 size={40} strokeWidth={1} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Rien à signaler pour le moment</p>
                  </motion.div>
                ) : (
                  data.todos.map(todo => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={todo.id} 
                      className={`group flex items-center gap-5 p-5 bg-white border-2 rounded-3xl transition-all hover:shadow-xl hover:shadow-indigo-50 ${todo.completed ? 'opacity-60 border-slate-50' : 'border-white shadow-sm'}`}
                    >
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => toggleTodo(date, todo.id)}
                        className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 hover:border-indigo-500 bg-white'}`}
                      >
                        {todo.completed && <Check size={18} strokeWidth={4} />}
                      </motion.button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-black px-2 py-1 rounded-lg border flex items-center gap-1.5 ${getCategoryColor(todo.category || 'task')}`}>
                            {getCategoryIcon(todo.category || 'task')}
                            {getCategoryBadge(todo.category || 'task')}
                          </span>
                        </div>
                        <p className={`text-base leading-tight break-words ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-900 font-bold'}`}>
                          {todo.text}
                        </p>
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteTodo(date, todo.id)} 
                        className="opacity-0 group-hover:opacity-100 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex-[2] p-10 flex flex-col bg-white overflow-hidden">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <StickyNote size={18} strokeWidth={3} />
              Notes & Compte-rendu
            </h3>
            <textarea
              value={data.note}
              onChange={(e) => updateDailyNote(date, e.target.value)}
              placeholder="Racontez votre journée, vos victoires, vos blocages..."
              className="w-full flex-1 text-slate-800 bg-white text-base leading-relaxed focus:outline-none resize-none placeholder:text-slate-200 font-semibold"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white pb-32">
      {/* Mini Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-base font-black text-white shadow-xl shadow-indigo-200"
            >
              S
            </motion.div>
            <div>
              <span className="text-lg font-black uppercase tracking-tighter text-indigo-900 block leading-none">Standup Memo</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Productivité Quotidienne</span>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const standup = `[HIER - ${formatDateFr(yesterdayKey)}]\n${notes[yesterdayKey]?.note || ''}\n\n[AUJOURD'HUI]\n${notes[todayKey]?.note || ''}`;
              navigator.clipboard.writeText(standup);
              alert('Standup copié dans le presse-papier !');
            }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
          >
            <ClipboardCopy size={16} />
            Copier le Standup
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-20">
        {/* Core Sections: Today & Yesterday */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-12 min-h-[850px]">
          {renderDailyColumn(todayKey, "Aujourd'hui", true)}
          {renderDailyColumn(yesterdayKey, "Hier", false)}
        </section>

        {/* Archives */}
        <section className="space-y-10 pt-16 border-t-4 border-slate-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-10 bg-indigo-100 rounded-full"></div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Archives Temporelles</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Voyagez dans le temps</p>
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={settings.windowSize} 
                onChange={(e) => setSettings({ ...settings, windowSize: parseInt(e.target.value) })}
                className="appearance-none bg-white border-2 border-slate-100 text-xs font-black uppercase tracking-widest rounded-2xl px-6 py-3.5 pr-12 focus:outline-none cursor-pointer hover:border-indigo-500 transition-all shadow-sm"
              >
                {[4, 8, 12, 20].map(n => (
                  <option key={n} value={n}>{n} jours d'historique</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {archiveKeys.map(date => (
              <HistoryCard 
                key={date} 
                date={date} 
                data={notes[date] || { note: '', todos: [] }}
                onChange={(val) => updateDailyNote(date, val)}
              />
            ))}
          </div>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 30px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
