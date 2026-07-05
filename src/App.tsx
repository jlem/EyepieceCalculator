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

  const activeTelescopeId = useMemo(() => {
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

    return match ? match.id : null;
  }, [inputs, savedTelescopes]);

  const handleSelectTelescope = (id: string | null) => {
    if (id === null) return;
    const t = savedTelescopes.find(x => x.id === id);
    if (t) {
      setInputs((prev) => {
        const next = {
          ...prev,
          fratio: t.focalRatio,
          inputMode: 'fl' as const,
          flengthVal: t.focalLength.toString(),
          apertureVal: t.aperture.toString(),
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
    
    // Select the telescope by copying its values directly, using the newly saved telescope object
    setInputs((prev) => {
      const next = {
        ...prev,
        fratio: t.focalRatio,
        inputMode: 'fl' as const,
        flengthVal: t.focalLength.toString(),
        apertureVal: t.aperture.toString(),
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
  };

  const handleDeleteTelescope = (id: string) => {
    const nextList = savedTelescopes.filter(x => x.id !== id);
    saveTelescopes(nextList);
  };

  // Transient limit-enforced overlays state
  const [minEnforced, setMinEnforced] = useState(false);
  const [maxEnforced, setMaxEnforced] = useState(false);
  const [pupilRangeOpen, setPupilRangeOpen] = useState(false);

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

  // Convert input values on inputMode toggle (FL <-> AP)
  const handleInputModeToggle = (nextMode: 'fl' | 'ap') => {
    if (nextMode === inputs.inputMode) return;

    let nextVal = '';
    const rawVal = inputs.inputMode === 'fl' ? inputs.flengthVal : inputs.apertureVal;
    if (rawVal) {
      const numVal = parseFloat(rawVal) || 0;
      if (nextMode === 'ap') {
        const aperture = numVal / inputs.fratio;
        if (inputs.apertureUnit === 'in') {
          nextVal = (aperture / 25.4).toFixed(2);
        } else {
          nextVal = Math.round(aperture).toString();
        }
        handleInputChange('apertureVal', nextVal);
      } else {
        let aperture = numVal;
        if (inputs.apertureUnit === 'in') {
          aperture = numVal * 25.4;
        }
        nextVal = Math.round(aperture * inputs.fratio).toString();
        handleInputChange('flengthVal', nextVal);
      }
    }
    handleInputChange('inputMode', nextMode);
  };

  // Convert input values on aperture unit toggle (mm <-> in)
  const handleApertureUnitToggle = (nextUnit: 'mm' | 'in') => {
    if (nextUnit === inputs.apertureUnit) return;

    let nextVal = '';
    if (inputs.apertureVal) {
      const numVal = parseFloat(inputs.apertureVal) || 0;
      if (nextUnit === 'in') {
        nextVal = (numVal / 25.4).toFixed(2);
      } else {
        nextVal = Math.round(numVal * 25.4).toString();
      }
      handleInputChange('apertureVal', nextVal);
    }
    handleInputChange('apertureUnit', nextUnit);
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

  // Compute resolved telescope & eyepiece specifications
  const telescope = useMemo(() => {
    let flength = 0;
    if (inputs.inputMode === 'fl') {
      flength = parseFloat(inputs.flengthVal) || 0;
    } else {
      const ap = parseFloat(inputs.apertureVal) || 0;
      const apMM = inputs.apertureUnit === 'in' ? ap * 25.4 : ap;
      flength = apMM * inputs.fratio;
    }
    const aperture = inputs.fratio > 0 ? flength / inputs.fratio : 0;
    return flength > 0 ? new Telescope('', 'Custom', aperture, flength, inputs.fratio, '2') : null;
  }, [inputs.inputMode, inputs.flengthVal, inputs.apertureVal, inputs.apertureUnit, inputs.fratio]);

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

  const handleToggleRange = (e: React.MouseEvent) => {
    e.preventDefault();
    setPupilRangeOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          const minEl = document.getElementById('epmin');
          if (minEl) {
            minEl.focus();
            minEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 0);
      }
      return next;
    });
  };

  const focusTelescopeInput = () => {
    const input = document.getElementById('fl-ap-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
          onInputModeToggle={handleInputModeToggle}
          onApertureUnitToggle={handleApertureUnitToggle}
          onShareClick={handleShareClick}
          minEnforced={minEnforced}
          maxEnforced={maxEnforced}
          pupilRangeOpen={pupilRangeOpen}
          setPupilRangeOpen={setPupilRangeOpen}
          telescope={telescope}
          hasFlength={hasFlength}
          eyepieceSet={eyepieceSet}
          focusTelescopeInput={focusTelescopeInput}
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
