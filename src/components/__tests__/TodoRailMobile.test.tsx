import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TodoRailMobile from '../TodoRailMobile';
import type { TodoRailLabels } from '../TodoRail';
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

describe('TodoRailMobile', () => {
  afterEach(cleanup);

  it('should render the collapsed progress strip', () => {
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    render(<TodoRailMobile items={items} labels={mockLabels} onItemClick={() => {}} />);

    const toggle = screen.getByRole('button', { name: /Progress: 2\/5/ });
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('should show active item label when collapsed', () => {
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    render(<TodoRailMobile items={items} labels={mockLabels} onItemClick={() => {}} />);

    expect(screen.getByText('Compile strengths')).toBeTruthy();
  });

  it('should expand to show full checklist on click', () => {
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    render(<TodoRailMobile items={items} labels={mockLabels} onItemClick={() => {}} />);

    const toggle = screen.getByRole('button', { name: /Progress: 2\/5/ });
    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeTruthy();
  });

  it('should show all items when expanded', () => {
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    render(<TodoRailMobile items={items} labels={mockLabels} onItemClick={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Progress/ }));

    expect(screen.getByText('Boot identity')).toBeTruthy();
    expect(screen.getByText('Load profile')).toBeTruthy();
    expect(screen.getAllByText('Compile strengths').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Unlock work log')).toBeTruthy();
    expect(screen.getByText('Open channel')).toBeTruthy();
  });

  it('should collapse after clicking an item', () => {
    const onItemClick = vi.fn();
    const items = makeItems(['completed', 'completed', 'active', 'pending', 'pending']);
    render(<TodoRailMobile items={items} labels={mockLabels} onItemClick={onItemClick} />);

    // Expand
    fireEvent.click(screen.getByRole('button', { name: /Progress/ }));

    // Click an item — find the one for "projects"
    const buttons = screen.getAllByRole('button');
    const projectsButton = buttons.find(b => b.textContent?.includes('Unlock work log'));
    fireEvent.click(projectsButton!);

    expect(onItemClick).toHaveBeenCalledWith('projects');
    // Should collapse — aria-expanded should return to false
    const toggle = screen.getByRole('button', { name: /Progress/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
