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
  <div className="flex-none p-2 sm:p-4 bg-white shadow-md z-10">
    <div className="text-center mb-1 sm:mb-2">
      <h1 className="text-xl sm:text-2xl font-bold">Word Chain Game</h1>
    </div>

    <div className="flex justify-between items-center bg-gray-50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
      <div>
        <div className="text-xs sm:text-sm text-gray-500">Start</div>
        <div className="font-mono font-bold">{startWord}</div>
      </div>
      <div>
        <div className="text-xs sm:text-sm text-gray-500">Target</div>
        <div className="font-mono font-bold">{targetWord}</div>
      </div>
      <div>
        <div className="text-xs sm:text-sm text-gray-500">Moves</div>
        <div className="font-mono font-bold">{moveCount}</div>
      </div>
    </div>
  </div>
);

// Letter color
const getPositionColor = (position) => {
  // Game-friendly color scheme for up to 8 positions
  const colors = {
    0: {
      bg: 'bg-rose-100',
      hover: 'hover:bg-rose-200',
      border: 'border-rose-200',
      text: 'text-rose-800'
    },
    1: {
      bg: 'bg-amber-100',
      hover: 'hover:bg-amber-200',
      border: 'border-amber-200',
      text: 'text-amber-800'
    },
    2: {
      bg: 'bg-emerald-100',
      hover: 'hover:bg-emerald-200',
      border: 'border-emerald-200',
      text: 'text-emerald-800'
    },
    3: {
      bg: 'bg-sky-100',
      hover: 'hover:bg-sky-200',
      border: 'border-sky-200',
      text: 'text-sky-800'
    },
    4: {
      bg: 'bg-purple-100',
      hover: 'hover:bg-purple-200',
      border: 'border-purple-200',
      text: 'text-purple-800'
    },
    5: {
      bg: 'bg-orange-100',
      hover: 'hover:bg-orange-200',
      border: 'border-orange-200',
      text: 'text-orange-800'
    },
    6: {
      bg: 'bg-teal-100',
      hover: 'hover:bg-teal-200',
      border: 'border-teal-200',
      text: 'text-teal-800'
    },
    7: {
      bg: 'bg-indigo-100',
      hover: 'hover:bg-indigo-200',
      border: 'border-indigo-200',
      text: 'text-indigo-800'
    }
  };
  return colors[position] || colors[0];
};

// Word chain display component
const WordChainDisplay = ({ moves, targetWord, isNewMove }) => (
  <div className="flex flex-col items-center">
    {moves.map((word, wordIndex) => (
      <div key={wordIndex} className="flex flex-col items-center">
        <div className="flex gap-px">
          {word.split('').map((char, charIndex) => {
            const positionColors = getPositionColor(charIndex);
            return (
              <div
                key={charIndex}
                className={`
                  flex items-center justify-center
                  w-8 sm:w-10 h-8 sm:h-10
                  rounded-lg font-mono text-lg
                  transition-all duration-300
                  ${isNewMove && wordIndex === moves.length - 1 ? 'animate-new-word' : ''}
                  ${word === targetWord
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                    : `${positionColors.bg} ${positionColors.text} ${positionColors.hover} ${positionColors.border}`
                  }
                  transform hover:scale-105
                  border
                `}
              >
                {char}
              </div>
            );
          })}
        </div>
        {wordIndex < moves.length - 1 && (
          <ArrowDown
            className={`
              text-gray-300 my-px
              transition-all duration-300
              ${isNewMove && wordIndex === moves.length - 2 ? 'animate-pulse' : ''}
            `}
            size={12}
          />
        )}
      </div>
    ))}
  </div>
);

const WordChainDisplay_ = ({ moves, targetWord, isNewMove }) => (
  <div className="flex flex-col items-center space-y-4 p-2 sm:p-4">
    {moves.map((word, wordIndex) => (
      <div key={wordIndex} className="flex flex-col items-center">
        <div className="flex space-x-1 sm:space-x-2">
          {word.split('').map((char, charIndex) => (
            <div
              key={charIndex}
              className={`
                flex items-center justify-center
                w-8 sm:w-10 h-8 sm:h-10
                rounded-lg font-mono text-lg
                transition-all duration-300
                ${isNewMove && wordIndex === moves.length - 1 ? 'animate-new-word' : ''}
                ${word === targetWord
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }
                transform hover:scale-105
                hover:shadow-md
                border-2 
                ${word === targetWord ? 'border-green-200' : 'border-blue-200'}
              `}
            >
              {char}
            </div>
          ))}
        </div>
        {wordIndex < moves.length - 1 && (
          <ArrowDown
            className={`
              text-gray-400 my-2
              transition-all duration-300
              ${isNewMove && wordIndex === moves.length - 2 ? 'animate-pulse' : ''}
            `}
            size={24}
          />
        )}
      </div>
    ))}
  </div>
);

// Input controls component
const InputControls = ({ inputRef, inputValue, setInputValue, isComplete, isLoading, handleNewWord, handleUndo, moves }) => (
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
        if (inputValue.trim()) {
          handleNewWord(inputValue.trim());
        }
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
    <div
      className="fixed inset-0 bg-white overflow-hidden"
    // style={{
    //   height: 'calc(var(--vh, 1vh) * 100)', // Uses custom vh for mobile browsers
    //   display: 'flex',
    //   flexDirection: 'column'
    // }}
    >

      {/* Game header - fixed at top */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white">
        <GameHeader
          startWord={moves[0]}
          targetWord={targetWord}
          moveCount={moves.length - 1}
        />
      </div>

      {/* Error overlay - floats at top of screen when errors occur */}
      <ErrorOverlay
        message={errorMessage}
        show={showError}
      />

      {/* Scrollable area for the word chain */}
      <div
        ref={chainContainerRef} // Reference for scroll management
        className="absolute inset-0 overflow-y-auto bg-gray-50"
        style={{
          top: '116px',
          bottom: '130px',
          // paddingBottom: '130px', // Space for input controls
          // minHeight: '0' // Enables proper flex scrolling
        }}
      >

        {/* The actual word chain display */}
        <WordChainDisplay
          moves={moves}
          targetWord={targetWord}
          isNewMove={isNewMove}
        />
      </div>

      {/* Bottom control panel - fixed at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white shadow-lg z-20"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)', // iOS safe area
          // zIndex: 20 // Ensures controls stay above other elements
        }}
      >

        <div className="max-w-2xl mx-auto p-3">
          {/* Word input controls */}
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

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-center text-gray-600 animate-pulse mt-1 text-sm">
              Checking word...
            </div>
          )}

          {/* Victory message and restart button */}
          {isComplete && (
            <VictoryMessage
              moveCount={moves.length - 1}
              onPlayAgain={startNewGame}
            />
          )}
        </div>
      </div>

      {/* Global styles for animations and mobile viewport handling */}
      <style jsx global>{`
        :root {
          --vh: 1vh;
        }

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