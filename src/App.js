import React, { useState, useEffect } from 'react';
import ItemLookbook from './components/ItemLookbook';
import Cell from './components/Cell';
import ItemClass from './components/ItemClass';
import ProgressChecker from './components/ProgressChecker'; // Import ProgressChecker component
import './App.css';
import confetti from 'canvas-confetti'; // Confetti library

function App() {
  const [allItems, setAllItems] = useState([]); // All items from items.txt
  const [lookbookItems, setLookbookItems] = useState([]); // Items displayed in the lookbook
  const [draggingItem, setDraggingItem] = useState(null); // Tracks currently dragged item
  const [foundGoalItems, setFoundGoalItems] = useState([]); // Tracks goal items the user has found
  const [showProgressChecker, setShowProgressChecker] = useState(false); // Tracks overlay visibility

  useEffect(() => {
    fetch('/items.txt')
      .then((response) => {
        console.log('Fetching items.txt...');
        return response.text();
      })
      .then((text) => {
        console.log('Fetched data:', text);

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
        console.log('Parsed Items:', itemsArray);

        setAllItems(itemsArray);

        // Filter and set default items for the lookbook
        const defaultItems = itemsArray.filter((item) => item.isDefault);
        console.log('Default Items:', defaultItems);

        setLookbookItems(defaultItems);
      })
      .catch((error) => console.error('Error loading items:', error));
  }, []);

  const handleDragStart = (item) => {
    console.log(`Dragging Item Set: ${item.name}`);
    setDraggingItem(item);
  };

  const handleNewItemCreated = (newItemId) => {
    const newItem = allItems.find((item) => item.id === newItemId);
  
    setLookbookItems((prevLookbookItems) => {
      if (prevLookbookItems.some((item) => item.id === newItemId)) {
        console.warn(`Item with ID ${newItemId} is already in the lookbook. Skipping.`);
        return prevLookbookItems;
      }
      return [...prevLookbookItems, newItem];
    });
  
    // Ensure no duplicates in foundGoalItems
    setFoundGoalItems((prevFoundGoalItems) => {
      if (newItem && newItem.goal && !prevFoundGoalItems.includes(newItemId)) {
        triggerConfetti(); // Trigger confetti when a new goal item is found
        return [...prevFoundGoalItems, newItemId];
      }
      return prevFoundGoalItems;
    });
  };
  

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 60,
      origin: { x: 0.5, y: 0.5 }, // Center of the screen
    });
  };

  const toggleProgressChecker = () => {
    setShowProgressChecker((prev) => !prev);
  };

  return (
    <div className="app">
      <button className="progress-checker-button" onClick={toggleProgressChecker}>
        📝 {/* Replace with a suitable icon */}
      </button>

      {showProgressChecker && (
        <ProgressChecker
          foundGoalItems={foundGoalItems}
          goalOrder={['mrna', 'trna', 'sirna', 'snrna', 'rrna', 'mirna', 'pirna', 'snorna']}
          onClose={() => setShowProgressChecker(false)} // Close handler
        />
      )}


      <div className="main-content">
        <Cell
          itemsDic={allItems}
          draggingItem={draggingItem}
          onNewItemCreated={handleNewItemCreated}
          foundGoalItems={foundGoalItems}
          triggerConfetti={triggerConfetti}
          lookbookItems={lookbookItems}
        />
      </div>
      <ItemLookbook items={lookbookItems} onDragStart={handleDragStart} />
    </div>
  );
}

export default App;
