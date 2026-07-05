import React from 'react';

export type MainTabType = 'database' | 'calculator' | 'recommendations';

interface MainNavTabsProps {
  activeTab: MainTabType;
  onChange: (tab: MainTabType) => void;
}

export const MainNavTabs: React.FC<MainNavTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="main-nav-tabs" id="main-nav-tabs">
      <button
        type="button"
        className={`main-nav-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
        onClick={() => onChange('calculator')}
      >
        Planner
      </button>
      <button
        type="button"
        className={`main-nav-tab-btn ${activeTab === 'database' ? 'active' : ''}`}
        onClick={() => onChange('database')}
      >
        Eyepiece Database
      </button>
      <button
        type="button"
        className={`main-nav-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
        onClick={() => onChange('recommendations')}
      >
        Recommendations
      </button>
    </div>
  );
};
