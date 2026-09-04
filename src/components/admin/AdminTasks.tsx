import React, { useState, useEffect } from 'react';
import { googleSignIn, getAccessToken, initAuth } from '../../lib/workspace-auth';
import { CheckSquare, LogIn, Plus, Trash2 } from 'lucide-react';
import type { User } from 'firebase/auth';

interface Task {
  id: string;
  title: string;
  status: string;
  notes?: string;
}

export default function AdminTasks() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskListId, setTaskListId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setToken(token);
        setNeedsAuth(false);
        fetchTasks(token);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const fetchTasks = async (accessToken: string) => {
    setLoading(true);
    try {
      // First get the default task list
      const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const listsData = await listsRes.json();
      const listId = listsData.items?.[0]?.id;
      if (!listId) throw new Error('No task list found');
      
      setTaskListId(listId);

      // Fetch tasks from the list
      const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const tasksData = await tasksRes.json();
      setTasks(tasksData.items || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        fetchTasks(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !taskListId || !token) return;

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTaskTitle })
      });
      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!taskListId || !token) return;
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  const deleteTask = async (task: Task) => {
    if (!taskListId || !token) return;
    
    if (!window.confirm(`Naozaj vymazať úlohu "${task.title}"?`)) return;

    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== task.id));

    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      fetchTasks(token); // Reload if failed
    }
  };

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <CheckSquare className="w-16 h-16 text-zinc-600 mb-6" />
        <h2 className="text-3xl font-black uppercase mb-4 text-white">Google Tasks Integrácia</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest mb-8 max-w-md">
          Pre správu úloh U.S.C potrebuješ prepojiť svoj Google účet a povoliť prístup k úlohám.
        </p>
        
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-3 bg-white text-black px-8 py-4 font-black uppercase tracking-widest border-4 border-black hover:bg-zinc-300 hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
        >
          <LogIn className="w-5 h-5" />
          {isLoggingIn ? 'Pripájam...' : 'Pripojiť Google Tasks'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-black uppercase text-white">Tasks</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Task Form */}
        <div className="bg-zinc-900 border-4 border-black p-6 h-fit">
          <h2 className="text-xl font-black uppercase mb-4 text-white">Pridať Úlohu</h2>
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
            <input 
              required 
              type="text" 
              placeholder="Názov úlohy..." 
              value={newTaskTitle} 
              onChange={e => setNewTaskTitle(e.target.value)} 
              className="bg-zinc-950 border-2 border-zinc-800 p-3 text-white focus:border-white outline-none" 
            />
            <button type="submit" className="flex items-center justify-center gap-2 bg-white text-black py-3 font-black uppercase hover:bg-zinc-300 mt-2 transition-colors">
              <Plus className="w-5 h-5" /> Pridať
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading ? (
            <div className="text-zinc-500 font-bold uppercase py-12 text-center text-xl">
              Načítavam úlohy...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-zinc-500 font-bold uppercase py-12 text-center text-xl border-4 border-dashed border-zinc-800">
              Zatiaľ žiadne úlohy.
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-zinc-900 border-4 border-black p-6 flex items-center justify-between transition-opacity ${task.status === 'completed' ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTask(task)}
                    className="w-6 h-6 bg-zinc-950 border-2 border-zinc-700 checked:bg-white checked:border-white cursor-pointer"
                  />
                  <div>
                    <h3 className={`text-xl font-bold uppercase ${task.status === 'completed' ? 'line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    {task.notes && (
                      <p className="text-zinc-500 text-sm mt-1">{task.notes}</p>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteTask(task)}
                  className="text-zinc-500 hover:text-red-500 transition-colors p-2"
                  title="Vymazať úlohu"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
