import React, { useEffect, useRef } from 'react';
import { ArrowDown, RotateCcw, Send } from 'lucide-react';
import { getLetterColor } from './constants';

// Header component showing game stats
export const GameHeader = ({ startWord, targetWord, moveCount }) => (
    <div className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Word Chain Game 2</h1>

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

export const WordChainDisplay = ({ moves, targetWord }) => {
    const endOfListRef = useRef(null);

    useEffect(() => {
        endOfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [moves]);

    return (
        <div className="flex flex-col items-center py-4">
            {moves.map((word, index) => (
                <div key={index} className="flex flex-col items-center">
                    <WordBlock
                        word={word}
                        isTarget={word === targetWord}
                    />

                    {index < moves.length - 1 && (
                        <ArrowDown className="text-gray-300 my-2" size={12} />
                    )}
                </div>
            ))}
            <div ref={endOfListRef} />
        </div>
    );
};

// Input controls component
export const InputControls = ({ inputRef, inputValue, setInputValue, isComplete, isLoading, handleNewWord, handleUndo, moves }) => {
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

// Error message component
export const ErrorOverlay = ({ message, show }) => (
    show ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-md z-50">
            {message}
        </div>
    ) : null
);

// Victory message component
export const VictoryOverlay = ({ moveCount, onPlayAgain, show }) => (
    show ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-100 text-green-700 p-4 rounded-lg shadow-md text-center">
            <div className="font-bold mb-3">Victory! Completed in {moveCount} moves!</div>
            <button
                onClick={onPlayAgain}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
                Play Again
            </button>
        </div>
    ) : null
);