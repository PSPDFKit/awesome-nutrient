'use client';

import React, { useState, useEffect } from 'react';

interface KeyboardShortcutsProps {
  currentStep: string;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export default function KeyboardShortcuts({
  currentStep,
  canGoNext,
  canGoPrevious,
}: KeyboardShortcutsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Show keyboard shortcuts hint after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for ? key to show help
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        const isInputElement =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('.CodeMirror');

        if (!isInputElement) {
          event.preventDefault();
          setShowHelp((prev) => !prev);
        }
      }

      if (event.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  if (!isVisible) return null;

  return (
    <>
      {/* Help trigger */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Show keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Help modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Close keyboard shortcuts"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="border-b border-gray-200 pb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Navigation</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next step</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                        →
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Previous step</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                        ←
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skip to content</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                        Tab
                      </kbd>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <h4 className="font-medium text-gray-900 mb-2">General</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Show this help</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                        ?
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Close dialogs</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Current Status
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Step: {currentStep.replace('-', ' ')}</div>
                    <div>Can go next: {canGoNext ? 'Yes' : 'No'}</div>
                    <div>Can go back: {canGoPrevious ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
