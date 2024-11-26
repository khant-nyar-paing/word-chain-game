import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, RotateCcw, Send } from 'lucide-react';
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
  // useEffect(() => {
  //   if (chainContainerRef.current && chainContentRef.current) {
  //     chainContainerRef.current.scrollTo({
  //       left: chainContentRef.current.scrollWidth,
  //       behavior: 'smooth'
  //     });
  //   }
  // }, [moves]);

  useEffect(() => {
    if (chainContainerRef.current) {
      chainContainerRef.current.scrollTop = chainContainerRef.current.scrollHeight;
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

  // Add effect to handle mobile viewport height
  useEffect(() => {
    const adjustViewportHeight = () => {
      // First we get the viewport height and multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    // Run once on mount
    adjustViewportHeight();
    // Add event listener
    window.addEventListener('resize', adjustViewportHeight);
    return () => window.removeEventListener('resize', adjustViewportHeight);
  }, []);

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
    <div
      className="relative w-full bg-white"
      style={{
        height: 'calc(var(--vh, 1vh) * 100)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Section */}
      <div className="flex-none p-2 sm:p-4 bg-white shadow-md z-10">
        <div className="text-center mb-1 sm:mb-2">
          <h1 className="text-xl sm:text-2xl font-bold">Word Chain Game</h1>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Start</div>
            <div className="font-mono font-bold">{moves[0]}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Target</div>
            <div className="font-mono font-bold">{targetWord}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Moves</div>
            <div className="font-mono font-bold">{moves.length - 1}</div>
          </div>
        </div>
      </div>

      {/* Error Message Overlay */}
      <div
        className={`
          fixed top-2 left-1/2 transform -translate-x-1/2
          bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg
          transition-all duration-300 z-50 text-sm sm:text-base
          max-w-[90%] sm:max-w-md
          ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
        `}
      >
        {errorMessage}
      </div>

      {/* Word Chain Section */}
      <div
        ref={chainContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50"
        style={{
          paddingBottom: '130px',
          minHeight: '0'
        }}
      >
        <div
          ref={chainContentRef}
          className="flex flex-col items-center space-y-2 p-2 sm:p-4"
        >
          {moves.map((word, index) => (
            <div key={index} className="flex flex-col items-center">
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`
                  px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-mono text-lg
                  transition-all duration-300
                  ${isNewMove && index === moves.length - 1 ? 'animate-bounce-subtle' : ''}
                  ${word === targetWord
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }
                  transform hover:scale-105
                  transform hover:scale-105
                  hover:shadow-md
                  min-w-[100px] sm:min-w-[120px] text-center
                `}
                >
                  {word}
                </div>
                {index < moves.length - 1 && (
                  <ArrowDown
                    className={`
                    text-gray-400 my-1
                    text-gray-400 my-1
                    transition-all duration-300
                    ${isNewMove && index === moves.length - 2 ? 'animate-pulse' : ''}
                  `}
                    size={24}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white shadow-lg"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 20
        }}
      >
        <div className="max-w-2xl mx-auto p-3">
          {/* Input Controls */}
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

          {/* Loading State */}
          {isLoading && (
            <div className="text-center text-gray-600 animate-pulse mt-1 text-sm">
              Checking word...
            </div>
          )}

          {/* Victory State */}
          {isComplete && (
            <div className="text-center mt-2 space-y-2 pb-2">
              <div className="text-lg sm:text-xl font-bold text-green-600 animate-bounce-subtle">
                Victory! Completed in {moves.length - 1} moves!
              </div>
              <button
                onClick={startNewGame}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Styles */}
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
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            transform: translateY(0);
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
  // return (
  //   <div className="max-w-3xl mx-auto p-6 space-y-8">
  //     {/* Title Section */}
  //     <div className="text-center transition-all duration-300 hover:scale-105">
  //       <h1 className="text-4xl font-bold mb-2">Word Chain Game</h1>
  //       <p className="text-gray-600">Change one letter at a time to reach the target word</p>
  //     </div>

  //     {/* Game Stats Section */}
  //     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-lg">
  //       <div className="transition-all duration-300 hover:scale-105">
  //         <div className="text-sm text-gray-500">Start Word</div>
  //         <div className="font-bold text-lg">{moves[0]}</div>
  //       </div>
  //       <div className="transition-all duration-300 hover:scale-105">
  //         <div className="text-sm text-gray-500">Target Word</div>
  //         <div className="font-bold text-lg">{targetWord}</div>
  //       </div>
  //       <div className="transition-all duration-300 hover:scale-105">
  //         <div className="text-sm text-gray-500">Moves</div>
  //         <div className="font-bold text-lg">{moves.length - 1}</div>
  //       </div>
  //     </div>

  //     {/* Error Message Overlay */}
  //     <div
  //       className={`
  //         fixed top-4 left-1/2 transform -translate-x-1/2
  //         bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-lg
  //         transition-all duration-300 z-50
  //         ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
  //       `}
  //     >
  //       {errorMessage}
  //     </div>

  //     {/* Word Chain Visualization */}
  //     <div
  //       ref={chainContainerRef}
  //       className="overflow-x-auto py-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
  //     >
  //       <div
  //         ref={chainContentRef}
  //         className="flex items-center justify-start space-x-4 min-w-max px-4"
  //       >
  //         {moves.map((word, index) => (
  //           <React.Fragment key={index}>
  //             <div
  //               className={`
  //                 px-4 py-2 rounded-lg font-medium
  //                 transition-all duration-300
  //                 ${isNewMove && index === moves.length - 1 ? 'animate-bounce-subtle' : ''}
  //                 ${word === targetWord
  //                   ? 'bg-green-100 text-green-800 hover:bg-green-200'
  //                   : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  //                 }
  //                 transform hover:scale-110
  //                 hover:shadow-md
  //               `}
  //               style={{
  //                 animation: isNewMove && index === moves.length - 1
  //                   ? 'slideIn 0.5s ease-out'
  //                   : 'none'
  //               }}
  //             >
  //               {word}
  //             </div>
  //             {index < moves.length - 1 && (
  //               <ArrowLeft
  //                 className={`
  //                   rotate-180 text-gray-400
  //                   transition-all duration-300
  //                   ${isNewMove && index === moves.length - 2 ? 'animate-pulse' : ''}
  //                 `}
  //                 size={20}
  //               />
  //             )}
  //           </React.Fragment>
  //         ))}
  //       </div>
  //     </div>

  //     {/* Input Controls Section */}
  //     <div className="space-y-4">
  //       <div className="flex space-x-2">
  //         {/* Word Input */}
  //         <input
  //           ref={inputRef}
  //           type="text"
  //           value={inputValue}
  //           onChange={(e) => setInputValue(e.target.value.toLowerCase())}
  //           placeholder="Enter your next word"
  //           disabled={isComplete || isLoading}
  //           className={`
  //             flex-1 px-4 py-2 border rounded-lg 
  //             focus:outline-none focus:ring-2 focus:ring-blue-500 
  //             transition-all duration-300
  //             ${isComplete || isLoading ? 'bg-gray-100' : 'bg-white'}
  //           `}
  //           onKeyPress={(e) => {
  //             if (e.key === 'Enter' && inputValue.trim()) {
  //               handleNewWord(inputValue.trim());
  //             }
  //           }}
  //         />

  //         {/* Submit Button */}
  //         <button
  //           onClick={() => {
  //             if (inputValue.trim()) {
  //               handleNewWord(inputValue.trim());
  //             }
  //           }}
  //           disabled={isComplete || isLoading || !inputValue.trim()}
  //           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
  //           title="Submit (Enter)"
  //         >
  //           <Send size={20} />
  //         </button>

  //         {/* Undo Button */}
  //         <button
  //           onClick={handleUndo}
  //           disabled={moves.length <= 1 || isLoading}
  //           className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
  //           title="Undo (Shift + Delete)"
  //         >
  //           <RotateCcw size={20} />
  //         </button>
  //       </div>

  //       {/* Loading Indicator */}
  //       {isLoading && (
  //         <div className="text-center text-gray-600 animate-pulse">
  //           Checking word...
  //         </div>
  //       )}
  //     </div>

  //     {/* Victory Message & New Game Button */}
  //     {isComplete && (
  //       <div className="text-center space-y-4 animate-fade-in">
  //         <div className="text-2xl font-bold text-green-600 animate-bounce-subtle">
  //           Victory! Completed in {moves.length - 1} moves!
  //         </div>
  //         <button
  //           onClick={startNewGame}
  //           className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105"
  //         >
  //           Play Again
  //         </button>
  //       </div>
  //     )}

  //     {/* Animations */}
  //     <style jsx>{`
  //       @keyframes slideIn {
  //         from {
  //           opacity: 0;
  //           transform: translateX(20px);
  //         }
  //         to {
  //           opacity: 1;
  //           transform: translateX(0);
  //         }
  //       }

  //       @keyframes bounce-subtle {
  //         0%, 100% {
  //           transform: translateY(0);
  //         }
  //         50% {
  //           transform: translateY(-5px);
  //         }
  //       }

  //       .animate-bounce-subtle {
  //         animation: bounce-subtle 1s ease-in-out;
  //       }

  //       .animate-fade-in {
  //         animation: fadeIn 0.5s ease-in;
  //       }

  //       @keyframes fadeIn {
  //         from {
  //           opacity: 0;
  //         }
  //         to {
  //           opacity: 1;
  //         }
  //       }

  //       @keyframes shake {
  //         0%, 100% { transform: translateX(0); }
  //         25% { transform: translateX(-8px); }
  //         75% { transform: translateX(8px); }
  //       }

  //       .shake {
  //         animation: shake 0.3s ease-in-out;
  //       }
  //     `}</style>
  //   </div>
  // );
};

export default WordChain;