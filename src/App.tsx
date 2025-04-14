import React, { useState, useEffect } from 'react';

const App = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const generateBoard = (rows: number, cols: number, mines: number) => {
    const board: number[][] = [];
    const minePositions: [number, number][] = [];

    // Generate mine positions
    while (minePositions.length < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!minePositions.some(([r, c]) => r === row && c === col)) {
        minePositions.push([row, col]);
      }
    }

    // Create board with mines and adjacent mine counts
    for (let row = 0; row < rows; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < cols; col++) {
        if (minePositions.some(([r, c]) => r === row && c === col)) {
          rowData.push(-1);
        } else {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (
                row + i >= 0 &&
                row + i < rows &&
                col + j >= 0 &&
                col + j < cols &&
                minePositions.some(([r, c]) => r === row + i && c === col + j)
              ) {
                count++;
              }
            }
          }
          rowData.push(count);
        }
      }
      board.push(rowData);
    }

    setBoard(board);
    setRevealed(Array.from({ length: rows }, () => Array.from({ length: cols }, () => false)));
  };

  useEffect(() => {
    generateBoard(10, 10, 10);
  }, []);

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon) return;

    const newRevealed = [...revealed];
    const revealedCells: [number, number][] = [[row, col]];
    const toReveal: [number, number][] = [[row, col]];

    while (toReveal.length > 0) {
      const [r, c] = toReveal.pop()!;
      if (!newRevealed[r][c]) {
        newRevealed[r][c] = true;
        revealedCells.push([r, c]);
        if (board[r][c] === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (
                r + i >= 0 &&
                r + i < board.length &&
                c + j >= 0 &&
                c + j < board[0].length &&
                !toReveal.some(([rr, cc]) => rr === r + i && cc === c + j)
              ) {
                toReveal.push([r + i, c + j]);
              }
            }
          }
        }
      }
    }

    const allRevealed = revealedCells.every(([r, c]) => board[r][c] !== -1);
    setRevealed(newRevealed);
    if (allRevealed) {
      setGameWon(true);
    } else if (revealedCells.some(([r, c]) => board[r][c] === -1)) {
      setGameOver(true);
    }
  };

  const renderCell = (row: number, col: number) => {
    const value = board[row][col];
    const isRevealed = revealed[row][col];
    const isMine = value === -1;

    return (
      <div
        key={`${row}-${col}`}
        className={`cell ${isRevealed ? 'revealed' : ''} ${isMine ? 'mine' : ''}`}
        onClick={() => revealCell(row, col)}
      >
        {isRevealed ? (isMine ? '💣' : value === 0 ? '' : value) : ''}
      </div>
    );
  };

  return (
    <div className="minesweeper">
      {gameOver && <div>Game Over!</div>}
      {gameWon && <div>You Win!</div>}
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;