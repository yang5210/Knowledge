import React, { useState, useEffect, useMemo } from 'react';
import { yellowRiverData } from './data';
import { AppMode, QuizOrder, Section, QuestionItem } from './types';
import QuizMode from './components/QuizMode';

const App = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionItem[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
  const [quizOrder, setQuizOrder] = useState<QuizOrder>(QuizOrder.SEQUENTIAL);
  
  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // State for bookmarks (Set of unique IDs string)
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('yr_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error("Failed to load bookmarks", e);
      return new Set();
    }
  });

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('yr_bookmarks', JSON.stringify(Array.from(bookmarks)));
    } catch (e) {
      console.error("Failed to save bookmarks", e);
    }
  }, [bookmarks]);

  // PWA Installation Logic
  useEffect(() => {
    // Check if already in standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isInStandaloneMode);

    // Handle Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS to show manual guide (since iOS doesn't fire beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIOS && !isInStandaloneMode) {
      // Show hint after a short delay to not annoy immediately
      const timer = setTimeout(() => setShowIOSHint(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Flatten all data and inject sectionId for easier global lookup
  const allQuestions = useMemo(() => {
    return yellowRiverData.flatMap(section => 
      section.items.map(item => ({ ...item, sectionId: section.id }))
    );
  }, []);

  const toggleBookmark = (uniqueId: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(uniqueId)) {
        next.delete(uniqueId);
      } else {
        next.add(uniqueId);
      }
      return next;
    });
  };

  const startQuiz = (section: Section, order: QuizOrder) => {
    setSelectedQuestions(section.items);
    setCurrentSectionId(section.id);
    setQuizOrder(order);
    setMode(AppMode.QUIZ);
  };

  const startReview = () => {
    const reviewItems = allQuestions.filter(q => bookmarks.has(`${q.sectionId}:${q.id}`));
    setSelectedQuestions(reviewItems);
    setCurrentSectionId(undefined); // No single section context
    setQuizOrder(QuizOrder.SEQUENTIAL); // Default to sequential for review
    setMode(AppMode.QUIZ);
  };

  const goHome = () => {
    setMode(AppMode.HOME);
    setSelectedQuestions([]);
    setCurrentSectionId(undefined);
  };

  return (
    <div className="min-h-[100dvh] bg-yellow-50 font-sans text-gray-900 pt-safe pb-safe relative">
      {mode === AppMode.HOME ? (
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <header className="text-center mb-6 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-800 mb-2 tracking-tight">黄河知识 400 问</h1>
            <p className="text-yellow-700 opacity-80 text-sm md:text-base">Yellow River Knowledge Database</p>
          </header>

          {/* Collection / Review Section */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-md border-l-4 border-red-500 overflow-hidden p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left w-full">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center justify-center sm:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  我的收藏本
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  当前已收藏 <span className="font-bold text-red-600">{bookmarks.size}</span> 道题目
                </p>
              </div>
              <button 
                onClick={startReview}
                disabled={bookmarks.size === 0}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 ${
                  bookmarks.size === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                }`}
              >
                开始复盘
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-8">
            {yellowRiverData.map((section) => (
              <div 
                key={section.id} 
                className="bg-white rounded-xl shadow-md border border-yellow-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
                    <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {section.items.length} 题
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{section.description}</p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => startQuiz(section, QuizOrder.SEQUENTIAL)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white font-medium py-2.5 px-2 rounded-lg transition-colors text-sm"
                    >
                      顺序练习
                    </button>
                    <button 
                      onClick={() => startQuiz(section, QuizOrder.RANDOM)}
                      className="flex-1 bg-yellow-50 border border-yellow-500 text-yellow-700 hover:bg-yellow-100 active:bg-yellow-200 font-medium py-2.5 px-2 rounded-lg transition-colors text-sm"
                    >
                      乱序背诵
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-4 text-center text-xs text-gray-400 pb-20">
            <p>© 2023 Knowledge App. Based on Provided PDF Material.</p>
          </footer>

          {/* PWA Install Prompts */}
          {!isStandalone && (
            <>
              {/* Android/Desktop Install Button */}
              {installPrompt && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-yellow-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 pb-safe animate-slideUp">
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                        <span className="text-xl">🌊</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">安装黄河知识助手</h3>
                        <p className="text-xs text-gray-500">添加到主屏幕，离线也能用</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleInstallClick}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-all"
                    >
                      安装应用
                    </button>
                  </div>
                </div>
              )}

              {/* iOS Install Hint */}
              {showIOSHint && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-yellow-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 pb-safe animate-slideUp">
                  <div className="max-w-4xl mx-auto relative pr-8">
                    <button 
                      onClick={() => setShowIOSHint(false)}
                      className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">📲</div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1">添加到主屏幕</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          为了获得全屏和离线体验，请点击浏览器底部的 <span className="font-bold text-blue-600">分享</span> 按钮，然后选择 <span className="font-bold text-gray-800">“添加到主屏幕”</span>。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <QuizMode 
          questions={selectedQuestions} 
          order={quizOrder} 
          onExit={goHome} 
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          sectionId={currentSectionId}
        />
      )}
    </div>
  );
};

export default App;