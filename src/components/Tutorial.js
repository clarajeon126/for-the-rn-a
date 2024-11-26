import React from 'react';
import './Tutorial.css';

function Tutorial({ onClose }) {
  return (
    <div className="tutorial-overlay">
      <button className="close-button" onClick={onClose}>
        &times; {/* Close button as an "X" */}
      </button>
    </div>
  );
}

export default Tutorial;
