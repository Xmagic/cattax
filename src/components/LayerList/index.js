'use client'

import { useState } from 'react'
import styles from './styles.module.css'

const LayerList = ({ layers, onLayerSelect, onLayerMove, selectedLayer }) => {
  const [dropPosition, setDropPosition] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.target.classList.add(styles.dragging);
    setDraggedIndex(index);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove(styles.dragging);
    setDropPosition(null);
    setDraggedIndex(null);
    // 清除所有指示器
    document.querySelectorAll(`.${styles.layerItem}`).forEach(item => {
      item.classList.remove(styles.dragOverTop, styles.dragOverBottom);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const layersContainer = e.currentTarget;
    const containerRect = layersContainer.getBoundingClientRect();
    const mouseY = e.clientY;

    // 清除所有指示器
    document.querySelectorAll(`.${styles.layerItem}`).forEach(item => {
      item.classList.remove(styles.dragOverTop, styles.dragOverBottom);
    });

    // 检查是否在容器的顶部区域
    if (mouseY - containerRect.top < 20) {
      const firstItem = layersContainer.querySelector(`.${styles.layerItem}:first-child`);
      if (firstItem && draggedIndex !== 0) {
        firstItem.classList.add(styles.dragOverTop);
        setDropPosition({ index: 0, position: 'top' });
      }
      return;
    }

    // 检查是否在容器的底部区域
    if (containerRect.bottom - mouseY < 20) {
      const lastItem = layersContainer.querySelector(`.${styles.layerItem}:last-child`);
      if (lastItem && draggedIndex !== layers.length - 1) {
        lastItem.classList.add(styles.dragOverBottom);
        setDropPosition({ index: layers.length - 1, position: 'bottom' });
      }
      return;
    }

    const dragOverItem = e.target.closest(`.${styles.layerItem}`);
    if (!dragOverItem) return;

    const rect = dragOverItem.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const currentIndex = parseInt(dragOverItem.getAttribute('data-index'));

    if (currentIndex === draggedIndex) return;

    if (mouseY < middleY) {
      dragOverItem.classList.add(styles.dragOverTop);
      setDropPosition({ index: currentIndex, position: 'top' });
    } else {
      dragOverItem.classList.add(styles.dragOverBottom);
      setDropPosition({ index: currentIndex, position: 'bottom' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (!dropPosition || dragIndex === dropPosition.index) return;

    let finalDropIndex = dropPosition.index;
    if (dropPosition.position === 'bottom') {
      finalDropIndex += 1;
    }
    if (dragIndex < dropPosition.index && dropPosition.position === 'bottom') {
      finalDropIndex -= 1;
    }

    onLayerMove(dragIndex, finalDropIndex);
    setDropPosition(null);
  };

  const getLayerName = (layer) => {
    if (layer.type === 'image') {
      return layer.fileName || 'Untitled Image';
    }
    return `Text: ${layer.text}`;
  };

  return (
    <div className={styles.layerList}>
      <h3>Layers</h3>
      <div 
        className={styles.layers}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            data-index={index}
            className={`${styles.layerItem} ${selectedLayer?.id === layer.id ? styles.selected : ''}`}
            onClick={() => onLayerSelect(layer)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className={styles.layerPreview}>
              {layer.type === 'image' ? '🖼️' : 'T'}
            </div>
            <div className={styles.layerContent}>
              <span className={styles.layerName} title={getLayerName(layer)}>
                {getLayerName(layer)}
              </span>
              <span className={styles.dragHandle}>⋮⋮</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerList; 