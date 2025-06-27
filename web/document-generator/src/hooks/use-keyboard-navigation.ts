"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { StepType } from "@/types";

interface KeyboardNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  disabled?: boolean;
}

export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onEscape,
  onEnter,
  onSpace,
  canGoNext = true,
  canGoPrevious = true,
  disabled = false,
}: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Don't handle keyboard events when user is typing in inputs
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest(".CodeMirror");

      if (isInputElement && !["Escape"].includes(event.key)) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          if (canGoNext && onNext) {
            event.preventDefault();
            onNext();
          }
          break;

        case "ArrowLeft":
        case "ArrowUp":
          if (canGoPrevious && onPrevious) {
            event.preventDefault();
            onPrevious();
          }
          break;

        case "Escape":
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;

        case "Enter":
          if (onEnter && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            onEnter();
          }
          break;

        case " ":
          if (onSpace) {
            event.preventDefault();
            onSpace();
          }
          break;
      }
    },
    [
      disabled,
      canGoNext,
      canGoPrevious,
      onNext,
      onPrevious,
      onEscape,
      onEnter,
      onSpace,
    ],
  );

  useEffect(() => {
    if (disabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, disabled]);

  return {
    handleKeyDown,
  };
}

interface StepNavigationOptions {
  currentStep: StepType;
  onNavigateToStep?: (step: StepType) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export function useStepNavigation({
  currentStep,
  onNavigateToStep,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
}: StepNavigationOptions) {
  const stepOrder = useMemo<StepType[]>(
    () => [
      "template-selection",
      "template-editor",
      "data-editor",
      "docx-editor",
      "pdf-viewer",
    ],
    [],
  );

  const currentIndex = stepOrder.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === stepOrder.length - 1;

  const navigateNext = useCallback(() => {
    if (!isLastStep && canGoNext) {
      if (onNext) {
        onNext();
      } else if (onNavigateToStep) {
        onNavigateToStep(stepOrder[currentIndex + 1]);
      }
    }
  }, [
    currentIndex,
    isLastStep,
    canGoNext,
    onNext,
    onNavigateToStep,
    stepOrder,
  ]);

  const navigatePrevious = useCallback(() => {
    if (!isFirstStep && canGoPrevious) {
      if (onPrevious) {
        onPrevious();
      } else if (onNavigateToStep) {
        onNavigateToStep(stepOrder[currentIndex - 1]);
      }
    }
  }, [
    currentIndex,
    isFirstStep,
    canGoPrevious,
    onPrevious,
    onNavigateToStep,
    stepOrder,
  ]);

  useKeyboardNavigation({
    onNext: navigateNext,
    onPrevious: navigatePrevious,
    canGoNext: !isLastStep && canGoNext,
    canGoPrevious: !isFirstStep && canGoPrevious,
  });

  return {
    navigateNext,
    navigatePrevious,
    canGoNext: !isLastStep && canGoNext,
    canGoPrevious: !isFirstStep && canGoPrevious,
    currentIndex,
    stepOrder,
  };
}
