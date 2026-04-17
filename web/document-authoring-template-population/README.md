# Document Authoring Template Data Population

A TypeScript library for applying template data to [Nutrient Document Authoring](https://www.nutrient.io/sdk/document-authoring/) documents. Populate DOCX templates with dynamic data using a Mustache-like syntax for placeholders, loops, and conditionals.

## Features

- **📝 Simple Placeholders** - Replace `{{variable}}` with data values
- **🔄 Loops** - Duplicate content for arrays using `{{#array}}...{{/array}}`
- **✅ Conditionals** - Show/hide content with `{{#condition}}...{{/condition}}`
- **❌ Negated Conditionals** - Invert conditions with `{{^condition}}...{{/condition}}`
- **📊 Table Support** - Automatically duplicate table rows for array data
- **⚙️ Custom Delimiters** - Configure your own placeholder syntax
- **🎨 Formatting Preservation** - Maintains text formatting (bold, italic, fonts, etc.)
- **🔧 TypeScript** - Full type safety and IDE autocomplete

## Prerequisites

- Node.js 18 or later
- A Nutrient Document Authoring license key (optional - will show watermark without one)

## Getting Started

### Installation

```bash
npm install
```

### Running the Demo

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Example

```typescript
import { applyTemplateData } from './src/index.ts';

// Your template data
const templateData = {
  config: {
    delimiter: { start: '{{', end: '}}' },
    defaultValue: ''
  },
  model: {
    customerName: 'Acme Corporation',
    invoiceNumber: 'INV-2024-001',
    total: '$12,420.00',
    lineItems: [
      { description: 'Web Development', quantity: '40', amount: '$6,000.00' },
      { description: 'UI/UX Design', quantity: '20', amount: '$3,500.00' }
    ]
  }
};

// Apply template data to an open document
await applyTemplateData(docInstance, templateData);
```

### Template Syntax

#### Simple Placeholders

Replace with a value from your data model:

```
Invoice Number: {{invoiceNumber}}
Customer: {{customerName}}
Total: {{total}}
```

#### Loops

Duplicate content for each item in an array:

```
{{#lineItems}}
- {{description}}: {{amount}}
{{/lineItems}}
```

For tables, the loop duplicates rows:

```
| Description | Quantity | Amount |
|-------------|----------|--------|
| {{#lineItems}}{{description}} | {{quantity}} | {{amount}}{{/lineItems}} |
```

#### Conditionals

Show content only if a condition is true:

```
{{#showDiscount}}
*** SPECIAL DISCOUNT APPLIED ***
Discount: {{discountAmount}}
{{/showDiscount}}
```

#### Negated Conditionals

Show content only if a condition is false:

```
{{^isPaid}}
*** PAYMENT DUE ***
Please pay by {{dueDate}}
{{/isPaid}}
```

## Project Structure

```
document-authoring-template-population/
├── src/
│   ├── index.ts                     # Main library export
│   ├── lib/
│   │   ├── DocumentTemplating.ts    # Core templating engine
│   │   ├── parser/
│   │   │   └── TemplateParser.ts    # Placeholder parsing
│   │   ├── processors/
│   │   │   ├── PlaceholderReplacer.ts  # {{variable}} replacement
│   │   │   ├── ConditionalProcessor.ts # Conditional logic
│   │   │   └── LoopProcessor.ts        # Array loop handling
│   │   └── utils/
│   │       ├── DataResolver.ts      # Data access utilities
│   │       └── ValidatorUtil.ts     # Validation helpers
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── index.html                       # Demo application
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md
```

## How It Works

The library processes templates in three phases:

1. **Loop Processing** - Duplicates content (including table rows) for array data
2. **Conditional Processing** - Shows or hides content based on boolean values
3. **Placeholder Replacement** - Replaces simple `{{variable}}` placeholders with values

All operations happen within a Document Authoring transaction for atomic updates.

### Table Row Duplication

When a loop (`{{#array}}...{{/array}}`) is detected in a table row:

1. The library identifies the template row
2. Creates new rows for each array item
3. Replaces placeholders in each row with item data
4. Preserves text formatting (font, size, bold, etc.)
5. Removes the template row

**Note:** Cell-level formatting (borders, backgrounds) uses default styling as the Document Authoring API doesn't currently expose methods to copy these properties.

## API Reference

### `applyTemplateData(instance, data, options?)`

Applies template data to a Document Authoring instance.

**Parameters:**
- `instance` - The Document Authoring document instance
- `data` - Template data object containing:
  - `config.delimiter` - Placeholder delimiters (default: `{{ }}`)
  - `config.defaultValue` - Value for missing data (default: `''`)
  - `model` - Your data object
- `options` - Optional configuration (currently unused)

**Returns:** `Promise<void>`

**Example:**

```typescript
const data = {
  config: {
    delimiter: { start: '{{', end: '}}' },
    defaultValue: 'N/A'
  },
  model: {
    name: 'John Doe',
    items: [...]
  }
};

await applyTemplateData(doc, data);
```

## Customization

### Custom Delimiters

Use different placeholder syntax:

```typescript
const data = {
  config: {
    delimiter: { start: '[[', end: ']]' }  // Use [[variable]] instead
  },
  model: { ... }
};
```

### Default Values

Set a fallback for missing data:

```typescript
const data = {
  config: {
    defaultValue: 'N/A'  // Show 'N/A' instead of empty string
  },
  model: { ... }
};
```

## Known Limitations

- **Table Formatting**: New rows created by loops will have default borders/backgrounds as the API doesn't expose cell formatting properties
- **Nested Loops**: Not currently supported
- **Complex Expressions**: Only simple value lookups are supported (no calculations or filters)

## License

This example is licensed under the MIT License.

## Support

For issues with this example:
- Create an issue in the [awesome-nutrient repository](https://github.com/PSPDFKit/awesome-nutrient/issues)

For Nutrient Document Authoring SDK support:
- Visit [Nutrient Support](https://www.nutrient.io/support/)
- Check the [Document Authoring documentation](https://www.nutrient.io/guides/document-authoring/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
