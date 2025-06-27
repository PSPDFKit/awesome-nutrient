'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useWizard } from '../../context/WizardContext';
import StepNavigation from '../StepNavigation';

const templates = [
  {
    id: 'invoice',
    name: 'Invoice Template',
    description: 'Professional invoice template for businesses',
    preview: '/assets/invoice.png',
    category: 'Business',
  },
  {
    id: 'checklist',
    name: 'Checklist Template',
    description: 'Organized checklist for tasks and projects',
    preview: '/assets/checklist.png',
    category: 'Productivity',
  },
  {
    id: 'menu',
    name: 'Menu Template',
    description: 'Restaurant menu template with elegant design',
    preview: '/assets/menu.png',
    category: 'Food & Beverage',
  },
];

export default function TemplateStep() {
  const { state, dispatch, nextStep, completeCurrentStep } = useWizard();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    state.template || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('🔄 TemplateStep render:', {
    stateTemplate: state.template,
    selectedTemplate,
    currentStep: state.currentStep,
  });

  // Add useEffect to sync local state with global state when navigating back
  React.useEffect(() => {
    console.log(
      '🔄 TemplateStep useEffect - syncing selectedTemplate with state.template:',
      state.template
    );
    setSelectedTemplate(state.template || '');
  }, [state.template]);

  // console.log('🎯 TemplateStep rendered:', {
  //   selectedTemplate,
  //   stateTemplate: state.template,
  //   canProceed: !!selectedTemplate
  // });

  const handleTemplateSelect = (templateId: string) => {
    console.log('🎯 TemplateStep: User selected template:', templateId);
    console.log(
      '🎯 TemplateStep: Previous state.template was:',
      state.template
    );
    setSelectedTemplate(templateId);
    dispatch({ type: 'SET_TEMPLATE', payload: templateId });
    // Clear custom file if selecting predefined template
    if (templateId !== 'custom') {
      setSelectedFile(null);
      dispatch({ type: 'SET_CUSTOM_TEMPLATE_BINARY', payload: null });
    }
    setUploadError(null);
    console.log('🎯 TemplateStep: Dispatched SET_TEMPLATE with:', templateId);
  };

  // File validation helper
  const validateFile = (file: File): string | null => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    // Check file type
    if (
      file.type !==
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return 'Please select a valid DOCX file';
    }

    return null;
  };

  // Convert file to ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        setSelectedFile(file);
        setSelectedTemplate('custom');
        dispatch({ type: 'SET_TEMPLATE', payload: 'custom' });
        dispatch({ type: 'SET_CUSTOM_TEMPLATE_BINARY', payload: arrayBuffer });
        console.log('🎯 TemplateStep: Custom template uploaded successfully');
      } catch (error) {
        console.error('Error reading file:', error);
        setUploadError('Failed to read the selected file');
      }
    },
    [dispatch]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle click to upload
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleNext = () => {
    if (selectedTemplate) {
      completeCurrentStep();
      nextStep();
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Template
        </h2>
        <p className="text-lg text-gray-600">
          Select a template to get started with your document
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              selectedTemplate === template.id
                ? 'border-indigo-500 ring-2 ring-indigo-200'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => handleTemplateSelect(template.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTemplateSelect(template.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={selectedTemplate === template.id}
            aria-label={`Select ${template.name} template. ${template.description}`}
          >
            {/* Preview Image */}
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
              <Image
                src={template.preview}
                alt={template.name}
                width={300}
                height={400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Template Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">
                  {template.name}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>

            {/* Selection Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Upload Option */}
      <div
        className={`relative mt-8 p-6 border-2 border-dashed rounded-xl text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-50'
            : selectedTemplate === 'custom'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleUploadClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload custom DOCX template by clicking or dragging files here"
        aria-describedby="upload-instructions upload-help"
      >
        {/* Accessible file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="sr-only"
          id="custom-template-upload"
          aria-label="Upload custom DOCX template file"
          aria-describedby="upload-instructions upload-help"
        />

        <svg
          className={`mx-auto h-12 w-12 ${isDragOver || selectedTemplate === 'custom' ? 'text-indigo-500' : 'text-gray-400'}`}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-4">
          <h3
            className={`text-lg font-medium ${selectedTemplate === 'custom' ? 'text-indigo-900' : 'text-gray-900'}`}
          >
            Upload Custom Template
          </h3>

          {selectedFile ? (
            <div className="mt-2">
              <p className="text-sm text-indigo-600 font-medium">
                ✓ {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              {isDragOver
                ? 'Drop your DOCX file here'
                : 'Drag and drop your DOCX file here, or click to browse'}
            </p>
          )}

          {!selectedFile && (
            <button
              type="button"
              className={`mt-3 inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${
                isDragOver
                  ? 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Choose File
            </button>
          )}

          {selectedFile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setSelectedTemplate('');
                dispatch({ type: 'SET_TEMPLATE', payload: '' });
                dispatch({ type: 'SET_CUSTOM_TEMPLATE_BINARY', payload: null });
                setUploadError(null);
              }}
              className="mt-3 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
            >
              Remove File
            </button>
          )}
        </div>

        {/* Selection Indicator */}
        {selectedTemplate === 'custom' && selectedFile && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Accessibility helper text */}
      <div id="upload-instructions" className="sr-only">
        Click this area or press Enter to select a DOCX file from your computer.
        You can also drag and drop a file directly onto this area.
      </div>
      <div id="upload-help" className="sr-only">
        Upload a DOCX file to use as a custom template. Maximum file size is
        10MB. Supported format: Microsoft Word DOCX files.
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      <StepNavigation canProceed={!!selectedTemplate} onNext={handleNext} />
    </div>
  );
}
