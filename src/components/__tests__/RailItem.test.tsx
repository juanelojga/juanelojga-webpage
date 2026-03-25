import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RailItem from '../RailItem';
import type { TodoItem } from '../../utils/todoRail';

function makeItem(state: TodoItem['state']): TodoItem {
  return { id: 'boot', labelKey: 'todoRail.bootIdentity', sectionId: 'home', state };
}

describe('RailItem', () => {
  afterEach(cleanup);

  it('should render a button with the display label', () => {
    render(
      <RailItem
        item={makeItem('pending')}
        displayLabel="Boot identity"
        stateLabel="Pending"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    expect(screen.getByText('Boot identity')).toBeTruthy();
  });

  it('should set aria-label with display and state labels', () => {
    render(
      <RailItem
        item={makeItem('active')}
        displayLabel="Boot identity"
        stateLabel="In progress"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const button = screen.getByRole('button', { name: 'Boot identity — In progress' });
    expect(button).toBeTruthy();
  });

  it('should set aria-current="step" when state is active', () => {
    render(
      <RailItem
        item={makeItem('active')}
        displayLabel="Boot identity"
        stateLabel="In progress"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-current')).toBe('step');
  });

  it('should not set aria-current when state is pending', () => {
    render(
      <RailItem
        item={makeItem('pending')}
        displayLabel="Boot identity"
        stateLabel="Pending"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-current')).toBeNull();
  });

  it('should not set aria-current when state is completed', () => {
    render(
      <RailItem
        item={makeItem('completed')}
        displayLabel="Boot identity"
        stateLabel="Completed"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-current')).toBeNull();
  });

  it('should fire onItemClick with the correct sectionId on click', () => {
    const onItemClick = vi.fn();
    render(
      <RailItem
        item={makeItem('pending')}
        displayLabel="Boot identity"
        stateLabel="Pending"
        onItemClick={onItemClick}
        prevState={undefined}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onItemClick).toHaveBeenCalledWith('home');
  });

  it('should render a strikethrough line when state is completed', () => {
    render(
      <RailItem
        item={makeItem('completed')}
        displayLabel="Boot identity"
        stateLabel="Completed"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const label = screen.getByText('Boot identity');
    const parentSpan = label.closest('span.relative');
    const strikeLine = parentSpan?.querySelector('span.bg-text-secondary.opacity-50');
    expect(strikeLine).toBeTruthy();
  });

  it('should render a border circle for pending state indicator', () => {
    const { container } = render(
      <RailItem
        item={makeItem('pending')}
        displayLabel="Boot identity"
        stateLabel="Pending"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const circle = container.querySelector('span.border-border.rounded-full');
    expect(circle).toBeTruthy();
  });

  it('should render a pulsing dot for active state indicator', () => {
    const { container } = render(
      <RailItem
        item={makeItem('active')}
        displayLabel="Boot identity"
        stateLabel="In progress"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const dot = container.querySelector('span.rail-pulse.bg-signal-primary');
    expect(dot).toBeTruthy();
  });

  it('should render a check icon SVG for completed state', () => {
    const { container } = render(
      <RailItem
        item={makeItem('completed')}
        displayLabel="Boot identity"
        stateLabel="Completed"
        onItemClick={() => {}}
        prevState={undefined}
      />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
