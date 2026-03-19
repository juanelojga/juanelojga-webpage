import { describe, it, expect } from 'vitest';
import { CASE_STUDY_PROJECTS, FEATURED_PROJECT } from '../workLog';

describe('workLog utility', () => {
  describe('CASE_STUDY_PROJECTS', () => {
    it('should only include projects with metadata', () => {
      for (const project of CASE_STUDY_PROJECTS) {
        expect(project.metadata).toBeDefined();
        expect(project.metadata.role).toBeDefined();
        expect(project.metadata.techStack).toBeDefined();
      }
    });

    it('should have 3 case study projects', () => {
      expect(CASE_STUDY_PROJECTS.length).toBe(3);
    });

    it('should sort featured project first', () => {
      expect(CASE_STUDY_PROJECTS[0].featured).toBe(true);
    });
  });

  describe('FEATURED_PROJECT', () => {
    it('should be defined', () => {
      expect(FEATURED_PROJECT).toBeDefined();
    });

    it('should have featured flag set to true', () => {
      expect(FEATURED_PROJECT?.featured).toBe(true);
    });

    it('should be the AIEcommerce project', () => {
      expect(FEATURED_PROJECT?.slug).toBe('aiecommerce-agent-pipeline');
    });
  });
});
