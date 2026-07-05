import { useEffect, useState, useRef } from 'react';
import { CalculatorInputs } from '../utils/types';

export type MainTabType = 'database' | 'calculator' | 'recommendations';

const DEFAULT_INPUTS: CalculatorInputs = {
  fratio: 5,
  inputMode: 'fl',
  flengthVal: '1000',
  apertureVal: '200',
  apertureUnit: 'mm',
  stepMode: 'percent',
  stepVal: 40,
  stepModeType: 'simple',
  personalEpLimit: 7,
  enforceLimit: false,
  epMin: 0.5,
  epMax: 7.0,
  minLimitMode: 'ep',
  maxLimitMode: 'ep',
  epTrans: 2.0,
  lowStrategy: 'fixed',
  lowStep: 50,
  highStrategy: 'pupil',
  highStep: 1.00,
};

function parseHash(hash: string, tab: MainTabType): { inputs: CalculatorInputs; tab: MainTabType } {
  if (!hash) return { inputs: DEFAULT_INPUTS, tab };
  
  const params = new URLSearchParams(hash);

  try {
    const fr = parseFloat(params.get('fr') || '');
    if (isNaN(fr)) return { inputs: DEFAULT_INPUTS, tab };

    const inputMode = (params.get('mode') === 'ap' ? 'ap' : 'fl') as 'ap' | 'fl';
    const val = params.get('val') || '';
    
    const minLimitMode = (params.get('minmode') === 'fl' ? 'fl' : 'ep') as 'ep' | 'fl';
    const maxLimitMode = (params.get('maxmode') === 'fl' ? 'fl' : 'ep') as 'ep' | 'fl';

    const rawMin = parseFloat(params.get('min') || '');
    const rawMax = parseFloat(params.get('max') || '');
    
    const epMin = isNaN(rawMin)
      ? (minLimitMode === 'fl' ? 2.5 : 0.5)
      : (minLimitMode === 'ep' ? rawMin : rawMin / fr);

    const epMax = isNaN(rawMax)
      ? (maxLimitMode === 'fl' ? 35.0 : 7.0)
      : (maxLimitMode === 'ep' ? rawMax : rawMax / fr);

    const personalEpLimit = parseFloat(params.get('pepl') || '7');
    const enforceLimit = params.get('enf') === '1';
    
    const stepModeType = (params.get('type') === 'advanced' ? 'advanced' : 'simple') as 'simple' | 'advanced';
    
    const stepMode = (params.get('strat') || 'percent') as CalculatorInputs['stepMode'];
    const stepVal = parseFloat(params.get('step') || '40');

    const epTrans = parseFloat(params.get('trans') || '2.0');
    const lowStrategy = (params.get('lstrat') || 'fixed') as CalculatorInputs['lowStrategy'];
    const lowStep = parseFloat(params.get('lstep') || '50');
    const highStrategy = (params.get('hstrat') || 'pupil') as CalculatorInputs['highStrategy'];
    const highStep = parseFloat(params.get('hstep') || '1.00');

    return {
      tab,
      inputs: {
        fratio: fr,
        inputMode,
        flengthVal: inputMode === 'fl' ? val : '1000',
        apertureVal: inputMode === 'ap' ? val : '200',
        apertureUnit: (params.get('unit') === 'in' ? 'in' : 'mm') as 'mm' | 'in',
        stepMode,
        stepVal,
        stepModeType,
        personalEpLimit,
        enforceLimit,
        epMin,
        epMax,
        minLimitMode,
        maxLimitMode,
        epTrans,
        lowStrategy,
        lowStep,
        highStrategy,
        highStep,
      }
    };
  } catch {
    return { inputs: DEFAULT_INPUTS, tab };
  }
}

export function useHashState() {
  const [state, setState] = useState(() => {
    const path = window.location.pathname;
    const hash = window.location.hash.substring(1);
    
    let tab: MainTabType = 'calculator';
    if (path === '/database') tab = 'database';
    else if (path === '/recommendations') tab = 'recommendations';

    if (path === '/' || path === '') {
      window.history.replaceState(null, '', '/planner' + window.location.hash);
    }

    return parseHash(hash, tab);
  });

  const inputs = state.inputs;
  const mainTab = state.tab;

  const setInputs = (updater: CalculatorInputs | ((prev: CalculatorInputs) => CalculatorInputs)) => {
    setState((prev) => {
      const nextInputs = typeof updater === 'function' ? updater(prev.inputs) : updater;
      return { ...prev, inputs: nextInputs };
    });
  };

  const setMainTab = (newTab: MainTabType) => {
    setState((prev) => {
      if (prev.tab === newTab) return prev;
      
      let nextPath = '/planner';
      if (newTab === 'database') nextPath = '/database';
      else if (newTab === 'recommendations') nextPath = '/recommendations';

      let nextHash = '';
      if (newTab === 'calculator') {
        if (shouldUpdateHash) {
          const params = new URLSearchParams();
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
          if (inputs.enforceLimit) params.set('enf', '1');
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
          nextHash = '#' + params.toString();
        }
      }

      window.history.pushState(null, '', nextPath + nextHash);
      return { ...prev, tab: newTab };
    });
  };

  const isInitialLoad = useRef(true);
  const [shouldUpdateHash, setShouldUpdateHash] = useState(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.has('fr');
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.substring(1);
      
      let newTab: MainTabType = 'calculator';
      if (path === '/database') newTab = 'database';
      else if (path === '/recommendations') newTab = 'recommendations';
      
      const parsed = parseHash(hash, newTab);
      
      setState((prev) => {
        if (
          prev.tab === parsed.tab &&
          JSON.stringify(prev.inputs) === JSON.stringify(parsed.inputs)
        ) {
          return prev;
        }
        return parsed;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (!shouldUpdateHash || mainTab !== 'calculator') {
      return;
    }

    const params = new URLSearchParams();
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

    window.history.replaceState(null, '', '/planner#' + params.toString());
  }, [inputs, shouldUpdateHash, mainTab]);

  const enableHashUpdate = () => {
    setShouldUpdateHash(true);
  };

  return [inputs, setInputs, mainTab, setMainTab, enableHashUpdate, shouldUpdateHash] as const;
}
