import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, Trash2, CheckCircle, Circle, ListTodo, Calendar, Flag, Tag, 
  Search, Moon, Sun, Download, Upload, Clock, Play, Pause, 
  ChevronDown, ChevronRight, Plus, Edit3, Archive
} from 'lucide-react';

interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
  timeSpent: number; // in minutes
  isExpanded?: boolean;
  archived?: boolean;
}

function App() {
  const styles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;

  // State management
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('personal');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category' | 'created'>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('smartTasks-todos');
    const savedDarkMode = localStorage.getItem('smartTasks-darkMode');
    
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save to localStorage whenever todos or darkMode change
  useEffect(() => {
    localStorage.setItem('smartTasks-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('smartTasks-darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Timer functionality
  useEffect(() => {
    let interval: number;
    if (activeTimer !== null) {
      interval = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === activeTimer 
            ? { ...todo, timeSpent: todo.timeSpent + (1/60) }
            : todo
        ));
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            document.getElementById('new-todo-input')?.focus();
            break;
          case 'd':
            e.preventDefault();
            setDarkMode(!darkMode);
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [darkMode]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const newTask: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        dueDate,
        priority,
        category,
        subtasks: [],
        createdAt: new Date().toISOString(),
        timeSpent: 0,
        isExpanded: false,
        archived: false
      };
      setTodos([...todos, newTask]);
      setNewTodo('');
      setDueDate('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : undefined
          } 
        : todo
    ));
    // Stop timer if task is completed
    if (activeTimer === id) {
      setActiveTimer(null);
      setTimerSeconds(0);
    }
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
    if (activeTimer === id) {
      setActiveTimer(null);
      setTimerSeconds(0);
    }
  };

  const archiveTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, archived: !todo.archived } : todo
    ));
  };

  const addSubtask = (todoId: number, subtaskText: string) => {
    if (subtaskText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [...todo.subtasks, {
                id: Date.now(),
                text: subtaskText.trim(),
                completed: false
              }]
            }
          : todo
      ));
    }
  };

  const toggleSubtask = (todoId: number, subtaskId: number) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            subtasks: todo.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            )
          }
        : todo
    ));
  };

  const deleteSubtask = (todoId: number, subtaskId: number) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId)
          }
        : todo
    ));
  };

  const toggleExpanded = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, isExpanded: !todo.isExpanded } : todo
    ));
  };

  const startTimer = (id: number) => {
    if (activeTimer === id) {
      setActiveTimer(null);
      setTimerSeconds(0);
    } else {
      setActiveTimer(id);
      setTimerSeconds(0);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], {type:'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTodos = JSON.parse(e.target?.result as string);
          setTodos(importedTodos);
        } catch (error) {
          alert('Error importing file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getFilteredTodos = () => {
    let filtered = todos;

    // Filter by status
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(todo => !todo.completed && !todo.archived);
        break;
      case 'completed':
        filtered = filtered.filter(todo => todo.completed && !todo.archived);
        break;
      case 'archived':
        filtered = filtered.filter(todo => todo.archived);
        break;
      default:
        filtered = filtered.filter(todo => !todo.archived);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.subtasks.some(subtask => 
          subtask.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const sortedTodos = [...getFilteredTodos()].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'category':
        return a.category.localeCompare(b.category);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return darkMode ? 'text-red-400' : 'text-red-500';
      case 'medium': return darkMode ? 'text-yellow-400' : 'text-yellow-500';
      case 'low': return darkMode ? 'text-green-400' : 'text-green-500';
      default: return darkMode ? 'text-gray-400' : 'text-gray-500';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTaskStats = () => {
    const total = todos.filter(t => !t.archived).length;
    const completed = todos.filter(t => t.completed && !t.archived).length;
    const overdue = todos.filter(t => 
      !t.completed && 
      !t.archived && 
      t.dueDate && 
      new Date(t.dueDate) < new Date()
    ).length;
    const highPriority = todos.filter(t => 
      !t.completed && 
      !t.archived && 
      t.priority === 'high'
    ).length;
    
    return { total, completed, overdue, highPriority };
  };

  const stats = getTaskStats();
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const quickTemplates = [
    { text: 'Check emails', category: 'work', priority: 'medium' as const },
    { text: 'Daily standup meeting', category: 'work', priority: 'high' as const },
    { text: 'Grocery shopping', category: 'shopping', priority: 'low' as const },
    { text: 'Exercise/Workout', category: 'health', priority: 'medium' as const },
    { text: 'Review daily goals', category: 'personal', priority: 'medium' as const },
  ];

  const addQuickTask = (template: typeof quickTemplates[0]) => {
    const newTask: Todo = {
      id: Date.now(),
      text: template.text,
      completed: false,
      priority: template.priority,
      category: template.category,
      subtasks: [],
      createdAt: new Date().toISOString(),
      timeSpent: 0,
      isExpanded: false,
      archived: false
    };
    setTodos([...todos, newTask]);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-violet-100 via-indigo-100 to-sky-100'
    } py-4 px-4 sm:py-12 sm:px-6`}>
      <div className="max-w-6xl mx-auto">
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-8 border transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/90 border-gray-700/20 text-white' 
            : 'bg-white/90 border-white/20 text-gray-900'
        }`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-lg ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600' 
                  : 'bg-gradient-to-br from-violet-500 to-indigo-500'
              }`}>
                <ListTodo className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent'
                }`}>
                  Smart Tasks
                </h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Organize your day, achieve more
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Toggle dark mode (Ctrl+D)"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Export/Import */}
              <button
                onClick={exportData}
                className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-green-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Export tasks"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Import tasks"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-200'
            }`}>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Tasks
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Overdue
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="text-2xl font-bold text-yellow-500">{completionRate.toFixed(0)}%</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Progress
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks... (Ctrl+F)"
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white/50 border-gray-200 shadow-sm placeholder-gray-500'
                }`}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`px-4 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-white' 
                  : 'bg-white/50 border-gray-200 shadow-sm'
              }`}
            >
              <option value="all">📋 All Tasks</option>
              <option value="active">⚡ Active</option>
              <option value="completed">✅ Completed</option>
              <option value="archived">📦 Archived</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-4 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-white' 
                  : 'bg-white/50 border-gray-200 shadow-sm'
              }`}
            >
              <option value="date">📅 Sort by Date</option>
              <option value="priority">🎯 Sort by Priority</option>
              <option value="category">🏷️ Sort by Category</option>
              <option value="created">🕒 Sort by Created</option>
            </select>
            
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2.5 text-sm rounded-xl border transition-all flex items-center justify-center gap-2 ${
                showArchived
                  ? (darkMode ? 'bg-purple-600 border-purple-500 text-white' : 'bg-violet-600 border-violet-500 text-white')
                  : (darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white/50 border-gray-200 hover:bg-white/70')
              }`}
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>

          {/* Quick Templates */}
          <div className={`mb-6 p-4 rounded-xl border ${
            darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-white/30 border-gray-200'
          }`}>
            <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Quick Templates:
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => addQuickTask(template)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-600/50 border-gray-500 text-gray-300 hover:bg-gray-500' 
                      : 'bg-white/50 border-gray-300 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  {template.text}
                </button>
              ))}
            </div>
          </div>

          {/* Add Todo Form */}
          <form onSubmit={addTodo} className="mb-8 space-y-4">
            <div className="flex gap-3">
              <input
                id="new-todo-input"
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done? (Ctrl+N)"
                className={`flex-1 px-4 py-3 text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white/50 border-gray-200 shadow-sm placeholder-gray-500'
                }`}
              />
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full md:w-auto px-4 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white' 
                    : 'bg-white/50 border-gray-200 shadow-sm'
                }`}
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className={`w-full md:w-auto px-4 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white' 
                    : 'bg-white/50 border-gray-200 shadow-sm'
                }`}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full md:w-auto px-4 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white' 
                    : 'bg-white/50 border-gray-200 shadow-sm'
                }`}
              >
                <option value="personal">👤 Personal</option>
                <option value="work">💼 Work</option>
                <option value="shopping">🛒 Shopping</option>
                <option value="health">❤️ Health</option>
                <option value="finance">💰 Finance</option>
                <option value="learning">📚 Learning</option>
              </select>
              <button
                type="submit"
                className={`w-full md:w-auto px-6 py-2.5 text-sm rounded-xl text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:transform hover:scale-105 duration-200 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90'
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            </div>
          </form>

          {/* Todo List */}
          <div className="space-y-3">
            {sortedTodos.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border ${
                darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-white/50 border-gray-100'
              }`}>
                <div className="text-4xl mb-3">
                  {filterStatus === 'completed' ? '🎉' : filterStatus === 'archived' ? '📦' : '✨'}
                </div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {filterStatus === 'completed' 
                    ? 'No completed tasks yet. Start working!' 
                    : filterStatus === 'archived' 
                    ? 'No archived tasks.' 
                    : searchTerm 
                    ? 'No tasks match your search.' 
                    : 'Your task list is empty. Start fresh!'}
                </p>
              </div>
            ) : (
              sortedTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`group animate-fadeIn rounded-xl border transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700/40 hover:bg-gray-700/60 border-gray-600/50 shadow-sm hover:shadow-md' 
                      : 'bg-white/60 hover:bg-white/80 border-gray-100/50 shadow-sm hover:shadow-md'
                  } ${todo.completed ? 'opacity-75' : ''}`}
                >
                  {/* Main Task Row */}
                  <div className="flex items-center gap-4 p-4">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`p-1 rounded-full transition-colors ${
                        todo.completed 
                          ? 'text-green-500 bg-green-50 dark:bg-green-900/30' 
                          : (darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-400 hover:text-violet-600')
                      }`}
                    >
                      {todo.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      {editingTodo === todo.id ? (
                        <input
                          type="text"
                          defaultValue={todo.text}
                          autoFocus
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              setTodos(todos.map(t => 
                                t.id === todo.id ? { ...t, text: e.target.value.trim() } : t
                              ));
                            }
                            setEditingTodo(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                            if (e.key === 'Escape') {
                              setEditingTodo(null);
                            }
                          }}
                          className={`w-full px-2 py-1 text-base rounded border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                        />
                      ) : (
                        <div>
                          <span 
                            className={`text-base cursor-pointer ${
                              todo.completed 
                                ? (darkMode ? 'text-gray-500 line-through' : 'text-gray-400 line-through')
                                : (darkMode ? 'text-gray-100' : 'text-gray-700')
                            }`}
                            onClick={() => setEditingTodo(todo.id)}
                          >
                            {todo.text}
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs">
                            {todo.dueDate && (
                              <span className={`flex items-center gap-1 ${
                                new Date(todo.dueDate) < new Date() && !todo.completed
                                  ? 'text-red-500'
                                  : (darkMode ? 'text-gray-400' : 'text-gray-500')
                              }`}>
                                <Calendar className="w-3.5 h-3.5" />
                                {todo.dueDate}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                              <Flag className="w-3.5 h-3.5" />
                              {todo.priority}
                            </span>
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Tag className="w-3.5 h-3.5" />
                              {todo.category}
                            </span>
                            {todo.timeSpent > 0 && (
                              <span className={`flex items-center gap-1 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(todo.timeSpent)}
                              </span>
                            )}
                            {activeTimer === todo.id && (
                              <span className="flex items-center gap-1 text-red-500 animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {formatTimerDisplay(timerSeconds)}
                              </span>
                            )}
                          </div>
                          
                          {/* Subtasks Progress */}
                          {todo.subtasks.length > 0 && (
                            <div className="mt-2">
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length} subtasks completed
                              </div>
                              <div className={`mt-1 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                <div 
                                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(todo.subtasks.filter(s => s.completed).length / todo.subtasks.length) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {/* Timer Button */}
                      {!todo.completed && (
                        <button
                          onClick={() => startTimer(todo.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            activeTimer === todo.id
                              ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                              : (darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50')
                          }`}
                          title={activeTimer === todo.id ? 'Stop timer' : 'Start timer'}
                        >
                          {activeTimer === todo.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      {/* Expand/Collapse Subtasks */}
                      <button
                        onClick={() => toggleExpanded(todo.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Toggle subtasks"
                      >
                        {todo.isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingTodo(todo.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-600' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title="Edit task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      {/* Archive Button */}
                      <button
                        onClick={() => archiveTodo(todo.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          todo.archived
                            ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : (darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50')
                        }`}
                        title={todo.archived ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtasks Section */}
                  {todo.isExpanded && (
                    <div className={`border-t px-4 pb-4 ${
                      darkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'
                    }`}>
                      <div className="pt-4 space-y-2">
                        {todo.subtasks.map(subtask => (
                          <div key={subtask.id} className="flex items-center gap-3 group/subtask">
                            <button
                              onClick={() => toggleSubtask(todo.id, subtask.id)}
                              className={`p-0.5 rounded-full transition-colors ${
                                subtask.completed 
                                  ? 'text-green-500' 
                                  : (darkMode ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-violet-600')
                              }`}
                            >
                              {subtask.completed ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <span className={`flex-1 text-sm ${
                              subtask.completed 
                                ? (darkMode ? 'text-gray-500 line-through' : 'text-gray-400 line-through')
                                : (darkMode ? 'text-gray-300' : 'text-gray-600')
                            }`}>
                              {subtask.text}
                            </span>
                            <button
                              onClick={() => deleteSubtask(todo.id, subtask.id)}
                              className={`opacity-0 group-hover/subtask:opacity-100 p-1 rounded transition-all ${
                                darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Add Subtask Input */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                            addSubtask(todo.id, input.value);
                            input.value = '';
                          }}
                          className="flex gap-2 mt-3"
                        >
                          <input
                            type="text"
                            placeholder="Add subtask..."
                            className={`flex-1 px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 placeholder-gray-500'
                            }`}
                          />
                          <button
                            type="submit"
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              darkMode 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                : 'bg-violet-600 hover:bg-violet-700 text-white'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Enhanced Summary */}
          {todos.filter(t => !t.archived).length > 0 && (
            <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Completed:</span>
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {stats.completed}/{stats.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>High Priority:</span>
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {stats.highPriority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Overdue:</span>
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {stats.overdue}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress:</span>
                  <span className="font-medium">{completionRate.toFixed(0)}%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${completionRate}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              
              {/* Time Tracking Summary */}
              {todos.some(t => t.timeSpent > 0) && (
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total Time Tracked:
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {formatTime(todos.reduce((total, todo) => total + todo.timeSpent, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keyboard Shortcuts Help */}
          <div className={`mt-6 p-4 rounded-xl border text-xs ${
            darkMode ? 'bg-gray-700/20 border-gray-600 text-gray-400' : 'bg-gray-50/50 border-gray-200 text-gray-500'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>⌘/Ctrl + N: New task</div>
              <div>⌘/Ctrl + F: Search</div>
              <div>⌘/Ctrl + D: Dark mode</div>
            </div>
          </div>
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
}

export default App;