import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import GameBoard from './components/GameBoard';

/**
 * Determines the backend API base URL depending on the environment.
 * Adjust this function if running locally or with a proxy.
 */
function getBackendBaseUrl() {
  // You may adjust this to match where your backend is running.
  // For local dev, e.g. 'http://localhost:8000'
  // For production, you may need to use a dynamic environment variable.
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Game state
  const [board, setBoard] = useState([["", "", ""], ["", "", ""], ["", "", ""]]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [result, setResult] = useState({ status: 'in_progress', winner: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch current game state on initial load
  useEffect(() => {
    fetchGameState();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  /**
   * PUBLIC_INTERFACE
   * Makes HTTP request to fetch current game state.
   */
  const fetchGameState = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getBackendBaseUrl()}/game`);
      if (!res.ok) throw new Error('Failed to fetch game state.');
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setResult(data.result);
      setInfo('');
    } catch (err) {
      setError(err.message);
      setInfo('');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Starts or resets the game.
   */
  const handleStartOrReset = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getBackendBaseUrl()}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to start/reset game.');
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setResult(data.result);
      setInfo('Game started/reset.');
    } catch (err) {
      setError(err.message);
      setInfo('');
    } finally {
      setLoading(false);
    }
  };

  /**
   * PUBLIC_INTERFACE
   * Make a move for player at (row, col)
   */
  const handleMove = async (row, col) => {
    // Prevent move if game is not in progress
    if (result.status !== 'in_progress') return;
    // Prevent move if cell occupied
    if (board[row][col]) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getBackendBaseUrl()}/game/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row: row,
          col: col,
          player: currentPlayer
        })
      });
      if (!res.ok) {
        // Try to get validation error body
        let message = 'Invalid move.';
        const data = await res.json().catch(() => ({}));
        if (data && data.detail && Array.isArray(data.detail)) {
          message += ' ' + data.detail.map(d => d.msg).join(', ');
        }
        throw new Error(message);
      }
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setResult(data.result);
      setInfo('');
    } catch (err) {
      setError(err.message);
      setInfo('');
    } finally {
      setLoading(false);
    }
  };

  // Helper to display game status above the board in a clear, prominent way
  const renderStatus = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: '#e53935', margin: 10, fontWeight: 500 }}>{error}</div>;
    if (result.status === 'won')
      return (
        <div style={{
          color: '#1976d2',
          margin: 10,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1.2
        }}>
          🎉 Winner: <span style={{ color: "#ffca28" }}><strong>{result.winner}</strong></span>
        </div>
      );
    if (result.status === 'draw')
      return (
        <div style={{
          color: '#ffca28',
          background: "rgba(25,118,210,0.04)",
          margin: 12,
          borderRadius: 8,
          padding: "8px 0",
          fontWeight: 600,
          fontSize: 18,
        }}>
          It's a draw! No more moves possible.
        </div>
      );
    return (
      <div style={{
        margin: 10,
        fontWeight: 600,
        color: "#424242",
        fontSize: 18,
        letterSpacing: 0.6
      }}>
        <span>
          Current turn:
          <span style={{
            marginLeft: 8,
            color: currentPlayer === 'X' ? "#1976d2" : "#ffca28",
            fontSize: 20
          }}>
            {currentPlayer}
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header" style={{ padding: 0, minHeight: "100vh" }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src={logo} className="App-logo" alt="logo" style={{ marginBottom: 8, width: 90, height: 90 }} />
          <h2 style={{
            margin: 4,
            color: "#1976d2",
            fontWeight: 900,
            letterSpacing: 1,
            fontSize: 32,
            textShadow: "0 1px 0 #fff7, 0 2px 6px #1976d222"
          }}>
            Tic Tac Toe
          </h2>
          {/* Scoreboard (could be upgraded in future) */}
          <div className="ttt-scoreboard" style={{
            margin: "10px 0 16px", fontSize: 15, color: "#424242"
          }}>
            Player <span style={{color:'#1976d2'}}>X</span> vs <span style={{color:'#ffca28'}}>O</span>
          </div>

          {renderStatus()}

          <GameBoard
            board={board}
            onCellClick={handleMove}
            disabled={loading}
            result={result}
            currentPlayer={currentPlayer}
          />

          <div className="ttt-controls" style={{ marginTop: 18 }}>
            <button
              className="btn"
              style={{
                background: "var(--button-bg, #1976d2)",
                color: "var(--button-text, #fff)",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                borderRadius: 8,
                padding: "10px 28px",
                marginRight: 14,
                marginBottom: 8,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
              onClick={handleStartOrReset}
              disabled={loading}
            >
              {result.status === "in_progress" ? "Restart" : "New Game"}
            </button>
            <button
              className="btn"
              style={{
                background: "#ffca28",
                color: "#1A1A1A",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                marginBottom: 8,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
              onClick={fetchGameState}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {info && <div style={{ color: "#1976d2", marginTop: 10 }}>{info}</div>}

          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 28, fontSize: 14 }}
          >
            Learn React
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
