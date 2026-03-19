import { useState } from 'react';
import type { TodoItem } from '../utils/todoRail';
import type { TodoRailLabels } from './TodoRail';

interface Props {
  items: TodoItem[];
  labels: TodoRailLabels;
  onItemClick: (sectionId: string) => void;
}

const labelKeyMap: Record<string, keyof TodoRailLabels> = {
  'todoRail.bootIdentity': 'bootIdentity',
  'todoRail.compileStrengths': 'compileStrengths',
  'todoRail.unlockWorkLog': 'unlockWorkLog',
  'todoRail.openChannel': 'openChannel',
};

function getLabel(item: TodoItem, labels: TodoRailLabels): string {
  const key = labelKeyMap[item.labelKey];
  return key ? labels[key] : item.labelKey;
}

export default function TodoRailMobile({ items, labels, onItemClick }: Props) {
  const [expanded, setExpanded] = useState(false);

  const completedCount = items.filter(i => i.state === 'completed').length;
  const activeItem = items.find(i => i.state === 'active');
  const panelId = 'todo-rail-mobile-panel';

  return (
    <div className="bg-surface-primary/95 sticky top-0 z-50 border-b border-border backdrop-blur-md lg:hidden">
      {/* Collapsed progress strip */}
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`${labels.label}: ${completedCount}/${items.length}`}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        {/* Progress dots */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {items.map(item => (
            <span
              key={item.id}
              className={`size-2 rounded-full transition-colors ${
                item.state === 'completed'
                  ? 'bg-signal-primary'
                  : item.state === 'active'
                    ? 'bg-signal-primary/50 rail-pulse'
                    : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Active label */}
        <span className="ml-3 flex-1 truncate text-left font-mono text-meta text-text-secondary">
          {activeItem ? getLabel(activeItem, labels) : `${completedCount}/${items.length}`}
        </span>

        {/* Expand icon */}
        <svg
          className={`ml-2 size-4 text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded checklist panel */}
      {expanded && (
        <div
          id={panelId}
          role="navigation"
          aria-label={labels.label}
          className="border-t border-border px-4 pb-4 pt-2"
        >
          <ol className="flex flex-col gap-1">
            {items.map(item => {
              const displayLabel = getLabel(item, labels);

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onItemClick(item.sectionId);
                      setExpanded(false);
                    }}
                    aria-current={item.state === 'active' ? 'step' : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left font-mono text-label transition-colors ${
                      item.state === 'active'
                        ? 'bg-signal-primary/10 text-signal-primary'
                        : item.state === 'completed'
                          ? 'text-text-secondary'
                          : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center"
                      aria-hidden="true"
                    >
                      {item.state === 'completed' ? (
                        <svg
                          className="size-4 text-signal-primary"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M3 8.5L6.5 12L13 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : item.state === 'active' ? (
                        <span className="rail-pulse size-2.5 rounded-full bg-signal-primary" />
                      ) : (
                        <span className="size-2.5 rounded-full border border-border" />
                      )}
                    </span>
                    <span className={item.state === 'completed' ? 'line-through opacity-60' : ''}>
                      {displayLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
