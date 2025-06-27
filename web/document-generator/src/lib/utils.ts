import { TemplateData, TemplateType } from '@/types';

export const fetchTemplateData = async (
  template: TemplateType
): Promise<TemplateData> => {
  const response = await fetch(`/data/${template}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch template data for ${template}`);
  }
  return response.json();
};

export const fetchTemplateJson = async (
  template: TemplateType
): Promise<unknown> => {
  const response = await fetch(`/templates/${template}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch template JSON for ${template}`);
  }
  return response.json();
};

export const downloadPdf = (
  blob: Blob,
  filename: string = 'document.pdf'
): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const validateJsonString = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

export const classNames = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};
