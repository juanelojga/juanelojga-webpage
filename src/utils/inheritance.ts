import type { InheritanceStory } from '../types/inheritance';

interface ProjectWithOptionalInheritance {
  inheritanceStory?: InheritanceStory;
  [key: string]: unknown;
}

export function hasInheritanceStory(
  project: ProjectWithOptionalInheritance
): project is ProjectWithOptionalInheritance & { inheritanceStory: InheritanceStory } {
  return (
    'inheritanceStory' in project &&
    project.inheritanceStory !== null &&
    project.inheritanceStory !== undefined
  );
}

export function getInheritanceStory(
  project: ProjectWithOptionalInheritance
): InheritanceStory | null {
  if (hasInheritanceStory(project)) {
    return project.inheritanceStory;
  }
  return null;
}
