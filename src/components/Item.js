import React from 'react';
import './Item.css';

function Item({ item, onDragStart }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item)); // Set item data
    console.log(`Dragging started for: ${item.name}`);
    if (onDragStart) {
      onDragStart(item); // Call the parent function
    }
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
    <div
      className="item"
      draggable
      onDragStart={handleDragStart}
    >
      <img src={`/${item.image}`} alt={item.name} />
      <p className="item-name">{item.name}</p>
      <div className="item-tags">
        {item.tags.map((tag, index) => (
          <div key={index} className="tag">
            <span
              className="tag-circle"
              style={{ backgroundColor: getRandomColor() }} // Random color for each tag
            ></span>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Item;
