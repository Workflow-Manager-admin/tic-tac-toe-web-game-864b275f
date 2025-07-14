import React from "react";
import PropTypes from "prop-types";

// PUBLIC_INTERFACE
/**
 * Renders a single cell in the tic tac toe board.
 * Handles onClick and display for each square.
 */
function Square({ value, onClick, highlight, disabled, "aria-label": ariaLabel }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        background: highlight
          ? "var(--text-secondary, #61dafb)"
          : "var(--bg-secondary, #f8f9fa)",
        color: "var(--text-primary, #282c34)",
        border: highlight ? "2.5px solid var(--primary, #1976d2)" : "2px solid var(--border-color, #e9ecef)",
        borderRadius: "8px",
        width: "60px",
        height: "60px",
        fontSize: "32px",
        fontWeight: "bold",
        margin: "4px",
        boxShadow: highlight
          ? "0 0 8px var(--primary, #1976d2)44"
          : undefined,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.25s, border 0.25s",
        outline: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {value}
    </button>
  );
}

Square.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
  highlight: PropTypes.bool,
  disabled: PropTypes.bool,
  "aria-label": PropTypes.string,
};

Square.defaultProps = {
  value: "",
  highlight: false,
  disabled: false,
};

export default Square;
