import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'root';
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Error info:', errorInfo);
    }

    // TODO: Send error to error reporting service (e.g., Sentry, LogRocket)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleNavigateHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { fallback, level = 'component' } = this.props;

      // Use custom fallback if provided
      if (fallback && error && errorInfo) {
        return fallback(error, errorInfo, this.handleRetry);
      }

      // Default fallback UI based on error level
      return (
        <div className={`bg-slate-900 ${level === 'root' ? 'min-h-screen' : 'min-h-64'} flex items-center justify-center p-4`}>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-400" size={24} />
              <h2 className="text-xl font-semibold text-white">
                {level === 'root' ? 'Application Error' : 'Something went wrong'}
              </h2>
            </div>

            <p className="text-gray-300 mb-4">
              {level === 'root'
                ? 'The application encountered an unexpected error and needs to be reloaded.'
                : 'This component encountered an error and couldn\'t be displayed properly.'}
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-4 p-3 bg-slate-950 rounded border border-slate-600">
                <summary className="text-red-400 font-medium cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-300 overflow-auto whitespace-pre-wrap">
                  {error.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              {level === 'root' && (
                <button
                  onClick={this.handleNavigateHome}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <Home size={16} />
                  Go Home
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for programmatically triggering error boundary
 * Useful for handling async errors in useEffect
 */
export function useErrorHandler() {
  return (error: Error) => {
    // React 18+ way to trigger error boundary from effects
    throw error;
  };
}