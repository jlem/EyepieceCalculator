import React from 'react';
import { Telescope } from '../models/Telescope';

interface TelescopeTabsProps {
  telescopes: Telescope[];
  activeTelescopeId: string | null;
  onSelect: (telescopeId: string | null) => void;
  onEdit: (telescope: Telescope) => void;
  onDelete: (telescopeId: string) => void;
  onAddClick: () => void;
}

export const TelescopeTabs: React.FC<TelescopeTabsProps> = ({
  telescopes,
  activeTelescopeId,
  onSelect,
  onEdit,
  onDelete,
  onAddClick,
}) => {
  return (
    <div className="telescope-tabs-row" id="telescope-tabs-row">
      <div className="telescope-tabs-container">
        {/* Saved Telescopes Tabs */}
        {telescopes.map((t) => {
          const isActive = activeTelescopeId === t.id;
          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              className={`telescope-tab-btn-wrap ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(t.id);
                }
              }}
              data-testid={`telescope-tab-${t.id}`}
            >
              <span className="telescope-tab-name">{t.name}</span>
              {isActive && (
                <div className="telescope-tab-actions">
                  <button
                    type="button"
                    className="telescope-tab-action-btn edit-btn"
                    title="Edit telescope details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(t);
                    }}
                    data-testid={`edit-telescope-${t.id}`}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="telescope-tab-action-btn delete-btn"
                    title="Delete telescope"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(t.id);
                    }}
                    data-testid={`delete-telescope-${t.id}`}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          className="add-telescope-btn"
          onClick={onAddClick}
          data-testid="add-telescope-btn"
        >
          + Add Telescope
        </button>
      </div>
    </div>
  );
};
