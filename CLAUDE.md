# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

### Build Process
The build process runs TypeScript compilation first (`tsc -b`) then Vite build. Both must succeed for a successful build.

## Project Architecture

### Technology Stack
- **Frontend**: React 19.1 with TypeScript
- **Routing**: React Router DOM v7.7
- **Styling**: Tailwind CSS v4.1 with custom dark theme
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

### Architecture Pattern
This project follows a **Clean Architecture** pattern with clear separation of concerns:

```
src/
├── application/     - Application layer (use cases, business logic)
├── domain/         - Domain layer (entities, business rules)  
├── infrastructure/ - Infrastructure layer (external services, APIs)
├── presentation/   - Presentation layer (UI components, pages, layouts)
└── shared/         - Shared utilities and types
```

### Presentation Layer Structure
- **layouts/**: Page layouts (e.g., DashboardLayout with sidebar/header)
- **pages/**: Route components exported from index.ts
- **components/**: Reusable UI components organized by feature
- **styles/**: Shared styling constants and utilities

### Routing Architecture
The app uses nested routing with a main `DashboardLayout` that wraps all pages. Currently implements custom navigation state management in the layout component rather than using React Router's built-in navigation.

### Styling System
- Uses Tailwind CSS with a dark theme (slate color palette)
- Custom slate-950 color defined for darker backgrounds
- Shared style constants in `presentation/styles/constants.ts`
- Consistent design system with cyan accent color (#22d3ee)

### Current Application State
This is a **Game Collection Management** application called "Gametrove" that allows users to track their video game library. The app is in early development with:
- Basic dashboard layout with sidebar navigation
- Placeholder pages for Dashboard, My Collection, Console Tracker, Add Game, and Settings
- Header with search functionality and user controls
- Mobile-responsive sidebar with overlay

### Key Components
- **DashboardLayout**: Main layout wrapper with sidebar and header
- **Header**: Top navigation with search and user controls  
- **Sidebar**: Navigation menu with game collection related links
- **Pages**: Placeholder components for different app sections

### Development Notes
- TypeScript configuration uses project references (tsconfig.json, tsconfig.app.json, tsconfig.node.json)
- ESLint configured for React and TypeScript
- No test framework currently configured
- Application, domain, and infrastructure layers are currently empty (architecture prepared for future development)

## TypeScript Configuration & Best Practices

This project uses strict TypeScript configuration with modern ES module compatibility:

### Compiler Options in Use
- `verbatimModuleSyntax: true` - Requires explicit type-only imports
- `erasableSyntaxOnly: true` - Only allows TypeScript syntax that can be completely removed at compile time

### Import/Export Best Practices

**Type-Only Imports:**
```typescript
// ✅ Correct - Use type-only imports for interfaces and type aliases
import type { GameCollectionSummary } from './Game';
import type { Platform } from './Platform';

// ✅ Correct - Regular imports for values (functions, classes, const assertions)
import { Game } from './Game';
import { GameCondition } from './GameCopy';

// ❌ Incorrect - Regular import for type-only usage
import { GameCollectionSummary } from './Game';
```

**Const Assertions Instead of Enums:**
```typescript
// ✅ Preferred - Const assertion (erasable, tree-shakable)
export const UserStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended"
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// ❌ Avoid - TypeScript enums (generate runtime code)
export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended"
}
```

**Why These Patterns:**
- **Better bundling** - Type-only imports are completely removed from output
- **Tree shaking** - Const assertions allow unused values to be eliminated
- **ES module compatibility** - Works with all modern bundlers and tools
- **Runtime performance** - No TypeScript-specific runtime overhead

### Validation Patterns
When validating const assertion values, use `Object.values()`:
```typescript
export function isValidUserStatus(status: string): status is UserStatus {
  return Object.values(UserStatus).includes(status as UserStatus);
}
```

## Security & Production Standards

### Environment Configuration
- **NEVER** log environment variables to console in production
- Use the centralized `environment` module from `shared/config/environment.ts`
- All environment variables must be validated at startup
- HTTPS required for all production API endpoints

```typescript
// ✅ Correct - Use validated environment config
import { environment } from '../../shared/config/environment';
const apiUrl = environment.apiBaseUrl;

// ❌ Incorrect - Direct env access without validation
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'fallback';
```

### Error Handling Standards
- Use structured `ApiError` class from `shared/errors/ApiError.ts`
- Provide user-friendly error messages
- Include proper error context for debugging
- Categorize errors for appropriate handling

```typescript
// ✅ Correct - Structured error handling
import { ApiError, ErrorCategory } from '../../shared/errors/ApiError';

throw ApiError.validation('Invalid email format', 'Please enter a valid email address');

// ❌ Incorrect - Generic error throwing
throw new Error('Validation failed');
```

### Logging Standards
- Use centralized `logger` from `shared/utils/logger.ts`
- **NEVER** use `console.log` in production code
- Include context for debugging
- Use appropriate log levels (debug, info, warn, error)

```typescript
// ✅ Correct - Centralized logging
import { logger } from '../../shared/utils/logger';
logger.info('User logged in successfully', { userId: user.id }, 'AUTH');

// ❌ Incorrect - Direct console usage
console.log('User logged in:', user);
```

### Error Boundaries
- All routes wrapped in ErrorBoundary components
- Root-level, page-level, and component-level error boundaries
- Custom error fallback UI for better user experience
- Error reporting hooks for monitoring

## Code Quality Standards

### ESLint Configuration
The project enforces strict code quality rules:
- `no-console`: Prevents console.log statements in production
- `@typescript-eslint/consistent-type-imports`: Enforces type-only imports
- `@typescript-eslint/no-explicit-any`: Prevents any types
- `@typescript-eslint/no-floating-promises`: Requires proper async handling

### Component Architecture
- **Maximum 300 lines per component** - Extract smaller components if exceeded
- **Maximum 10 useState hooks per component** - Use useReducer for complex state
- **Single responsibility principle** - Each component should have one clear purpose
- **Error boundary wrapping** - Wrap complex components in ErrorBoundary

### State Management Guidelines
- Use `useReducer` for complex state (>5 related state variables)
- Extract custom hooks for reusable logic
- Implement proper cleanup in useEffect
- Avoid stale closure issues with proper dependencies

```typescript
// ✅ Correct - Complex state with useReducer
const [state, dispatch] = useReducer(settingsReducer, initialState);

// ❌ Incorrect - Too many useState hooks
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);
const [filter, setFilter] = useState('');
// ... 6+ more useState hooks
```

### Memory Management
- Clean up subscriptions and timeouts in useEffect cleanup
- Use proper dependency arrays to prevent unnecessary re-renders
- Memoize expensive computations and static data
- Avoid creating objects/arrays in render

```typescript
// ✅ Correct - Proper cleanup and memoization
useEffect(() => {
  const timer = setTimeout(() => {
    // logic
  }, 1000);
  
  return () => clearTimeout(timer);
}, [dependency]);

const memoizedData = useMemo(() => expensiveComputation(data), [data]);

// ❌ Incorrect - Memory leaks and unnecessary re-renders
useEffect(() => {
  setTimeout(() => {
    // logic - no cleanup
  }, 1000);
}, [objectCreatedInRender]); // Will re-run every render
```

## API Integration Standards

### Request Patterns
- Use structured error handling for all API calls
- Include proper request/response logging
- Implement retry logic for transient failures
- Add request timeouts and cancellation

### Authentication
- All API calls must use the centralized auth service
- Handle token refresh failures gracefully
- Include proper error context for auth failures

## Development Workflow Reminders
- Should not try to `npm run`, I will run the app, just indicate to me that now might be a good time to run
- Run `npm run lint` before committing changes
- Ensure TypeScript compilation passes with `npm run build`

## Testing Standards (Future)
- Jest + React Testing Library for component testing
- Test user interactions, not implementation details
- Mock API calls with proper error scenarios
- Maintain >80% code coverage for critical paths

## Accessibility Requirements
- All interactive elements must have proper ARIA labels
- Support keyboard navigation
- Maintain proper focus management
- Use semantic HTML elements
- Test with screen readers

## Large Feature Change Behavior
- If the problem analysed may create a lot of code, you should not proceed and instead advise that any outstanding changes be committed

## Branch Naming Conventions
- When creating a branch, always use a prefix to indicate the purpose:
  - `feature/` for new features or substantial improvements
  - `chore/` for maintenance, cleanup, or non-feature work
  - `fix/` for bug fixes and security patches
  - Branch names should be brief and descriptive, using hyphens to separate words
  - Example: `fix/security-env-logging` or `feature/add-game-search-functionality`

## Performance Optimization Patterns

### Component Optimization
- **Extract components when >300 lines** - Large components should be broken into smaller, focused pieces
- **Use custom hooks for complex logic** - Extract business logic from components into reusable hooks
- **Memoize expensive computations** - Use `useMemo` for complex calculations and `useCallback` for event handlers
- **Prevent unnecessary re-renders** - Use proper dependency arrays and avoid object creation in render

```typescript
// ✅ Correct - Extracted components and hooks
const Dashboard: React.FC = () => {
  const dashboardData = useDashboardData(); // Custom hook
  
  return (
    <div>
      <StatsCards {...dashboardData.stats} />        {/* Extracted component */}
      <PriceHighlights {...dashboardData.highlights} /> {/* Extracted component */}
      <RecentGames {...dashboardData.recentGames} />    {/* Extracted component */}
    </div>
  );
};

// ❌ Incorrect - Monolithic component with inline logic
const Dashboard: React.FC = () => {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  // ... 15+ useState hooks
  // ... 200+ lines of JSX
};
```

### Memory Management Best Practices
- **Clean up all subscriptions** - Use cleanup functions in useEffect
- **Avoid stale closures** - Include all dependencies in dependency arrays
- **Memoize static data** - Use `useMemo` for data that doesn't change between renders

```typescript
// ✅ Correct - Proper memory management
useEffect(() => {
  const timer = setTimeout(() => {
    // logic
  }, 1000);
  
  return () => clearTimeout(timer); // Cleanup
}, [dependency]); // Proper dependencies

const staticData = useMemo(() => ({
  // expensive computation or static array
}), []); // Empty deps for truly static data

// ❌ Incorrect - Memory leaks
useEffect(() => {
  setInterval(() => {
    // logic - never cleaned up!
  }, 1000);
}, []); // Missing cleanup
```

## Code Organization Standards

### File Structure Guidelines
- **Maximum file size: 300 lines** - Split larger files into focused modules
- **Component directory structure:**
  ```
  components/
  ├── dashboard/           - Feature-specific components
  │   ├── StatsCards.tsx   - Focused component (50-100 lines)
  │   ├── PriceHighlights.tsx
  │   ├── RecentGames.tsx
  │   └── index.ts         - Barrel exports
  ├── common/              - Shared/reusable components
  └── forms/               - Form-specific components
  ```

### Hook Organization
- **Custom hooks for business logic** - Extract complex state and API logic
- **Prefix with 'use'** - Follow React naming conventions
- **Single responsibility** - Each hook should handle one concern
- **Return consistent interface** - Use objects for multiple return values

```typescript
// ✅ Correct - Focused custom hook
interface DashboardData {
  stats: StatsData;
  statsLoading: boolean;
  statsError: string | null;
  // ... other related data
}

export const useDashboardData = (): DashboardData => {
  // All dashboard-related logic here
  return { stats, statsLoading, statsError /* ... */ };
};

// ❌ Incorrect - Generic hook doing too much
export const useEverything = () => {
  // Stats logic
  // Game logic  
  // User logic
  // Settings logic
  // ... everything mixed together
};
```

## Production Monitoring & Debugging

### Error Monitoring Setup
- **Error boundaries at multiple levels** - Root, page, and component boundaries
- **Structured error reporting** - Use ApiError class for consistent error handling
- **User-friendly fallback UI** - Never show raw error messages to users
- **Error context tracking** - Include request IDs, user context, and action context

### Performance Monitoring
- **Core Web Vitals tracking** - Monitor LCP, FID, CLS metrics
- **API response time logging** - Track slow endpoints
- **Bundle size monitoring** - Keep bundles optimized
- **Memory usage tracking** - Monitor for memory leaks in production

### Debugging Tools
- **Development logging** - Use centralized logger with context
- **React Developer Tools** - Profile component re-renders
- **Network monitoring** - Track API failures and timeouts
- **User session recording** - Capture user flows for debugging

## Deployment & CI/CD Standards

### Pre-deployment Checklist
- [ ] All ESLint rules pass
- [ ] TypeScript compilation successful
- [ ] No console.log statements in production code
- [ ] Error boundaries tested
- [ ] Environment variables validated
- [ ] API error handling tested
- [ ] Performance metrics within targets

### Build Optimization
- **Tree shaking enabled** - Remove unused code from bundles
- **Code splitting** - Split routes and heavy components
- **Asset optimization** - Compress images and optimize fonts
- **Cache busting** - Proper cache headers for static assets

## Future Enhancements (Roadmap)

### Testing Infrastructure
- **Unit tests** - Jest + React Testing Library for components
- **Integration tests** - Test API interactions and user flows
- **E2E tests** - Critical user paths with Playwright or Cypress
- **Coverage targets** - Maintain >80% coverage for critical paths

### Accessibility Improvements
- **Screen reader support** - Proper ARIA labels and semantic HTML
- **Keyboard navigation** - Tab order and focus management
- **Color contrast** - WCAG AA compliance
- **Motion preferences** - Respect user motion preferences

### Performance Enhancements
- **Request deduplication** - Implement React Query or SWR
- **Virtual scrolling** - For large lists
- **Image lazy loading** - Optimize initial page load
- **Service worker** - Offline functionality and caching

## Merge Guidelines
- When I do a branch merge, it should squash
- All commits must pass linting and type checking
- Include descriptive commit messages with context
- Reference the specific improvements made (e.g., "Extract Dashboard components for better maintainability")
- Include performance impact if applicable