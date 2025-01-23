'use client'

import styles from './styles.module.css'

const DialogList = ({ onAddText }) => {
  return (
    <div className={styles.dialogList}>
      <button 
        className={styles.addTextBtn}
        onClick={() => onAddText()}
      >
        Add Text
      </button>
    </div>
  );
};

export default DialogList; 