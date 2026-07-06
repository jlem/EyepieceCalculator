import React from 'react';
import { DatabaseTable } from './DatabaseTable/DatabaseTable';
import eyepiecesData from '../data/eyepieces.json';
import { DatabaseEyepiece } from '../models/DatabaseEyepiece';

export const DatabaseTab: React.FC = () => {
  const eyepieces = eyepiecesData as DatabaseEyepiece[];

  return (
    <div className="database-tab-container" data-testid="database-tab" style={{ padding: '0 0 2rem' }}>


      <DatabaseTable eyepieces={eyepieces} />
    </div>
  );
};
