import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import ActionDropdown, { type ActionDropdownOption } from './ActionDropdown';

// HeadlessUI's Menu observes its layout via ResizeObserver, which jsdom does
// not implement. Provide a no-op stub so the component can mount in tests.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {
        // no-op
      }
      unobserve() {
        // no-op
      }
      disconnect() {
        // no-op
      }
    },
  );
});

// A trivial icon component matching the React.ComponentType<{ className? }> shape.
function DummyIcon({ className }: { className?: string }) {
  return <svg data-testid='dummy-icon' className={className} />;
}

function makeOptions(overrides: Partial<ActionDropdownOption>[] = []): {
  options: ActionDropdownOption[];
  onEdit: ReturnType<typeof vi.fn>;
  onDelete: ReturnType<typeof vi.fn>;
} {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const base: ActionDropdownOption[] = [
    { id: 'edit', label: 'Edit', icon: DummyIcon, onClick: onEdit },
    {
      id: 'delete',
      label: 'Delete',
      icon: DummyIcon,
      onClick: onDelete,
      variant: 'danger',
    },
  ];
  const options = base.map((opt, i) => ({ ...opt, ...overrides[i] }));
  return { options, onEdit, onDelete };
}

// HeadlessUI v2 uses the aria-activedescendant pattern: DOM focus stays on the
// MenuItems container and the "focused" item carries a `data-focus` attribute.
// Assert the visually/keyboard-focused item that way rather than toHaveFocus().
function expectActiveItem(name: string | RegExp) {
  expect(screen.getByRole('menuitem', { name })).toHaveAttribute('data-focus');
}

describe('ActionDropdown', () => {
  describe('single variant', () => {
    it('renders a labelled trigger button (default "Actions")', () => {
      const { options } = makeOptions();
      render(<ActionDropdown options={options} variant='single' />);
      expect(
        screen.getByRole('button', { name: 'Actions' }),
      ).toBeInTheDocument();
    });

    it('uses a custom triggerLabel when provided', () => {
      const { options } = makeOptions();
      render(
        <ActionDropdown
          options={options}
          variant='single'
          triggerLabel='More options'
        />,
      );
      expect(
        screen.getByRole('button', { name: 'More options' }),
      ).toBeInTheDocument();
    });

    it('opens the menu and lists all options on click', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      render(<ActionDropdown options={options} variant='single' />);

      await user.click(screen.getByRole('button', { name: 'Actions' }));

      const menu = screen.getByRole('menu');
      expect(
        within(menu).getByRole('menuitem', { name: 'Edit' }),
      ).toBeVisible();
      expect(
        within(menu).getByRole('menuitem', { name: 'Delete' }),
      ).toBeVisible();
    });

    it('invokes the option onClick when a menu item is activated', async () => {
      const user = userEvent.setup();
      const { options, onEdit } = makeOptions();
      render(<ActionDropdown options={options} variant='single' />);

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('lists primaryAction first when provided', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      const onPrimary = vi.fn();
      render(
        <ActionDropdown
          options={options}
          variant='single'
          primaryAction={{ label: 'Add Payment', onClick: onPrimary }}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      const items = screen.getAllByRole('menuitem');
      expect(items[0]).toHaveTextContent('Add Payment');
    });
  });

  describe('mobile-only variant', () => {
    it('renders an icon-only trigger with an accessible label', () => {
      const { options } = makeOptions();
      render(<ActionDropdown options={options} variant='mobile-only' />);
      expect(
        screen.getByRole('button', { name: 'Toggle actions menu' }),
      ).toBeInTheDocument();
    });

    it('lists primaryAction first, then options', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      const onPrimary = vi.fn();
      render(
        <ActionDropdown
          options={options}
          variant='mobile-only'
          primaryAction={{
            label: 'Add Payment',
            icon: DummyIcon,
            onClick: onPrimary,
          }}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'Toggle actions menu' }),
      );
      const items = screen.getAllByRole('menuitem');
      expect(items[0]).toHaveTextContent('Add Payment');
      expect(items[1]).toHaveTextContent('Edit');
      expect(items[2]).toHaveTextContent('Delete');
    });

    it('calls primaryAction.onClick from the dropdown item', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      const onPrimary = vi.fn();
      render(
        <ActionDropdown
          options={options}
          variant='mobile-only'
          primaryAction={{ label: 'Add Payment', onClick: onPrimary }}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'Toggle actions menu' }),
      );
      await user.click(screen.getByRole('menuitem', { name: 'Add Payment' }));
      expect(onPrimary).toHaveBeenCalledTimes(1);
    });
  });

  describe('desktop-split variant', () => {
    it('renders the primaryAction as a direct button (no dropdown)', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      const onPrimary = vi.fn();
      render(
        <ActionDropdown
          options={options}
          variant='desktop-split'
          primaryAction={{ label: 'Edit', icon: DummyIcon, onClick: onPrimary }}
        />,
      );

      // The primary action button is a real button, activated directly.
      await user.click(screen.getByRole('button', { name: 'Edit' }));
      expect(onPrimary).toHaveBeenCalledTimes(1);
      // No menu was opened by activating the primary action.
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders a chevron toggle with an accessible label opening ONLY options', async () => {
      const user = userEvent.setup();
      const onPrimary = vi.fn();
      // Options intentionally do NOT include the primaryAction label ("Edit"),
      // so we can assert the primaryAction is not repeated in the dropdown.
      const options: ActionDropdownOption[] = [
        { id: 'delete', label: 'Delete', onClick: vi.fn(), variant: 'danger' },
      ];
      render(
        <ActionDropdown
          options={options}
          variant='desktop-split'
          primaryAction={{ label: 'Edit', onClick: onPrimary }}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'More actions' }));
      const menu = screen.getByRole('menu');
      // primaryAction is NOT repeated inside the dropdown.
      expect(
        within(menu).queryByRole('menuitem', { name: 'Edit' }),
      ).not.toBeInTheDocument();
      expect(
        within(menu).getByRole('menuitem', { name: 'Delete' }),
      ).toBeInTheDocument();
      expect(within(menu).getAllByRole('menuitem')).toHaveLength(1);
    });
  });

  describe('full variant', () => {
    it('renders both the mobile trigger and the desktop split controls', () => {
      const { options } = makeOptions();
      const onPrimary = vi.fn();
      render(
        <ActionDropdown
          options={options}
          variant='full'
          primaryAction={{ label: 'Edit', onClick: onPrimary }}
        />,
      );

      // Mobile three-dot trigger.
      expect(
        screen.getByRole('button', { name: 'Toggle actions menu' }),
      ).toBeInTheDocument();
      // Desktop split: primary button + chevron toggle.
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'More actions' }),
      ).toBeInTheDocument();
    });
  });

  describe('danger styling', () => {
    it('applies red styling to danger options', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      render(<ActionDropdown options={options} variant='single' />);

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
      expect(deleteItem.className).toMatch(/text-red-/);
    });
  });

  describe('loading state', () => {
    it('shows loadingLabel + spinner and disables the option when loading', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions([
        {},
        {
          id: 'recalculate-totals',
          label: 'Recalculate Totals',
          loading: true,
          loadingLabel: 'Recalculating...',
        },
      ]);
      render(<ActionDropdown options={options} variant='single' />);

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      const loadingItem = screen.getByRole('menuitem', {
        name: /Recalculating/,
      });
      expect(loadingItem).toHaveTextContent('Recalculating...');
      expect(loadingItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not call onClick for a loading option activated by keyboard', async () => {
      const user = userEvent.setup();
      const onRecalc = vi.fn();
      const options: ActionDropdownOption[] = [
        {
          id: 'recalculate-totals',
          label: 'Recalculate Totals',
          onClick: onRecalc,
          loading: true,
          loadingLabel: 'Recalculating...',
        },
        { id: 'edit', label: 'Edit', onClick: vi.fn() },
      ];
      render(<ActionDropdown options={options} variant='single' />);

      await user.tab();
      // ArrowDown opens the menu and focuses the first ENABLED item, skipping
      // the loading (disabled) "Recalculate Totals" item.
      await user.keyboard('{ArrowDown}');
      expectActiveItem('Edit');
      expect(
        screen.getByRole('menuitem', { name: /Recalculating/ }),
      ).not.toHaveAttribute('data-focus');
      expect(onRecalc).not.toHaveBeenCalled();
    });
  });

  describe('disabled options', () => {
    it('marks disabled options aria-disabled and does not focus them via keyboard', async () => {
      const user = userEvent.setup();
      const onDisabled = vi.fn();
      const options: ActionDropdownOption[] = [
        {
          id: 'disabled',
          label: 'Disabled Action',
          onClick: onDisabled,
          disabled: true,
        },
        { id: 'edit', label: 'Edit', onClick: vi.fn() },
      ];
      render(<ActionDropdown options={options} variant='single' />);

      await user.tab();
      await user.keyboard('{ArrowDown}');
      const disabledItem = screen.getByRole('menuitem', {
        name: 'Disabled Action',
      });
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
      // Keyboard navigation skips the disabled item and lands on "Edit".
      expect(disabledItem).not.toHaveAttribute('data-focus');
      expectActiveItem('Edit');
      expect(onDisabled).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation & accessibility', () => {
    it('opens with the keyboard and moves focus through items with ArrowDown', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      render(<ActionDropdown options={options} variant='single' />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Actions' })).toHaveFocus();

      // ArrowDown opens the menu and focuses the first item.
      await user.keyboard('{ArrowDown}');
      expectActiveItem('Edit');

      await user.keyboard('{ArrowDown}');
      expectActiveItem('Delete');

      await user.keyboard('{ArrowUp}');
      expectActiveItem('Edit');
    });

    it('activates the focused item with Enter', async () => {
      const user = userEvent.setup();
      const { options, onDelete } = makeOptions();
      render(<ActionDropdown options={options} variant='single' />);

      await user.tab();
      await user.keyboard('{ArrowDown}'); // open + focus Edit
      await user.keyboard('{ArrowDown}'); // focus Delete
      await user.keyboard('{Enter}');
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      render(<ActionDropdown options={options} variant='single' />);

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it('traps focus within the menu while open (outside content is inert)', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      render(
        <>
          <ActionDropdown options={options} variant='single' />
          <button type='button' data-testid='outside'>
            Outside
          </button>
        </>,
      );

      const outside = screen.getByTestId('outside');
      // Before opening, the outside button is reachable/visible.
      expect(outside).not.toHaveAttribute('aria-hidden');

      await user.click(screen.getByRole('button', { name: 'Actions' }));

      // While the menu is open, HeadlessUI marks sibling content inert so
      // focus cannot leave the menu — the outside button is hidden from the
      // accessibility tree and no longer reachable by role.
      expect(outside).toHaveAttribute('aria-hidden', 'true');
      expect(
        screen.queryByRole('button', { name: 'Outside' }),
      ).not.toBeInTheDocument();
    });

    it('closes when clicking outside the menu', async () => {
      const user = userEvent.setup();
      const { options } = makeOptions();
      render(
        <>
          <ActionDropdown options={options} variant='single' />
          <div data-testid='outside'>Outside</div>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // HeadlessUI marks siblings inert while open, so click the document body
      // to simulate an outside interaction; the menu should close.
      await user.click(document.body);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
