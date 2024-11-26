import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Send } from 'lucide-react';
import wordPairs from './wordPairs';

const SoundEffects = {
  START: '/sounds/BattleIntro.wav',
  MOVE: '/sounds/Confirm.wav',
  ERROR: '/sounds/Error.wav',
  VICTORY: '/sounds/LoadSave.wav',
  UNDO: '/sounds/Close.wav',
  INVALID: '/sounds/Error.wav'
};

const WordChain = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [targetWord, setTargetWord] = useState('');
  const [moves, setMoves] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isNewMove, setIsNewMove] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const inputRef = useRef(null);
  const chainContainerRef = useRef(null);
  const chainContentRef = useRef(null);

  // Audio refs
  const startAudioRef = useRef(new Audio(SoundEffects.START));
  const moveAudioRef = useRef(new Audio(SoundEffects.MOVE));
  const errorAudioRef = useRef(new Audio(SoundEffects.ERROR));
  const victoryAudioRef = useRef(new Audio(SoundEffects.VICTORY));
  const undoAudioRef = useRef(new Audio(SoundEffects.UNDO));
  const invalidAudioRef = useRef(new Audio(SoundEffects.INVALID));

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (isNewMove) {
      const timer = setTimeout(() => setIsNewMove(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isNewMove]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  // Auto scroll to the latest word
  useEffect(() => {
    if (chainContainerRef.current && chainContentRef.current) {
      chainContainerRef.current.scrollTo({
        left: chainContentRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [moves]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Shift + Delete for undo
      if (e.key === 'Delete' && e.shiftKey && !isComplete && !isLoading) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, isComplete, isLoading]);

  const playSound = (audioRef) => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
  };

  const showErrorAnimation = (message) => {
    setErrorMessage(message);
    setShowError(true);
    playSound(errorAudioRef);
    if (inputRef.current) {
      inputRef.current.classList.add('shake');
      setTimeout(() => {
        inputRef.current?.classList.remove('shake');
      }, 500);
    }
  };

  const startNewGame = () => {
    playSound(startAudioRef);


    const [start, target] = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    setCurrentWord(start);
    setTargetWord(target);
    setMoves([start]);
    setIsComplete(false);
    setInputValue('');
  };

  const isValidMove = (newWord) => {
    if (newWord.length !== currentWord.length) return false;
    let differences = 0;
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] !== newWord[i]) differences++;
    }
    return differences === 1;
  };

  const handleNewWord = async (word) => {
    if (!word) return;

    if (!isValidMove(word)) {
      showErrorAnimation('Must change exactly one letter!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        showErrorAnimation('Not a valid English word!');
        return;
      }

      playSound(moveAudioRef);
      setCurrentWord(word);
      setMoves([...moves, word]);
      setIsNewMove(true);

      if (word === targetWord) {
        setIsComplete(true);
        playSound(victoryAudioRef);
      }
    } catch (error) {
      showErrorAnimation('Error checking word. Please try again.');
    } finally {
      setIsLoading(false);
      // Focus on entry field
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleUndo = () => {
    if (moves.length > 1) {
      playSound(undoAudioRef);
      const newMoves = moves.slice(0, -1);
      const lastWord = newMoves[newMoves.length - 1];
      setMoves(newMoves);
      setCurrentWord(newMoves[newMoves.length - 1]);
      setIsComplete(false);
      // Pre-fill and focus after undo
      setInputValue(lastWord);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Title Section */}
      <div className="text-center transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-bold mb-2">Word Chain Game</h1>
        <p className="text-gray-600">Change one letter at a time to reach the target word</p>
      </div>

      {/* Game Stats Section */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-lg">
        <div className="transition-all duration-300 hover:scale-105">
          <div className="text-sm text-gray-500">Start Word</div>
          <div className="font-bold text-lg">{moves[0]}</div>
        </div>
        <div className="transition-all duration-300 hover:scale-105">
          <div className="text-sm text-gray-500">Target Word</div>
          <div className="font-bold text-lg">{targetWord}</div>
        </div>
        <div className="transition-all duration-300 hover:scale-105">
          <div className="text-sm text-gray-500">Moves</div>
          <div className="font-bold text-lg">{moves.length - 1}</div>
        </div>
      </div>

      {/* Error Message Overlay */}
      <div
        className={`
          fixed top-4 left-1/2 transform -translate-x-1/2
          bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-lg
          transition-all duration-300 z-50
          ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
        `}
      >
        {errorMessage}
      </div>

      {/* Word Chain Visualization */}
      <div
        ref={chainContainerRef}
        className="overflow-x-auto py-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <div
          ref={chainContentRef}
          className="flex items-center justify-start space-x-4 min-w-max px-4"
        >
          {moves.map((word, index) => (
            <React.Fragment key={index}>
              <div
                className={`
                  px-4 py-2 rounded-lg font-medium
                  transition-all duration-300
                  ${isNewMove && index === moves.length - 1 ? 'animate-bounce-subtle' : ''}
                  ${word === targetWord
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }
                  transform hover:scale-110
                  hover:shadow-md
                `}
                style={{
                  animation: isNewMove && index === moves.length - 1
                    ? 'slideIn 0.5s ease-out'
                    : 'none'
                }}
              >
                {word}
              </div>
              {index < moves.length - 1 && (
                <ArrowLeft
                  className={`
                    rotate-180 text-gray-400
                    transition-all duration-300
                    ${isNewMove && index === moves.length - 2 ? 'animate-pulse' : ''}
                  `}
                  size={20}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Input Controls Section */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          {/* Word Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toLowerCase())}
            placeholder="Enter your next word"
            disabled={isComplete || isLoading}
            className={`
              flex-1 px-4 py-2 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              transition-all duration-300
              ${isComplete || isLoading ? 'bg-gray-100' : 'bg-white'}
            `}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                handleNewWord(inputValue.trim());
              }
            }}
          />

          {/* Submit Button */}
          <button
            onClick={() => {
              if (inputValue.trim()) {
                handleNewWord(inputValue.trim());
              }
            }}
            disabled={isComplete || isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            title="Submit (Enter)"
          >
            <Send size={20} />
          </button>

          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={moves.length <= 1 || isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            title="Undo (Shift + Delete)"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center text-gray-600 animate-pulse">
            Checking word...
          </div>
        )}
      </div>

      {/* Victory Message & New Game Button */}
      {isComplete && (
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-2xl font-bold text-green-600 animate-bounce-subtle">
            Victory! Completed in {moves.length - 1} moves!
          </div>
          <button
            onClick={startNewGame}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WordChain;