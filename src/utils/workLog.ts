import projectsData from '../content/projects.json';
import experienceData from '../content/experience.json';

export interface ProjectEntry {
  title: string;
  slug: string;
  featured?: boolean;
  description: string;
  category: string;
  tags: string[];
  image: string;
  links: { live: string; github: string };
  heroImage: string;
  metadata: {
    role: string;
    duration: string;
    techStack: string[];
    target: string;
  };
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  duration: string;
  type: 'role';
  projectSlug: string | null;
}

export type WorkLogEntry =
  | { kind: 'project'; data: ProjectEntry }
  | { kind: 'milestone'; data: ExperienceEntry };

/**
 * Projects with full case-study metadata, ordered with featured first.
 */
export const CASE_STUDY_PROJECTS: ProjectEntry[] = (projectsData as ProjectEntry[])
  .filter(p => 'metadata' in p && p.metadata)
  .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

/**
 * The highlighted project (marked `featured: true` in projects.json).
 */
export const FEATURED_PROJECT: ProjectEntry | undefined = CASE_STUDY_PROJECTS.find(p => p.featured);

/**
 * Experience milestones from experience.json.
 */
export const EXPERIENCE_ENTRIES: ExperienceEntry[] = experienceData as ExperienceEntry[];

/**
 * Merge projects and experience milestones into a display-ready list.
 * Featured project first, then interleave milestones with remaining projects.
 */
export function mergeWorkLogEntries(
  projects: ProjectEntry[],
  experience: ExperienceEntry[]
): WorkLogEntry[] {
  const entries: WorkLogEntry[] = [];

  // Featured project leads
  const featured = projects.find(p => p.featured);
  if (featured) {
    entries.push({ kind: 'project', data: featured });
  }

  // Remaining projects paired with their milestones
  const remaining = projects.filter(p => !p.featured);
  const usedMilestones = new Set<string>();

  for (const project of remaining) {
    // Insert linked milestone before its project
    const milestone = experience.find(
      e => e.projectSlug === project.slug && !usedMilestones.has(e.id)
    );
    if (milestone) {
      entries.push({ kind: 'milestone', data: milestone });
      usedMilestones.add(milestone.id);
    }
    entries.push({ kind: 'project', data: project });
  }

  // Append any remaining milestones without linked projects
  for (const milestone of experience) {
    if (!usedMilestones.has(milestone.id)) {
      entries.push({ kind: 'milestone', data: milestone });
    }
  }

  return entries;
}

/**
 * Pre-merged work log entries ready for rendering.
 */
export const WORK_LOG_ENTRIES: WorkLogEntry[] = mergeWorkLogEntries(
  CASE_STUDY_PROJECTS,
  EXPERIENCE_ENTRIES
);
