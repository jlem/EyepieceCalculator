import { describe, it, expect } from 'vitest';
import { Eyepiece } from '../models/Eyepiece';

describe('Eyepiece Model', () => {
  it('should initialize with focal length', () => {
    const eyepiece = new Eyepiece(25);
    expect(eyepiece.focalLength).toBe(25);
  });
});
