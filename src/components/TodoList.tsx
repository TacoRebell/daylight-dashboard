"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2, Calendar } from 'lucide-react'; // Removed Plus import
import { motion, AnimatePresence } from 'framer-motion';
import { isPast, isToday, isTomorrow, parseISO } from 'date-fns';

interface Task {
  id: string;
  listId: string;
  title: string;
  status: string;
  due: string | null;
}

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingIds, setCompletingIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        // Limit to max 10 tasks strictly
        setTasks(data.slice(0, 10));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTasks();
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleToggle(task: Task) {
    const originalTasks = [...tasks];
    setTasks(tasks.filter((t) => t.id !== task.id));
    setCompletingIds([...completingIds, task.id]);

    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        body: JSON.stringify({ listId: task.listId, taskId: task.id }),
      });

      if (!res.ok) throw new Error("Failed");
    } catch (e) {
      setTasks(originalTasks);
      console.error("Failed to complete task");
    } finally {
      setCompletingIds(prev => prev.filter(id => id !== task.id));
    }
  }

  const getTaskPriority = (due: string | null) => {
    if (!due) return 'low';
    const date = parseISO(due);
    if (isPast(date) && !isToday(date)) return 'high';
    if (isToday(date)) return 'high';
    if (isTomorrow(date)) return 'medium';
    return 'low';
  };

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  const getPriorityLabel = (priority: string, due: string | null) => {
    if (!due) return null;
    if (priority === 'high') return isPast(parseISO(due)) && !isToday(parseISO(due)) ? 'Overdue' : 'Today';
    if (priority === 'medium') return 'Tomorrow';
    return new Date(due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-green-400" />
          <h2 className="text-xl text-white">Family To-Dos</h2>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
            {tasks.length} left
          </span>
        </div>
        {/* Removed the <button> that was here */}
      </div>
      
      <div className="space-y-2">
        {loading && tasks.length === 0 ? (
           <div className="text-white/30 text-center py-4">Loading tasks...</div>
        ) : tasks.length === 0 ? (
           <div className="text-white/30 text-center py-4 italic">All tasks completed!</div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => {
              const priority = getTaskPriority(task.due);
              const priorityLabel = getPriorityLabel(priority, task.due);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white/5 rounded-xl p-4 border-l-4 border-y border-r border-white/5 ${priorityColors[priority]} hover:bg-white/10 transition-colors cursor-pointer group`}
                  onClick={() => handleToggle(task)}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="flex-shrink-0"
                    >
                      {completingIds.includes(task.id) ? (
                        <Loader2 className="size-6 text-green-400 animate-spin" />
                      ) : (
                        <Circle className="size-6 text-white/30 group-hover:text-white/50 transition-colors" />
                      )}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-white transition-all truncate text-lg">
                        {task.title}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded uppercase font-medium tracking-wider ${
                          priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {priority === 'high' ? 'High Priority' : priority}
                        </span>

                        {priorityLabel && (
                          <div className="flex items-center gap-1 text-xs text-white/40">
                            <span>•</span>
                            <Calendar className="size-3" />
                            <span>{priorityLabel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}