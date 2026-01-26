import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { UserProgress, Subject, Task } from '../types';
import { Trophy, Target, Flame, Quote } from 'lucide-react';
import ToDoList from './ToDoList';

interface DashboardProps {
  progress: UserProgress;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleNotifications: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  progress, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  onToggleNotifications
}) => {
  const data = [
    { name: Subject.PHYSICS, value: progress.physicsScore, color: '#3b82f6' }, // Blue
    { name: Subject.CHEMISTRY, value: progress.chemistryScore, color: '#f59e0b' }, // Amber
    { name: Subject.BIOLOGY, value: progress.biologyScore, color: '#10b981' }, // Emerald
  ];

  const hasData = data.some(d => d.value > 0);
  
  // If no data, show a placeholder segment for visual balance
  const chartData = hasData 
    ? data 
    : [{ name: 'No Data', value: 1, color: '#f1f5f9' }];

  return (
    <div id="stats-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 md:px-0">
      {/* Quote Card (Full Width) */}
      <div className="md:col-span-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-white rounded-full text-teal-600 shadow-sm shrink-0">
            <Quote size={24} className="fill-current" />
        </div>
        <div>
            <h3 className="text-teal-900 font-semibold mb-1">Daily Motivation for Prachi</h3>
            <p className="text-teal-700 italic text-lg leading-relaxed">"{progress.dailyQuote || "Dream it. Believe it. Achieve it."}"</p>
        </div>
      </div>

      {/* Left Column: Stats */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Solved</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Target size={20} />
            </div>
            </div>
            <div className="text-4xl font-bold text-slate-800">{progress.totalQuestionsSolved}</div>
            <p className="text-sm text-slate-400 mt-2">Questions completed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Daily Streak</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Flame size={20} />
            </div>
            </div>
            <div className="text-4xl font-bold text-slate-800">{progress.streakDays} <span className="text-lg font-normal text-slate-500">Days</span></div>
            <p className="text-sm text-slate-400 mt-2">Keep the fire burning!</p>
        </div>
      </div>

      {/* Middle Column: Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative">
        <h3 className="text-slate-700 font-semibold mb-4">Correct Answers</h3>
        <div className="w-full h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={hasData ? 5 : 0}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-3xl font-bold text-slate-700">
              {progress.physicsScore + progress.chemistryScore + progress.biologyScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">Correct</span>
          </div>
        </div>
        <div className="mt-4 space-y-3">
            {data.map((subject) => (
                <div key={subject.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                        <span className="text-slate-600">{subject.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{subject.value}</span>
                </div>
            ))}
        </div>
      </div>
      
      {/* Right Column: To-Do List */}
      <div className="md:h-auto">
        <ToDoList 
            tasks={progress.tasks || []} 
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            notificationsEnabled={progress.notificationsEnabled || false}
            onToggleNotifications={onToggleNotifications}
        />
      </div>
      
       {/* Badge Area */}
       <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 rounded-2xl shadow-md text-white md:col-span-3 flex items-center justify-between relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="font-bold text-lg">Future Dr. Prachi</h3>
            <p className="text-white/90 text-sm mt-1 max-w-md">
                Every question you solve today is a patient you will save tomorrow.
            </p>
         </div>
         <Trophy className="text-yellow-300 w-16 h-16 opacity-90 relative z-10" />
         <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
       </div>
    </div>
  );
};

export default Dashboard;