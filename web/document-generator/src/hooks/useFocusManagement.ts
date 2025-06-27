"use client";

import { useCallback, useRef } from "react";

export function useFocusManagement() {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Store the currently focused element before navigation
  const storeFocus = useCallback(() => {
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
  }, []);

  // Restore focus to previously focused element
  const restoreFocus = useCallback(() => {
    if (
      previouslyFocusedElementRef.current &&
      document.contains(previouslyFocusedElementRef.current)
    ) {
      previouslyFocusedElementRef.current.focus();
    }
  }, []);

  // Focus the first focusable element in a container
  const focusFirstElement = useCallback((container?: HTMLElement | null) => {
    const containerElement = container || document.body;
    const focusableElements = getFocusableElements(containerElement);

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }, []);

  // Focus the last focusable element in a container
  const focusLastElement = useCallback((container?: HTMLElement | null) => {
    const containerElement = container || document.body;
    const focusableElements = getFocusableElements(containerElement);

    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }, []);

  // Focus an element by selector
  const focusElement = useCallback(
    (selector: string, container?: HTMLElement | null) => {
      const containerElement = container || document;
      const element = containerElement.querySelector(selector) as HTMLElement;

      if (element?.focus) {
        element.focus();
        return true;
      }
      return false;
    },
    [],
  );

  // Focus a step indicator
  const focusStep = useCallback((stepIndex: number) => {
    const stepElement = document.querySelector(
      `[data-step-index="${stepIndex}"]`,
    ) as HTMLElement;
    if (stepElement) {
      stepElement.focus();
      return true;
    }
    return false;
  }, []);

  // Trap focus within a container (useful for modals)
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) return () => {};

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Focus the first element initially
    firstFocusable.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    storeFocus,
    restoreFocus,
    focusFirstElement,
    focusLastElement,
    focusElement,
    focusStep,
    trapFocus,
  };
}

// Helper function to get all focusable elements within a container
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="tab"]:not([disabled])',
    "details summary",
  ].join(", ");

  const elements = Array.from(
    container.querySelectorAll(focusableSelectors),
  ) as HTMLElement[];

  return elements.filter((element) => {
    // Filter out hidden elements
    const style = getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      !element.hasAttribute("aria-hidden") &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  });
}

// Hook for managing focus on step transitions
export function useStepFocus() {
  const { focusFirstElement, focusElement } = useFocusManagement();

  const focusStepContent = useCallback(
    (stepContainer?: HTMLElement | null) => {
      // Try to focus the step heading first, then first focusable element
      if (!focusElement("h1, h2, h3", stepContainer)) {
        focusFirstElement(stepContainer);
      }
    },
    [focusElement, focusFirstElement],
  );

  const announceStepChange = useCallback(
    (stepTitle: string, stepNumber: number, totalSteps: number) => {
      // Create a live region announcement for screen readers
      const announcement = `Step ${stepNumber} of ${totalSteps}: ${stepTitle}`;

      // Find or create the announcement container
      let announcer = document.getElementById("step-announcer");
      if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "step-announcer";
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = "sr-only";
        document.body.appendChild(announcer);
      }

      // Clear and set the announcement
      announcer.textContent = "";
      setTimeout(() => {
        announcer.textContent = announcement;
      }, 100);
    },
    [],
  );

  return {
    focusStepContent,
    announceStepChange,
  };
}
