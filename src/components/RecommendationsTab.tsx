import React from 'react';

export const RecommendationsTab: React.FC = () => {
  return (
    <div className="placeholder-tab-container" data-testid="recommendations-tab">
      <div className="placeholder-tab-card">
        <h3>Recommendations Engine</h3>
        <p className="placeholder-tab-text">
          A recommendations engine that attempts to match the calculated set of ideal focal lengths against real-world eyepieces.
        </p>
        <div className="placeholder-badge">Coming Soon</div>
      </div>
    </div>
  );
};
