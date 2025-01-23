import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ImageEditor from './components/ImageEditor';
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>Image Editor</h1>
        <ImageEditor />
      </div>
    </DndProvider>
  );
}

export default App; 