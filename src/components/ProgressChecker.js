import React from 'react';
import './ProgressChecker.css';

function ProgressChecker({ foundGoalItems, goalOrder, onClose }) {
  const stars = goalOrder.map((goal, index) => (
    <div className="goal-cell" key={index}>
      {foundGoalItems.includes(goal) && <img src="/star.png" alt="Star" className="star-image" />}
    </div>
  ));

  return (
    <div className="progress-checker-overlay">
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
      <div className="progress-header">
        {foundGoalItems.length}/8
      </div>
      <div className="progress-content">
        {stars}
      </div>
    </div>
  );
}

export default ProgressChecker;
