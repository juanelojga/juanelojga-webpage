export interface InheritanceStory {
  parentClass: {
    name: string;
    description: string;
    icon: string;
  };
  inheritedTraits: {
    label: string;
    evidence: string;
    origin: string;
  }[];
  overrides: {
    label: string;
    description: string;
    proofMetric?: string;
    codeSnippet?: string;
    relatedTraits?: string[];
  }[];
  resultingIdentity: string;
}

export interface InheritanceSectionLabels {
  sectionTitle: string;
  subtitle: string;
  parentClassLabel: string;
  inheritedTraitsLabel: string;
  overridesLabel: string;
  resultingIdentityLabel: string;
  returnCta: string;
}
