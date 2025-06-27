'use client';

import React, { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { AppState } from '@/types';
import { STEP_TITLES } from '@/lib/constants';

interface DocxEditorProps {
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  navigateToStep: (step: 'data-editor' | 'pdf-viewer') => Promise<void>;
}

export default function DocxEditor({
  appState,
  updateAppState,
  navigateToStep,
}: DocxEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  const initializeDocxEditor = useCallback(async () => {
    console.log('🔄 DocxEditor: initializeDocxEditor called');
    console.log('📋 Current state:', {
      hasEditorRef: !!editorRef.current,
      hasTemplateDocument: !!appState.templateDocument,
      hasDataJson: !!appState.dataJson,
      hasDocAuthSystem: !!appState.docAuthSystem,
      hasDocxDocument: !!appState.docxDocument,
      hasDocxEditor: !!appState.docxEditor,
      windowPSPDFKit: !!window.PSPDFKit,
      isInitialized,
    });

    if (isInitialized) {
      console.log('✅ DocxEditor already initialized, skipping');
      return;
    }

    // Wait for ref to be available with timeout
    let attempts = 0;
    const maxAttempts = 20;
    while (!editorRef.current && attempts < maxAttempts) {
      console.log(
        `🔄 Waiting for DOCX editor ref (attempt ${attempts + 1}/${maxAttempts})...`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!editorRef.current) {
      console.warn('❌ No DOCX editor ref available after waiting');
      return;
    }

    // Additional validation: ensure the element is properly attached to DOM
    if (!editorRef.current.isConnected) {
      console.warn('❌ DOCX editor ref element is not connected to DOM');
      return;
    }

    // Ensure the element has proper dimensions
    const rect = editorRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('❌ DOCX editor ref element has zero dimensions:', rect);
      // Wait a bit more for layout to complete
      await new Promise((resolve) => setTimeout(resolve, 200));
      const newRect = editorRef.current.getBoundingClientRect();
      if (newRect.width === 0 || newRect.height === 0) {
        console.warn(
          '❌ DOCX editor ref element still has zero dimensions after waiting:',
          newRect
        );
        return;
      }
    }

    if (!appState.templateDocument) {
      console.warn('❌ No template document available');
      return;
    }

    if (!appState.dataJson) {
      console.warn('❌ No data JSON available');
      return;
    }

    setIsLoading(true);
    try {
      // Generate DOCX from template and data if not already done
      let docxDocument = appState.docxDocument;
      let docAuthSystem = appState.docAuthSystem;

      if (!docxDocument) {
        console.log('📄 Generating DOCX document from template and data...');

        if (!docAuthSystem) {
          console.error('❌ Document Authoring system not available');
          throw new Error('Document Authoring system not available');
        }

        if (!window.PSPDFKit) {
          console.error('❌ PSPDFKit not available - SDK may not be loaded');
          throw new Error('PSPDFKit not loaded');
        }

        console.log('🔧 Exporting template to DOCX buffer...');
        const templateBuffer = await appState.templateDocument.exportDOCX();
        console.log(
          '✅ Template exported to buffer, size:',
          templateBuffer.byteLength
        );

        console.log('🔧 Populating template with data...');
        console.log('Data to populate:', appState.dataJson);
        const docxBuffer = await window.PSPDFKit.populateDocumentTemplate(
          { document: templateBuffer },
          appState.dataJson
        );
        console.log(
          '✅ Template populated, result size:',
          docxBuffer.byteLength
        );

        console.log('🔧 Importing populated DOCX into Document Authoring...');
        docxDocument = await docAuthSystem.importDOCX(docxBuffer);
        console.log('✅ DOCX document imported:', docxDocument);

        updateAppState({ docxDocument });
      } else {
        console.log('✅ DOCX document already exists');
      }

      // Initialize editor
      console.log('🖊️ Creating Document Authoring editor for DOCX...');

      // Clear any existing content in the container
      const container = editorRef.current;
      if (!container) {
        console.warn('❌ Container became null during initialization');
        return;
      }

      while (container.firstChild) {
        const child = container.firstChild;
        if (child.parentNode === container) {
          container.removeChild(child);
        } else {
          // If parent relationship is broken, break the loop to prevent infinite loop
          break;
        }
      }

      console.log(
        '📝 Container cleared, creating DOCX editor with dimensions:',
        {
          width: container.getBoundingClientRect().width,
          height: container.getBoundingClientRect().height,
        }
      );

      // Ensure container is still valid before creating editor
      if (!container.isConnected) {
        console.warn('❌ Container lost DOM connection before editor creation');
        return;
      }

      // Add a stable ID to the container for the SDK
      if (!container.id) {
        container.id = `docx-editor-${Date.now()}`;
      }

      // Ensure container is properly styled and stable for the SDK
      container.style.position = 'relative';
      container.style.overflow = 'hidden';

      // Wait a frame to ensure DOM is completely settled
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Final validation before SDK call
      if (!container.isConnected || !container.parentElement) {
        console.warn('❌ Container became disconnected before editor creation');
        return;
      }

      try {
        const editor = await docAuthSystem!.createEditor(container, {
          document: docxDocument!,
        });
        console.log('✅ DOCX editor created successfully:', editor);
        updateAppState({ docxEditor: editor });
        setIsInitialized(true);
      } catch (sdkError) {
        console.error('❌ Document Authoring SDK error:', sdkError);
        // Try to recover by retrying after a short delay
        console.log('🔄 Retrying SDK initialization after delay...');
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Re-validate container is still available
        if (container.isConnected && container.parentElement) {
          try {
            const editor = await docAuthSystem!.createEditor(container, {
              document: docxDocument!,
            });
            console.log(
              '✅ DOCX editor created successfully on retry:',
              editor
            );
            updateAppState({ docxEditor: editor });
            setIsInitialized(true);
          } catch (retryError) {
            console.error(
              '❌ Document Authoring SDK retry failed:',
              retryError
            );
            throw retryError;
          }
        } else {
          console.error('❌ Container no longer available for retry');
          throw sdkError;
        }
      }
    } catch (error) {
      console.error('❌ Error initializing DOCX editor:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        appState: {
          hasTemplateDocument: !!appState.templateDocument,
          hasDataJson: !!appState.dataJson,
          hasDocAuthSystem: !!appState.docAuthSystem,
          hasDocxDocument: !!appState.docxDocument,
        },
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 DocxEditor initialization finished');
    }
  }, [
    appState.templateDocument,
    appState.dataJson,
    appState.docAuthSystem,
    appState.docxDocument,
    appState.docxEditor,
    updateAppState,
    isInitialized,
  ]);

  useEffect(() => {
    console.log('🔄 DocxEditor useEffect mounted');

    // Only initialize if we have required data and no existing editor
    if (
      appState.templateDocument &&
      appState.dataJson &&
      !appState.docxEditor &&
      !isInitialized &&
      !isLoading
    ) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        console.log(
          '⏰ Timer triggered, checking DOM ref:',
          !!editorRef.current
        );
        if (editorRef.current) {
          console.log('🚀 Starting DOCX editor initialization');
          initializeDocxEditor();
        }
      }, 50);

      return () => {
        console.log('🧹 DocxEditor cleanup called');
        clearTimeout(timer);
        if (appState.docxEditor) {
          console.log('🗑️ Destroying existing DOCX editor');
          appState.docxEditor.destroy();
          updateAppState({ docxEditor: null });
        }
        setIsInitialized(false);
      };
    }

    // Default cleanup for when no initialization occurs
    return () => {
      console.log('🧹 DocxEditor cleanup called (no-op)');
    };
  }, [
    appState.templateDocument,
    appState.dataJson,
    appState.docxEditor,
    initializeDocxEditor,
    isInitialized,
    isLoading,
    updateAppState,
  ]);

  const handleBackToData = useCallback(async () => {
    console.log('⬅️ Navigating back to data editor');
    if (appState.docxEditor) {
      console.log('🗑️ Destroying DOCX editor before navigation');
      appState.docxEditor.destroy();
    }
    updateAppState({
      docxEditor: null,
      docxDocument: null,
    });
    await navigateToStep('data-editor');
  }, [appState.docxEditor, updateAppState, navigateToStep]);

  const handleGeneratePdf = useCallback(async () => {
    console.log('➡️ Proceeding to PDF viewer');
    await navigateToStep('pdf-viewer');
  }, [navigateToStep]);

  return (
    <div className="nutri-card flex flex-col h-screen">
      <div className="nutri-card-header flex-shrink-0">
        <h2 className="text-2xl font-bold">{STEP_TITLES['docx-editor']}</h2>
      </div>

      <div className="nutri-card-content flex-1 min-h-0 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutrient-primary mx-auto mb-2"></div>
              <p className="text-gray-600">Loading DOCX editor...</p>
            </div>
          </div>
        ) : (
          <div ref={editorRef} className="nutri-editor h-full m-6" />
        )}
      </div>

      <div className="nutri-card-footer flex-shrink-0 relative z-10">
        <div className="flex justify-between">
          <button
            onClick={handleBackToData}
            className="nutri-button-secondary"
            disabled={isLoading}
          >
            ← Edit Data
          </button>
          <button
            onClick={handleGeneratePdf}
            className="nutri-button-primary"
            disabled={isLoading}
          >
            Generate PDF →
          </button>
        </div>
      </div>
    </div>
  );
}
