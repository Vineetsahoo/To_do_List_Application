import React, { useState } from 'react';
import { PlusCircle, Trash2, CheckCircle, Circle, ListTodo, Calendar, Flag, Tag } from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
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
  `;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('personal');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category'>('date');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        dueDate,
        priority,
        category
      }]);
      setNewTodo('');
      setDueDate('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const sortedTodos = [...todos].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (a.dueDate || '') > (b.dueDate || '') ? 1 : -1;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-100 to-sky-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl shadow-lg">
              <ListTodo className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Tasks
              </h1>
              <p className="text-gray-600 text-sm mt-1">Organize your day, achieve more</p>
            </div>
          </div>

          {/* Add Todo Form */}
          <form onSubmit={addTodo} className="mb-8 space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50 shadow-sm"
              />
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full md:w-auto px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white/50 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full md:w-auto px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white/50 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full md:w-auto px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white/50 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="personal">👤 Personal</option>
                <option value="work">💼 Work</option>
                <option value="shopping">🛒 Shopping</option>
                <option value="health">❤️ Health</option>
              </select>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:transform hover:scale-105 duration-200"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            </div>
          </form>

          {/* Sorting Options */}
          <div className="mb-6">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'category')}
              className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white/50 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="date">📅 Sort by Date</option>
              <option value="priority">🎯 Sort by Priority</option>
              <option value="category">🏷️ Sort by Category</option>
            </select>
          </div>

          {/* Todo List */}
          <div className="space-y-3">
            {sortedTodos.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-gray-600">Your task list is empty. Start fresh!</p>
              </div>
            ) : (
              sortedTodos.map(todo => (
                <div
                  key={todo.id}
                  className="group animate-fadeIn flex items-center gap-4 p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-gray-100/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`p-1 rounded-full transition-colors ${todo.completed ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:text-violet-600'}`}
                  >
                    {todo.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-base ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {todo.text}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs">
                      {todo.dueDate && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {todo.dueDate}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                        <Flag className="w-3.5 h-3.5" />
                        {todo.priority}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Tag className="w-3.5 h-3.5" />
                        {todo.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {todos.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                  {todos.filter(t => t.completed).length} of {todos.length} completed
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {todos.filter(t => t.priority === 'high').length} high priority
                </span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${(todos.filter(t => t.completed).length / todos.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
}

export default App;