"use client";

import type React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-2 ${sizeClasses[size]}`}
          aria-hidden="true"
        />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.round(Math.max(0, Math.min(100, progress)));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span
            className="text-sm font-medium text-gray-700"
            id={`progress-label-${Math.random().toString(36).substr(2, 9)}`}
          >
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className="w-full bg-gray-200 rounded-full h-2.5"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label && (
        <div className="sr-only" aria-live="polite">
          {label}: {percentage}% complete
        </div>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isVisible,
  message = "Loading...",
  progress,
  children,
}: LoadingOverlayProps) {
  if (!isVisible) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-90 rounded-lg"
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <div className="text-center max-w-xs">
          <LoadingSpinner message={message} size="lg" />
          {typeof progress === "number" && (
            <div className="mt-4 w-full">
              <ProgressBar
                progress={progress}
                label="Progress"
                className="max-w-sm mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
