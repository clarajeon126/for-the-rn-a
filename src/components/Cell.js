import React, { useState, useEffect } from 'react';
import './Cell.css';

function Cell({ itemsDic, draggingItem, onNewItemCreated, foundGoalItems, triggerConfetti }) {
  const [hoverLocation, setHoverLocation] = useState('n/a');
  const [droppedItems, setDroppedItems] = useState([]); // Tracks dropped items
  const [draggingExistingIndex, setDraggingExistingIndex] = useState(null); // Tracks the index of the dragged item
  const [currentlyDragging, setCurrentlyDragging] = useState(null); // Tracks the currently dragged item
  const [shake, setShake] = useState(false); // Tracks if the cell should vibrate

  const calculateHoverLocation = (x, y) => {
    const cell = document.querySelector('.cell');
    if (!cell) return 'n/a';
  
    const { left, top, width, height } = cell.getBoundingClientRect();
  
    // Calculate the center of the cell
    const centerX = left + width / 2;
    const centerY = top + height / 2;
  
    // Calculate cursor distance from the center
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  
    // Define radii for each region
    const cytoplasmRadius = 450; // Cell radius
    const nucleusRadius = 300; // Adjust as needed
    const nucleolusRadius = 200; // Adjust as needed
  
    // Determine hover location based on distance
    if (distance <= nucleolusRadius) {
      return 'Nucleolus';
    } else if (distance <= nucleusRadius) {
      return 'Nucleus';
    } else if (distance <= cytoplasmRadius) {
      return 'Cytoplasm';
    } else {
      return 'n/a';
    }
  };

  const handleMouseMove = (e) => {
    const cell = document.querySelector('.cell');
    if (!cell) return;

    const { left, top, width, height } = cell.getBoundingClientRect();

    // Calculate the center of the cell
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calculate cursor distance from the center
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );

    // Define radii for each region
    const cytoplasmRadius = 450; // Cell radius
    const nucleusRadius = 300; // Adjust as needed
    const nucleolusRadius = 200; // Adjust as needed

    // Determine hover location based on distance
    if (distance <= nucleolusRadius) {
      setHoverLocation('Nucleolus');
    } else if (distance <= nucleusRadius) {
      setHoverLocation('Nucleus');
    } else if (distance <= cytoplasmRadius) {
      setHoverLocation('Cytoplasm');
    } else {
      setHoverLocation('n/a');
    }
  };

  useEffect(() => {
    // Add `mousemove` listener to the document
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      // Cleanup listener on component unmount
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault(); // Allows drop
    const location = calculateHoverLocation(e.clientX, e.clientY);
    setHoverLocation(location);
  };
  
  

  const handleDrop = (e) => {
    e.preventDefault();
    const { left, top } = e.currentTarget.getBoundingClientRect();

    // Calculate drop position relative to the `.cell`
    const dropX = e.clientX - left;
    const dropY = e.clientY - top;

    if (draggingExistingIndex !== null) {
      const movedItem = droppedItems[draggingExistingIndex];
      if (!movedItem) {
        console.error('Dropped item is undefined.');
        return;
      }

      const updatedItems = droppedItems.map((item, index) =>
        index === draggingExistingIndex ? { ...item, x: dropX, y: dropY } : item
      );

      const overlappingIndex = findOverlappingItem(dropX, dropY, updatedItems, draggingExistingIndex);
      if (overlappingIndex >= 0) {
        handleInteraction(movedItem, updatedItems[overlappingIndex], dropX, dropY, updatedItems);
      } else {
        setDroppedItems(updatedItems);
      }

      setDraggingExistingIndex(null);
      setCurrentlyDragging(null); // Reset dragging state
    } else if (draggingItem) {
      const newItem = { ...draggingItem, x: dropX, y: dropY };

      const overlappingIndex = findOverlappingItem(dropX, dropY, droppedItems);
      if (overlappingIndex >= 0) {
        handleInteraction(newItem, droppedItems[overlappingIndex], dropX, dropY, [...droppedItems, newItem]);
      } else {
        setDroppedItems((prev) => [...prev, newItem]);
      }
    } else {
      console.warn('No item to drop.');
    }
  };

  const findOverlappingItem = (x, y, items, excludeIndex = null) => {
    return items.findIndex((item, index) => {
      if (!item || index === excludeIndex) return false; // Skip invalid or excluded items
      const distance = Math.sqrt(Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2));
      return distance < 60; // Adjust threshold based on item size
    });
  };

  const handleInteraction = (item1, item2, x, y, items) => {
    console.log(`Handling interaction between ${item1.name} and ${item2.name}`);
  
    let interaction = item1.interactions[item2.id];
    let initiatingItem = item1;
  
    if (!interaction) {
      interaction = item2.interactions[item1.id];
      initiatingItem = item2;
    }
  
    if (interaction) {
      if (interaction[0] === hoverLocation.toLowerCase()) {
        // Extract all result IDs after the location
        const resultIds = interaction.slice(1);
  
        // Create new items for all result IDs
        const newItems = resultIds
          .map((resultId) => {
            const resultItem = Object.values(itemsDic).find((item) => item.id === resultId);
            if (!resultItem) {
              console.error(`Item with ID ${resultId} not found in itemsDic.`);
              return null;
            }
            return { ...resultItem, x, y }; // Use provided coordinates
          })
          .filter(Boolean);
  
        if (newItems.length > 0) {
          // Remove the original interacting items and add the new ones
          const updatedItems = items.filter((item) => item.id !== item1.id && item.id !== item2.id);
          setDroppedItems([...updatedItems, ...newItems]);
  
          // Identify new goal items and handle them
          const newGoalItems = newItems.filter((item) => item.goal && !foundGoalItems.includes(item.id));
          if (newGoalItems.length > 0) {
            newGoalItems.forEach((item) => {
              if (onNewItemCreated) onNewItemCreated(item.id);
            });
  
            // Trigger confetti once if any new goal item is created
            triggerConfetti();
          }
        }
      } else {
        triggerShake();
      }
    } else {
      console.warn(`No interaction found between ${item1.id} and ${item2.id}`);
      triggerShake();
    }
  };
  
  
  

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); // Remove shake class after 500ms
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className={`shake-parent ${shake ? 'shake' : ''}`}>
      <div className="hover-info">Hovering over: {hoverLocation}</div>
      <div
        className="cell-container"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="cell">
          <div className="nucleus">
            <div className="nucleolus"></div>
          </div>
        </div>

        {/* Render dropped items */}
        {droppedItems.map((item, index) => (
          <div
            key={index}
            className="dropped-item"
            style={{
              position: 'absolute',
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
            draggable
            onDragStart={() => {
              setDraggingExistingIndex(index);
              setCurrentlyDragging(index); // Set the currently dragged item
            }}
            onDragEnd={() => setCurrentlyDragging(null)} // Clear the currently dragged item on drop
          >
            <img src={`/${item.image}`} alt={item.name} />
            <p className="item-name">{item.name}</p>
            {/* Conditionally render tags based on dragging status */}
            {currentlyDragging !== index && (
              <div className="item-info">
                <div className="item-tags">
                  {item.tags.map((tag, idx) => (
                    <div key={idx} className="tag">
                      <span className="tag-circle" style={{ backgroundColor: getRandomColor() }}></span>
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
  );
}

export default Cell;
