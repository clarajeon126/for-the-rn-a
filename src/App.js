import React, { useState, useEffect } from 'react';
import ItemLookbook from './components/ItemLookbook';
import Cell from './components/Cell';
import ItemClass from './components/ItemClass';
import ProgressChecker from './components/ProgressChecker';
import Tutorial from './components/Tutorial';
import Introduction from './components/Introduction';
import End from './components/End'; // New component
import './App.css';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'rna_transcription_game_state';

function App() {
  const [allItems, setAllItems] = useState([]);
  const [lookbookItems, setLookbookItems] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [foundGoalItems, setFoundGoalItems] = useState([]);
  const [droppedItems, setDroppedItems] = useState([]);
  const [showProgressChecker, setShowProgressChecker] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTrashOverlay, setShowTrashOverlay] = useState(false);
  const [showResetOverlay, setShowResetOverlay] = useState(false);
  const [clearCell, setClearCell] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nowLoad, setNowLoad] = useState(false);

  const RNA_GOAL_ITEMS = ['mrna', 'trna', 'sirna', 'snrna', 'rrna', 'mirna', 'pirna', 'snorna'];
  const [showEnd, setShowEnd] = useState(false); // New state for the End component

  const saveGameState = () => {
    const stateToSave = {
      lookbookItems,
      foundGoalItems,
      droppedItems,
    };
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (nowLoad) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  };

  const preloadImages = (imageUrls) => {
    return Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  };

  useEffect(() => {
    const initializeGame = async (itemsArray) => {
      const defaultItems = itemsArray.filter((item) => item.isDefault);

      const images = [
        'logo.png',
        'intro1.png',
        'intro2.png',
        'intro3.png',
        'intro4.png',
        'tutorial.png',
        'end.png', // Preload end screen image
        'progress_icon.png',
        'info_icon.png',
        'trash_icon.png',
        'reset.png',
        'cytoplasm.png',
        'nucleus.png',
        'nucleolus.png',
        ...itemsArray.map((item) => item.image),
      ];

      await preloadImages(images);

      const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (savedState) {
        const { lookbookItems: savedLookbook, foundGoalItems: savedGoals, droppedItems: savedDropped } = savedState;

        setLookbookItems(savedLookbook && savedLookbook.length > 0 ? savedLookbook : defaultItems);
        setFoundGoalItems(savedGoals || []);
        setDroppedItems(savedDropped || []);
        setNowLoad(true);
        setShowIntroduction(false);
      } else {
        setLookbookItems(defaultItems);
        setShowIntroduction(true);
        setNowLoad(true);
      }

      setIsLoading(false);
    };

    fetch('/items.txt')
      .then((response) => response.text())
      .then((text) => {
        const parsedItems = JSON.parse(text);
        const itemsArray = Object.entries(parsedItems).map(
          ([id, item]) =>
            new ItemClass(
              id,
              item.name,
              item.image,
              item.interactions,
              item.tags,
              item.goal,
              item.isDefault
            )
        );
        setAllItems(itemsArray);
        initializeGame(itemsArray);
      })
      .catch((error) => console.error('Error loading items:', error));
  }, []);

  useEffect(() => {
    saveGameState();

    // Check if all goal RNA items are found
    if (RNA_GOAL_ITEMS.every((item) => foundGoalItems.includes(item))) {
      setShowEnd(true);
    }
  }, [lookbookItems, foundGoalItems, droppedItems]);

  const handleDragStart = (item) => {
    setDraggingItem(item);
  };

  const handleNewItemCreated = (newItemId) => {
    const newItem = allItems.find((item) => item.id === newItemId);

    setLookbookItems((prevLookbookItems) => {
      if (prevLookbookItems.some((item) => item.id === newItemId)) {
        return prevLookbookItems;
      }
      return [...prevLookbookItems, newItem];
    });

    setFoundGoalItems((prevFoundGoalItems) => {
      if (newItemId === 'rrna18' || newItemId === 'rrna58' || newItemId === 'rrna28') {
        newItemId = 'rrna';
      }
      if (newItem && newItem.goal && !prevFoundGoalItems.includes(newItemId)) {
        triggerConfetti();
        return [...prevFoundGoalItems, newItemId];
      }
      return prevFoundGoalItems;
    });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 60,
      origin: { x: 0.5, y: 0.5 },
    });
  };

  const handleClearCell = () => {
    setShowTrashOverlay(false);
    setDroppedItems([]);
    setClearCell(true);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <img src="logo.png" alt="Logo" className="loading-logo" />
        <p className="loading-text">transcribing rna...</p>
      </div>
    );
  }

  if (showIntroduction) {
    return <Introduction onFinish={() => setShowIntroduction(false)} />;
  }

  if (showEnd) {
    return (
      <End
        onRestart={() => {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="app">
      <div className="buttons-row">
        <button
          className="icon-button"
          style={{ backgroundImage: "url('progress_icon.png')" }}
          onClick={() => setShowProgressChecker(true)}
        ></button>
        <button
          className="icon-button"
          style={{ backgroundImage: "url('info_icon.png')" }}
          onClick={() => setShowTutorial(true)}
        ></button>
        <button
          className="icon-button"
          style={{ backgroundImage: "url('trash_icon.png')" }}
          onClick={() => setShowTrashOverlay(true)}
        ></button>
        <button
          className="icon-button"
          style={{ backgroundImage: "url('reset.png')" }}
          onClick={() => setShowResetOverlay(true)}
        ></button>
      </div>

      {showProgressChecker && (
        <div className="overlay">
          <ProgressChecker
            foundGoalItems={foundGoalItems}
            goalOrder={RNA_GOAL_ITEMS}
            onClose={() => setShowProgressChecker(false)}
          />
        </div>
      )}

      {showTutorial && (
        <div className="overlay">
          <Tutorial onClose={() => setShowTutorial(false)} />
        </div>
      )}

      {showTrashOverlay && (
        <div className="overlay">
          <div className="trash-overlay">
            <p>Do you want to clear the cell?</p>
            <button onClick={handleClearCell}>Yes</button>
            <button onClick={() => setShowTrashOverlay(false)}>No</button>
          </div>
        </div>
      )}

      {showResetOverlay && (
        <div className="overlay">
          <div className="trash-overlay">
            <p>Do you want to reset your progress on the game? All your progress will be lost!!</p>
            <button           onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }}>Yes</button>
            <button onClick={() => setShowResetOverlay(false)}>No</button>
          </div>
        </div>
      )}

      <div className="main-content">
        <Cell
          itemsDic={allItems}
          draggingItem={draggingItem}
          onNewItemCreated={handleNewItemCreated}
          foundGoalItems={foundGoalItems}
          triggerConfetti={triggerConfetti}
          lookbookItems={lookbookItems}
          clearCell={clearCell}
          setClearCell={setClearCell}
          droppedItems={droppedItems}
          setDroppedItems={setDroppedItems}
        />
      </div>
      <ItemLookbook items={lookbookItems} onDragStart={handleDragStart} />
    </div>
  );
}

export default App;
