/**
 * WordChain is a React component that implements a word chain game where players
 * transform one word into another by changing one letter at a time. Each intermediate
 * word must be a valid English word.
 */

import React, { useState, useEffect, useRef } from 'react';
import wordPairs from './wordPairs';
import { GameHeader, WordChainDisplay, InputControls, ErrorOverlay, VictoryOverlay } from './components';
import { SoundEffects } from './constants';
import './styles.css';

const WordChain_ = () => {

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
  // const chainContainerRef = useRef(null);
  // const chainContentRef = useRef(null);

  // Audio refs
  const startAudioRef = useRef(new Audio(SoundEffects.START));
  const moveAudioRef = useRef(new Audio(SoundEffects.MOVE));
  const errorAudioRef = useRef(new Audio(SoundEffects.ERROR));
  const victoryAudioRef = useRef(new Audio(SoundEffects.VICTORY));
  const undoAudioRef = useRef(new Audio(SoundEffects.UNDO));

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
    <div className="h-[100dvh] flex flex-col fixed inset-0">
      <div className="sticky top-0 z-10 bg-white">
        <GameHeader
          startWord={moves[0]}
          targetWord={targetWord}
          moveCount={moves.length - 1}
        />
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div className="min-h-full py-4">
          <WordChainDisplay
            moves={moves}
            targetWord={targetWord}
            isNewMove={isNewMove}
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 pb-safe bg-white p-2">
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
    </div>
  );
};










const WordChain = () => {
  const [inputValue, setInputValue] = useState("");
  const [textBlocks, setTextBlocks] = useState([]);
  const endOfListRef = useRef(null);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setTextBlocks([...textBlocks, inputValue]);
      setInputValue("");
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "10px",
        textAlign: "center",
        zIndex: 2
      }}>
        <h1>Header</h1>
      </header>

      <main style={{
        marginTop: "60px",
        marginBottom: "60px",
        overflowY: "auto",
        flex: 1,
        padding: "20px",
        WebkitOverflowScrolling: "touch"
      }}>
        {textBlocks.map((text, index) => (
          <div key={index} style={{
            backgroundColor: "#f8f9fa",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px"
          }}>
            {text}
          </div>
        ))}
        <div ref={endOfListRef} />
      </main>

      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#f1f1f1",
        padding: "10px",
        textAlign: "center",
        zIndex: 2,
        marginBottom: `calc(20px + env(keyboard-inset-height))`
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter text here"
          style={{
            width: "70%",
            padding: "10px",
            marginRight: "10px",
            borderRadius: "5px"
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </footer >
    </div >
  );
};













const WordChain_1 = () => {
  const [inputValue, setInputValue] = useState("");
  const [textBlocks, setTextBlocks] = useState([]);
  const endOfListRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      // Use visual viewport height for iOS
      const height = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(height);
    };

    // Listen to visualViewport changes for iOS
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    // Fallback for browsers without visualViewport
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setTextBlocks([...textBlocks, inputValue]);
      setInputValue("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [textBlocks]);

  return (
    <div style={{
      height: '100%',
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "10px",
        textAlign: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <h1>Header</h1>
      </header>

      <main style={{
        flex: 1,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "scroll",
        height: `${viewportHeight - 140}px`
      }}>
        {textBlocks.map((text, index) => (
          <div key={index} style={{
            backgroundColor: "#f8f9fa",
            padding: "10px",
            borderRadius: "5px",
          }}>
            {text}
          </div>
        ))}
        <div ref={endOfListRef} />
      </main>

      <footer style={{
        backgroundColor: "#f1f1f1",
        padding: "10px",
        textAlign: "center",
        position: "sticky",
        bottom: 0
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Enter text here"
          style={{
            width: "70%",
            padding: "10px",
            marginRight: "10px",
            borderRadius: "5px"
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </footer>
    </div>
  );
};





function WordChain__() {
  // State hook for tracking the current value of the input field
  const [inputValue, setInputValue] = useState(""); // Initializes the input field with an empty string

  // State hook for storing the list of text blocks
  const [textBlocks, setTextBlocks] = useState([]); // Initializes the text blocks as an empty array

  // useRef hook to reference the last div in the text blocks list
  const endOfListRef = useRef(null); // This will be used to scroll to the bottom of the list when a new block is added

  // Dynamic viewport height
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Adjust the viewport height dynamically when the window resizes (keyboard appears/disappears)
  useEffect(() => {
    const handleResize = () => { setViewportHeight(window.innerHeight); }; // Update height when keyboard shows or hides
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handles changes in the input field and updates the state
  const handleInputChange = (event) => {
    setInputValue(event.target.value); // Updates the inputValue state with the new text typed in the input
  };

  // Handles submission when the "Send" button is clicked or Enter key is pressed
  const handleSubmit = () => {
    if (inputValue.trim() !== "") {
      setTextBlocks([...textBlocks, inputValue]); // Adds the new input value to the textBlocks array
      setInputValue(""); // Clears the input field after submitting
    }
  };

  // Handles the "Enter" key press and submits the text when Enter is pressed
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit(); // Calls the handleSubmit function if Enter key is pressed
    }
  };

  // useEffect hook to scroll to the bottom when new text is added
  useEffect(() => {
    if (endOfListRef.current) {
      endOfListRef.current.scrollIntoView({ behavior: "smooth" }); // Smooth scroll to the last element in the text blocks
    }
  }, [textBlocks]); // This effect runs whenever the textBlocks state changes (i.e., when a new block is added)

  return (
    <div
      style={{
        display: "flex", // Defines the container as a flexbox,
        flexDirection: "column", // Stacks the flex items vertically from top to bottom
        height: "100dvh", // Sets the height of the container to 100% of the dynamic viewport height (not vh)
      }}
    >
      {/* Header Section */}
      <header
        style={{
          backgroundColor: "#4CAF50", // Sets the background color of the header
          color: "white", // Sets the text color to white
          padding: "10px", // Adds padding inside the header
          textAlign: "center", // Centers the text horizontally
          flexShrink: 0, // Prevents the header from shrinking when the window is resized
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 10,
        }}
      >
        <h1>Header</h1>
      </header>

      {/* Main Content Section with Scrollable Text Blocks */}
      <main
        style={{
          flexGrow: 1, // Allows the main content to take up the remaining space
          padding: "20px", // Adds padding inside the main content area
          marginTop: "60px",
          display: "flex", // Makes the main content a flex container
          flexDirection: "column", // Arranges text blocks vertically
          gap: "10px", // Adds space between text blocks
          justifyContent: "flex-start", // Aligns items at the start of the container (top)
          overflowY: "scroll", // Enables vertical scrolling if content overflows
          // maxHeight: "calc(100vh - 140px)", // Restricts the height to fit within the available space (considering header and footer)
          maxHeight: `calc(${viewportHeight}px - 140px)`, // Adjust content area height based on dynamic viewport height
        }}
      >
        {
          // Displays all the text blocks from the textBlocks array
        }
        {/* Div placed at the end of the list for scrolling to it */}
        <div ref={endOfListRef}></div>
      </main>

      {/* Footer Section containing input field and button */}
      <footer
        style={{
          backgroundColor: "#f1f1f1", // Sets the background color of the footer
          padding: "10px", // Adds padding inside the footer
          textAlign: "center", // Centers the content in the footer
          flexShrink: 0, // Prevents the footer from shrinking
        }}
      >
        {/* Text input field for typing new messages */}
        <input
          type="text" // Specifies it's a text input field
          value={inputValue} // Binds the value of the input to the inputValue state
          onChange={handleInputChange} // Calls handleInputChange when text is typed
          onKeyDown={handleKeyPress} // Calls handleKeyPress when a key is pressed in the input
          placeholder="Enter text here" // Placeholder text to show when the input is empty
          style={{
            width: "70%", // Sets the input field width to 70% of the container
            padding: "10px", // Adds padding inside the input field
            marginRight: "10px", // Adds space to the right of the input field
            borderRadius: "5px", // Rounds the corners of the input field
          }}
        />
        {/* Send Button */}
        <button
          onClick={handleSubmit} // Calls handleSubmit when the button is clicked
          style={{
            padding: "10px 20px", // Adds padding inside the button
            backgroundColor: "#4CAF50", // Sets the background color of the button
            color: "white", // Sets the text color of the button
            border: "none", // Removes the default border of the button
            borderRadius: "5px", // Rounds the corners of the button
            cursor: "pointer", // Changes the cursor to pointer when hovering over the button
          }}
        >
          Send {/* Button text */}
        </button>
      </footer>
    </div>
  );
}

export default WordChain;

// textBlocks.map((block, index) => (
//   <div
//     key={index} // Uses index as key for each text block (ensures unique identification)
//     style={{
//       padding: "10px", // Adds padding inside each text block
//       border: "1px solid #ddd", // Adds a light gray border around each text block
//       borderRadius: "5px", // Rounds the corners of the border
//     }}
//   >
//     {block} {/* Displays the actual text in the block */}
//   </div>
// ))