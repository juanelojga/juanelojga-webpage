import { describe, it, expect } from 'vitest';
import {
  mergeWorkLogEntries,
  CASE_STUDY_PROJECTS,
  FEATURED_PROJECT,
  EXPERIENCE_ENTRIES,
  WORK_LOG_ENTRIES,
} from '../workLog';

describe('workLog utility', () => {
  describe('CASE_STUDY_PROJECTS', () => {
    it('should only include projects with metadata', () => {
      for (const project of CASE_STUDY_PROJECTS) {
        expect(project.metadata).toBeDefined();
        expect(project.metadata.role).toBeDefined();
        expect(project.metadata.techStack).toBeDefined();
      }
    });

    it('should exclude projects without metadata (JuaneloJGAC Tech)', () => {
      const slugs = CASE_STUDY_PROJECTS.map(p => p.slug);
      expect(slugs).not.toContain('juanelojgac-tech');
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

    it('should be the Upwork project', () => {
      expect(FEATURED_PROJECT?.slug).toBe('upwork-search-jobs');
    });
  });

  describe('EXPERIENCE_ENTRIES', () => {
    it('should have experience entries', () => {
      expect(EXPERIENCE_ENTRIES.length).toBeGreaterThanOrEqual(1);
    });

    it('should have required fields on each entry', () => {
      for (const entry of EXPERIENCE_ENTRIES) {
        expect(entry.id).toBeDefined();
        expect(entry.company).toBeDefined();
        expect(entry.role).toBeDefined();
        expect(entry.duration).toBeDefined();
        expect(entry.type).toBe('role');
      }
    });
  });

  describe('mergeWorkLogEntries', () => {
    it('should place featured project first', () => {
      const entries = mergeWorkLogEntries(CASE_STUDY_PROJECTS, EXPERIENCE_ENTRIES);
      expect(entries[0].kind).toBe('project');
      if (entries[0].kind === 'project') {
        expect(entries[0].data.featured).toBe(true);
      }
    });

    it('should include all case study projects', () => {
      const entries = mergeWorkLogEntries(CASE_STUDY_PROJECTS, EXPERIENCE_ENTRIES);
      const projectEntries = entries.filter(e => e.kind === 'project');
      expect(projectEntries.length).toBe(3);
    });

    it('should include milestone markers', () => {
      const entries = mergeWorkLogEntries(CASE_STUDY_PROJECTS, EXPERIENCE_ENTRIES);
      const milestones = entries.filter(e => e.kind === 'milestone');
      expect(milestones.length).toBeGreaterThanOrEqual(1);
    });

    it('should place linked milestone before its project', () => {
      const entries = mergeWorkLogEntries(CASE_STUDY_PROJECTS, EXPERIENCE_ENTRIES);
      // Find narbox milestone and narbox project
      const narboxMilestoneIdx = entries.findIndex(
        e => e.kind === 'milestone' && e.data.projectSlug === 'narbox'
      );
      const narboxProjectIdx = entries.findIndex(
        e => e.kind === 'project' && e.data.slug === 'narbox'
      );
      if (narboxMilestoneIdx !== -1) {
        expect(narboxMilestoneIdx).toBeLessThan(narboxProjectIdx);
      }
    });

    it('should include unlinked milestones at the end', () => {
      const entries = mergeWorkLogEntries(CASE_STUDY_PROJECTS, EXPERIENCE_ENTRIES);
      const freelanceMilestone = entries.find(
        e => e.kind === 'milestone' && e.data.id === 'freelance'
      );
      expect(freelanceMilestone).toBeDefined();
    });

    it('should handle empty inputs gracefully', () => {
      expect(mergeWorkLogEntries([], [])).toEqual([]);
    });

    it('should handle projects-only input', () => {
      const entries = mergeWorkLogEntries(CASE_STUDY_PROJECTS, []);
      const projectEntries = entries.filter(e => e.kind === 'project');
      expect(projectEntries.length).toBe(3);
      const milestones = entries.filter(e => e.kind === 'milestone');
      expect(milestones.length).toBe(0);
    });

    it('should handle experience-only input', () => {
      const entries = mergeWorkLogEntries([], EXPERIENCE_ENTRIES);
      const milestones = entries.filter(e => e.kind === 'milestone');
      expect(milestones.length).toBe(EXPERIENCE_ENTRIES.length);
    });
  });

  describe('WORK_LOG_ENTRIES', () => {
    it('should be pre-computed and non-empty', () => {
      expect(WORK_LOG_ENTRIES.length).toBeGreaterThan(0);
    });

    it('should start with featured project', () => {
      expect(WORK_LOG_ENTRIES[0].kind).toBe('project');
      if (WORK_LOG_ENTRIES[0].kind === 'project') {
        expect(WORK_LOG_ENTRIES[0].data.featured).toBe(true);
      }
    });

    it('should contain both projects and milestones', () => {
      const kinds = new Set(WORK_LOG_ENTRIES.map(e => e.kind));
      expect(kinds.has('project')).toBe(true);
      expect(kinds.has('milestone')).toBe(true);
    });
  });
});
