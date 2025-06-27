"use client";

import { useWizard } from "../context/wizard-context";

interface StepNavigationProps {
  canProceed?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  isLastStep?: boolean;
}

export default function StepNavigation({
  canProceed = true,
  onNext,
  onPrevious,
  nextLabel = "Next",
  previousLabel = "Previous",
  isLastStep = false,
}: StepNavigationProps) {
  const { state, nextStep, prevStep } = useWizard();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      prevStep();
    }
  };

  const isFirstStep = state.currentStep === 0;
  const isAtLastStep = state.currentStep === state.steps.length - 1;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Previous step</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {previousLabel}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Progress Info */}
        <span className="text-sm text-gray-500">
          Step {state.currentStep + 1} of {state.steps.length}
        </span>

        {/* Next/Finish Button */}
        {!isAtLastStep && (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`inline-flex items-center px-6 py-2 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              canProceed
                ? "text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }`}
          >
            {isLastStep ? "Finish" : nextLabel}
            {!isLastStep && (
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Next step</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
