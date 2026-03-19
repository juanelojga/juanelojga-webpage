import projectsData from '../content/projects.json';

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
