# Nutrient Document Generator - Next.js

## Overview

This is a modern, production-ready document generation application built with Next.js 14+ and TypeScript that demonstrates the combined power of Nutrient's Document Authoring and Web SDKs. The application provides a 5-step wizard interface that guides users from template selection to final PDF generation, with full editing capabilities at every stage.

## ✨ Features

### 🎯 Complete Document Workflow

Transform templates into professional documents through an intuitive 5-step process:

1. **📋 Choose Template** - Select from predefined templates (Invoice, Checklist, Menu) or upload custom DOCX files
2. **🎨 Customize Template** - Edit template design and layout using the Document Authoring SDK
3. **📊 Add Data** - Provide and edit JSON data with syntax highlighting and live preview
4. **✏️ Preview & Edit** - Fine-tune the populated document with real-time editing
5. **📄 Download** - Generate and download your final PDF with perfect fidelity

### 🚀 Modern Technology Stack

- **Next.js 14+** with App Router
- **TypeScript** with strict type safety
- **Tailwind CSS** with custom Nutrient branding
- **React 18** with modern hooks and patterns
- **Nutrient Document Authoring SDK** for template and document editing
- **Nutrient Web SDK (PSPDFKit)** for document population and PDF generation
- **CodeMirror** for JSON editing with syntax highlighting

### 💼 Professional Features

- **Responsive Design** - Works seamlessly on desktop and mobile
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Memory Management** - Automatic cleanup of SDK instances
- **File Upload** - Drag & drop support for DOCX and JSON files
- **Live Preview** - Interactive and simple JSON data preview modes
- **Type Safety** - Full TypeScript coverage prevents runtime errors

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd document-generator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This automatically copies the Nutrient Web SDK files to `./public/web-sdk/`

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler check
```

## 🏗️ Architecture

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main wizard page (default route)
│   └── wizard/
│       ├── components/          # Wizard components
│       │   ├── StepIndicator.tsx    # Progress indicator
│       │   ├── StepNavigation.tsx   # Navigation controls
│       │   ├── StepContent.tsx      # Step content router
│       │   ├── WizardLayout.tsx     # Main layout wrapper
│       │   └── steps/              # Individual step components
│       │       ├── TemplateStep.tsx     # Template selection
│       │       ├── CustomizeStep.tsx    # Template editing
│       │       ├── DataStep.tsx         # Data editing
│       │       ├── PreviewStep.tsx      # Document preview/edit
│       │       └── DownloadStep.tsx     # PDF generation
│       └── context/
│           └── WizardContext.tsx    # Global state management
├── components/                   # Shared components
├── lib/                         # Utility functions
│   ├── utils.ts                # Helper functions
│   └── jsonTransformer.ts      # JSON display logic
├── types/                      # TypeScript definitions
│   └── index.ts               # Global type definitions
└── styles/                    # Tailwind CSS configuration

public/
├── assets/                    # Static images
├── templates/                 # DocJSON templates
├── data/                     # Sample JSON data
└── web-sdk/                  # Nutrient Web SDK files (auto-copied)
```

### Key Components

#### WizardContext

Central state management using React Context and useReducer:

- **Template Selection** - Manages selected templates and custom uploads
- **Document State** - Tracks all SDK instances and documents
- **Step Navigation** - Controls wizard flow and completion status
- **Error Handling** - Global error state management

#### Step Components

Each step is a self-contained React component:

- **Initialization** - SDK setup and document loading
- **Memory Management** - Automatic cleanup on unmount
- **Error Boundaries** - Graceful error handling
- **Type Safety** - Full TypeScript integration

#### JSON Data Features

- **Interactive Preview** - Expandable tree view with icons
- **Simple Preview** - Text-based hierarchical display
- **File Upload** - Drag & drop JSON files for custom templates
- **Syntax Highlighting** - CodeMirror with JSON validation
- **Red Null Values** - Visual attention for potential mistakes

## 🎨 UI/UX Features

### Design System

- **Tailwind CSS** with custom Nutrient color palette
- **Responsive Grid** layouts for all screen sizes
- **Interactive Elements** with hover states and transitions
- **Loading States** with spinners and progress indicators
- **Error States** with clear user feedback

### Accessibility

- **Screen Reader Support** with proper ARIA labels
- **Keyboard Navigation** for all interactive elements
- **Focus Management** with visible focus indicators
- **Semantic HTML** structure throughout

## 🔧 Technical Implementation

### Document Processing Flow

1. **Template Loading** - DocJSON from templates or DOCX import
2. **Template Editing** - Document Authoring SDK integration
3. **Data Preparation** - JSON editing with validation
4. **Document Population** - Web SDK template population
5. **Final Editing** - Document Authoring SDK for generated DOCX
6. **PDF Export** - High-fidelity PDF generation

### Memory Management

```typescript
useEffect(() => {
  // Component initialization
  initializeEditor();

  return () => {
    // Automatic cleanup
    if (editor) {
      editor.destroy();
    }
  };
}, []);
```

### Type Safety

All components use strict TypeScript with proper interfaces:

```typescript
interface WizardState {
  currentStep: number;
  templateDocument: DocAuthDocument | null;
  dataJson: TemplateData | null;
  // ... full type coverage
}
```

## 🔌 SDK Integration

### Document Authoring SDK

- **Template Creation** - Edit DocJSON templates
- **Document Editing** - Modify populated DOCX files
- **PDF Export** - Generate final PDFs

### Web SDK (PSPDFKit)

- **Template Population** - Fill templates with data
- **PDF Viewing** - Display generated PDFs
- **Memory Management** - Proper cleanup and unloading

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel with automatic Next.js detection
```

### Manual Deployment

```bash
npm run build
npm start
# Serve on your preferred hosting platform
```

### Environment Configuration

The application works out of the box with no additional environment variables required.

## 🧪 Development

### Code Quality

- **ESLint** - Code linting with Next.js rules
- **TypeScript** - Strict type checking
- **Prettier** - Code formatting (configurable)

### Best Practices

- **Component Isolation** - Each step is self-contained
- **Error Boundaries** - Graceful error handling
- **Memory Management** - Automatic SDK cleanup
- **Type Safety** - No `any` types in production code

## 📋 Browser Support

- **Chrome** 88+
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `npm run type-check`
5. Run linting: `npm run lint`
6. Submit a pull request

## 📄 License

This project demonstrates Nutrient SDK capabilities. Please respect the licensing terms for all dependencies:

- Next.js - MIT License
- Tailwind CSS - MIT License
- CodeMirror - MIT License
- Nutrient SDKs - Commercial License Required

## 🆘 Support

For technical support or questions about Nutrient SDKs:

- 📖 [Documentation](https://www.nutrient.io/sdk)
- 💬 [Support Portal](https://www.nutrient.io/support)
- 🐛 [Report Issues](https://github.com/your-repo/issues)

---

Built with ❤️ using Nutrient SDKs and modern web technologies.
