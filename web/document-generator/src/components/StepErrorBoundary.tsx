'use client';

import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AppError } from '@/lib/errorHandler';
import { StepType } from '@/types';

interface StepErrorBoundaryProps {
  children: ReactNode;
  step: StepType;
  onReset?: () => void;
  onNavigateBack?: () => void;
}

interface StepErrorFallbackProps {
  error: AppError;
  resetError: () => void;
  step: StepType;
  onNavigateBack?: () => void;
}

function StepErrorFallback({
  error,
  resetError,
  step,
  onNavigateBack,
}: StepErrorFallbackProps) {
  const stepTitles = {
    'template-selection': 'Template Selection',
    'template-editor': 'Template Editor',
    'data-editor': 'Data Editor',
    'docx-editor': 'Document Editor',
    'pdf-viewer': 'PDF Viewer',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="nutri-card">
        <div className="nutri-card-header">
          <h2 className="text-xl font-semibold text-red-700">
            Error in {stepTitles[step]}
          </h2>
        </div>
        <div className="nutri-card-content">
          <div className="mb-4">
            <p className="text-red-600 mb-2">{error.message}</p>
            <p className="text-sm text-gray-600">
              There was an issue with the {stepTitles[step].toLowerCase()}. You
              can try again or go back to the previous step.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={resetError} className="nutri-button-primary">
              Try Again
            </button>
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="nutri-button-secondary"
              >
                Go Back
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="nutri-button-secondary"
            >
              Reload Page
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && Boolean(error.details) && (
            <details className="mt-4 p-3 bg-gray-50 rounded border">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Debug Information
              </summary>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Error Code:</strong> {error.code}
                </div>
                <div>
                  <strong>Step:</strong> {error.step || step}
                </div>
                <div>
                  <strong>Recoverable:</strong>{' '}
                  {error.recoverable ? 'Yes' : 'No'}
                </div>
                {Boolean(error.details) && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="mt-1 text-gray-600 overflow-auto max-h-32 bg-white p-2 rounded border">
                      {String(
                        typeof error.details === 'string'
                          ? error.details
                          : JSON.stringify(error.details, null, 2)
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StepErrorBoundary({
  children,
  step,
  onReset,
  onNavigateBack,
}: StepErrorBoundaryProps) {
  const handleReset = () => {
    onReset?.();
  };

  const StepFallback = ({
    error,
    resetError,
  }: {
    error: AppError;
    resetError: () => void;
  }) => (
    <StepErrorFallback
      error={error}
      resetError={resetError}
      step={step}
      onNavigateBack={onNavigateBack}
    />
  );

  return (
    <ErrorBoundary onReset={handleReset} fallback={StepFallback}>
      {children}
    </ErrorBoundary>
  );
}
