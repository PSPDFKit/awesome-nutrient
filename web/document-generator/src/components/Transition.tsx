"use client";

import type { TransitionProps } from "@/types";

export default function Transition({ isVisible, message }: TransitionProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutrient-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
      </div>
    </div>
  );
}
