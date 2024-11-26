/**
 * WordChain is a React component that implements a word chain game where players
 * transform one word into another by changing one letter at a time. Each intermediate
 * word must be a valid English word.
 */

import React, { useState, useEffect, useRef } from 'react';
import wordPairs from './wordpairs';
import { GameHeader, WordChainDisplay, InputControls, ErrorOverlay, VictoryOverlay } from './components';
import { SoundEffects } from './constants';
import './styles.css';

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
      <div className="bg-white sticky top-0 z-10">
        <GameHeader
          startWord={moves[0]}
          targetWord={targetWord}
          moveCount={moves.length - 1}
        />
      </div>

      <ErrorOverlay
        message={errorMessage}
        show={showError}
      />

      <div className="flex-1 overflow-y-auto">
        <WordChainDisplay
          moves={moves}
          targetWord={targetWord}
          isNewMove={isNewMove}
        />
      </div>

      <div className="bg-white shadow-lg p-3 sticky bottom-0 z-10">
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

      <VictoryOverlay
        moveCount={moves.length - 1}
        onPlayAgain={startNewGame}
        show={isComplete}
      />
    </div>
  );
};

export default WordChain;