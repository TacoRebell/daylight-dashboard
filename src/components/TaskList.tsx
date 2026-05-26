"use client";
import { useEffect, useState } from "react";
import { Square, CheckSquare, Loader2 } from "lucide-react";
import { parseISO, isPast, isToday, isTomorrow } from "date-fns";

interface Task {
  id: string;
  listId: string; // <--- Added listId
  title: string;
  status: string;
  due: string | null;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Track which task is currently being "completed" to show a spinner if needed
  const [completingIds, setCompletingIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (e) {
        console.error(e);
      }
    }
    
    fetchTasks();
    const interval = setInterval(fetchTasks, 300000);
    return () => clearInterval(interval);
  }, []);

  async function handleToggle(task: Task) {
    // 1. Optimistic Update: Immediately hide it from the UI
    const originalTasks = [...tasks];
    setTasks(tasks.filter((t) => t.id !== task.id));
    setCompletingIds([...completingIds, task.id]);

    // 2. Send request to backend
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        body: JSON.stringify({ listId: task.listId, taskId: task.id }),
      });

      if (!res.ok) {
        // If it failed, revert the change!
        throw new Error("Failed");
      }
    } catch (e) {
      // Revert if API fails
      setTasks(originalTasks);
      console.error("Failed to complete task");
    } finally {
      setCompletingIds(prev => prev.filter(id => id !== task.id));
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-gray-500 italic mt-2 text-lg">
        All caught up!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto pr-2 no-scrollbar">
      {tasks.map((task) => {
        let dateLabel = null;
        let colorClass = "text-white";
        let iconColor = "text-gray-500";
        const isProcessing = completingIds.includes(task.id);

        if (task.due) {
          const dueDate = parseISO(task.due);
          
          if (isPast(dueDate) && !isToday(dueDate)) {
             dateLabel = "Overdue";
             colorClass = "text-red-400";
             iconColor = "text-red-400";
          } else if (isToday(dueDate)) {
             dateLabel = "Today";
             colorClass = "text-yellow-400";
             iconColor = "text-yellow-400";
          } else if (isTomorrow(dueDate)) {
             dateLabel = "Tomorrow";
             colorClass = "text-blue-400";
          }
        }

        return (
          <div 
            key={task.id} 
            className="flex items-start gap-4 group cursor-pointer active:scale-95 transition-transform"
            onClick={() => !isProcessing && handleToggle(task)}
          >
            {/* Checkbox Icon */}
            <div className={`mt-0.5 ${iconColor} transition-colors group-hover:text-green-400`}>
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Square className="w-6 h-6 group-hover:fill-white/10" />
              )}
            </div>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
               <div className={`text-xl leading-tight truncate ${colorClass} font-medium group-hover:line-through group-hover:opacity-50 transition-all`}>
                 {task.title}
               </div>
               
               {dateLabel && (
                 <div className={`text-xs uppercase tracking-wider font-bold mt-1 ${colorClass} opacity-80`}>
                   {dateLabel}
                 </div>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
}