import { useEffect, useState, useRef } from 'react';
import { CalculatorInputs } from '../utils/types';

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

export function useHashState() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    // Initial parse of URL hash
    const hash = window.location.hash.substring(1);
    if (!hash) return DEFAULT_INPUTS;

    try {
      const params = new URLSearchParams(hash);
      const fr = parseFloat(params.get('fr') || '');
      if (isNaN(fr)) return DEFAULT_INPUTS;

      const inputMode = (params.get('mode') === 'ap' ? 'ap' : 'fl') as 'ap' | 'fl';
      const val = params.get('val') || '';
      
      const minLimitMode = (params.get('minmode') === 'fl' ? 'fl' : 'ep') as 'ep' | 'fl';
      const maxLimitMode = (params.get('maxmode') === 'fl' ? 'fl' : 'ep') as 'ep' | 'fl';

      // Parse bounds (we first read the raw value in the box and convert to epMin/epMax)
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
      
      // Step strategy details
      const stepMode = (params.get('strat') || 'percent') as CalculatorInputs['stepMode'];
      const stepVal = parseFloat(params.get('step') || '40');

      const epTrans = parseFloat(params.get('trans') || '2.0');
      const lowStrategy = (params.get('lstrat') || 'fixed') as CalculatorInputs['lowStrategy'];
      const lowStep = parseFloat(params.get('lstep') || '50');
      const highStrategy = (params.get('hstrat') || 'pupil') as CalculatorInputs['highStrategy'];
      const highStep = parseFloat(params.get('hstep') || '1.00');

      return {
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
      };
    } catch {
      return DEFAULT_INPUTS;
    }
  });

  const isInitialLoad = useRef(true);
  const [shouldUpdateHash, setShouldUpdateHash] = useState(() => !!window.location.hash);

  // Sync state back to URL hash on changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (!shouldUpdateHash) return;

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

    // Write raw text values
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

    window.history.replaceState(null, '', '#' + params.toString());
  }, [inputs, shouldUpdateHash]);

  const enableHashUpdate = () => {
    setShouldUpdateHash(true);
  };

  return [inputs, setInputs, enableHashUpdate, shouldUpdateHash] as const;
}
