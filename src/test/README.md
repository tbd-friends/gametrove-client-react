# Testing Guide

This directory contains the testing infrastructure and utilities for the Gametrove application.

## Quick Start

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Testing Architecture

### Infrastructure
- **Vitest**: Fast, Vite-native test runner
- **React Testing Library**: Component testing with user-centric queries
- **MSW**: API mocking for realistic tests
- **JSDOM**: Browser environment simulation

### File Structure
```
src/test/
├── setup.ts           # Global test setup and configuration
├── server.ts          # MSW server configuration
├── mocks.ts           # Mock data and utilities
├── utils.tsx          # Custom render functions and test utilities
└── README.md          # This file
```

## Test Categories

### 1. Unit Tests
Test individual functions and utilities in isolation.

**Coverage Target**: 90%+ for shared utilities

**Example**: `src/shared/utils/__tests__/logger.test.ts`

### 2. Hook Tests
Test custom React hooks with realistic data and state changes.

**Coverage Target**: 85%+ for presentation hooks

**Example**: `src/presentation/hooks/__tests__/useGamesData.test.ts`

### 3. Integration Tests
Test components with their dependencies and user interactions.

**Coverage Target**: 75%+ for components

**Example**: `src/presentation/pages/__tests__/MyCollection.test.tsx`

### 4. API Tests
Test API services with mocked HTTP responses.

**Coverage Target**: 80%+ for API services

**Example**: `src/infrastructure/api/__tests__/GameApiService.test.ts`

## Testing Patterns

### Component Testing
```typescript
import { renderWithProviders } from '../../../test/utils'
import { MyComponent } from '../MyComponent'

test('should render with expected content', () => {
  renderWithProviders(<MyComponent />)
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})
```

### Hook Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

test('should return expected data', async () => {
  const { result } = renderHook(() => useMyHook())
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined()
  })
})
```

### API Testing
```typescript
import { server } from '../../../test/server'
import { http, HttpResponse } from 'msw'

test('should handle API success', async () => {
  server.use(
    http.get('/api/endpoint', () => {
      return HttpResponse.json({ data: 'success' })
    })
  )
  
  const result = await apiService.getData()
  expect(result).toEqual({ data: 'success' })
})
```

## Mock Strategy

### API Mocking with MSW
MSW intercepts network requests and provides realistic responses:

```typescript
// Setup in server.ts
const handlers = [
  http.get('/api/games', () => {
    return HttpResponse.json({ data: mockGames })
  })
]

// Override in specific tests
server.use(
  http.get('/api/games', () => {
    return HttpResponse.json({ error: 'Server error' }, { status: 500 })
  })
)
```

### Component Mocking
Complex child components are mocked to focus on the component under test:

```typescript
vi.mock('../../components/complex', () => ({
  ComplexComponent: ({ data }: { data: any }) => (
    <div data-testid="complex-component">{data.title}</div>
  )
}))
```

### Hook Mocking
Custom hooks are mocked to control their return values:

```typescript
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: mockUser
  })
}))
```

## Coverage Thresholds

### Global Thresholds (75%)
- **Branches**: 75%
- **Functions**: 75%
- **Lines**: 75%
- **Statements**: 75%

### Shared Utilities (85%)
High coverage required for critical infrastructure:
- Logger
- API request utility
- Error handling

### API Services (80%)
Critical business logic requires thorough testing:
- All CRUD operations
- Error scenarios
- Authentication integration

## Best Practices

### 1. Test User Behavior, Not Implementation
```typescript
// ✅ Good - Tests user interaction
await user.click(screen.getByRole('button', { name: /add game/i }))
expect(screen.getByText('Game added successfully')).toBeInTheDocument()

// ❌ Bad - Tests implementation details
expect(mockSetGames).toHaveBeenCalledWith([...games, newGame])
```

### 2. Use Descriptive Test Names
```typescript
// ✅ Good
test('should display error message when API fails to load games')

// ❌ Bad  
test('error handling')
```

### 3. Test Error Scenarios
```typescript
test('should handle network failures gracefully', async () => {
  server.use(
    http.get('/api/games', () => HttpResponse.error())
  )
  
  const { result } = renderHook(() => useGamesData())
  
  await waitFor(() => {
    expect(result.current.error).toBeTruthy()
  })
})
```

### 4. Clean Up After Tests
```typescript
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
```

### 5. Use Realistic Data
```typescript
// Use the centralized mock data
import { mockGames } from '../../../test/mocks'

// Don't create ad-hoc data in tests
const games = [{ id: '1', name: 'Test' }] // ❌
```

## Debugging Tests

### Visual Testing with UI
```bash
npm run test:ui
```
Opens a browser interface for interactive test debugging.

### Debug Mode
```bash
npm test -- --reporter=verbose
```
Shows detailed test output and timing.

### Coverage Reports
```bash
npm run test:coverage
open coverage/index.html
```
View detailed coverage reports in browser.

## Performance Considerations

### Parallel Test Execution
Tests run in parallel by default for faster execution.

### MSW vs Fetch Mocking
MSW provides more realistic testing by intercepting actual HTTP requests.

### Test Isolation
Each test file runs in isolation to prevent side effects.

## Continuous Integration

### Required Checks
- All tests must pass
- Coverage thresholds must be met
- No ESLint violations
- TypeScript compilation successful

### Quality Gates
- Unit tests: Required for merge
- Integration tests: Required for merge  
- E2E tests: Required for production deployment

## Common Issues

### Mock Cleanup
Always reset mocks between tests:
```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

### Async Testing
Always wait for async operations:
```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false)
})
```

### Timer Testing
Use fake timers for consistent results:
```typescript
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
```

## Contributing

When adding new tests:

1. Follow the established patterns in existing tests
2. Maintain or improve coverage percentages
3. Test both success and error scenarios
4. Include accessibility testing where applicable
5. Update this README if adding new patterns or utilities

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)