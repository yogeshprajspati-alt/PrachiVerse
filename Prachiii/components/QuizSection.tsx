import React, { useState } from 'react';
import { Subject, Question } from '../types';
import { generatePracticeQuestion } from '../services/gemini';
import { CheckCircle, XCircle, ArrowRight, Loader2, BookOpen, BrainCircuit, ArrowLeft, Layers } from 'lucide-react';

interface QuizSectionProps {
  onCorrectAnswer: (subject: Subject) => void;
  onQuestionAnswered: () => void;
  seenQuestions: string[];
  onQuestionGenerated: (questionText: string) => void;
}

const TOPICS_BY_SUBJECT: Record<Subject, string[]> = {
  [Subject.PHYSICS]: [
    "Units & Dimensions", "Kinematics", "Laws of Motion", "Work, Energy & Power",
    "Rotational Motion", "Gravitation", "Electrostatics", "Current Electricity",
    "Magnetic Effects", "Optics", "Modern Physics", "Semiconductors"
  ],
  [Subject.CHEMISTRY]: [
    "Mole Concept", "Atomic Structure", "Chemical Bonding", "Thermodynamics",
    "Equilibrium", "Redox Reactions", "P-Block Elements", "Coordination Compounds",
    "GOC (Organic)", "Hydrocarbons", "Aldehydes & Ketones", "Electrochemistry"
  ],
  [Subject.BIOLOGY]: [
    "Living World", "Plant Kingdom", "Animal Kingdom", "Morphology",
    "Cell: The Unit of Life", "Cell Cycle", "Plant Physiology", "Human Physiology",
    "Reproduction", "Genetics", "Evolution", "Biotechnology", "Ecology"
  ]
};

const QuizSection: React.FC<QuizSectionProps> = ({ 
  onCorrectAnswer, 
  onQuestionAnswered, 
  seenQuestions,
  onQuestionGenerated 
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const subjects = [
    { id: Subject.PHYSICS, icon: BrainCircuit, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { id: Subject.CHEMISTRY, icon: Loader2, color: 'bg-amber-100 text-amber-600 border-amber-200' },
    { id: Subject.BIOLOGY, icon: BookOpen, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  ];

  const handleSubjectSelect = (sub: Subject) => {
    setSelectedSubject(sub);
    setSelectedTopic(null);
    setCurrentQuestion(null);
  };

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    if (selectedSubject) {
      loadQuestion(selectedSubject, topic);
    }
  };

  const loadQuestion = async (sub: Subject, topic?: string) => {
    setLoading(true);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setShowExplanation(false);
    
    const topicToUse = topic || selectedTopic || undefined;
    
    // Retry logic for uniqueness
    let attempts = 0;
    let uniqueQuestionFound = false;
    let finalQuestion: Question | null = null;

    // We pass a subset of seen questions to the API for context, but we check against ALL locally
    // This balances API token usage with strict client-side verification
    const recentHistory = seenQuestions.slice(-10);

    while (!uniqueQuestionFound && attempts < 3) {
        const question = await generatePracticeQuestion(sub, topicToUse, recentHistory);
        
        if (question) {
            // Check if we have seen this text before (normalization: lowercase, trimmed)
            const isDuplicate = seenQuestions.some(q => 
                q.toLowerCase().trim() === question.text.toLowerCase().trim()
            );

            if (!isDuplicate) {
                finalQuestion = question;
                uniqueQuestionFound = true;
            } else {
                console.log("Duplicate question generated, retrying...", question.text);
            }
        }
        attempts++;
    }
    
    // If we failed to get a unique one after 3 tries, just show the last one (rare edge case)
    if (finalQuestion) {
        setCurrentQuestion(finalQuestion);
        onQuestionGenerated(finalQuestion.text);
    } else {
        // Error state handled by UI
    }
    
    setLoading(false);
  };

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    setSelectedOption(index);
    setShowExplanation(true);
    onQuestionAnswered();
    
    if (currentQuestion && index === currentQuestion.correctAnswerIndex) {
      onCorrectAnswer(currentQuestion.subject);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setCurrentQuestion(null);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setCurrentQuestion(null);
  };

  return (
    <div id="practice-section" className="max-w-4xl mx-auto px-4 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Quick Practice</h2>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      {/* 1. Subject Selector */}
      {!selectedSubject && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleSubjectSelect(sub.id)}
              className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-4 ${sub.color.replace('bg-', 'hover:bg-opacity-80 ')} border-transparent hover:shadow-md bg-white`}
            >
              <div className={`p-4 rounded-full ${sub.color}`}>
                <sub.icon size={32} />
              </div>
              <span className="font-bold text-lg text-slate-700">{sub.id}</span>
            </button>
          ))}
        </div>
      )}

      {/* 2. Topic Selector */}
      {selectedSubject && !selectedTopic && (
        <div className="animate-fade-in">
           <button 
             onClick={handleBackToSubjects}
             className="mb-6 flex items-center text-slate-500 hover:text-teal-600 transition"
           >
             <ArrowLeft size={18} className="mr-1" /> Back to Subjects
           </button>
           
           <h3 className="text-xl font-bold text-slate-800 mb-4">Select a Topic in {selectedSubject}</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
             {TOPICS_BY_SUBJECT[selectedSubject].map((topic) => (
               <button
                 key={topic}
                 onClick={() => handleTopicSelect(topic)}
                 className="p-4 text-left bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm transition-all group"
               >
                 <div className="flex items-center justify-between">
                   <span className="font-medium text-slate-700 group-hover:text-teal-800">{topic}</span>
                   <Layers size={16} className="text-slate-300 group-hover:text-teal-400" />
                 </div>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* 3. Quiz Interface */}
      {selectedSubject && selectedTopic && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <button 
                  onClick={handleBackToTopics}
                  className="mr-2 p-1 hover:bg-slate-200 rounded-full text-slate-500 transition"
                  title="Back to Topics"
                >
                  <ArrowLeft size={18} />
                </button>
                <span className="font-semibold text-slate-700">{selectedSubject}</span>
                <span className="text-slate-400">/</span>
                <span className="font-medium text-teal-600 text-sm">{selectedTopic}</span>
             </div>
             
             <button 
               onClick={handleBackToSubjects}
               className="text-xs text-slate-400 hover:text-teal-600 font-medium hidden sm:block"
             >
               Switch Subject
             </button>
          </div>

          <div className="p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin text-teal-500 mb-4" size={48} />
                <p className="text-slate-500 animate-pulse">Consulting the AI Tutor for Prachi...</p>
              </div>
            ) : currentQuestion ? (
              <div className="animate-fade-in">
                <div className="mb-2">
                  <h3 className="text-xl md:text-2xl font-medium text-slate-800 mb-6 leading-relaxed">
                    {currentQuestion.text}
                  </h3>
                </div>

                <div className="grid gap-3 mb-8">
                  {currentQuestion.options.map((option, idx) => {
                    let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group text-base font-medium shadow-sm ";
                    
                    if (selectedOption === null) {
                      btnClass += "bg-white border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-900";
                    } else if (idx === currentQuestion.correctAnswerIndex) {
                      btnClass += "border-green-500 bg-green-50 text-green-900";
                    } else if (selectedOption === idx) {
                      btnClass += "border-red-500 bg-red-50 text-red-900";
                    } else {
                      btnClass += "border-slate-100 opacity-50 bg-white text-slate-400";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        disabled={selectedOption !== null}
                        className={btnClass}
                      >
                        <span className="flex-1">{option}</span>
                        {selectedOption !== null && idx === currentQuestion.correctAnswerIndex && <CheckCircle className="text-green-600 flex-shrink-0 ml-2" size={24} />}
                        {selectedOption === idx && idx !== currentQuestion.correctAnswerIndex && <XCircle className="text-red-500 flex-shrink-0 ml-2" size={24} />}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6 animate-slide-up">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <BookOpen size={18} /> Explanation
                    </h4>
                    <p className="text-blue-900 leading-relaxed text-sm md:text-base">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {selectedOption !== null && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => loadQuestion(selectedSubject)}
                      className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition shadow-md hover:shadow-lg"
                    >
                      Next Question <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Failed to load question. Please try again.
                <button 
                  onClick={() => loadQuestion(selectedSubject)} 
                  className="block mx-auto mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSection;