import React, { useState } from 'react';
import './Introduction.css'; // Add styles for the introduction

const imageSequence = [
  'intro1.png',
  'intro2.png',
  'intro3.png',
  'intro4.png',
  'tutorial.png',
];

function Introduction({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < imageSequence.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else {
      onFinish(); // Notify parent to proceed to the game
    }
  };

  return (
    <div className="introduction-container">
      <img
        src={imageSequence[currentIndex]}
        alt={`Introduction Step ${currentIndex + 1}`}
        className="introduction-image"
      />
      <button className="introduction-next-button" onClick={handleNext}>
        Next
      </button>
    </div>
  );
}

export default Introduction;
