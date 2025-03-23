import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import nimbus_logo from "./images/Nimbus copy.png";
import ojas_logo from "./images/orangered copy.png";
import side2 from "./images/Side2.png";
import side3 from "./images/Side3.png";
import side4 from "./images/Side4.png";
import side5 from "./images/Side5.png";

// Define the patterns and their corresponding riddles and answers
const patterns = {
  INFINITY: {
    coords: ["J10", "B10", "E5", "I1", "B1", "J9"],
    riddleText:
      "I am the product of the smallest two prime numbers that add up to 10, multiplied by the number of sides in a heptagon. What two-digit number am I?",
    answer: "63",
    patternNumber: "444",
    displayName: "Side 1",
    hint: "Form a shape like ∞",
    successImage: side5, // Placeholder for Infinity pattern image
  },
  LIGHTNING_BOLT: {
    coords: ["A6", "E1", "F5", "J3", "E9", "D6"],
    riddleText:
      "I am the product of the first four Fibonacci numbers, divided by the sum of all single-digit prime numbers. What two-digit number am I?",
    answer: "42",
    patternNumber: "222",
    displayName: "Side 2",
    hint: "Form a zigzag pattern",
    successImage: side2, // Placeholder for Lightning Bolt pattern image
  },
  S: {
    coords: ["A7", "B2", "D3", "F8", "H9", "J1"],
    riddleText:
      "I am the sum of all faces on a die, reduced to a single digit, then multiplied by a perfect square that is half of the smallest two-digit perfect square. What two-digit number am I?",
    answer: "36",
    patternNumber: "111",
    displayName: "Side 3",
    hint: "Form an S shape",
    successImage: side3, // Placeholder for S pattern image
  },
  M: {
    coords: ["J2", "B2", "E5", "B8", "J8", "J3"],
    riddleText:
      "I am the number of degrees in a regular hexagon, minus the atomic number of carbon. What two-digit number am I?",
    answer: "54",
    patternNumber: "333",
    displayName: "Side 4",
    hint: "Form an M shape",
    successImage: side4, // Placeholder for M pattern image
  },
};

// Main App Component
const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-2 sm:p-5 flex flex-col items-center">
      <div className="bg-white p-3 sm:p-5 rounded-lg shadow-md w-full max-w-xl">
        <ConnectTheDots />
      </div>
    </div>
  );
};

// Instructions Component
const Instructions = () => (
  <div className="bg-gray-50 p-2 sm:p-3 rounded-md mb-4 text-center">
    <div className="flex flex-col gap-2 sm:gap-4">
      <div className="w-full flex items-center justify-between">
        <div>
          <img src={nimbus_logo} alt="nimnus logo" className="w-10 sm:w-14" />
        </div>
        <div className="text-xl sm:text-2xl font-bold">
          <h1> TEAM OJAS</h1>
        </div>
        <div>
          <img src={ojas_logo} alt="ojas logo" className="w-10 sm:w-14" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl text-slate-900">Connect the Dots Challenge</h1>
      <div className="instructions">
        <p className="text-left text-sm sm:text-base">
          <strong className="text-base sm:text-lg">Instructions:</strong>
          <ul>
            <li>1. Create your own pattern by connecting 6 dots.</li>
            <li>
              2. Once you've selected 6 dots, you can submit your pattern.
            </li>
            <li>
              3. Coordinates for each pattern can be found on each side of the
              piller in LH
            </li>
          </ul>
        </p>
      </div>
    </div>
  </div>
);

// Challenge Selection Component
const ChallengeSelector = ({ onSelectChallenge, currentChallenge }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4 w-full">
      {Object.entries(patterns).map(([key, pattern]) => (
        <button
          key={key}
          onClick={() => onSelectChallenge(key)}
          className={`${
            currentChallenge === key
              ? "bg-blue-700 ring-2 ring-blue-300"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm`}
        >
          {pattern.displayName}
        </button>
      ))}
    </div>
  );
};

// Main Game Component
const ConnectTheDots = () => {
  // Game state
  const [selectedDots, setSelectedDots] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState("INFINITY");
  const [gameStatus, setGameStatus] = useState("drawing"); // drawing, riddle, success
  const [feedback, setFeedback] = useState({ text: "", isError: false });
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [gridSize, setGridSize] = useState({ width: 320, height: 320 });
  const [dotSize, setDotSize] = useState(6);
  const [cellSize, setcellSize] = useState(32);

  const canvasRef = useRef(null);
  const dotsRef = useRef({});
  const gridContainerRef = useRef(null);

  // Calculate responsive grid size
  useEffect(() => {
    const updateGridSize = () => {
      if (gridContainerRef.current) {
        const containerWidth = gridContainerRef.current.clientWidth;
        // Keep grid square - same width and height
        const size = Math.min(containerWidth, 400);
        setGridSize({ width: size, height: size });
        
        // Adjust cell and dot size based on grid size
        const newCellSize = Math.floor(size / 10);
        setcellSize(newCellSize);
        setDotSize(Math.max(6, Math.floor(newCellSize / 8)));
      }
    };

    // Initial size calculation
    updateGridSize();

    // Update on window resize
    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, []);

  // Initialize dots data
  useEffect(() => {
    const rows = "ABCDEFGHIJ";
    const dots = {};

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const coord = `${rows[i]}${j + 1}`;
        dots[coord] = {
          x: j * cellSize + cellSize / 2,
          y: i * cellSize + cellSize / 2,
          row: i,
          col: j,
        };
      }
    }

    dotsRef.current = dots;
  }, [cellSize]);

  // Drawing functions
  const clearLines = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const drawLine = (x1, y1, x2, y2, isCorrect = null) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      // Set color based on correctness
      if (isCorrect === true) {
        ctx.strokeStyle = "#22c55e"; // green
      } else if (isCorrect === false) {
        ctx.strokeStyle = "#ef4444"; // red
      } else {
        ctx.strokeStyle = "#ff5722"; // default orange
      }

      // Scale line width based on grid size
      const lineWidth = Math.max(2, Math.floor(gridSize.width / 150));
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  const redrawLines = () => {
    clearLines();
    const correctCoords = patterns[currentChallenge].coords;

    for (let i = 0; i < selectedDots.length - 1; i++) {
      const dot1 = dotsRef.current[selectedDots[i]];
      const dot2 = dotsRef.current[selectedDots[i + 1]];

      if (dot1 && dot2) {
        // Check if this segment is correct in the pattern
        const isCorrectSegment =
          i < correctCoords.length - 1 &&
          selectedDots[i] === correctCoords[i] &&
          selectedDots[i + 1] === correctCoords[i + 1];

        drawLine(dot1.x, dot1.y, dot2.x, dot2.y, isCorrectSegment);
      }
    }
  };

  // Redraw lines when selected dots change or when grid size changes
  useEffect(() => {
    redrawLines();
  }, [selectedDots, currentChallenge, gridSize]);

  const handleDotClick = (coord) => {
    if (gameStatus !== "drawing") return;

    if (selectedDots.includes(coord)) {
      // Deselect the dot and all dots after it
      const index = selectedDots.indexOf(coord);
      setSelectedDots((prev) => prev.slice(0, index));
    } else if (selectedDots.length < 6) {
      // Select this dot and draw line
      setSelectedDots((prev) => {
        const newSelected = [...prev, coord];
        return newSelected;
      });
    } else {
      setFeedback({
        text: "You can only select 6 dots. Reset to start over.",
        isError: true,
      });
      setTimeout(() => setFeedback({ text: "", isError: false }), 3000);
    }
  };

  const resetGame = () => {
    setSelectedDots([]);
    setGameStatus("drawing");
    setFeedback({ text: "", isError: false });
    clearLines();
  };

  const handleSelectChallenge = (challengeKey) => {
    setCurrentChallenge(challengeKey);
    resetGame();
  };

  const checkPattern = () => {
    if (selectedDots.length !== 6) {
      setFeedback({
        text: "You must select exactly 6 dots!",
        isError: true,
      });
      setTimeout(() => setFeedback({ text: "", isError: false }), 3000);
      return;
    }

    setAttemptsCount((prev) => prev + 1);

    // Check if the user's pattern matches the current challenge
    const correctCoords = patterns[currentChallenge].coords;
    const isCorrect =
      JSON.stringify(selectedDots) === JSON.stringify(correctCoords);

    if (isCorrect) {
      setGameStatus("riddle");
      setFeedback({
        text: "Pattern correct! Here is one part of the QR Code",
        isError: false,
      });
    } else {
      // Show feedback and display the correct pattern temporarily
      setFeedback({
        text: `Incorrect pattern. Try again! (Attempt ${attemptsCount + 1})`,
        isError: true,
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Instructions />

      {/* Challenge Selector */}
      <ChallengeSelector
        onSelectChallenge={handleSelectChallenge}
        currentChallenge={currentChallenge}
      />

      {/* Grid Container with Relative Positioning */}
      <div 
        ref={gridContainerRef} 
        className="w-full mt-4 mb-4 px-1 sm:px-6 md:px-10"
      >
        <div 
          className="relative mx-auto"
          style={{ width: `${gridSize.width}px`, height: `${gridSize.height + 25}px` }}
        >
          {/* Row and Column Labels */}
          <RowLabels gridSize={gridSize} cellSize={cellSize} />
          <ColumnLabels gridSize={gridSize} cellSize={cellSize} />

          {/* Canvas for drawing lines */}
          <canvas
            ref={canvasRef}
            width={gridSize.width}
            height={gridSize.height}
            className="absolute top-5 left-0 pointer-events-none z-10"
          />

          {/* Grid with dots */}
          <Grid
            selectedDots={selectedDots}
            onDotClick={handleDotClick}
            currentChallenge={currentChallenge}
            gridSize={gridSize}
            cellSize={cellSize}
            dotSize={dotSize}
          />
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex flex-col items-center w-full mt-2">
        <div className="font-mono text-xs sm:text-sm mb-2 overflow-auto max-w-full px-2">
          <span className="whitespace-nowrap">Selected: {selectedDots.join(" → ")}</span>
        </div>

        {/* Different controls based on game status */}
        {gameStatus === "drawing" && (
          <div className="flex space-x-3">
            <button
              onClick={resetGame}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm"
            >
              Reset
            </button>
            <button
              onClick={checkPattern}
              disabled={selectedDots.length !== 6}
              className={`${
                selectedDots.length !== 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm`}
            >
              Check Pattern
            </button>
          </div>
        )}
      </div>

      {/* Feedback Message */}
      {feedback.text && (
        <div
          className={`mt-3 p-2 sm:p-3 rounded-md text-center text-sm sm:text-base ${
            feedback.isError
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Riddle Challenge */}
      {gameStatus === "riddle" && (
        <div className="mt-4 text-center w-full bg-purple-50 p-3 sm:p-4 rounded-md">
          <h2 className="text-lg sm:text-xl font-bold mb-2">Well Done!!</h2>
          <p className="italic mb-3 text-sm sm:text-base">
            {patterns[currentChallenge].patternName}
          </p>
          <p className="text-sm sm:text-base">
            Congratulations! You've solved the{" "}
            {patterns[currentChallenge].displayName} challenge.
          </p>

          <div className="flex w-full items-center justify-center">
            <img
              src={patterns[currentChallenge].successImage}
              alt={patterns[currentChallenge].patternName}
              className="w-32 sm:w-40 m-4 sm:m-8"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Row Labels Component
const RowLabels = ({ gridSize, cellSize }) => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const labelSize = Math.max(Math.floor(cellSize / 2), 20);

  return (
    <div 
      className="absolute left-0 top-5 h-full flex flex-col "
      style={{ marginLeft: `-${labelSize}px` }}
    >
      {rows.map((row, index) => (
        <div
          key={row}
          className="flex items-center justify-center font-bold text-xs"
          style={{ 
            width: `${labelSize}px`, 
            height: `${cellSize}px`,
            
          }}
        >
          {row}
        </div>
      ))}
    </div>
  );
};

// Column Labels Component
const ColumnLabels = ({ gridSize, cellSize }) => {
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="absolute top-0 left-0 w-full flex justify-between">
      {columns.map((col) => (
        <div
          key={col}
          className="flex items-center justify-center font-bold text-xs"
          style={{ width: `${cellSize}px`, height: "20px" }}
        >
          {col}
        </div>
      ))}
    </div>
  );
};

// Grid Component
const Grid = ({ selectedDots, onDotClick, currentChallenge, gridSize, cellSize, dotSize }) => {
  const rows = "ABCDEFGHIJ";
  const correctCoords = patterns[currentChallenge].coords;

  return (
    <div
      className="grid gap-0 absolute top-5 left-0"
      style={{
        gridTemplateColumns: `repeat(10, ${cellSize}px)`,
        gridTemplateRows: `repeat(10, ${cellSize}px)`,
        width: `${gridSize.width}px`,
        height: `${gridSize.height}px`,
      }}
    >
      {Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => {
          const coord = `${rows[i]}${j + 1}`;
          const isSelected = selectedDots.includes(coord);

          // Determine if this dot is correctly placed in the pattern
          const dotIndex = selectedDots.indexOf(coord);
          const isCorrectPosition =
            dotIndex !== -1 && correctCoords[dotIndex] === coord;

          // Determine dot color class based on selection and correctness
          let dotColorClass = "bg-gray-800 hover:bg-gray-600";
          if (isSelected) {
            dotColorClass = isCorrectPosition ? "bg-green-500" : "bg-red-500";
          }

          // Calculate dot size based on cell size
          const actualDotSize = dotSize * 2;

          return (
            <div
              key={coord}
              className="flex items-center justify-center"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            >
              <button
                className={`rounded-full ${dotColorClass} w-5 h-5 transition-transform ${
                  isSelected ? "transform scale-125" : ""
                }`}
                style={{ width: `${actualDotSize}px`, height: `${actualDotSize}px` }}
                onClick={() => onDotClick(coord)}
              />
            </div>
          );
        })
      ).flat()}
    </div>
  );
};

export default App;