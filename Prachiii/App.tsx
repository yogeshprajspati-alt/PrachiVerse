import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import QuizSection from './components/QuizSection';
import AIChat from './components/AIChat';
import { Subject, UserProgress } from './types';
import { generateMotivationalQuote } from './services/gemini';

const App: React.FC = () => {
  // Initialize progress with safe defaults including new fields
  const [progress, setProgress] = useState<UserProgress>(() => {
    const defaultState: UserProgress = {
      physicsScore: 0,
      chemistryScore: 0,
      biologyScore: 0,
      totalQuestionsSolved: 0,
      streakDays: 0,
      lastActiveDate: '',
      dailyQuote: "Your stethoscope is waiting. Keep pushing!",
      lastQuoteDate: '',
      seenQuestions: [],
      tasks: [],
      notificationsEnabled: false
    };

    try {
      const saved = localStorage.getItem('prachi-neet-progress');
      if (saved) {
        // Merge saved data with default state to ensure new fields (tasks, seenQuestions) exist
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
    
    return defaultState;
  });

  // Save progress to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('prachi-neet-progress', JSON.stringify(progress));
  }, [progress]);

  // Daily Quote Logic
  useEffect(() => {
    const checkAndFetchQuote = async () => {
      const today = new Date().toISOString().split('T')[0];
      if (progress.lastQuoteDate !== today) {
        try {
          const newQuote = await generateMotivationalQuote();
          setProgress(prev => ({
            ...prev,
            dailyQuote: newQuote,
            lastQuoteDate: today
          }));
        } catch (error) {
          console.error("Failed to update quote");
        }
      }
    };
    checkAndFetchQuote();
  }, [progress.lastQuoteDate]);

  // Notification Logic (Check every minute)
  useEffect(() => {
    if (!progress.notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Check if it's 8:00 PM (20:00)
      if (now.getHours() === 20 && now.getMinutes() === 0) {
        const incompleteTasks = progress.tasks.filter(t => !t.completed).length;
        if (incompleteTasks > 0) {
            new Notification("NEET Prep Reminder", {
                body: `Hey Prachi, you have ${incompleteTasks} tasks left for today! Let's finish them.`,
                icon: '/favicon.ico'
            });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [progress.notificationsEnabled, progress.tasks]);

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    
    setProgress(prev => {
      if (prev.lastActiveDate === today) return prev;

      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      const isConsecutive = prev.lastActiveDate === yesterday;

      return {
        ...prev,
        lastActiveDate: today,
        streakDays: isConsecutive ? prev.streakDays + 1 : 1
      };
    });
  };

  const handleCorrectAnswer = (subject: Subject) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      newProgress.totalQuestionsSolved += 1;
      
      if (subject === Subject.PHYSICS) newProgress.physicsScore += 1;
      if (subject === Subject.CHEMISTRY) newProgress.chemistryScore += 1;
      if (subject === Subject.BIOLOGY) newProgress.biologyScore += 1;

      return newProgress;
    });
  };

  const handleQuestionAnswered = () => {
      updateStreak();
  };

  const handleQuestionGenerated = (text: string) => {
    setProgress(prev => ({
        ...prev,
        seenQuestions: [...(prev.seenQuestions || []), text]
    }));
  };

  // Task Handlers
  const addTask = (text: string) => {
    setProgress(prev => ({
        ...prev,
        tasks: [...prev.tasks, { id: crypto.randomUUID(), text, completed: false }]
    }));
  };

  const toggleTask = (id: string) => {
    setProgress(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setProgress(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const toggleNotifications = async () => {
    if (!progress.notificationsEnabled) {
        // Request permission
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notifications");
            return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setProgress(prev => ({ ...prev, notificationsEnabled: true }));
            new Notification("Notifications Enabled", { body: "You'll get a reminder at 8 PM if tasks are pending!" });
        }
    } else {
        setProgress(prev => ({ ...prev, notificationsEnabled: false }));
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Hero />
      
      <main className="max-w-7xl mx-auto">
        <Dashboard 
            progress={progress} 
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onToggleNotifications={toggleNotifications}
        />
        <QuizSection 
            onCorrectAnswer={handleCorrectAnswer} 
            onQuestionAnswered={handleQuestionAnswered}
            seenQuestions={progress.seenQuestions || []}
            onQuestionGenerated={handleQuestionGenerated}
        />
      </main>

      <AIChat />

      <footer className="mt-12 text-center text-slate-400 text-sm pb-8">
        <p>© 2025 NEET Prep Companion. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;