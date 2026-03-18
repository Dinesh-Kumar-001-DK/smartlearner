import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Brain, Target, Trophy, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useStudyStore } from '../stores/studyStore';
import GlowCard from '../components/ui/GlowCard';
import NumberTicker from '../components/ui/NumberTicker';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { documents, flashcards, quizzes } = useStudyStore();

  const stats = [
    { 
      label: 'Total Documents', 
      value: documents.length, 
      icon: FileText, 
      color: 'violet',
      description: 'Your uploaded study materials'
    },
    { 
      label: 'Flashcards Made', 
      value: flashcards.length, 
      icon: Brain, 
      color: 'teal',
      description: 'Study cards created'
    },
    { 
      label: 'Quizzes Taken', 
      value: quizzes.length, 
      icon: Target, 
      color: 'gold',
      description: 'Practice sessions completed'
    },
    { 
      label: 'Avg Score', 
      value: 85, 
      icon: Trophy, 
      color: 'violet',
      description: 'Based on quiz results'
    }
  ];

  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading font-bold text-3xl mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
          </h1>
          <p className="text-gray-400">Track your learning progress and continue studying</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlowCard glowColor={stat.color} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color === 'gold' ? 'gold' : stat.color}-500/20`}>
                    <stat.icon className={`text-${stat.color === 'gold' ? 'gold' : stat.color}-400`} size={24} />
                  </div>
                </div>
                <div className="text-3xl font-heading font-bold mb-1">
                  <NumberTicker value={stat.value} duration={1500} />
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.description}</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlowCard glowColor="violet" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-xl">Recent Documents</h2>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-violet-400 text-sm hover:text-violet-300 flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              
              {recentDocs.length > 0 ? (
                <div className="space-y-3">
                  {recentDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${doc.fileType === 'docx' ? 'bg-teal-500/20' : 'bg-violet-500/20'}`}>
                        <FileText size={20} className={doc.fileType === 'docx' ? 'text-teal-400' : 'text-violet-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-gray-500 text-sm">{doc.pageCount} pages</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock size={14} />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">No documents yet</p>
                  <button
                    onClick={() => navigate('/documents')}
                    className="px-6 py-3 bg-violet-500 rounded-xl font-medium hover:bg-violet-600 transition-colors"
                  >
                    Upload Your First Document
                  </button>
                </div>
              )}
            </GlowCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlowCard glowColor="teal" className="p-6">
              <h2 className="font-heading font-semibold text-xl mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/documents')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-teal-500/20">
                    <FileText size={24} className="text-teal-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Upload Document</p>
                    <p className="text-gray-500 text-sm">Add a new PDF or Word file</p>
                  </div>
                  <ChevronRight className="ml-auto text-gray-500" size={20} />
                </button>

                <button
                  onClick={() => {
                    if (documents.length > 0) {
                      navigate(`/documents/${documents[0].id}`);
                    } else {
                      toast.error('Upload a document first');
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-violet-500/20">
                    <Brain size={24} className="text-violet-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Generate Flashcards</p>
                    <p className="text-gray-500 text-sm">Create study cards from your docs</p>
                  </div>
                  <ChevronRight className="ml-auto text-gray-500" size={20} />
                </button>

                <button
                  onClick={() => {
                    if (documents.length > 0) {
                      navigate(`/documents/${documents[0].id}?tab=quiz`);
                    } else {
                      toast.error('Upload a document first');
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-gold-500/20">
                    <Target size={24} className="text-gold-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Take a Quiz</p>
                    <p className="text-gray-500 text-sm">Test your knowledge</p>
                  </div>
                  <ChevronRight className="ml-auto text-gray-500" size={20} />
                </button>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
