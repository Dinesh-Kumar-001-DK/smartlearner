import React from 'react';
import { useState, useEffect, useRef } from 'react';

const ScrambleText = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const timeoutRef = useRef(null);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const scramble = () => {
    setIsScrambling(true);
    let iterations = 0;
    const maxIterations = text.length * 3;

    const interval = setInterval(() => {
      setDisplayText(
        text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iterations / 3) return text[index];
          return characters[Math.floor(Math.random() * characters.length)];
        }).join('')
      );
      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, 40);
  };

  const handleMouseEnter = () => {
    if (!isScrambling) {
      scramble();
    }
  };

  return (
    <span
      className={`inline-block cursor-default ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {displayText}
    </span>
  );
};

export default ScrambleText;
