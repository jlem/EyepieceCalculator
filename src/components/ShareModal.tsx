import React, { useState } from 'react';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  isOpen: boolean;
  shareUrl: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, shareUrl, onClose }) => {
  const [copyText, setCopyText] = useState('Copy');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>Share Configuration</h3>
        <p>Copy the link below to share your eyepiece set calculator configuration:</p>
        <div className={styles.shareInputGroup}>
          <input
            type="text"
            id="share-url-input"
            readOnly
            value={shareUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button type="button" id="copy-btn" className={styles.modalBtn} onClick={handleCopy}>
            {copyText}
          </button>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" id="close-modal-btn" className={styles.modalBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
