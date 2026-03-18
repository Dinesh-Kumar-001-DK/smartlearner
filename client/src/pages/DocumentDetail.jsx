import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, FileText, Brain, Target, MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudyStore } from '../stores/studyStore';
import useGemini from '../hooks/useGemini';
import ChatWindow from '../components/ChatWindow';
import PDFViewer from '../components/PDFViewer';
import Flashcard from '../components/Flashcard';
import QuizCard from '../components/QuizCard';
import GlowCard from '../components/ui/GlowCard';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gemini = useGemini();
  const { documents, summaries, chats, flashcards, quizzes, setSummary, addFlashcards, saveQuiz, addMessage, toggleFavorite } = useStudyStore();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'chat');
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPDF, setShowPDF] = useState(true);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const doc = documents.find(d => d.id === id);
    if (!doc) {
      navigate('/documents');
      return;
    }
    setSelectedDoc(doc);
  }, [id, documents, navigate]);

  if (!selectedDoc) return null;

  const docChats = chats[id] || [];
  const docFlashcards = flashcards.filter(f => f.docId === id);
  const docQuiz = quizzes.find(q => q.docId === id);
  const docSummary = summaries[id];

  const handleChat = async (message) => {
    addMessage(id, { role: 'user', content: message });
    setLoading(true);
    
    try {
      const { response } = await gemini.chat(selectedDoc.text, docChats);
      addMessage(id, { role: 'assistant', content: response });
    } catch (err) {
      toast.error('Failed to get response');
      addMessage(id, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSummary = async () => {
    if (docSummary) return;
    setLoading(true);
    try {
      const { summary } = await gemini.summary(selectedDoc.text);
      setSummary(id, summary);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleFlashcards = async (count = 10) => {
    setLoading(true);
    try {
      const { flashcards: cards } = await gemini.flashcards(selectedDoc.text, count);
      addFlashcards(id, cards);
      toast.success(`${cards.length} flashcards created!`);
    } catch (err) {
      toast.error('Failed to create flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleQuiz = async (count = 5) => {
    setLoading(true);
    setQuizScore({ correct: 0, total: 0 });
    try {
      const { quiz } = await gemini.quiz(selectedDoc.text, count);
      saveQuiz(id, quiz);
      toast.success(`${quiz.length} questions ready!`);
    } catch (err) {
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (isCorrect) => {
    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
    { id: 'quiz', label: 'Quiz', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {showPDF && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '40%' }}
          className="border-r border-dark-700"
        >
          <div className="p-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="font-semibold">
              {selectedDoc.originalFileType === 'docx' 
                ? 'Word Document (PDF Preview)' 
                : 'PDF Viewer'}
            </h2>
            <button
              onClick={() => setShowPDF(false)}
              className="text-gray-400 hover:text-white"
            >
              Minimize
            </button>
          </div>
          <div className="h-[calc(100vh-73px)]">
            <PDFViewer 
              fileUrl={selectedDoc.url} 
              fileType={selectedDoc.fileType || 'pdf'} 
              fileName={selectedDoc.name}
              originalFileUrl={selectedDoc.originalUrl}
              originalFileType={selectedDoc.originalFileType}
            />
          </div>
        </motion.div>
      )}

      {!showPDF && (
        <button
          onClick={() => setShowPDF(true)}
          className="fixed right-4 top-20 z-40 p-3 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors"
        >
          <FileText size={20} />
        </button>
      )}

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-dark-700 flex items-center gap-4">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-heading font-semibold text-xl truncate flex-1">
            {selectedDoc.name}
          </h1>
        </div>

        <div className="flex border-b border-dark-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-violet-400 border-b-2 border-violet-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ChatWindow
                  messages={docChats}
                  onSendMessage={handleChat}
                  isLoading={loading}
                />
              </motion.div>
            )}

            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                {docSummary ? (
                  <div className="max-w-3xl mx-auto">
                    <GlowCard glowColor="teal" className="p-6">
                      <h2 className="font-heading font-bold text-2xl mb-6">Document Summary</h2>
                      <div className="prose prose-invert max-w-none">
                        {docSummary.split('\n').map((para, i) => (
                          <p key={i} className="text-gray-300 mb-4">{para}</p>
                        ))}
                      </div>
                    </GlowCard>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    {loading ? (
                      <div className="text-center">
                        <Loader2 className="animate-spin text-violet-500 mx-auto mb-4" size={48} />
                        <p className="text-gray-400">Generating summary...</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleSummary}
                        className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl font-semibold"
                      >
                        Generate Summary
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'flashcards' && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-3xl mx-auto">
                  {docFlashcards.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-bold text-2xl">
                          {docFlashcards.length} Flashcards
                        </h2>
                        <button
                          onClick={() => handleFlashcards(10)}
                          disabled={loading}
                          className="px-4 py-2 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors disabled:opacity-50"
                        >
                          Generate More
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {docFlashcards.map((card) => (
                          <Flashcard
                            key={card.id}
                            card={card}
                            onToggleFavorite={() => toggleFavorite(card.id)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      {loading ? (
                        <Loader2 className="animate-spin text-violet-500 mb-4" size={48} />
                      ) : (
                        <>
                          <Brain className="text-gray-500 mb-4" size={48} />
                          <button
                            onClick={() => handleFlashcards(10)}
                            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl font-semibold"
                          >
                            Generate 10 Flashcards
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-2xl mx-auto">
                  {docQuiz ? (
                    <div className="space-y-8">
                      {quizScore.total > 0 && (
                        <div className="text-center p-4 bg-dark-800 rounded-xl">
                          <p className="text-lg font-medium">
                            Score: <span className="text-teal-400">{quizScore.correct}</span> / {quizScore.total}
                            {quizScore.total === docQuiz.questions.length && (
                              <span className="ml-4 text-gray-400">
                                ({Math.round((quizScore.correct / quizScore.total) * 100)}%)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {docQuiz.questions.map((q, i) => (
                        <QuizCard key={i} question={q} index={i} onAnswer={handleQuizAnswer} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      {loading ? (
                        <Loader2 className="animate-spin text-violet-500 mb-4" size={48} />
                      ) : (
                        <>
                          <Target className="text-gray-500 mb-4" size={48} />
                          <button
                            onClick={() => handleQuiz(5)}
                            className="px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-dark-900 rounded-xl font-semibold"
                          >
                            Generate 5 Questions
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
