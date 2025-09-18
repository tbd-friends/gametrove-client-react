/**
 * Test utilities for rendering components with providers
 */

import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { mockUser } from './mocks'

// Mock Auth0 provider for testing
const MockAuth0Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Auth0Provider
      domain="test-domain"
      clientId="test-client-id"
      authorizationParams={{
        redirect_uri: 'http://localhost:3000'
      }}
    >
      {children}
    </Auth0Provider>
  )
}

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  isAuthenticated?: boolean
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries = ['/'], isAuthenticated = true, ...renderOptions } = options

  // Mock useAuth0 hook
  const mockUseAuth0 = {
    isAuthenticated,
    isLoading: false,
    user: isAuthenticated ? mockUser : undefined,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
    loginWithRedirect: vi.fn(),
    logout: vi.fn()
  }

  // Mock the Auth0 hook before rendering
  vi.mock('@auth0/auth0-react', () => ({
    ...vi.importActual('@auth0/auth0-react'),
    useAuth0: () => mockUseAuth0,
    Auth0Provider: ({ children }: { children: React.ReactNode }) => children
  }))

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <MockAuth0Provider>
          {children}
        </MockAuth0Provider>
      </BrowserRouter>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockUseAuth0
  }
}

// Helper to create mock promises for async testing
export const createMockPromise = <T,>() => {
  let resolve: (value: T) => void
  let reject: (reason?: any) => void
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  
  return {
    promise,
    resolve: resolve!,
    reject: reject!
  }
}

// Helper to wait for async operations
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock implementation for fetch API
export const createMockFetch = (responses: Record<string, any> = {}) => {
  return vi.fn().mockImplementation((url: string) => {
    const response = responses[url]
    if (response instanceof Error) {
      return Promise.reject(response)
    }
    
    return Promise.resolve({
      ok: response?.status ? response.status < 400 : true,
      status: response?.status || 200,
      json: () => Promise.resolve(response || {}),
      text: () => Promise.resolve(JSON.stringify(response || {}))
    })
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'