// Sound effect file paths for various game events
export const SoundEffects = {
    START: '/sounds/BattleIntro.wav',
    MOVE: '/sounds/Confirm.wav',
    ERROR: '/sounds/Error.wav',
    VICTORY: '/sounds/LoadSave.wav',
    UNDO: '/sounds/Close.wav',
};

// Color mapping for letter blocks
export const getLetterColor = (position) => {
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