import React, { useState, useEffect } from 'react';
import ItemLookbook from './components/ItemLookbook';
import Cell from './components/Cell';
import ItemClass from './components/ItemClass';
import './App.css';

function App() {
  const [allItems, setAllItems] = useState([]); // All items from items.txt
  const [lookbookItems, setLookbookItems] = useState([]); // Items displayed in the lookbook
  const [draggingItem, setDraggingItem] = useState(null); // Tracks currently dragged item
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
    // Find the new item from allItems and add it to the lookbook
    const newItem = allItems.find((item) => item.id === newItemId);
    if (newItem && !lookbookItems.some((item) => item.id === newItemId)) {
      setLookbookItems((prev) => [...prev, newItem]);
    }
  };

  return (
    <div className="app">
      <div className="main-content">
        <Cell
          itemsDic={allItems}
          draggingItem={draggingItem}
          onNewItemCreated={handleNewItemCreated}
        />
      </div>
      <ItemLookbook items={lookbookItems} onDragStart={handleDragStart} />
    </div>
  );
}

export default App;
