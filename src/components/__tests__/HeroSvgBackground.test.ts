import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const componentSource = readFileSync(resolve(__dirname, '../HeroSvgBackground.astro'), 'utf-8');

describe('HeroSvgBackground template', () => {
  it('should render an SVG element', () => {
    expect(componentSource).toContain('<svg');
  });

  it('should be hidden from assistive technology', () => {
    expect(componentSource).toContain('aria-hidden="true"');
  });

  it('should only display on desktop (lg breakpoint)', () => {
    expect(componentSource).toContain('lg:block');
  });

  it('should have the correct viewBox', () => {
    expect(componentSource).toContain('viewBox="0 0 1200 800"');
  });
});

describe('HeroSvgBackground architecture boxes', () => {
  const labels = ['API', 'Gateway', 'Auth', 'Queue', 'Cache', 'DB', 'Worker', 'Logger', 'Store'];

  it('should have 9 architecture boxes', () => {
    const boxMatches = componentSource.match(/class="arch-box/g);
    expect(boxMatches).toHaveLength(9);
  });

  it('should have all architecture labels', () => {
    for (const label of labels) {
      expect(componentSource).toContain(`>${label}</text>`);
    }
  });
});

describe('HeroSvgBackground connections', () => {
  it('should have connection lines with dash-flow animation', () => {
    expect(componentSource).toContain('arch-line dash-flow');
  });

  it('should have data-pulse circles with animateMotion', () => {
    expect(componentSource).toContain('data-pulse');
    expect(componentSource).toContain('animateMotion');
  });
});

describe('HeroSvgBackground terminal text', () => {
  it('should have docker compose command', () => {
    expect(componentSource).toContain('docker compose');
  });

  it('should have git push command', () => {
    expect(componentSource).toContain('git push');
  });

  it('should have npm run build command', () => {
    expect(componentSource).toContain('npm run build');
  });

  it('should have kubectl command', () => {
    expect(componentSource).toContain('kubectl');
  });
});

describe('HeroSvgBackground CSS', () => {
  it('should define dash-scroll keyframes', () => {
    expect(componentSource).toContain('@keyframes dash-scroll');
  });

  it('should define float-slow keyframes', () => {
    expect(componentSource).toContain('@keyframes float-slow');
  });

  it('should define float-medium keyframes', () => {
    expect(componentSource).toContain('@keyframes float-medium');
  });

  it('should define term-fade-in keyframes', () => {
    expect(componentSource).toContain('@keyframes term-fade-in');
  });

  it('should define blink keyframes', () => {
    expect(componentSource).toContain('@keyframes blink');
  });

  it('should respect prefers-reduced-motion', () => {
    expect(componentSource).toContain('prefers-reduced-motion: reduce');
    expect(componentSource).toMatch(/prefers-reduced-motion: reduce[\s\S]*?animation: none/);
  });
});
