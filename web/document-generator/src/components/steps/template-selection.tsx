"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useState } from "react";
import { STEP_TITLES, TEMPLATE_OPTIONS } from "@/lib/constants";
import { readFileAsArrayBuffer } from "@/lib/utils";
import type { AppState, TemplateType } from "@/types";

interface TemplateSelectionProps {
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  navigateToStep: (step: "template-editor") => Promise<void>;
  showError?: (message: string, duration?: number) => string;
  showSuccess?: (message: string, duration?: number) => string;
  showWarning?: (message: string, duration?: number) => string;
}

export default function TemplateSelection({
  appState: _appState,
  updateAppState,
  navigateToStep,
  showError,
  showWarning: _showWarning,
}: TemplateSelectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateSelect = useCallback(
    async (template: TemplateType) => {
      if (template === "custom" && !selectedFile) {
        return;
      }

      setIsLoading(true);
      try {
        let customTemplateBinary: ArrayBuffer | null = null;

        if (template === "custom" && selectedFile) {
          customTemplateBinary = await readFileAsArrayBuffer(selectedFile);
        }

        updateAppState({
          template,
          customTemplateBinary,
        });

        await navigateToStep("template-editor");
      } catch (error) {
        console.error("Error selecting template:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFile, updateAppState, navigateToStep],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

      if (!file) {
        setSelectedFile(null);
        return;
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        showError?.("File size must be less than 10MB");
        event.target.value = "";
        setSelectedFile(null);
        return;
      }

      // MIME type validation
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setSelectedFile(file);
      } else {
        showError?.("Please select a valid DOCX file");
        event.target.value = "";
        setSelectedFile(null);
      }
    },
    [showError],
  );

  return (
    <div className="nutri-card">
      <div className="nutri-card-header">
        <h2 className="text-2xl font-bold">
          {STEP_TITLES["template-selection"]}
        </h2>
      </div>

      <div className="nutri-card-content">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            DEMO Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMPLATE_OPTIONS.map((option) => (
              <div key={option.id} className="nutri-card">
                <div className="nutri-card-header">
                  <h4 className="text-lg font-semibold">{option.name}</h4>
                </div>
                <div className="p-4">
                  <div className="text-center mb-4">
                    <Image
                      src={option.imagePath}
                      alt={option.name}
                      width={300}
                      height={300}
                      className="nutri-template-image"
                      priority
                    />
                  </div>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                </div>
                <div className="nutri-card-footer">
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleTemplateSelect(option.id)}
                      disabled={isLoading}
                      className="nutri-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Loading..." : "Edit Template →"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            CUSTOM Template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="nutri-card">
              <div className="nutri-card-header">
                <h4 className="text-lg font-semibold">Upload Document</h4>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">
                  Upload a DOCX file with a custom template.
                </p>
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-nutrient-primary file:text-nutrient-secondary hover:file:bg-gray-800"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="nutri-card-footer">
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect("custom")}
                    disabled={!selectedFile || isLoading}
                    className="nutri-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Loading..." : "Upload & Edit Template →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
