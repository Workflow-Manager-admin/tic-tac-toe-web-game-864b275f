import React from "react";
import PropTypes from "prop-types";
import Square from "./Square";

// Returns an array of winning positions if there is a winner
function calculateWinningLine(board) {
  // rows, cols, diagonals
  const lines = [
    // rows
    [[0,0], [0,1], [0,2]],
    [[1,0], [1,1], [1,2]],
    [[2,0], [2,1], [2,2]],
    // cols
    [[0,0], [1,0], [2,0]],
    [[0,1], [1,1], [2,1]],
    [[0,2], [1,2], [2,2]],
    // diagonals
    [[0,0], [1,1], [2,2]],
    [[0,2], [1,1], [2,0]],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    const v1 = board[a[0]][a[1]];
    if (v1 && v1 === board[b[0]][b[1]] && v1 === board[c[0]][c[1]]) {
      return line;
    }
  }
  return null;
}

// PUBLIC_INTERFACE
/**
 * GameBoard Component: renders a responsive 3x3 grid of Square components.
 * Shows highlight for winner cells.
 * Props:
 * - board: 2D array of board state [["X","O",""], ...]
 * - onCellClick(row, col): handler for a cell click
 * - disabled: disables all squares if true
 * - result: game result object {status, winner}
 * - currentPlayer: whose turn it is
 */
function GameBoard({ board, onCellClick, disabled, result, currentPlayer }) {
  const winningLine =
    result && result.status === "won" ? calculateWinningLine(board) : null;

  // For highlighting winner squares
  const isWinningCell = (row, col) =>
    winningLine &&
    winningLine.some(([r, c]) => r === row && c === col);

  return (
    <div
      className="ttt-board"
      style={{
        display: "inline-block",
        boxShadow: "0 0 12px 0 rgba(25,118,210,0.08)",
        background: "var(--bg-secondary, #f8f9fa)",
        borderRadius: 14,
        padding: 18,
        margin: "auto",
      }}
    >
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="ttt-board-row" style={{ display: "flex" }}>
          {row.map((cell, colIdx) => (
            <Square
              key={colIdx}
              value={cell}
              onClick={() =>
                !disabled && !cell && (!result || result.status === "in_progress")
                  ? onCellClick(rowIdx, colIdx)
                  : undefined
              }
              highlight={isWinningCell(rowIdx, colIdx)}
              disabled={
                !!cell ||
                disabled ||
                (result && result.status && result.status !== "in_progress")
              }
              aria-label={`Tic Tac Toe cell Row ${rowIdx + 1} Column ${colIdx + 1} ${cell ? cell : "empty"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

GameBoard.propTypes = {
  board: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  onCellClick: PropTypes.func,
  disabled: PropTypes.bool,
  result: PropTypes.shape({
    status: PropTypes.string.isRequired,
    winner: PropTypes.string,
  }),
  currentPlayer: PropTypes.string,
};

GameBoard.defaultProps = {
  disabled: false,
  currentPlayer: undefined,
};

export default GameBoard;
