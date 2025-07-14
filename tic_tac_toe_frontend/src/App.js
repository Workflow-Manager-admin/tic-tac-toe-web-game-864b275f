import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';

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

  // Helper to display board
  const renderBoard = () => (
    <div style={{ margin: '24px auto', display: 'inline-block' }}>
      {board.map((row, i) => (
        <div key={i} style={{ display: 'flex' }}>
          {row.map((cell, j) => (
            <button
              key={j}
              style={{
                width: 60, height: 60, fontSize: 32, margin: 4,
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "2px solid var(--border-color)",
                borderRadius: 8,
                cursor: cell || result.status !== 'in_progress' ? 'not-allowed' : 'pointer',
                outline: 'none',
                transition: 'background 0.2s'
              }}
              onClick={() => handleMove(i, j)}
              disabled={!!cell || loading || result.status !== "in_progress"}
              aria-label={`Row ${i + 1} Col ${j + 1}`}
            >
              {cell ? cell : ''}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  // Helper to display game status
  const renderStatus = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red', margin: 10 }}>{error}</div>;
    if (result.status === 'won')
      return <div style={{ color: 'green', margin: 10 }}>Winner: <strong>{result.winner}</strong></div>;
    if (result.status === 'draw')
      return <div style={{ color: 'orange', margin: 10 }}>Draw! No more moves possible.</div>;
    return <div style={{ margin: 10 }}>Current turn: <strong>{currentPlayer}</strong></div>;
  };

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <img src={logo} className="App-logo" alt="logo" style={{ marginBottom: '8px' }} />

        <h2 style={{ margin: 8 }}>Tic Tac Toe</h2>
        <div>
          <button
            style={{
              background: "var(--button-bg)",
              color: "var(--button-text)",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
              marginRight: 12,
              transition: "background 0.2s"
            }}
            onClick={handleStartOrReset}
            disabled={loading}
          >
            {result.status === "in_progress" ? "Restart" : "New Game"}
          </button>
          <button
            style={{
              background: "var(--button-bg)",
              color: "var(--button-text)",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              marginBottom: 16,
              transition: "background 0.2s"
            }}
            onClick={fetchGameState}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {renderStatus()}
        {renderBoard()}
        {info && <div style={{ color: "#1976d2", marginTop: 10 }}>{info}</div>}

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: 24, fontSize: 12 }}
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
