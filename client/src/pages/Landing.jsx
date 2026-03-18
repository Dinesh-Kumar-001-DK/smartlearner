import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Particles from '../components/ui/Particles';
import ScrambleText from '../components/ui/ScrambleText';
import MagneticButton from '../components/ui/MagneticButton';
import SplitReveal from '../components/ui/SplitReveal';
import GlowCard from '../components/ui/GlowCard';
import { BookOpen, Brain, Zap, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: BookOpen, title: 'Smart Documents', desc: 'Upload and analyze any PDF instantly', color: 'violet' },
    { icon: Brain, title: 'AI Learning', desc: 'Get summaries, flashcards & quizzes', color: 'teal' },
    { icon: Zap, title: 'Instant Chat', desc: 'Ask questions about your documents', color: 'gold' },
    { icon: Users, title: 'Track Progress', desc: 'Monitor your learning journey', color: 'violet' }
  ];

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      <Particles count={80} />
      
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Brain className="text-violet-500" size={32} />
          <span className="font-heading font-bold text-2xl">AI Learn</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <MagneticButton
            onClick={() => navigate('/auth')}
            className="px-6 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-600 font-medium transition-colors"
          >
            Sign In
          </MagneticButton>
          <MagneticButton
            onClick={() => navigate('/auth?tab=register')}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 font-medium"
          >
            Get Started
          </MagneticButton>
        </motion.div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30">
            <Zap className="text-violet-400" size={16} />
            <span className="text-violet-300 text-sm">Powered by Google Gemini</span>
          </div>
          
          <h1 className="font-heading font-extrabold text-5xl md:text-7xl mb-6">
            <SplitReveal 
              text="Learn Smarter with AI" 
              className="block mb-2"
            />
            <ScrambleText 
              text="Intelligent Learning" 
              className="text-gradient"
            />
          </h1>
          
          <SplitReveal 
            text="Transform your documents into interactive learning experiences. Get instant summaries, create flashcards, take quizzes, and chat with AI about any topic."
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
            delay={0.5}
          />
          
          <MagneticButton
            onClick={() => navigate('/auth?tab=register')}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-dark-900 font-heading font-bold text-lg shadow-lg shadow-gold-500/30"
          >
            Start Learning Free
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full max-w-5xl"
        >
          {features.map((feature, i) => (
            <GlowCard key={i} glowColor={feature.color} className="p-6">
              <feature.icon className={`text-${feature.color === 'violet' ? 'violet' : feature.color === 'teal' ? 'teal' : 'gold'}-400 mb-4`} size={32} />
              <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </GlowCard>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
