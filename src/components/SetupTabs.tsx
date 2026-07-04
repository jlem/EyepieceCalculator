import React from 'react';

interface SetupTabsProps {
  activeTab: 'simple' | 'advanced';
  onChange: (tab: 'simple' | 'advanced') => void;
  onShare: () => void;
}

export const SetupTabs: React.FC<SetupTabsProps> = ({
  activeTab,
  onChange,
  onShare,
}) => {
  return (
    <div className="setup-tabs" id="step-mode-type-toggle">
      <button
        type="button"
        className={`setup-tab-btn ${activeTab === 'simple' ? 'active' : ''}`}
        onClick={() => onChange('simple')}
      >
        Simple Setup
      </button>
      <button
        type="button"
        className={`setup-tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
        onClick={() => onChange('advanced')}
      >
        Advanced Setup
      </button>
      <button
        type="button"
        id="share-btn"
        className="share-btn"
        onClick={onShare}
      >
        Share Setup
      </button>
    </div>
  );
};
