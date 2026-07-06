import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useHashState } from './hooks/useHashState';
import { calculateEyepieceSet } from './utils/calculator';
import { AppHeader } from './components/AppHeader';
import { ShareModal } from './components/ShareModal';
import { Telescope } from './models/Telescope';
import { MainNavTabs } from './components/MainNavTabs';
import { DatabaseTab } from './components/DatabaseTab';
import { RecommendationsTab } from './components/RecommendationsTab';
import { PlannerTab } from './components/PlannerTab';
import { CalculatorInputs } from './utils/types';
import { TelescopeTabs } from './components/TelescopeTabs';
import { TelescopeModal } from './components/TelescopeModal';

export default function App() {
  const [inputs, setInputs, mainTab, setMainTab, enableHashUpdate] = useHashState();

  // Telescope Manager State
  const [savedTelescopes, setSavedTelescopes] = useState<Telescope[]>(() => {
    const raw = localStorage.getItem('saved_telescopes');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as any[];
        return parsed.map(
          (p) => new Telescope(p.id, p.name, p.aperture, p.focalLength, p.focalRatio, p.focuserSize)
        );
      } catch {
        // fallback
      }
    }
    const defaults = [
      new Telescope('tele_default_1', '8" Dobsonian', 200, 1200, 6, '2'),
      new Telescope('tele_default_2', '80mm Refractor', 80, 600, 7.5, '2'),
      new Telescope('tele_default_3', '127mm Mak-Cas', 127, 1500, 11.8, '1.25'),
    ];
    localStorage.setItem('saved_telescopes', JSON.stringify(defaults));
    return defaults;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [telescopeToEdit, setTelescopeToEdit] = useState<Telescope | null>(null);

  const saveTelescopes = (list: Telescope[]) => {
    setSavedTelescopes(list);
    localStorage.setItem('saved_telescopes', JSON.stringify(list));
  };

  const [activeTelescopeId, setActiveTelescopeId] = useState<string | null>(() => {
    const inputAp = parseFloat(inputs.apertureVal) || 0;
    const inputApMM = inputs.apertureUnit === 'in' ? inputAp * 25.4 : inputAp;
    const inputFL = inputs.inputMode === 'fl'
      ? (parseFloat(inputs.flengthVal) || 0)
      : (inputApMM * inputs.fratio);

    const match = savedTelescopes.find(t => {
      const flDiff = Math.abs(t.focalLength - inputFL);
      const apDiff = Math.abs(t.aperture - inputApMM);
      const frDiff = Math.abs(t.focalRatio - inputs.fratio);
      return flDiff < 0.5 && apDiff < 0.5 && frDiff < 0.05;
    });

    if (match) return match.id;
    return savedTelescopes.length > 0 ? savedTelescopes[0].id : null;
  });

  const activeTelescope = useMemo(() => {
    return savedTelescopes.find(t => t.id === activeTelescopeId) || null;
  }, [activeTelescopeId, savedTelescopes]);

  // Sync inputs with the active telescope whenever it changes
  useEffect(() => {
    if (activeTelescope) {
      setInputs((prev) => {
        const next = {
          ...prev,
          fratio: activeTelescope.focalRatio,
          inputMode: 'fl' as const,
          flengthVal: activeTelescope.focalLength.toString(),
          apertureVal: activeTelescope.aperture.toString(),
          apertureUnit: 'mm' as const,
        };
        if (next.enforceLimit && next.epMax > next.personalEpLimit) {
          next.epMax = next.personalEpLimit;
          setMaxEnforced(true);
          if (maxEnforceTimeoutRef.current) clearTimeout(maxEnforceTimeoutRef.current);
          maxEnforceTimeoutRef.current = setTimeout(() => setMaxEnforced(false), 2000);
        }
        return next;
      });
    }
  }, [activeTelescope]);

  const handleSelectTelescope = (id: string | null) => {
    if (id === null) return;
    setActiveTelescopeId(id);
  };

  const handleSaveTelescope = (t: Telescope) => {
    const exists = savedTelescopes.some(x => x.id === t.id);
    let nextList: Telescope[];
    if (exists) {
      nextList = savedTelescopes.map(x => x.id === t.id ? t : x);
    } else {
      nextList = [...savedTelescopes, t];
    }
    saveTelescopes(nextList);
    setActiveTelescopeId(t.id);
  };

  const handleDeleteTelescope = (id: string) => {
    const nextList = savedTelescopes.filter(x => x.id !== id);
    saveTelescopes(nextList);
    if (activeTelescopeId === id) {
      setActiveTelescopeId(nextList.length > 0 ? nextList[0].id : null);
    }
  };

  // Transient limit-enforced overlays state
  const [minEnforced, setMinEnforced] = useState(false);
  const [maxEnforced, setMaxEnforced] = useState(false);

  // Timeouts references
  const minEnforceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxEnforceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modal share link visibility state
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Input change handler supporting limit enforcement clamps
  const handleInputChange = <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };

      // Enforce limit logic: clamp epMax to personal limit if checked
      if (next.enforceLimit) {
        if (next.epMax > next.personalEpLimit) {
          next.epMax = next.personalEpLimit;
          setMaxEnforced(true);
          if (maxEnforceTimeoutRef.current) clearTimeout(maxEnforceTimeoutRef.current);
          maxEnforceTimeoutRef.current = setTimeout(() => setMaxEnforced(false), 2000);
        }
      }

      return next;
    });
  };



  // Trigger KaTeX parsing when App mounts
  useEffect(() => {
    if ((window as any).renderMathInElement) {
      (window as any).renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
      });
    }
  }, []);

  // Use the active telescope directly for all calculations
  const telescope = activeTelescope;
  const hasFlength = !!telescope;

  // Reactively calculate full eyepiece list set
  const eyepieceSet = useMemo(() => {
    if (inputs.epMin >= inputs.epMax) return null; // stop calculations if range is invalid
    return calculateEyepieceSet(inputs);
  }, [inputs]);

  // Share link handlers
  const handleShareClick = () => {
    enableHashUpdate();
    setShareModalOpen(true);
  };

  const getShareUrl = () => {
    const params = new URLSearchParams();
    params.set('tab', 'planner');
    params.set('fr', inputs.fratio.toString());
    params.set('mode', inputs.inputMode);
    
    const val = inputs.inputMode === 'fl' ? inputs.flengthVal : inputs.apertureVal;
    if (val) params.set('val', val);

    if (inputs.inputMode === 'ap') {
      params.set('unit', inputs.apertureUnit);
    }

    params.set('minmode', inputs.minLimitMode);
    params.set('maxmode', inputs.maxLimitMode);

    const minVal = inputs.minLimitMode === 'ep' ? inputs.epMin : inputs.epMin * inputs.fratio;
    const maxVal = inputs.maxLimitMode === 'ep' ? inputs.epMax : inputs.epMax * inputs.fratio;
    params.set('min', minVal.toFixed(inputs.minLimitMode === 'fl' ? 1 : 2));
    params.set('max', maxVal.toFixed(inputs.maxLimitMode === 'fl' ? 1 : 2));

    params.set('pepl', inputs.personalEpLimit.toString());
    if (inputs.enforceLimit) {
      params.set('enf', '1');
    }

    params.set('type', inputs.stepModeType);

    if (inputs.stepModeType === 'simple') {
      params.set('strat', inputs.stepMode);
      params.set('step', inputs.stepVal.toString());
    } else {
      params.set('trans', inputs.epTrans.toFixed(1));
      params.set('lstrat', inputs.lowStrategy);
      params.set('lstep', inputs.lowStep.toString());
      params.set('hstrat', inputs.highStrategy);
      params.set('hstep', inputs.highStep.toString());
    }
    return window.location.origin + window.location.pathname + '#' + params.toString();
  };



  return (
    <main>
      <AppHeader />

      <TelescopeTabs
        telescopes={savedTelescopes}
        activeTelescopeId={activeTelescopeId}
        onSelect={handleSelectTelescope}
        onEdit={(t) => {
          setTelescopeToEdit(t);
          setModalOpen(true);
        }}
        onDelete={handleDeleteTelescope}
        onAddClick={() => {
          setTelescopeToEdit(null);
          setModalOpen(true);
        }}
      />

      <MainNavTabs
        activeTab={mainTab}
        onChange={(tab) => setMainTab(tab)}
      />

      {mainTab === 'database' && <DatabaseTab />}

      {mainTab === 'recommendations' && <RecommendationsTab />}

      {mainTab === 'calculator' && (
        <PlannerTab
          inputs={inputs}
          onChange={handleInputChange}
          onShareClick={handleShareClick}
          minEnforced={minEnforced}
          maxEnforced={maxEnforced}
          telescope={telescope}
          hasFlength={hasFlength}
          eyepieceSet={eyepieceSet}
          onAddTelescopeClick={() => {
            setTelescopeToEdit(null);
            setModalOpen(true);
          }}
        />
      )}

      <footer className="app-footer">
        Inspired by Don Pensack (Starman1) and his invaluable insights and contributions to the amateur astronomy community. Thank you, Don!
      </footer>

      {/* Share Link Modal popup */}
      <ShareModal
        isOpen={shareModalOpen}
        shareUrl={getShareUrl()}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Telescope Form Modal popup */}
      <TelescopeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTelescope}
        telescopeToEdit={telescopeToEdit}
      />
    </main>
  );
}
