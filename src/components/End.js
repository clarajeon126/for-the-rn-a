import React, { useState, useEffect } from 'react';
import './End.css';
import confetti from 'canvas-confetti';

function End({ onRestart }) {
    const [showResetOverlay, setShowResetOverlay] = useState(false);
    const triggerConfetti = () => {
        confetti({
          particleCount: 1500,
          spread: 800,
          startVelocity: 50,
          gravity: .3,
          shapes: ['star', 'circle', 'circle'],
          origin: { x: 0.5, y: 0.5 },
        });
      };
      useEffect(() => {
        triggerConfetti()
      },[])
  return (
    <div className="end-screen">
        <div className='end-left'>
        <img src="end.png" alt="Congratulations" className="end-image" />
        <img src="progressdone.png" alt="Congratulations" className="end-image" />

        </div>
      <div className='end-left'>
        <text>
            please fill out this form if you enjoyed playing !
        </text>
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSeqFTWHLqmJw7Cnx-uykV9KNcDwJuhGVWecQI7nkFQ4v8h91g/viewform?embedded=true" className="end-form" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
        <button className="restart-button" onClick={() => setShowResetOverlay(true)}>
        </button>
      </div>


      {showResetOverlay && (
        <div className="overlay">
          <div className="trash-overlay">
            <p>Do you want to reset your progress on the game? All your progress will be lost!!</p>
            <button           onClick={onRestart}>Yes</button>
            <button onClick={() => setShowResetOverlay(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default End;
