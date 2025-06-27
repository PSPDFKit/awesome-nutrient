"use client";

import { useWizard } from "../context/wizard-context";
import CustomizeStep from "./steps/customize-step";
import DataStep from "./steps/data-step";
import DownloadStep from "./steps/download-step";
import PreviewStep from "./steps/preview-step";
import TemplateStep from "./steps/template-step";

export default function StepContent() {
  const { state } = useWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <TemplateStep />;
      case 1:
        return <CustomizeStep />;
      case 2:
        return <DataStep />;
      case 3:
        return <PreviewStep />;
      case 4:
        return <DownloadStep />;
      default:
        return <TemplateStep />;
    }
  };

  return (
    <div className="px-8 py-6 flex-1 flex flex-col min-h-[600px]">
      <div className="flex-1 flex flex-col">{renderStep()}</div>
    </div>
  );
}
