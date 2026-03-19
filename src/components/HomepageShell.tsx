import { useEffect, useCallback } from 'react';
import { useTodoRail, DEFAULT_RAIL_ITEMS } from '../utils/todoRail';
import { observeSections } from '../utils/scrollObserver';
import TodoRail, { type TodoRailLabels } from './TodoRail';
import TodoRailMobile from './TodoRailMobile';
import ThemeToggle, { type ThemeToggleLabels } from './ThemeToggle';
import LocaleSwitcher, { type LocaleSwitcherLabels } from './LocaleSwitcher';

export interface HomepageShellLabels {
  todoRail: TodoRailLabels;
  themeToggle: ThemeToggleLabels;
  localeSwitcher: LocaleSwitcherLabels;
  resumeLabel: string;
}

interface Props {
  lang: string;
  labels: HomepageShellLabels;
}

export default function HomepageShell({ lang, labels }: Props) {
  const { items, activate } = useTodoRail(DEFAULT_RAIL_ITEMS);

  // Wire IntersectionObserver to drive rail state
  useEffect(() => {
    const sectionIds = DEFAULT_RAIL_ITEMS.map(i => i.sectionId);
    return observeSections(sectionIds, activate);
  }, [activate]);

  const handleItemClick = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      {/* Mobile rail — top of page, visible < lg */}
      <TodoRailMobile items={items} labels={labels.todoRail} onItemClick={handleItemClick} />

      {/* Desktop rail — sticky right column, visible >= lg */}
      <div className="hidden lg:flex lg:flex-col">
        {/* Utility strip at the top of the rail column */}
        <div className="flex items-center justify-end gap-1 border-b border-l border-border px-4 py-2">
          <a
            href={`/${lang}/resume`}
            className="border-signal-primary/50 hover:bg-signal-primary/10 rounded-lg border px-3 py-1.5 font-mono text-meta font-medium text-signal-primary transition-all hover:border-signal-primary"
          >
            {labels.resumeLabel}
          </a>
          <ThemeToggle labels={labels.themeToggle} />
          <LocaleSwitcher currentLang={lang} labels={labels.localeSwitcher} />
        </div>

        {/* Rail navigation */}
        <TodoRail items={items} labels={labels.todoRail} onItemClick={handleItemClick} />
      </div>
    </>
  );
}
