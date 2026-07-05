import React from 'react';

export const DatabaseTab: React.FC = () => {
  return (
    <div className="placeholder-tab-container" data-testid="database-tab">
      <div className="placeholder-tab-card">
        <h3>Eyepiece Database</h3>
        <p className="placeholder-tab-text">
          A database of commercially available eyepieces will list here.
        </p>
        <div className="placeholder-badge">Coming Soon</div>
      </div>
    </div>
  );
};
