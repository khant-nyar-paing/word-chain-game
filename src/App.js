/**
 * WordChain is a React component that implements a word chain game where players
 * transform one word into another by changing one letter at a time. Each intermediate
 * word must be a valid English word.
 */


import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, RotateCcw, Send } from 'lucide-react';
import wordPairs from './wordPairs';

// Sound effect file paths for various game events
const SoundEffects = {
  START: '/sounds/BattleIntro.wav',
  MOVE: '/sounds/Confirm.wav',
  ERROR: '/sounds/Error.wav',
  VICTORY: '/sounds/LoadSave.wav',
  UNDO: '/sounds/Close.wav',
  INVALID: '/sounds/Error.wav'
};

// Header component showing game stats
const GameHeader = ({ startWord, targetWord, moveCount }) => (
  <div className="p-4 bg-white shadow-md">
    <h1 className="text-2xl font-bold text-center mb-4">Word Chain Game</h1>

    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
      <div>
        <div className="text-sm text-gray-500">Start</div>
        <div className="font-mono font-bold">{startWord}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Target</div>
        <div className="font-mono font-bold">{targetWord}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Moves</div>
        <div className="font-mono font-bold">{moveCount}</div>
      </div>
    </div>
  </div>
);


// Word chain display component
const getLetterColor = (position) => {
  const colors = {
    0: 'bg-rose-100 hover:bg-rose-200 border-rose-200 text-rose-800',
    1: 'bg-amber-100 hover:bg-amber-200 border-amber-200 text-amber-800',
    2: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200 text-emerald-800',
    3: 'bg-sky-100 hover:bg-sky-200 border-sky-200 text-sky-800',
    4: 'bg-purple-100 hover:bg-purple-200 border-purple-200 text-purple-800',
    5: 'bg-orange-100 hover:bg-orange-200 border-orange-200 text-orange-800',
    6: 'bg-teal-100 hover:bg-teal-200 border-teal-200 text-teal-800',
    7: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-200 text-indigo-800'
  };
  return colors[position] || colors[0];
};

const LetterBlock = ({ char, colorClass }) => (
  <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-2xl border ${colorClass}`}>
    {char}
  </div>
);

const WordBlock = ({ word, isTarget }) => {
  const targetStyle = 'bg-green-100 hover:bg-green-200 border-green-200 text-green-800';

  return (
    <div className="flex gap-1">
      {word.split('').map((char, index) => (
        <LetterBlock
          key={index}
          char={char}
          colorClass={isTarget ? targetStyle : getLetterColor(index)}
        />
      ))}
    </div>
  );
};

const WordChainDisplay = ({ moves, targetWord }) => {
  return (
    <div className="flex flex-col items-center">
      {moves.map((word, index) => (
        <div key={index} className="flex flex-col items-center">
          <WordBlock
            word={word}
            isTarget={word === targetWord}
          />

          {index < moves.length - 1 && (
            <ArrowDown className="text-gray-300 my-1" size={12} />
          )}
        </div>
      ))}
    </div>
  );
};

// Input controls component
const InputControls = ({ inputRef, inputValue, setInputValue, isComplete, isLoading, handleNewWord, handleUndo, moves }) => {
  const handleSubmit = () => {
    if (inputValue.trim()) {
      handleNewWord(inputValue.trim());
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.toLowerCase())}
        placeholder="Enter word"
        disabled={isComplete || isLoading}
        className="flex-1 p-2 border rounded-lg font-mono focus:ring focus:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={isComplete || isLoading || !inputValue.trim()}
        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        title="Submit (Enter)"
      >
        <Send size={20} />
      </button>

      <button
        onClick={handleUndo}
        disabled={moves.length <= 1 || isLoading}
        className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        title="Undo (Backspace)"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
};

const InputControls_ = ({ inputRef, inputValue, setInputValue, isComplete, isLoading, handleNewWord, handleUndo, moves }) => (
  <div className="flex space-x-2">
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value.toLowerCase())}
      placeholder="Enter word"
      disabled={isComplete || isLoading}
      className={`
        flex-1 px-3 py-2 border rounded-lg 
        font-mono text-base sm:text-lg
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
    <button
      onClick={() => {
        if (inputValue.trim()) { handleNewWord(inputValue.trim()); }
      }}
      disabled={isComplete || isLoading || !inputValue.trim()}
      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      title="Submit (Enter)"
    >
      <Send size={20} />
    </button>

    <button
      onClick={handleUndo}
      disabled={moves.length <= 1 || isLoading}
      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      title="Undo (Backspace)"
    >
      <RotateCcw size={20} />
    </button>
  </div>
);

// Error message component
const ErrorOverlay = ({ message, show }) => (
  <div
    className={`
      fixed top-2 left-1/2 transform -translate-x-1/2
      bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg
      transition-all duration-300 z-50 text-sm sm:text-base
      max-w-[90%] sm:max-w-md
      ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
    `}
  >
    {message}
  </div>
);

// Victory message component
const VictoryOverlay = ({ moveCount, onPlayAgain, show }) => (
  <div
    className={` 
      fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      bg-green-100 text-green-700 px-6 py-4 rounded-lg shadow-lg
      transition-all duration-300 z-50 text-center space-y-3
      ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
    `}
  >
    <div className="text-lg sm:text-xl font-bold animate-bounce-subtle">
      Victory! Completed in {moveCount} moves!
    </div>
    <button
      onClick={onPlayAgain}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
    >
      Play Again
    </button>
  </div>
);

const VictoryMessage = ({ moveCount, onPlayAgain }) => (
  <div className="text-center mt-2 space-y-2 pb-2">
    <div className="text-lg sm:text-xl font-bold text-green-600 animate-bounce-subtle">
      Victory! Completed in {moveCount} moves!
    </div>
    <button
      onClick={onPlayAgain}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
    >
      Play Again
    </button>
  </div>
);

// Main WordChain component
const WordChain = () => {

  // Game state declarations
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

  // Initialize the game when the component mounts. This effect runs once when the component is first rendered.
  useEffect(() => {
    startNewGame();
  }, []);

  // Manages the animation timing for new moves. Clears the new move animation state after 500ms.
  useEffect(() => {
    if (isNewMove) {
      const timer = setTimeout(() => setIsNewMove(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isNewMove]);

  // Controls the duration of error message display. Automatically hides the error message after 2 seconds.
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  // Manages automatic scrolling of the word chain container. Ensures the latest move is always visible by scrolling to the bottom.
  useEffect(() => {
    if (chainContainerRef.current) {
      chainContainerRef.current.scrollTop = chainContainerRef.current.scrollHeight;
    }
  }, [moves]);

  // Sets up keyboard shortcuts for the game. Shift + Delete: Undo last move. 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && e.shiftKey && !isComplete && !isLoading) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, isComplete, isLoading]);

  // Handles mobile viewport height adjustments. Calculating the true viewport height, Setting a CSS custom property (--vh), Updating on resize events
  useEffect(() => {
    const adjustViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    adjustViewportHeight(); // Run once on mount
    window.addEventListener('resize', adjustViewportHeight); // Add event listener
    return () => window.removeEventListener('resize', adjustViewportHeight);
  }, []);

  // Plays a sound effect
  const playSound = (audioRef) => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
  };

  // Displays an error message with animation and sound
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

  // Initializes a new game by selecting random word pairs and resetting game state
  const startNewGame = () => {
    playSound(startAudioRef);
    const [start, target] = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    setCurrentWord(start);
    setTargetWord(target);
    setMoves([start]);
    setIsComplete(false);
    setInputValue('');
  };

  // Validates if a new word is a legal move
  const isValidMove = (newWord) => {
    if (newWord.length !== currentWord.length) return false;

    let differences = 0;
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] !== newWord[i]) differences++;
    }
    return differences === 1;
  };

  // Validates if a new word is an actual english word
  const isValidWord = async (word) => {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) return false;
    return true;
  };

  // Processes a new word submission, validates it, and updates game state
  const handleNewWord = async (word) => {
    if (!word) return;

    if (!isValidMove(word)) {
      showErrorAnimation('Must change exactly one letter!');
      return;
    }

    setIsLoading(true);
    try {
      const isWordValid = await isValidWord(word);
      if (isWordValid) {
        playSound(moveAudioRef);
        setCurrentWord(word);
        setMoves([...moves, word]);
        setIsNewMove(true);
        if (word === targetWord) {
          setIsComplete(true);
          playSound(victoryAudioRef);
        }
      }
      if (!isWordValid) {
        showErrorAnimation('Not a valid English word!');
      }
    } catch (error) {
      showErrorAnimation('Error checking word. Please try again.');
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handles the undo action by removing the last move
  const handleUndo = () => {
    if (moves.length > 1) {
      const newMoves = moves.slice(0, -1);
      const lastWord = newMoves[newMoves.length - 1];
      setMoves(newMoves);
      setCurrentWord(newMoves[newMoves.length - 1]);
      setIsComplete(false);
      setInputValue(lastWord);
      playSound(undoAudioRef);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <div className="bg-white">
        <GameHeader
          startWord={moves[0]}
          targetWord={targetWord}
          moveCount={moves.length - 1}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <WordChainDisplay
          moves={moves}
          targetWord={targetWord}
          isNewMove={isNewMove}
        />
      </div>

      <div className="bg-white shadow-lg p-3 sticky bottom-0">
        <InputControls
          inputRef={inputRef}
          inputValue={inputValue}
          setInputValue={setInputValue}
          isComplete={isComplete}
          isLoading={isLoading}
          handleNewWord={handleNewWord}
          handleUndo={handleUndo}
          moves={moves}
        />
      </div>

      <ErrorOverlay
        message={errorMessage}
        show={showError}
      />

      <VictoryOverlay
        moveCount={moves.length - 1}
        onPlayAgain={startNewGame}
        show={isComplete}
      />

      {/* Global styles for animations and mobile viewport handling */}
      <style jsx global>{`

        @supports (padding: env(safe-area-inset-bottom)) {
          .has-safe-area {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        html, body {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }

        #root {
          height: 100%;
        }

        /* Animations */
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-40px);
          }
          60% {
            opacity: 1;
            transform: translateY(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-new-word {
          animation: slideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        /* Keep other animations the same */
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
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

        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WordChain;