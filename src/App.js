import React, { useState, useEffect } from 'react';
import ItemLookbook from './components/ItemLookbook';
import Cell from './components/Cell';
import ItemClass from './components/ItemClass';
import './App.css';
import confetti from 'canvas-confetti'; // Confetti library

function App() {
  const [allItems, setAllItems] = useState([]); // All items from items.txt
  const [lookbookItems, setLookbookItems] = useState([]); // Items displayed in the lookbook
  const [draggingItem, setDraggingItem] = useState(null); // Tracks currently dragged item
  const [foundGoalItems, setFoundGoalItems] = useState([]); // Tracks goal items the user has found

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
        return prevLookbookItems; // Return the current lookbook unchanged
      }
      else {
            // Find the new item in allItems or dynamically create it
        return [...prevLookbookItems, newItem];
      }
    })

    // Check if the new item is a goal item and hasn't been found before
    if (newItem && newItem.goal && !foundGoalItems.includes(newItemId)) {
      setFoundGoalItems((prev) => [...prev, newItemId]);
      triggerConfetti(); // Trigger confetti when a new goal item is found
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 60,
      origin: { x: 0.5, y: 0.5 }, // Center of the screen
    });
  };

  return (
    <div className="app">
      <div className="main-content">
                <Cell
            itemsDic={allItems}
            draggingItem={draggingItem}
            onNewItemCreated={handleNewItemCreated}
            foundGoalItems={foundGoalItems} // Pass found goal items
            triggerConfetti={triggerConfetti} // Pass the confetti function
            lookbookItems={lookbookItems} // Pass lookbook items
          />
      </div>
      <ItemLookbook items={lookbookItems} onDragStart={handleDragStart} />
    </div>
  );
}

export default App;
