import { StepType } from '@/types';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public step?: StepType,
    public details?: unknown,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // Template related errors
  TEMPLATE_LOAD_FAILED: 'TEMPLATE_LOAD_FAILED',
  TEMPLATE_PARSE_FAILED: 'TEMPLATE_PARSE_FAILED',
  TEMPLATE_EDITOR_INIT_FAILED: 'TEMPLATE_EDITOR_INIT_FAILED',

  // Data related errors
  DATA_INVALID_JSON: 'DATA_INVALID_JSON',
  DATA_EDITOR_INIT_FAILED: 'DATA_EDITOR_INIT_FAILED',
  DATA_LOAD_FAILED: 'DATA_LOAD_FAILED',

  // Document related errors
  DOCX_GENERATION_FAILED: 'DOCX_GENERATION_FAILED',
  DOCX_EDITOR_INIT_FAILED: 'DOCX_EDITOR_INIT_FAILED',
  PDF_GENERATION_FAILED: 'PDF_GENERATION_FAILED',
  PDF_VIEWER_INIT_FAILED: 'PDF_VIEWER_INIT_FAILED',

  // File related errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_READ_FAILED: 'FILE_READ_FAILED',

  // SDK related errors
  SDK_NOT_LOADED: 'SDK_NOT_LOADED',
  SDK_INIT_FAILED: 'SDK_INIT_FAILED',
  SDK_OPERATION_FAILED: 'SDK_OPERATION_FAILED',

  // Network related errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  FETCH_FAILED: 'FETCH_FAILED',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.TEMPLATE_LOAD_FAILED]:
    'Failed to load template. Please try again or select a different template.',
  [ErrorCodes.TEMPLATE_PARSE_FAILED]:
    'Template format is invalid. Please check the template file and try again.',
  [ErrorCodes.TEMPLATE_EDITOR_INIT_FAILED]:
    'Failed to initialize template editor. Please refresh the page and try again.',

  [ErrorCodes.DATA_INVALID_JSON]:
    'JSON data is invalid. Please check the syntax and try again.',
  [ErrorCodes.DATA_EDITOR_INIT_FAILED]:
    'Failed to initialize data editor. Please refresh the page and try again.',
  [ErrorCodes.DATA_LOAD_FAILED]:
    'Failed to load data. Please check the data file and try again.',

  [ErrorCodes.DOCX_GENERATION_FAILED]:
    'Failed to generate DOCX document. Please check your template and data.',
  [ErrorCodes.DOCX_EDITOR_INIT_FAILED]:
    'Failed to initialize document editor. Please try again.',
  [ErrorCodes.PDF_GENERATION_FAILED]:
    'Failed to generate PDF. Please try again.',
  [ErrorCodes.PDF_VIEWER_INIT_FAILED]:
    'Failed to initialize PDF viewer. Please refresh the page and try again.',

  [ErrorCodes.FILE_TOO_LARGE]:
    'File size is too large. Please select a file smaller than 10MB.',
  [ErrorCodes.FILE_INVALID_TYPE]:
    'Invalid file type. Please select a valid file.',
  [ErrorCodes.FILE_READ_FAILED]:
    'Failed to read file. Please try selecting the file again.',

  [ErrorCodes.SDK_NOT_LOADED]:
    'Required libraries are not loaded. Please refresh the page and try again.',
  [ErrorCodes.SDK_INIT_FAILED]:
    'Failed to initialize document processing libraries. Please refresh the page.',
  [ErrorCodes.SDK_OPERATION_FAILED]:
    'Document operation failed. Please try again.',

  [ErrorCodes.NETWORK_ERROR]:
    'Network connection error. Please check your internet connection and try again.',
  [ErrorCodes.FETCH_FAILED]:
    'Failed to fetch data. Please check your connection and try again.',

  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCodes.VALIDATION_ERROR]:
    'Validation failed. Please check your input and try again.',
};

export function createAppError(
  code: ErrorCode,
  step?: StepType,
  details?: unknown,
  customMessage?: string,
  recoverable: boolean = true
): AppError {
  const message = customMessage || ErrorMessages[code];
  return new AppError(message, code, step, details, recoverable);
}

export function handleError(
  error: unknown,
  context?: string,
  step?: StepType
): AppError {
  console.error(`Error in ${context || 'unknown context'}:`, error);

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Try to categorize common errors
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return createAppError(ErrorCodes.NETWORK_ERROR, step, error);
    }

    if (errorMessage.includes('json') || errorMessage.includes('parse')) {
      return createAppError(ErrorCodes.DATA_INVALID_JSON, step, error);
    }

    if (errorMessage.includes('file') || errorMessage.includes('read')) {
      return createAppError(ErrorCodes.FILE_READ_FAILED, step, error);
    }

    if (
      errorMessage.includes('sdk') ||
      errorMessage.includes('pspdfkit') ||
      errorMessage.includes('docauth')
    ) {
      return createAppError(ErrorCodes.SDK_OPERATION_FAILED, step, error);
    }

    // Default to unknown error with original message
    return createAppError(ErrorCodes.UNKNOWN_ERROR, step, error, error.message);
  }

  // Handle non-Error objects
  const message =
    typeof error === 'string' ? error : 'An unexpected error occurred';
  return createAppError(ErrorCodes.UNKNOWN_ERROR, step, error, message);
}

export function getRetryMessage(error: AppError): string | null {
  if (!error.recoverable) {
    return null;
  }

  switch (error.code) {
    case ErrorCodes.NETWORK_ERROR:
    case ErrorCodes.FETCH_FAILED:
      return 'Check your internet connection and try again';

    case ErrorCodes.SDK_INIT_FAILED:
    case ErrorCodes.SDK_NOT_LOADED:
      return 'Refresh the page and try again';

    case ErrorCodes.TEMPLATE_EDITOR_INIT_FAILED:
    case ErrorCodes.DATA_EDITOR_INIT_FAILED:
    case ErrorCodes.DOCX_EDITOR_INIT_FAILED:
    case ErrorCodes.PDF_VIEWER_INIT_FAILED:
      return 'Try selecting a different template or refresh the page';

    case ErrorCodes.FILE_READ_FAILED:
      return 'Try selecting the file again';

    default:
      return 'Try again';
  }
}

export function shouldShowDetails(error: AppError): boolean {
  // Show details for development or specific error types
  const detailsErrorCodes: ErrorCode[] = [
    ErrorCodes.DATA_INVALID_JSON,
    ErrorCodes.VALIDATION_ERROR,
  ];

  return (
    process.env.NODE_ENV === 'development' ||
    detailsErrorCodes.includes(error.code as ErrorCode)
  );
}
