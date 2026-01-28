# Nutrient Signing Demo

A React-based signing demo application using Nutrient Viewer with custom widget overlays for PDF document signing workflows.

## Features

- 🖋️ **Interactive Signature Widgets** - Click-to-sign functionality
- 📝 **Editable Text Fields** - Double-click to edit text content
- 📅 **Date Picker Widgets** - Select dates with a calendar interface
- 🎯 **Drag & Drop** - Move widgets around in form creator mode
- 🎨 **Custom Widget Components** - Easily extensible widget system
- ⚡ **React Hook API** - Clean, reusable hook-based architecture

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open your browser to:** `http://localhost:3000`

The demo includes a sample PDF (`public/sample.pdf`) that will load automatically. To use your own PDF, simply replace `sample.pdf` with your document.

## Project Structure

```
├── src/
│   ├── main.jsx          # Vite entry point
│   ├── App.jsx           # Main demo component
│   └── index.css         # Global styles
├── hooks/
│   └── useNutrientViewer.js  # Custom hook for Nutrient Viewer
├── components/
│   ├── WidgetOverlay.jsx     # Base widget overlay component
│   ├── SignatureWidget.jsx  # Signature field component
│   ├── TextWidget.jsx        # Text input component
│   └── DateWidget.jsx        # Date picker component
├── public/
│   └── sample.pdf            # Sample PDF for demo (replace with your own)
├── index.html                # Vite HTML template
└── package.json              # Dependencies and scripts
```

## Usage

### Basic Hook Usage

```jsx
import { useNutrientViewer } from './hooks/useNutrientViewer';
import SignatureWidget from './components/SignatureWidget';

const MyApp = () => {
  const { containerRef, createWidget, isLoaded } = useNutrientViewer({
    document: "path/to/document.pdf",
    customWidgetComponent: SignatureWidget,
    onReady: (instance) => console.log("Ready!", instance)
  });

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
  );
};
```

### Creating Custom Widgets

```jsx
import WidgetOverlay from './WidgetOverlay';

const MyCustomWidget = ({ annotation, customData, onUpdate, onDelete }) => {
  const handleClick = () => {
    onUpdate({ myCustomField: "updated value" });
  };

  return (
    <WidgetOverlay
      annotation={annotation}
      customData={customData}
      onUpdate={onUpdate}
      onDelete={onDelete}
    >
      <div onClick={handleClick}>
        Custom Widget Content
      </div>
    </WidgetOverlay>
  );
};
```

### Hook API

```typescript
const {
  containerRef,        // Ref for PDF container
  instance,           // NutrientViewer instance
  isLoaded,           // Loading state
  selectedAnnotations, // Currently selected annotations
  currentMode,        // Current interaction mode
  isFormCreatorMode,  // Whether in form creator mode
  activeOverlays,     // Number of active overlays
  createWidget,       // Function to create widgets
  toggleFormCreator,  // Toggle form creator mode
} = useNutrientViewer(options);
```

### Hook Options

```typescript
useNutrientViewer({
  document: string,              // PDF document URL/path
  theme?: "DARK" | "LIGHT",     // Viewer theme
  styleSheets?: string[],        // Custom CSS files
  customWidgetComponent?: Component, // Custom widget component
  enableFormCreator?: boolean,   // Enable form creator toolbar
  onReady?: (instance) => void, // Callback when ready
})
```

## Widget Types

### Signature Widget
- Click to toggle signed/unsigned state
- Visual feedback with checkmark when signed
- Stores signature timestamp

### Text Widget
- Double-click to edit text content
- Inline text editing with save/cancel
- Supports multi-line text

### Date Widget
- Click to open date picker
- Formatted date display
- Stores ISO date string

## Demo Instructions

1. **Open Signing Controls** - Click the "Signing Controls" button in the sidebar dropdown menu
2. **Select Widget Type** - Choose from signature, text, or date widgets in the sidebar
3. **Create Widget** - Click "Create Widget" to add a new widget to the document
4. **Enter Editor Mode** - Click "Enter Editor" to enable drag & drop mode
5. **Interact with Widgets**:
   - Drag widgets to reposition them
   - Click signature widgets to sign
   - Double-click text widgets to edit
   - Click date widgets to select dates
6. **Delete Widgets** - Click the × button on any widget

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## Architecture

### SDK-Driven Design
- **Dynamic Field Types**: Field types are automatically detected from available `NutrientViewer.FormFields`
- **Flexible Widget Creation**: Uses FormField classes directly instead of hardcoded types
- **Extensible Configuration**: Easy to add new field types as they become available in the SDK

### Performance Optimizations
- **Memoized Field Configurations**: Field type detection is cached and reused
- **Debounced Validation**: Collision detection is optimized for smooth drag operations
- **Efficient Event Handling**: Minimal DOM updates and smart event delegation
- **Memory Management**: Automatic cleanup of event listeners and references

### Developer-Friendly Features
- **TypeScript-Ready**: Structured for easy TypeScript integration
- **Modular Architecture**: Separated concerns with dedicated utility modules
- **Comprehensive Error Handling**: Graceful degradation when SDK features are unavailable
- **Performance Monitoring**: Built-in performance tracking utilities

## Dependencies

- **React 18+** - UI framework
- **Vite** - Build tool and dev server
- **Nutrient Viewer** - PDF viewing and annotation (via CDN)

## Enhanced Features

### Advanced Field Types
The demo now supports all available NutrientViewer FormField types:
- **SignatureFormField**: Signature and Initials
- **TextFormField**: Text, Name, Email, Date (with format validation)
- **CheckBoxFormField**: Checkbox controls
- **RadioButtonFormField**: Radio button groups
- **ListBoxFormField**: Multi-select lists
- **ComboBoxFormField**: Dropdown selectors

### Collision Detection & Boundaries
- **8px Gap Enforcement**: Automatic spacing between widgets
- **Page Boundary Validation**: Widgets cannot be placed outside document edges
- **Real-time Collision Detection**: Prevents overlapping during drag, drop, and resize
- **Smooth User Experience**: Operations stop at boundaries without jarring movements

### Performance Features
- **Cached Field Configurations**: Reduces repeated SDK queries
- **Optimized Validation**: Efficient bounds checking with minimal overhead
- **Smart Event Handling**: Debounced and throttled operations where appropriate

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues related to:
- **Nutrient Viewer**: Check the [Nutrient documentation](https://docs.nutrient.io/)
- **This demo**: Open an issue in this repository