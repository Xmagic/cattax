'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import DialogList from '../DialogList'
import LayerList from '../LayerList'
import styles from './styles.module.css'
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline'

export default function ImageEditor() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layers, setLayers] = useState([]);
  const [fabricLoaded, setFabricLoaded] = useState(false);

  // 初始化 Fabric Canvas
  useEffect(() => {
    if (!fabricLoaded || !window.fabric || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const width = wrapper.clientWidth;
    const height = wrapper.clientWidth;

    const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: '#f0f0f0'
    });

    // 设置选中对象的事件监听
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    setCanvas(fabricCanvas);

    // 添加窗口大小变化监听
    const handleResize = () => {
      const newWidth = wrapper.clientWidth;
      fabricCanvas.setDimensions({
        width: newWidth,
        height: newWidth
      });
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, [fabricLoaded]);

  // 添加文本
  const addText = () => {
    if (!canvas) return;

    const textbox = new window.fabric.Textbox('New Text', {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 20,
      fill: '#000000',
      backgroundColor: 'transparent',
      padding: 10,
      editable: true,
      id: Date.now(),
      type: 'text',
      text: 'New Text'
    });

    canvas.add(textbox);
    setLayers(prev => [...prev, { id: textbox.id, type: 'text', text: 'New Text' }]);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
  };

  // 处理图片上传
  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files && canvas) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          window.fabric.Image.fromURL(e.target.result, (img) => {
            const padding = 40;
            const canvasWidth = canvas.width - padding * 2;
            const canvasHeight = canvas.height - padding * 2;
            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;

            if (imgRatio > canvasRatio) {
              img.scaleToWidth(canvasWidth);
            } else {
              img.scaleToHeight(canvasHeight);
            }

            img.set({
              left: (canvas.width - img.getScaledWidth()) / 2,
              top: (canvas.height - img.getScaledHeight()) / 2,
              id: Date.now(),
              type: 'image',
              fileName: file.name
            });

            canvas.add(img);
            setLayers(prev => [...prev, {
              id: img.id,
              type: 'image',
              fileName: file.name
            }]);
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 导出图片
  const handleExport = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1
    });

    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = dataUrl;
    link.click();
  };

  // 删除选中对象
  const handleDelete = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    setLayers(prev => prev.filter(layer => layer.id !== selectedObject.id));
    setSelectedObject(null);
    canvas.renderAll();
  };

  // 处理图层选择
  const handleLayerSelect = (layer) => {
    const obj = canvas.getObjects().find(o => o.id === layer.id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  // 处理图层移动
  const handleLayerMove = (dragIndex, dropIndex) => {
    const newLayers = [...layers];
    const [draggedLayer] = newLayers.splice(dragIndex, 1);
    newLayers.splice(dropIndex, 0, draggedLayer);
    
    const objects = canvas.getObjects();
    const [draggedObject] = objects.splice(dragIndex, 1);
    objects.splice(dropIndex, 0, draggedObject);
    
    objects.forEach((obj, index) => {
      canvas.moveTo(obj, index);
    });
    
    canvas.discardActiveObject();
    canvas.renderAll();
    setLayers(newLayers);
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"
        onLoad={() => setFabricLoaded(true)}
      />
      {fabricLoaded && (
        <div className={styles.imageEditor}>
          <div className={styles.editorHeader}>
            <h1>Cattax meme editor</h1>
          </div>
          <div className={styles.editorContent}>
            <div className={styles.sidebar}>
              <DialogList onAddText={addText} />
            </div>
            <div className={styles.mainContent}>
              <div className={styles.toolbar}>
                <label className={styles.fileInputWrapper}>
                  <ArrowUpTrayIcon className={styles.fileIcon} />
                  <span>Import</span>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className={styles.fileInputHidden}
                  />
                </label>
                <button 
                  onClick={handleExport} 
                  className={styles.exportButton} 
                  title="Export"
                  disabled={layers.length === 0}
                >
                  <ArrowDownTrayIcon className={styles.buttonIcon} />
                  <span>Export</span>
                </button>
                <button 
                  onClick={handleDelete} 
                  className={styles.deleteButton} 
                  title="Delete"
                  disabled={!selectedObject}
                >
                  <TrashIcon className={styles.buttonIcon} />
                  <span>Delete</span>
                </button>
              </div>
              <div className={styles.canvasContainer}>
                <div className={styles.canvasWrapper} ref={wrapperRef}>
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
            <div className={styles.rightSidebar}>
              <LayerList
                layers={layers}
                selectedLayer={selectedObject ? { id: selectedObject.id } : null}
                onLayerSelect={handleLayerSelect}
                onLayerMove={handleLayerMove}
              />
            </div>
          </div>
          <footer className={styles.footer}>
            Powered By <a href="https://github.com/Xmagic" target="_blank" rel="noopener noreferrer">Xmagic</a>
          </footer>
        </div>
      )}
    </>
  );
} 