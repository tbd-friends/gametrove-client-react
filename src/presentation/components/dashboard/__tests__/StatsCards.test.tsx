import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsCards } from '../StatsCards';
import type { StatsData } from '../StatsCards';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Gamepad2: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="gamepad-icon" data-size={size} className={className}>Gamepad2</div>
  ),
  Copy: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="copy-icon" data-size={size} className={className}>Copy</div>
  ),
  Monitor: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="monitor-icon" data-size={size} className={className}>Monitor</div>
  ),
  Building: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="building-icon" data-size={size} className={className}>Building</div>
  ),
  AlertCircle: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="alert-icon" data-size={size} className={className}>AlertCircle</div>
  ),
}));

// Mock data factory
const createMockStatsData = (overrides?: Partial<StatsData>): StatsData => ({
  totalGames: 247,
  totalCopies: 312,
  platforms: 12,
  publishers: 89,
  ...overrides,
});

describe('StatsCards', () => {
  describe('Rendering States', () => {
    it('renders loading state with skeleton placeholders', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={true}
          error={null}
        />
      );

      // Should show skeleton loaders for each stat value
      const skeletonElements = screen.getAllByRole('generic').filter(
        el => el.className.includes('animate-pulse')
      );
      expect(skeletonElements).toHaveLength(4);

      // Should still show stat titles
      expect(screen.getByText('Total Games')).toBeInTheDocument();
      expect(screen.getByText('Total Copies')).toBeInTheDocument();
      expect(screen.getByText('Platforms')).toBeInTheDocument();
      expect(screen.getByText('Publishers')).toBeInTheDocument();

      // Should not show actual stat values during loading
      expect(screen.queryByText('247')).not.toBeInTheDocument();
      expect(screen.queryByText('312')).not.toBeInTheDocument();
    });

    it('renders stats data correctly when loaded', () => {
      const mockStats = createMockStatsData({
        totalGames: 150,
        totalCopies: 200,
        platforms: 8,
        publishers: 45,
      });

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      // Should display all stat values
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();

      // Should display all stat titles
      expect(screen.getByText('Total Games')).toBeInTheDocument();
      expect(screen.getByText('Total Copies')).toBeInTheDocument();
      expect(screen.getByText('Platforms')).toBeInTheDocument();
      expect(screen.getByText('Publishers')).toBeInTheDocument();

      // Should not show loading elements
      expect(screen.queryByRole('generic', { name: /animate-pulse/ })).not.toBeInTheDocument();
    });

    it('displays error state with appropriate messaging', () => {
      const mockStats = createMockStatsData();
      const errorMessage = 'Failed to load collection stats';

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={errorMessage}
        />
      );

      // Should show error icons for each card
      const errorIcons = screen.getAllByTestId('alert-icon');
      expect(errorIcons).toHaveLength(4);

      // Should show error message text
      const failedTexts = screen.getAllByText('Failed to load');
      expect(failedTexts).toHaveLength(4);

      // Should not show stat values during error state
      expect(screen.queryByText('247')).not.toBeInTheDocument();
      expect(screen.queryByText('312')).not.toBeInTheDocument();
    });

    it('shows all four stat cards with correct structure', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      // Should render exactly 4 stat cards
      const statCards = screen.getAllByRole('generic').filter(
        el => el.className.includes('bg-slate-800')
      );
      expect(statCards).toHaveLength(4);

      // Verify grid layout classes are applied
      const gridContainer = statCards[0].parentElement;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Data Display', () => {
    it('formats numbers correctly in stat values', () => {
      const mockStats = createMockStatsData({
        totalGames: 1000,
        totalCopies: 2500,
        platforms: 0,
        publishers: 1,
      });

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      // Should display numbers as strings without formatting
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('2500')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows appropriate icons for each stat type', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      // Check that each icon is present with correct attributes
      expect(screen.getByTestId('gamepad-icon')).toBeInTheDocument();
      expect(screen.getByTestId('gamepad-icon')).toHaveAttribute('data-size', '24');
      expect(screen.getByTestId('gamepad-icon')).toHaveClass('text-cyan-400');

      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
      expect(screen.getByTestId('copy-icon')).toHaveClass('text-green-400');

      expect(screen.getByTestId('monitor-icon')).toBeInTheDocument();
      expect(screen.getByTestId('monitor-icon')).toHaveClass('text-gray-400');

      expect(screen.getByTestId('building-icon')).toBeInTheDocument();
      expect(screen.getByTestId('building-icon')).toHaveClass('text-yellow-400');
    });

    it('applies correct styling classes for each card', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      const statCards = screen.getAllByRole('generic').filter(
        el => el.className.includes('bg-slate-800')
      );

      statCards.forEach(card => {
        expect(card).toHaveClass(
          'bg-slate-800',
          'rounded-lg',
          'p-6',
          'border',
          'border-slate-700',
          'relative'
        );
      });

      // Check title styling
      const titles = [
        screen.getByText('Total Games'),
        screen.getByText('Total Copies'),
        screen.getByText('Platforms'),
        screen.getByText('Publishers'),
      ];

      titles.forEach(title => {
        expect(title).toHaveClass('text-gray-400', 'text-sm', 'mb-2');
      });
    });
  });

  describe('Loading Behavior', () => {
    it('shows skeleton animation for values during loading', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={true}
          error={null}
        />
      );

      const skeletonElements = screen.getAllByRole('generic').filter(
        el => el.className.includes('animate-pulse') &&
             el.className.includes('bg-slate-600')
      );

      expect(skeletonElements).toHaveLength(4);

      skeletonElements.forEach(skeleton => {
        expect(skeleton).toHaveClass(
          'animate-pulse',
          'bg-slate-600',
          'h-8',
          'w-16',
          'rounded'
        );
      });
    });

    it('maintains card layout during loading states', () => {
      const mockStats = createMockStatsData();

      const { rerender } = render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      const initialCards = screen.getAllByRole('generic').filter(
        el => el.className.includes('bg-slate-800')
      );
      expect(initialCards).toHaveLength(4);

      // Rerender with loading state
      rerender(
        <StatsCards
          stats={mockStats}
          loading={true}
          error={null}
        />
      );

      const loadingCards = screen.getAllByRole('generic').filter(
        el => el.className.includes('bg-slate-800')
      );
      expect(loadingCards).toHaveLength(4);

      // Grid layout should remain consistent
      expect(initialCards[0].parentElement?.className).toBe(
        loadingCards[0].parentElement?.className
      );
    });
  });

  describe('Error Handling', () => {
    it('shows error icon and message when stats fail to load', () => {
      const mockStats = createMockStatsData();
      const errorMessage = 'Network error occurred';

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={errorMessage}
        />
      );

      // Should show alert icons
      const alertIcons = screen.getAllByTestId('alert-icon');
      expect(alertIcons).toHaveLength(4);

      alertIcons.forEach(icon => {
        expect(icon).toHaveClass('text-red-400');
        expect(icon).toHaveAttribute('data-size', '16');
      });

      // Should show "Failed to load" text for each card
      const errorTexts = screen.getAllByText('Failed to load');
      expect(errorTexts).toHaveLength(4);

      errorTexts.forEach(text => {
        expect(text).toHaveClass('text-red-400', 'text-xs');
      });
    });

    it('maintains consistent card layout during error state', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error="Test error"
        />
      );

      const errorCards = screen.getAllByRole('generic').filter(
        el => el.className.includes('bg-slate-800')
      );
      expect(errorCards).toHaveLength(4);

      // Each card should maintain proper structure
      errorCards.forEach(card => {
        const errorContainer = card.querySelector('.flex.items-center.justify-center.h-16');
        expect(errorContainer).toBeInTheDocument();
      });
    });

    it('uses appropriate error styling with red colors', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error="Error message"
        />
      );

      const alertIcons = screen.getAllByTestId('alert-icon');
      const errorTexts = screen.getAllByText('Failed to load');

      alertIcons.forEach(icon => {
        expect(icon).toHaveClass('text-red-400');
      });

      errorTexts.forEach(text => {
        expect(text).toHaveClass('text-red-400');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values correctly', () => {
      const mockStats = createMockStatsData({
        totalGames: 0,
        totalCopies: 0,
        platforms: 0,
        publishers: 0,
      });

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      const zeroValues = screen.getAllByText('0');
      expect(zeroValues).toHaveLength(4);
    });

    it('handles very large numbers', () => {
      const mockStats = createMockStatsData({
        totalGames: 999999,
        totalCopies: 1000000,
        platforms: 500,
        publishers: 10000,
      });

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('1000000')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('10000')).toBeInTheDocument();
    });

    it('handles simultaneous loading and error states (error takes precedence)', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={true}
          error="Both loading and error"
        />
      );

      // Error state should take precedence over loading state
      expect(screen.getAllByTestId('alert-icon')).toHaveLength(4);
      expect(screen.getAllByText('Failed to load')).toHaveLength(4);

      // Should not show loading skeletons when error is present
      expect(screen.queryByRole('generic', { name: /animate-pulse/ })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      // Cards should be in a grid container
      const gridContainer = screen.getByRole('generic', {
        name: (_, element) => element?.className.includes('grid') || false
      });
      expect(gridContainer).toBeInTheDocument();
    });

    it('provides meaningful content for screen readers', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      // Stat titles should be accessible
      expect(screen.getByText('Total Games')).toBeInTheDocument();
      expect(screen.getByText('Total Copies')).toBeInTheDocument();
      expect(screen.getByText('Platforms')).toBeInTheDocument();
      expect(screen.getByText('Publishers')).toBeInTheDocument();

      // Values should be associated with their titles through DOM structure
      const gameCard = screen.getByText('Total Games').closest('.bg-slate-800');
      expect(gameCard).toContainElement(screen.getByText('247'));
    });

    it('maintains focus and keyboard navigation support', () => {
      const mockStats = createMockStatsData();

      render(
        <StatsCards
          stats={mockStats}
          loading={false}
          error={null}
        />
      );

      // Cards should not interfere with keyboard navigation
      // (No interactive elements means no special keyboard handling needed)
      const cards = screen.getAllByRole('generic').filter(
        el => el.className.includes('bg-slate-800')
      );

      cards.forEach(card => {
        expect(card).not.toHaveAttribute('tabindex');
        expect(card).not.toHaveAttribute('role', 'button');
      });
    });
  });
});