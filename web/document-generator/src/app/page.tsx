"use client";

import { useEffect } from "react";
import StepContent from "./wizard/components/step-content";
import StepIndicator from "./wizard/components/step-indicator";
import WizardLayout from "./wizard/components/wizard-layout";
import { WizardProvider } from "./wizard/context/wizard-context";

export default function HomePage(): JSX.Element {
  // Simplified global error handler for SDK IntersectionObserver errors
  useEffect(() => {
    const handleSDKError = (event: ErrorEvent): boolean | undefined => {
      const filename = event.filename || "";
      const message = event.message || "";
      const stack = event.error?.stack || "";

      // Handle SDK errors more aggressively
      if (
        filename.includes("docauth-impl") ||
        filename.includes("document-authoring.cdn.nutrient.io") ||
        stack.includes("docauth-impl") ||
        stack.includes("document-authoring.cdn.nutrient.io") ||
        message.includes("IntersectionObserver")
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      return true;
    };

    // Simplified promise rejection handler
    const handleSDKRejection = (
      event: PromiseRejectionEvent,
    ): boolean | undefined => {
      const stack = event.reason?.stack || "";

      if (
        stack.includes("docauth-impl") ||
        stack.includes("document-authoring.cdn.nutrient.io")
      ) {
        console.warn("🛡️ SDK promise rejection suppressed");
        event.preventDefault();
        return false;
      }
      return true;
    };

    // Override console.error only for SDK errors to completely suppress them
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args.join(" ");
      const errorArg = args.find(
        (arg): arg is Error =>
          arg instanceof Error ||
          (typeof arg === "object" && arg !== null && "stack" in arg),
      );
      const stack = errorArg?.stack || "";

      // Suppress SDK errors completely
      if (
        message.includes("docauth-impl") ||
        stack.includes("docauth-impl") ||
        stack.includes("document-authoring.cdn.nutrient.io")
      ) {
        return; // Completely silent
      }

      originalConsoleError.apply(console, args);
    };

    // Monkey-patch IntersectionObserver with complete error suppression
    const OriginalIntersectionObserver = window.IntersectionObserver;
    if (OriginalIntersectionObserver) {
      window.IntersectionObserver = class extends OriginalIntersectionObserver {
        constructor(
          callback: IntersectionObserverCallback,
          options?: IntersectionObserverInit,
        ) {
          const safeCallback: IntersectionObserverCallback = (
            entries,
            observer,
          ) => {
            try {
              callback(entries, observer);
            } catch (_error) {
              // Completely silent - no logging at all
              return;
            }
          };
          super(safeCallback, options);
        }
      };
    }

    // Minimal event handlers only
    window.addEventListener("error", handleSDKError);
    window.addEventListener("unhandledrejection", handleSDKRejection);

    return () => {
      window.removeEventListener("error", handleSDKError);
      window.removeEventListener("unhandledrejection", handleSDKRejection);
      // Restore original IntersectionObserver
      if (OriginalIntersectionObserver) {
        window.IntersectionObserver = OriginalIntersectionObserver;
      }
      // Restore original console.error
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <WizardProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
          <div className="max-w-7xl mx-auto flex-1 flex flex-col">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Document Generator
              </h1>
              <p className="text-lg text-gray-600">
                Create professional documents in just a few steps
              </p>
            </div>

            {/* Main Wizard */}
            <div className="flex-1">
              <WizardLayout>
                <StepIndicator />
                <StepContent />
              </WizardLayout>
            </div>
          </div>
        </div>
      </div>
    </WizardProvider>
  );
}
