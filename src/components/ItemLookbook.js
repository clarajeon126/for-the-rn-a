import React from 'react';
import Item from './Item';
import './ItemLookbook.css';

function ItemLookbook({ items, onDragStart }) {
  // Group items by their first letter
  const groupedItems = items.reduce((acc, item) => {
    const firstLetter = item.name[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(item);
    return acc;
  }, {});

  // Scroll to a section
  const handleScrollToSection = (letter) => {
    const section = document.getElementById(`section-${letter}`);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="item-lookbook-container">
      <div className="item-lookbook">
        <h2>Item Lookbook</h2>
        {Object.keys(groupedItems).sort().map((letter) => (
          <div key={letter} id={`section-${letter}`} className="letter-section">
            <h3 className="letter-header">{letter}</h3>
            <div className="item-grid">
              {groupedItems[letter].map((item) => (
                <Item key={item.id} item={item} onDragStart={onDragStart}/>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="alphabet-nav">
        {Object.keys(groupedItems).sort().map((letter) => (
          <button
            key={letter}
            className="alphabet-button"
            onClick={() => handleScrollToSection(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ItemLookbook;
