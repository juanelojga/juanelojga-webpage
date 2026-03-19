import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TodoRail, { type TodoRailLabels } from '../TodoRail';
import type { TodoItem } from '../../utils/todoRail';

const mockLabels: TodoRailLabels = {
  label: 'Progress',
  bootIdentity: 'Boot identity',
  loadProfile: 'Load profile',
  compileStrengths: 'Compile strengths',
  unlockWorkLog: 'Unlock work log',
  openChannel: 'Open channel',
  statePending: 'Pending',
  stateActive: 'In progress',
  stateCompleted: 'Completed',
};

function makeItems(states: Array<'pending' | 'active' | 'completed'>): TodoItem[] {
  return [
    { id: 'boot', labelKey: 'todoRail.bootIdentity', sectionId: 'home', state: states[0] },
    { id: 'profile', labelKey: 'todoRail.loadProfile', sectionId: 'about', state: states[1] },
    { id: 'compile', labelKey: 'todoRail.compileStrengths', sectionId: 'skills', state: states[2] },
    {
      id: 'unlock',
      labelKey: 'todoRail.unlockWorkLog',
      sectionId: 'projects',
      state: states[3],
    },
    { id: 'open', labelKey: 'todoRail.openChannel', sectionId: 'contact', state: states[4] },
  ];
}

describe('TodoRail', () => {
  afterEach(cleanup);

  it('should render a navigation landmark', () => {
    const items = makeItems(['pending', 'pending', 'pending', 'pending', 'pending']);
    render(<TodoRail items={items} labels={mockLabels} onItemClick={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeTruthy();
  });

  it('should render all 5 rail items', () => {
    const items = makeItems(['pending', 'pending', 'pending', 'pending', 'pending']);
    render(<TodoRail items={items} labels={mockLabels} onItemClick={() => {}} />);

    expect(screen.getByText('Boot identity')).toBeTruthy();
    expect(screen.getByText('Load profile')).toBeTruthy();
    expect(screen.getByText('Compile strengths')).toBeTruthy();
    expect(screen.getByText('Unlock work log')).toBeTruthy();
    expect(screen.getByText('Open channel')).toBeTruthy();
  });

  it('should set aria-current="step" on the active item', () => {
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    render(<TodoRail items={items} labels={mockLabels} onItemClick={() => {}} />);

    const activeButton = screen.getByRole('button', {
      name: 'Compile strengths — In progress',
    });
    expect(activeButton.getAttribute('aria-current')).toBe('step');
  });

  it('should not set aria-current on pending or completed items', () => {
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    render(<TodoRail items={items} labels={mockLabels} onItemClick={() => {}} />);

    const pendingButton = screen.getByRole('button', {
      name: 'Unlock work log — Pending',
    });
    expect(pendingButton.getAttribute('aria-current')).toBeNull();

    const completedButton = screen.getByRole('button', {
      name: 'Boot identity — Completed',
    });
    expect(completedButton.getAttribute('aria-current')).toBeNull();
  });

  it('should fire onItemClick with the correct sectionId', () => {
    const onItemClick = vi.fn();
    const items = makeItems(['pending', 'pending', 'pending', 'pending', 'pending']);
    render(<TodoRail items={items} labels={mockLabels} onItemClick={onItemClick} />);

    fireEvent.click(screen.getByText('Unlock work log'));
    expect(onItemClick).toHaveBeenCalledWith('projects');
  });

  it('should apply line-through on completed items', () => {
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    const { container } = render(
      <TodoRail items={items} labels={mockLabels} onItemClick={() => {}} />
    );

    // Strike-through is now an animated overlay span with a bg-text-secondary line
    const completedLabel = screen.getByText('Boot identity');
    const parentSpan = completedLabel.closest('span.relative');
    const strikeLine = parentSpan?.querySelector('span.bg-text-secondary\\/50');
    expect(strikeLine).toBeTruthy();
  });
});
