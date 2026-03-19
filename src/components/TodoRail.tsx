import type { TodoItem } from '../utils/todoRail';

export interface TodoRailLabels {
  label: string;
  bootIdentity: string;
  compileStrengths: string;
  unlockWorkLog: string;
  openChannel: string;
  statePending: string;
  stateActive: string;
  stateCompleted: string;
}

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

function CheckIcon() {
  return (
    <svg
      className="size-4 text-signal-primary"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 8.5L6.5 12L13 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TodoRail({ items, labels, onItemClick }: Props) {
  return (
    <nav
      aria-label={labels.label}
      className="hidden h-screen w-[280px] shrink-0 flex-col justify-center border-l border-border px-6 lg:sticky lg:top-0 lg:flex xl:w-[300px]"
    >
      <ol className="flex flex-col gap-1">
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
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onItemClick(item.sectionId)}
                aria-current={item.state === 'active' ? 'step' : undefined}
                aria-label={`${displayLabel} — ${stateLabel}`}
                className={`group flex w-full items-center gap-3 rounded-lg p-3 text-left font-mono transition-colors ${
                  item.state === 'active'
                    ? 'bg-signal-primary/10 text-signal-primary'
                    : item.state === 'completed'
                      ? 'text-text-secondary hover:bg-surface-secondary'
                      : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                }`}
              >
                {/* State indicator */}
                <span
                  className="flex size-5 shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  {item.state === 'completed' ? (
                    <CheckIcon />
                  ) : item.state === 'active' ? (
                    <span className="rail-pulse size-2.5 rounded-full bg-signal-primary" />
                  ) : (
                    <span className="size-2.5 rounded-full border border-border" />
                  )}
                </span>

                {/* Label */}
                <span
                  className={`text-label ${
                    item.state === 'completed' ? 'line-through opacity-60' : ''
                  }`}
                >
                  {displayLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
