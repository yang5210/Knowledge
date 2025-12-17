import React, { useState, useEffect } from 'react';
import { QuestionItem, QuizOrder } from '../types';
import { shuffleArray } from '../utils';

interface QuizModeProps {
  questions: QuestionItem[];
  order: QuizOrder;
  onExit: () => void;
  bookmarks: Set<string>;
  onToggleBookmark: (uniqueId: string) => void;
  sectionId?: string; // Optional context if questions belong to a single section
}

const QuizMode: React.FC<QuizModeProps> = ({ 
  questions, 
  order, 
  onExit, 
  bookmarks, 
  onToggleBookmark,
  sectionId 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizList, setQuizList] = useState<QuestionItem[]>([]);

  useEffect(() => {
    let list = [...questions];
    if (order === QuizOrder.RANDOM) {
      list = shuffleArray(list);
    }
    setQuizList(list);
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [questions, order]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < quizList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleBookmarkClick = (e: React.MouseEvent, uniqueId: string) => {
    e.stopPropagation();
    onToggleBookmark(uniqueId);
  };

  if (quizList.length === 0) return (
    <div className="flex flex-col h-[100dvh] bg-yellow-50 items-center justify-center p-4 text-center">
      <div className="text-xl text-yellow-800 mb-4">暂无收藏题目</div>
      <button onClick={onExit} className="px-6 py-3 rounded-lg bg-yellow-600 text-white shadow-lg active:scale-95">
        返回主页
      </button>
    </div>
  );

  const currentQuestion = quizList[currentIndex];
  // Determine unique ID: prefer item's own sectionId, fallback to prop sectionId
  const qSectionId = currentQuestion.sectionId || sectionId;
  const uniqueId = qSectionId ? `${qSectionId}:${currentQuestion.id}` : `${currentQuestion.id}`;
  const isBookmarked = bookmarks.has(uniqueId);

  return (
    <div className="flex flex-col h-[100dvh] bg-yellow-50 overflow-hidden">
      {/* Top Bar - Fixed */}
      <div className="flex-none flex items-center justify-between px-4 py-3 bg-yellow-600 text-white shadow-md z-10 pt-safe">
        <button onClick={onExit} className="flex items-center px-2 py-1 rounded hover:bg-yellow-700 active:bg-yellow-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">返回</span>
        </button>
        <div className="text-center">
          <span className="font-bold text-lg tabular-nums">
            {currentIndex + 1}
          </span>
          <span className="text-yellow-200 text-sm mx-1">/</span>
          <span className="text-sm text-yellow-100 tabular-nums">{quizList.length}</span>
        </div>
        <button
          onClick={(e) => handleBookmarkClick(e, uniqueId)}
          className="p-2 rounded-full hover:bg-yellow-700 active:bg-yellow-800 transition-colors focus:outline-none"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isBookmarked ? "#fbbf24" : "none"} 
            stroke={isBookmarked ? "#fbbf24" : "currentColor"} 
            className="w-6 h-6"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      </div>

      {/* Main Content - Flex Grow to fill space */}
      <div className="flex-1 p-3 md:p-6 flex flex-col justify-center overflow-hidden">
        <div 
          className="w-full h-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col border border-yellow-200 relative overflow-hidden transition-all duration-300"
          onClick={toggleAnswer}
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:p-10 scrollbar-hide">
            <div className="min-h-full flex flex-col justify-center">
              
              {/* Question Section */}
              <div className="mb-6 text-center">
                <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-yellow-800 uppercase bg-yellow-100 rounded-full">
                  问题
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Divider */}
              <div className={`w-16 h-1 mx-auto rounded-full transition-colors duration-300 mb-6 ${showAnswer ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>

              {/* Answer Section (or prompt) */}
              <div className="text-center flex-1 flex flex-col justify-center">
                {showAnswer ? (
                  <div className="animate-fadeIn">
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium text-justify md:text-center">
                      {currentQuestion.answer}
                    </p>
                    <div className="mt-8 text-xs text-gray-400 flex justify-center space-x-3">
                      <span>页码: {currentQuestion.page}</span>
                      <span>ID: {currentQuestion.id}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <p className="text-sm font-medium animate-pulse">点击屏幕查看答案</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Fixed */}
      <div className="flex-none p-4 pb-safe bg-white border-t border-gray-200 flex justify-between items-center shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-10">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-lg mr-3 transition-transform active:scale-95 touch-manipulation ${
            currentIndex === 0 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
        >
          上一题
        </button>
        
        <button 
          onClick={handleNext} 
          disabled={currentIndex === quizList.length - 1}
          className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-lg ml-3 transition-transform active:scale-95 touch-manipulation shadow-md ${
            currentIndex === quizList.length - 1 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          下一题
        </button>
      </div>
    </div>
  );
};

export default QuizMode;