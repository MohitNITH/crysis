// import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import nimbus_logo from "./images/Nimbus copy.png";
import ojas_logo from "./images/orangered copy.png";
import side2 from "./images/Side2.png";
import side3 from "./images/Side3.png";
import side4 from "./images/Side4.png";
import side5 from "./images/Side5.png";

// Base phone number (first part)
// const basePhoneNumber = "555";

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
    <div className="bg-gray-100 min-h-screen p-5 flex flex-col items-center">
      <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-xl">
        <ConnectTheDots />
      </div>
    </div>
  );
};

// Instructions Component
const Instructions = () => (
  <div className="bg-gray-50 p-3 rounded-md mb-4 text-center">
    <div className="flex flex-col gap-4">
      <div className="w-full flex items-center justify-between">
        <div>
          <img src={nimbus_logo} alt="nimnus logo" className="w-14" />
        </div>
        <div className="text-2xl font-bold">
          <h1> TEAM OJAS</h1>
        </div>
        <div>
          <img src={ojas_logo} alt="ojas logo" className="w-14" />
        </div>
      </div>

      <h1 className="text-3xl text-slate-900">Connect the Dots Challenge</h1>
      <div className="instructions">
        <p className="text-left">
          <strong className="text-lg">Instructions:</strong>
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
          } text-white px-3 py-2 rounded text-sm`}
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
  const [currentChallenge, setCurrentChallenge] = useState("S");
  const [gameStatus, setGameStatus] = useState("drawing"); // drawing, riddle, success
  // const [riddleAnswer, setRiddleAnswer] = useState("");
  const [feedback, setFeedback] = useState({ text: "", isError: false });
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [solvedPatterns, setSolvedPatterns] = useState({});
  const [attemptsCount, setAttemptsCount] = useState(0);
  // const [gameover, setgameover] = useState(true);

  const canvasRef = useRef(null);
  const dotsRef = useRef({});

  // Initialize dots data
  useEffect(() => {
    const rows = "ABCDEFGHIJ";
    const dots = {};

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const coord = `${rows[i]}${j + 1}`;
        dots[coord] = {
          x: j * 40 + 20,
          y: i * 40 + 20,
          row: i,
          col: j,
        };
      }
    }

    dotsRef.current = dots;
  }, []);

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

      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  const redrawLines = () => {
    clearLines();
    const correctCoords = patterns[currentChallenge].coords;

    for (let i = 0; i < selectedDots.length - 1; i++) {
      const dot1 = dotsRef.current[selectedDots[i]];
      const dot2 = dotsRef.current[selectedDots[i + 1]];

      // Check if this segment is correct in the pattern
      const isCorrectSegment =
        i < correctCoords.length - 1 &&
        selectedDots[i] === correctCoords[i] &&
        selectedDots[i + 1] === correctCoords[i + 1];

      drawLine(dot1.x, dot1.y, dot2.x, dot2.y, isCorrectSegment);
    }
  };

  // Redraw lines when selected dots change
  useEffect(() => {
    redrawLines();
  }, [selectedDots, currentChallenge]);

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
    // setAttemptsCount(0);
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

      // Briefly flash the correct pattern if they've tried 3+ times
      // if (attemptsCount >= 5) {
      // Save current selection
      // const userSelection = [...selectedDots];

      // Show correct pattern for a moment
      // setSelectedDots(correctCoords);

      // Show hint text
      // setgameover(false);
      // setFeedback({
      //   text: `Your Attempts are over, Better Luck Next Time🙂`,
      //   isError: true,
      // });

      // After 2 seconds, restore user selection
      // setTimeout(() => {
      //   setSelectedDots(userSelection);
      //   setFeedback({ text: "Try to recreate that pattern", isError: true });
      // }, 2000);
      // }
    }
  };

  // const checkRiddle = () => {
  //   const pattern = patterns[currentChallenge];

  //   if (riddleAnswer === pattern.answer) {
  //     // Generate phone number using the pattern's specific number
  //     const newPhoneNumber = `${basePhoneNumber}-${pattern.patternNumber}-${riddleAnswer}`;
  //     setPhoneNumber(newPhoneNumber);
  //     setGameStatus("success");
  //     setFeedback({ text: "Correct!", isError: false });

  //     // Preload image for smoother display

  //     // Add to solved patterns
  //     setSolvedPatterns((prev) => ({
  //       ...prev,
  //       [currentChallenge]: {
  //         patternName: pattern.displayName,
  //         answer: pattern.answer,
  //         phoneNumber: newPhoneNumber,
  //         image: pattern.successImage,
  //       },
  //     }));
  //   } else {
  //     setFeedback({ text: "Incorrect answer. Try again.", isError: true });
  //   }
  // };

  return (
    <div className="flex flex-col items-center">
      <Instructions />

      {/* Challenge Selector */}
      <ChallengeSelector
        onSelectChallenge={handleSelectChallenge}
        currentChallenge={currentChallenge}
      />

      {/* Current Challenge Info */}
      {/* <div className="bg-blue-50 p-3 rounded-md mb-4 w-full text-center">
        <h2 className="font-bold">
          Current Challenge: {patterns[currentChallenge].displayName}
        </h2>
      </div> */}

      {/* Solved Patterns Summary */}
      {/* {Object.keys(solvedPatterns).length > 0 && (
        <div className="w-full mb-4 p-3 bg-green-50 rounded-md">
          <h3 className="font-bold text-center mb-2">Solved Patterns</h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(solvedPatterns).map(([key, data]) => (
              <div
                key={key}
                className="flex items-center text-sm p-2 bg-white rounded-md shadow-sm"
              >
                <img
                  src={data.image}
                  alt={data.patternName}
                  className="w-12 h-12 object-cover rounded mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium block">{data.patternName}</span>
                  <div className="flex items-center">
                    <span className="mr-2">Answer: {data.answer}</span>
                    <span className="text-blue-500 font-mono">
                      {data.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div className="relative mt-8 mb-5">
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
          currentChallenge={currentChallenge}
        />
      </div>

      {/* Game Controls */}
      <div className="flex flex-col items-center w-full mt-4">
        <div className="font-mono text-sm mb-2">
          Selected: {selectedDots.join(" → ")}
        </div>

        {/* Different controls based on game status */}
        {gameStatus === "drawing" && (
          <div className="flex space-x-3">
            <button
              onClick={resetGame}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
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
              } text-white px-4 py-2 rounded`}
            >
              Check Pattern
            </button>
          </div>
        )}
      </div>

      {/* Feedback Message */}
      {feedback.text && (
        <div
          className={`mt-4 p-3 rounded-md text-center ${
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
        <div className="mt-6 text-center w-full bg-purple-50 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2">Well Done!!</h2>
          <p className="italic mb-4">
            {patterns[currentChallenge].patternName}
          </p>
          <p>
            Congratulations! You've solved the{" "}
            {patterns[currentChallenge].displayName} challenge.
          </p>

          <div className="flex w-100 items-center justify-center">
            <img
              src={patterns[currentChallenge].successImage}
              alt={patterns[currentChallenge].patternName}
              className="w-40 m-8"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Row Labels Component
const RowLabels = () => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  return (
    <div className="absolute left-0 top-0 h-full flex flex-col justify-between -ml-6">
      {rows.map((row) => (
        <div
          key={row}
          className="flex items-center justify-center w-5 h-5 font-bold"
        >
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
        <div
          key={col}
          className="flex items-center justify-center w-5 h-5 font-bold"
        >
          {col}
        </div>
      ))}
    </div>
  );
};

// Grid Component
const Grid = ({ selectedDots, onDotClick, currentChallenge }) => {
  const rows = "ABCDEFGHIJ";
  const correctCoords = patterns[currentChallenge].coords;

  return (
    <div className="grid grid-cols-10 grid-rows-10 gap-0">
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

          return (
            <div
              key={coord}
              className="flex items-center justify-center relative"
              style={{ width: "40px", height: "40px" }}
            >
              <button
                className={`w-5 h-5 rounded-full ${dotColorClass} transition-transform ${
                  isSelected ? "transform scale-125" : ""
                }`}
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
