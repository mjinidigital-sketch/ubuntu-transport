"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormWizardProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLastStep: boolean;
  canNext: boolean;
  children: ReactNode;
  isLoading?: boolean;
}

export function FormWizard({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isLastStep,
  canNext,
  children,
  isLoading = false,
}: FormWizardProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6 px-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-card">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {isLastStep ? (
          <Button type="button" onClick={onSubmit} disabled={!canNext || isLoading}>
            {isLoading ? "Saving..." : "Submit"}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={!canNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
