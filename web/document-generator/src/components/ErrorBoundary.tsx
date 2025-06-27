'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AppError,
  handleError,
  getRetryMessage,
  shouldShowDetails,
} from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallback?: React.ComponentType<{ error: AppError; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error?: AppError;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };

    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'unhandledrejection',
        this.handlePromiseRejection
      );
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'unhandledrejection',
        this.handlePromiseRejection
      );
    }
  }

  handlePromiseRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    const appError = handleError(event.reason, 'Promise rejection');
    this.setState({
      hasError: true,
      error: appError,
    });
    event.preventDefault(); // Prevent default browser error handling
  };

  static getDerivedStateFromError(error: Error): State {
    const appError = handleError(error, 'Component error');
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    const appError = handleError(error, 'Error boundary', undefined);
    // Log additional context for debugging
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.handleReset}
          />
        );
      }

      const retryMessage = getRetryMessage(this.state.error);
      const showDetails = shouldShowDetails(this.state.error);

      return (
        <div className="max-w-4xl mx-auto">
          <div className="nutri-card">
            <div className="nutri-card-header">
              <h2 className="text-xl font-semibold text-red-700">
                {this.state.error.recoverable
                  ? 'Something went wrong'
                  : 'Critical Error'}
              </h2>
            </div>
            <div className="nutri-card-content">
              <div className="mb-4">
                <p className="text-red-600 mb-2">{this.state.error.message}</p>
                {retryMessage && (
                  <p className="text-sm text-gray-600">{retryMessage}</p>
                )}
              </div>

              {showDetails && Boolean(this.state.error.details) && (
                <details className="mb-4 p-3 bg-gray-50 rounded border">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Technical Details
                  </summary>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                    {String(
                      typeof this.state.error.details === 'string'
                        ? this.state.error.details
                        : JSON.stringify(this.state.error.details, null, 2)
                    )}
                  </pre>
                </details>
              )}

              <div className="flex flex-wrap gap-3">
                {this.state.error.recoverable && (
                  <button
                    onClick={this.handleReset}
                    className="nutri-button-primary"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="nutri-button-secondary"
                >
                  Reload Page
                </button>
                {this.state.error.step && (
                  <p className="text-xs text-gray-500 flex items-center">
                    Error occurred in: {this.state.error.step}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
