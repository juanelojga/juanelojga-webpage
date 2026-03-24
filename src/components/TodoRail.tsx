import { useEffect, useRef } from 'react';
import type { TodoItem, TodoRailLabels } from '../utils/todoRail';
import { labelKeyMap } from '../utils/todoRail';
import RailItem from './RailItem';

export type { TodoRailLabels } from '../utils/todoRail';

interface Props {
  items: TodoItem[];
  labels: TodoRailLabels;
  onItemClick: (sectionId: string) => void;
}

export default function TodoRail({ items, labels, onItemClick }: Props) {
  // Track previous states for animation triggers
  const prevStatesRef = useRef<Map<string, TodoItem['state']>>(new Map());

  useEffect(() => {
    const map = new Map<string, TodoItem['state']>();
    items.forEach(item => map.set(item.id, item.state));
    // Defer update to allow render to read previous values
    const timer = setTimeout(() => {
      prevStatesRef.current = map;
    }, 0);
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <nav
      aria-label={labels.label}
      className="hidden h-screen w-[280px] shrink-0 flex-col justify-center border-l border-border px-6 lg:sticky lg:top-0 lg:flex xl:w-[300px]"
    >
      <ol className="flex min-h-0 flex-col gap-1 overflow-y-auto">
        {items.map(item => {
          const labelProp = labelKeyMap[item.labelKey];
          const displayLabel = labelProp ? labels[labelProp] : item.labelKey;
          const stateLabel =
            item.state === 'active'
              ? labels.stateActive
              : item.state === 'completed'
                ? labels.stateCompleted
                : labels.statePending;

          return (
            <RailItem
              key={item.id}
              item={item}
              displayLabel={displayLabel as string}
              stateLabel={stateLabel}
              onItemClick={onItemClick}
              prevState={prevStatesRef.current.get(item.id)}
            />
          );
        })}
      </ol>
    </nav>
  );
}
