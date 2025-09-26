# Secure PDF viewer with table extraction

A modern React application built with Vite that demonstrates secure PDF viewing and table extraction capabilities using Nutrient DWS (Document Web Service) APIs. This example shows how to build a production-ready PDF viewer with advanced document processing features while keeping API keys secure on the server side.

## Features

- **Secure PDF viewing** — Server-side API key management with session tokens
- **Table extraction** — Convert PDF tables to Excel format using Nutrient Processor API
- **Real-time processing** — Job status tracking and progress updates
- **Modern UI** — Clean, responsive interface built with React
- **Document support** — PDF, Word (.docx), PowerPoint (.pptx), and Excel (.xlsx) files
- **Full annotation support** — Complete annotation toolkit from Nutrient Web SDK

## Prerequisites

Before running this example, you'll need:

- Node.js (v16 or higher)
- npm or yarn package manager
- Two Nutrient DWS API keys:
  - **Viewer API key** — For document viewing and session management
  - **Processor API key** — For table extraction and document conversion
- Modern web browser (Chrome, Firefox, Edge, etc.)

## Getting API keys

1. Visit [Nutrient API Portal](https://api.nutrient.io/)
2. Sign up for a free account or log in
3. Create two API keys:
   - One for the **DWS Viewer API**
   - One for the **DWS Processor API**
4. Copy both API keys - you’ll need them in the next step

## Getting started

### 1. Clone and navigate

```bash
git clone https://github.com/PSPDFKit/awesome-nutrient
cd awesome-nutrient/dws
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# Nutrient DWS API Keys
NUTRIENT_DWS_VIEWER_API_KEY=your_viewer_api_key_here
NUTRIENT_DWS_PROCESSOR_API_KEY=your_processor_api_key_here

# Server Configuration
PORT=3001
```

**Important** — Never commit your `.env` file to version control. API keys should be kept secret.

### 4. Run the application

Start both the backend server and frontend development server:

```bash
npm run dev:full
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5174`

The application will automatically open in your browser.

## How to use

### Uploading documents

Click "Upload File" and select a document from your computer.

Supported formats: PDF, DOCX, PPTX, XLSX

### Viewing documents

Once uploaded, documents will appear in the viewer with full functionality:
- Zoom in/out
- Navigate pages
- Add annotations
- Search text
- Print document

### Extracting tables

1. After uploading a PDF document, click "Export to Excel"
2. Monitor the job progress in the status panel
3. Once completed, the extracted Excel file downloads automatically.

## Additional resources

- [Nutrient Support Center](https://support.nutrient.io/hc/en-us/requests/new)
- [Nutrient Web SDK getting started guide](https://www.nutrient.io/sdk/web/getting-started/react-vite/)
- [Nutrient DWS API example guide](https://www.nutrient.io/api/viewer-api/documentation/examples/build-secure-pdf-viewers-with-table-extraction/)

## Support

Nutrient offers support for customers with an active SDK license via [Nutrient Support](https://www.nutrient.io/support/request/).

Are you [evaluating our SDK](https://www.nutrient.io/sdk/try)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our [sales form](https://www.nutrient.io/contact-sales/).

## License

This project is licensed under the BSD license. See the LICENSE file for more details.

## Contributing

Please ensure you have signed our CLA so that we can accept your contributions.
