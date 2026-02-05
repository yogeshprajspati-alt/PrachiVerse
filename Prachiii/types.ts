export enum Subject {
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subject: Subject;
  topic?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserProgress {
  physicsScore: number;
  chemistryScore: number;
  biologyScore: number;
  totalQuestionsSolved: number;
  streakDays: number;
  lastActiveDate?: string;
  dailyQuote?: string;
  lastQuoteDate?: string;
  // New fields for enhanced persistence
  seenQuestions: string[]; // Stores text of all questions ever solved to prevent repeats
  tasks: Task[];
  notificationsEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}