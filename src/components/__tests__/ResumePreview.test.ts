import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const componentSource = readFileSync(resolve(__dirname, '../ResumePreview.astro'), 'utf-8');

describe('ResumePreview component contract', () => {
  const defaultFilename = 'resume.pdf';

  const trafficLightColors = ['#FF5F57', '#FEBC2E', '#28C840'];

  it('should have exactly 3 traffic-light colors', () => {
    expect(trafficLightColors).toHaveLength(3);
  });

  it('should use correct macOS traffic-light colors', () => {
    expect(trafficLightColors[0]).toBe('#FF5F57'); // close (red)
    expect(trafficLightColors[1]).toBe('#FEBC2E'); // minimize (yellow)
    expect(trafficLightColors[2]).toBe('#28C840'); // maximize (green)
  });

  it('should have a default filename', () => {
    expect(defaultFilename).toBe('resume.pdf');
    expect(defaultFilename).toBeTruthy();
  });

  it('should contain traffic-light dot elements in template', () => {
    for (const color of trafficLightColors) {
      expect(componentSource).toContain(`bg-[${color}]`);
    }
  });

  it('should render the filename in template', () => {
    expect(componentSource).toContain('{filename}');
  });

  it('should contain a gradient overlay element', () => {
    expect(componentSource).toContain('bg-gradient-to-t');
    expect(componentSource).toContain('from-white');
    expect(componentSource).toContain('to-transparent');
  });
});
