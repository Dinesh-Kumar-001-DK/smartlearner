import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb } from 'lucide-react';

const QuizCard = ({ question, index, onAnswer }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (optionIndex) => {
    if (showResult) return;
    setSelected(optionIndex);
    setShowResult(true);
    onAnswer(optionIndex === question.correct);
  };

  const getOptionStyle = (i) => {
    if (!showResult) {
      return selected === i
        ? 'border-violet-500 bg-violet-500/20'
        : 'border-gray-700 hover:border-gray-500 bg-dark-800/50';
    }
    if (i === question.correct) {
      return 'border-teal-500 bg-teal-500/20';
    }
    if (i === selected && i !== question.correct) {
      return 'border-red-500 bg-red-500/20';
    }
    return 'border-gray-700 bg-dark-800/30 opacity-50';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 text-gray-400 text-sm">
        Question {index + 1}
      </div>
      <h3 className="text-xl font-heading font-semibold mb-6">{question.question}</h3>
      
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <motion.button
            key={i}
            onClick={() => handleSelect(i)}
            className={`w-full p-4 rounded-xl border transition-all text-left ${getOptionStyle(i)}`}
            whileHover={!showResult ? { scale: 1.01 } : {}}
            whileTap={!showResult ? { scale: 0.99 } : {}}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {showResult && i === question.correct && (
                <Check className="text-teal-500" size={20} />
              )}
              {showResult && i === selected && i !== question.correct && (
                <X className="text-red-500" size={20} />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/30"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="text-violet-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-violet-300 font-medium mb-1">Explanation</p>
                <p className="text-gray-300 text-sm">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizCard;
