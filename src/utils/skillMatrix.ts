import skillClusters from '../content/skill-clusters.json';

export interface SkillCluster {
  id: string;
  icon: string;
  order: number;
  skills: string[];
  proofPointKey: string;
}

export const SKILL_CLUSTERS: SkillCluster[] = (skillClusters as SkillCluster[]).sort(
  (a, b) => a.order - b.order
);
