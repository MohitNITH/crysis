import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';

// Base phone number (first part)
const basePhoneNumber = '555';

// Define the patterns and their corresponding riddles and answers
const patterns = {
  'S': {
    coords: ['A7', 'B2', 'D3', 'F8', 'H9', 'J1'],
    riddleText: 'I am the sum of all faces on a die, reduced to a single digit, then multiplied by a perfect square that is half of the smallest two-digit perfect square. What two-digit number am I?',
    answer: '36',
    patternNumber: '111',
    displayName: 'S Pattern'
  },
  'LIGHTNING_BOLT': {
    coords: ['A6', 'E1', 'F5', 'J3', 'E9', 'D6'],
    riddleText: 'I am the product of the first four Fibonacci numbers, divided by the sum of all single-digit prime numbers. What two-digit number am I?',
    answer: '42',
    patternNumber: '222',
    displayName: 'Lightning Bolt'
  },
  'M': {
    coords: ['J2', 'B2', 'E5', 'B8', 'J8', 'J3'],
    riddleText: 'I am the number of degrees in a regular hexagon, minus the atomic number of carbon. What two-digit number am I?',
    answer: '54',
    patternNumber: '333',
    displayName: 'M Pattern'
  },
  'INFINITY': {
    coords: ['J10', 'B10', 'E5', 'I1', 'B1', 'J9'],
    riddleText: 'I am the product of the smallest two prime numbers that add up to 10, multiplied by the number of sides in a heptagon. What two-digit number am I?',
    answer: '63',
    patternNumber: '444',
    displayName: 'Infinity Pattern'
  }
};

// Main App Component
const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-5 flex flex-col items-center">
      <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Connect the Dots Challenge</h1>
        <ConnectTheDots />
      </div>
    </div>
  );
};

// Instructions Component
const Instructions = () => (
  <div className="bg-gray-50 p-3 rounded-md mb-4 text-center text-sm">
    <p><strong>Instructions:</strong> Select a pattern button to see the pattern, or create your own by connecting 6 dots.</p>
  </div>
);

// Pattern Button Component
const PatternButtons = ({ onSelectPattern }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4 w-full">
      {Object.entries(patterns).map(([key, pattern]) => (
        <button
          key={key}
          onClick={() => onSelectPattern(key)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
        >
          {pattern.displayName}
        </button>
      ))}
    </div>
  );
};

// Main Game Component
const ConnectTheDots = () => {
  const [selectedDots, setSelectedDots] = useState([]);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [showRiddle, setShowRiddle] = useState(false);
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [riddleHint, setRiddleHint] = useState({ text: '', isError: false });
  const [showResult, setShowResult] = useState(false);
  const [patternHint, setPatternHint] = useState({ show: false, name: '' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [solvedPatterns, setSolvedPatterns] = useState({});

  const canvasRef = useRef(null);
  const dotsRef = useRef({});

  // Initialize dots data
  useEffect(() => {
    const rows = 'ABCDEFGHIJ';
    const dots = {};
    
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const coord = `${rows[i]}${j + 1}`;
        dots[coord] = {
          x: j * 40 + 20,
          y: i * 40 + 20,
          row: i,
          col: j
        };
      }
    }
    
    dotsRef.current = dots;
  }, []);

  // Drawing functions
  const clearLines = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const drawLine = (x1, y1, x2, y2) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#ff5722';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  const redrawLines = () => {
    clearLines();
    for (let i = 0; i < selectedDots.length - 1; i++) {
      const dot1 = dotsRef.current[selectedDots[i]];
      const dot2 = dotsRef.current[selectedDots[i+1]];
      drawLine(dot1.x, dot1.y, dot2.x, dot2.y);
    }
  };

  // Redraw lines when selected dots change
  useEffect(() => {
    redrawLines();
    
    // Check for pattern hints
    if (selectedDots.length >= 3) {
      checkForPatternHint();
    } else {
      setPatternHint({ show: false, name: '' });
    }
  }, [selectedDots]);

  const handleDotClick = (coord) => {
    if (selectedDots.includes(coord)) {
      // Deselect the dot and all dots after it
      const index = selectedDots.indexOf(coord);
      setSelectedDots(prev => prev.slice(0, index));
    } else if (selectedDots.length < 6) {
      // Select this dot and draw line
      setSelectedDots(prev => {
        const newSelected = [...prev, coord];
        return newSelected;
      });
    } else {
      alert('You can only select 6 dots. Reset to start over.');
    }
  };

  const resetGame = () => {
    setSelectedDots([]);
    setCurrentPattern(null);
    setShowRiddle(false);
    setRiddleAnswer('');
    setRiddleHint({ text: '', isError: false });
    setShowResult(false);
    setPatternHint({ show: false, name: '' });
    clearLines();
  };

  const handleSelectPattern = (patternKey) => {
    resetGame();
    setSelectedDots(patterns[patternKey].coords);
    setCurrentPattern(patternKey);
    setShowRiddle(true);
  };

  const checkForPatternHint = () => {
    // Check if what they have so far matches the beginning of any pattern
    for (const [name, pattern] of Object.entries(patterns)) {
      const coords = pattern.coords;
      let matchesPattern = true;
      
      for (let i = 0; i < Math.min(selectedDots.length, coords.length); i++) {
        if (selectedDots[i] !== coords[i]) {
          matchesPattern = false;
          break;
        }
      }
      
      if (matchesPattern && selectedDots.length >= 3) {
        setPatternHint({ show: true, name: pattern.displayName });
        return;
      }
    }
    
    setPatternHint({ show: false, name: '' });
  };

  const checkPattern = () => {
    // Check if the user's pattern matches any of the predefined patterns
    for (const [name, pattern] of Object.entries(patterns)) {
      if (JSON.stringify(selectedDots) === JSON.stringify(pattern.coords)) {
        setCurrentPattern(name);
        setShowRiddle(true);
        return;
      }
    }
    
    // If no match is found
    alert('This pattern is not recognized. Try creating one of the special patterns!');
  };

  const checkRiddle = () => {
    if (!currentPattern) return;
    
    const pattern = patterns[currentPattern];
    
    if (riddleAnswer === pattern.answer) {
      // Generate phone number using the pattern's specific number
      const newPhoneNumber = `${basePhoneNumber}-${pattern.patternNumber}-${riddleAnswer}`;
      setPhoneNumber(newPhoneNumber);
      setShowResult(true);
      setRiddleHint({ text: 'Correct!', isError: false });
      
      // Add to solved patterns
      setSolvedPatterns(prev => ({
        ...prev,
        [currentPattern]: {
          patternName: pattern.displayName,
          answer: pattern.answer,
          phoneNumber: newPhoneNumber
        }
      }));
    } else {
      setRiddleHint({ text: 'Incorrect answer. Try again.', isError: true });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Instructions />
      
      {/* Pattern Buttons */}
      <PatternButtons onSelectPattern={handleSelectPattern} />
      
      {/* Solved Patterns Summary */}
      {Object.keys(solvedPatterns).length > 0 && (
        <div className="w-full mb-4 p-3 bg-green-50 rounded-md">
          <h3 className="font-bold text-center mb-2">Solved Patterns</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(solvedPatterns).map(([key, data]) => (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="font-medium">{data.patternName}:</span>
                <div className="flex items-center">
                  <span className="mr-2">Answer: {data.answer}</span>
                  <span className="text-blue-500 font-mono">{data.phoneNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="relative mt-2 mb-5">
        {/* Row and Column Labels */}
        <RowLabels />
        <ColumnLabels />
        
        {/* Canvas for drawing lines */}
        <canvas 
          ref={canvasRef} 
          width="400" 
          height="400" 
          className="absolute top-0 left-0 pointer-events-none z-10"
        />
        
        {/* Grid with dots */}
        <Grid 
          selectedDots={selectedDots} 
          onDotClick={handleDotClick} 
        />
      </div>
      
      {/* Game Controls */}
      <div className="flex flex-col items-center w-full mt-4">
        <div className="font-mono text-sm mb-2">Selected: {selectedDots.join(' → ')}</div>
        <div className="flex space-x-3">
          <button 
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
          <button 
            onClick={checkPattern}
            disabled={selectedDots.length < 6}
            className={`${selectedDots.length < 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded`}
          >
            Submit Pattern
          </button>
        </div>
      </div>
      
      {/* Pattern Hint */}
      {patternHint.show && !showRiddle && (
        <div className="bg-blue-50 p-3 rounded mt-4 italic text-center">
          You've created: <span className="font-bold text-blue-500">{patternHint.name}</span>
        </div>
      )}
      
      {/* Riddle Challenge */}
      {showRiddle && currentPattern && (
        <div className="mt-6 text-center w-full">
          <h2 className="text-xl font-bold mb-2">Riddle for {patterns[currentPattern].displayName}</h2>
          <p className="italic mb-4">{patterns[currentPattern].riddleText}</p>
          <div className="flex items-center justify-center">
            <input
              type="number"
              min="10"
              max="99"
              placeholder="??"
              value={riddleAnswer}
              onChange={(e) => setRiddleAnswer(e.target.value)}
              className="w-16 p-2 text-center mr-2 border rounded"
            />
            <button 
              onClick={checkRiddle}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Solve
            </button>
          </div>
          {riddleHint.text && (
            <p className={`mt-2 ${riddleHint.isError ? 'text-red-500' : 'text-green-500'}`}>
              {riddleHint.text}
            </p>
          )}
        </div>
      )}
      
      {/* Result */}
      {showResult && (
        <div className="mt-6 text-center animate-fade-in">
          <h2 className="text-xl font-bold mb-2">Challenge Complete!</h2>
          <p>Congratulations! You've solved the {patterns[currentPattern].displayName} challenge.</p>
          <p>Here's your phone number:</p>
          <div className="text-2xl font-bold tracking-wide text-blue-500 my-2">
            {phoneNumber}
          </div>
          <button 
            onClick={resetGame}
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            Try Another Pattern
          </button>
        </div>
      )}
    </div>
  );
};

// Row Labels Component
const RowLabels = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  return (
    <div className="absolute left-0 top-0 h-full flex flex-col justify-between -ml-6">
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-center w-5 h-5 font-bold">
          {row}
        </div>
      ))}
    </div>
  );
};

// Column Labels Component
const ColumnLabels = () => {
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  return (
    <div className="absolute top-0 left-0 w-full flex justify-between -mt-6">
      {columns.map((col) => (
        <div key={col} className="flex items-center justify-center w-5 h-5 font-bold">
          {col}
        </div>
      ))}
    </div>
  );
};

// Grid Component
const Grid = ({ selectedDots, onDotClick }) => {
  const rows = 'ABCDEFGHIJ';
  
  return (
    <div className="grid grid-cols-10 grid-rows-10 gap-0">
      {Array.from({ length: 10 }, (_, i) => (
        Array.from({ length: 10 }, (_, j) => {
          const coord = `${rows[i]}${j + 1}`;
          return (
            <div 
              key={coord} 
              className="flex items-center justify-center relative"
              style={{ width: '40px', height: '40px' }}
            >
              <button
                className={`w-5 h-5 rounded-full bg-gray-800 hover:bg-gray-600 transition-transform ${
                  selectedDots.includes(coord) ? 'bg-orange-500 transform scale-125' : ''
                }`}
                onClick={() => onDotClick(coord)}
              />
              <div className="absolute -top-5 text-xs text-gray-500 whitespace-nowrap">
                
              </div>
            </div>
          );
        })
      )).flat()}
    </div>
  );
};

export default App;