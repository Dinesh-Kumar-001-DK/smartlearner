import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCcw } from 'lucide-react';

const Flashcard = ({ card, onToggleFavorite, showControls = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="perspective-1000 w-full h-64 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1f2a 0%, #0a0d14 100%)',
            border: '1px solid rgba(155, 109, 255, 0.3)',
            backfaceVisibility: 'hidden'
          }}
        >
          <span className="text-violet-400 text-sm mb-4 font-medium">Question</span>
          <p className="text-xl text-center font-medium">{card.front}</p>
          <div className="absolute bottom-4 flex items-center gap-4">
            <span className="text-gray-500 text-sm">Click to flip</span>
            {showControls && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(card.id);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Star
                  size={18}
                  className={card.favorite ? 'text-gold-500 fill-gold-500' : 'text-gray-500'}
                />
              </button>
            )}
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #0a1a1a 0%, #0a0d14 100%)',
            border: '1px solid rgba(0, 212, 180, 0.3)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <span className="text-teal-400 text-sm mb-4 font-medium">Answer</span>
          <p className="text-xl text-center font-medium">{card.back}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="absolute bottom-4 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
          >
            <RotateCcw size={16} />
            <span className="text-sm">Flip back</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcard;
