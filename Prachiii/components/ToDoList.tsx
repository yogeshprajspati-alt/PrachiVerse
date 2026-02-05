import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, Bell, BellOff } from 'lucide-react';
import { Task } from '../types';

interface ToDoListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

const ToDoList: React.FC<ToDoListProps> = ({ 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  notificationsEnabled,
  onToggleNotifications
}) => {
  const [newTask, setNewTask] = useState('');

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddTask(newTask);
      setNewTask('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <CheckSquare className="text-teal-500" size={20} />
          Prachi's Daily Goals
        </h3>
        <button 
          onClick={onToggleNotifications}
          className={`p-2 rounded-full transition-colors ${notificationsEnabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
          title={notificationsEnabled ? "Notifications Enabled" : "Enable Reminders"}
        >
          {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a topic (e.g., 'Solve 50 MCQs')"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition"
        />
        <button 
          onClick={handleAdd}
          disabled={!newTask.trim()}
          className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[250px] pr-1 custom-scrollbar">
        {tasks.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4 italic">No tasks yet. Plan your victory!</p>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${task.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 hover:border-teal-200'}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className={`shrink-0 transition-colors ${task.completed ? 'text-teal-500' : 'text-slate-300 hover:text-teal-400'}`}
                >
                  {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <span className={`text-sm truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.text}
                </span>
              </div>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="text-slate-300 hover:text-red-400 ml-2 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {tasks.length > 0 && (
         <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-center text-slate-400">
            {tasks.filter(t => t.completed).length}/{tasks.length} completed
         </div>
      )}
    </div>
  );
};

export default ToDoList;