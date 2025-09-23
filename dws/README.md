# Secure PDF Viewer with Table Extraction

A modern React application built with Vite that demonstrates secure PDF viewing and table extraction capabilities using Nutrient DWS (Document Web Service) APIs. This example shows how to build a production-ready PDF viewer with advanced document processing features while keeping API keys secure on the server side.

## 🌟 Features

- **Secure PDF Viewing**: Server-side API key management with session tokens
- **Multiple Upload Methods**: Upload files directly or from URLs
- **Table Extraction**: Convert PDF tables to Excel format using Nutrient Processor API
- **Real-time Processing**: Job status tracking and progress updates
- **Modern UI**: Clean, responsive interface built with React
- **Document Support**: PDF, Word (.docx), PowerPoint (.pptx), and Excel (.xlsx) files
- **Full Annotation Support**: Complete annotation toolkit from Nutrient Web SDK

## 📋 Prerequisites

Before running this example, you'll need:

- Node.js (v16 or higher)
- npm or yarn package manager
- Two Nutrient DWS API keys:
  - **Viewer API Key**: For document viewing and session management
  - **Processor API Key**: For table extraction and document conversion
- Modern web browser (Chrome, Firefox, Edge, etc.)

## 🔑 Getting API Keys

1. Visit [Nutrient API Portal](https://api.nutrient.io/)
2. Sign up for a free account or log in
3. Create two API keys:
   - One for the **DWS Viewer API**
   - One for the **DWS Processor API**
4. Copy both API keys - you'll need them in the next step

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd awesome-nutrient/dws
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

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

⚠️ **Important**: Never commit your `.env` file to version control. API keys should be kept secret.

### 4. Run the Application

Start both the backend server and frontend development server:

```bash
npm run dev:full
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5174`

The application will automatically open in your browser.

## 📁 Project Structure

```
dws/
├── public/                 # Static assets
├── server/                 # Express.js backend
│   └── index.js           # Main server file with API endpoints
├── src/                   # React frontend source
│   ├── components/
│   │   └── PDFViewer.jsx  # PDF viewer component
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── package.json          # Project dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md            # This file
```

## 🎯 How to Use

### Uploading Documents

1. **File Upload**: Click "Choose File to Upload" and select a document from your computer
2. **URL Upload**: Enter a document URL in the input field and click "Upload from URL"

Supported formats: PDF, DOCX, PPTX, XLSX

### Viewing Documents

Once uploaded, documents will appear in the viewer with full functionality:
- Zoom in/out
- Navigate pages
- Add annotations
- Search text
- Print document

### Extracting Tables

1. After uploading a PDF document, click "Extract Tables to Excel"
2. Monitor the job progress in the status panel
3. When complete, click "Download Excel File" to get the extracted tables

## 🔧 API Endpoints

The backend server provides these endpoints:

- `GET /api/health` - Server health check
- `POST /api/upload-and-create-session` - Upload file and create viewer session
- `POST /api/upload-from-url` - Upload document from URL
- `POST /api/convert-to-excel` - Start table extraction job
- `GET /api/job-status/:jobId` - Check job processing status
- `GET /api/download/:jobId` - Download processed Excel file

## 🛡️ Security Features

- **API Key Protection**: All API keys are stored server-side only
- **Session Tokens**: Temporary, expiring tokens for viewer access
- **CORS Configuration**: Controlled cross-origin access
- **File Validation**: Server-side file type and size validation
- **Secure Upload**: Temporary file storage with automatic cleanup

## 🎨 Customization

### Viewer Configuration

Modify `src/components/PDFViewer.jsx` to customize the viewer:

```javascript
const instance = await window.NutrientViewer.load({
  container: containerRef.current,
  sessionToken: sessionToken,
  baseUrl: 'https://api.nutrient.io/',
  theme: 'light', // or 'dark'
  toolbarItems: [
    'sidebar-thumbnails',
    'pager',
    'zoom-mode',
    // Add or remove toolbar items
  ],
  // Add more configuration options
})
```

### Styling

Update `src/App.css` to modify the application appearance:
- Colors and themes
- Layout and spacing
- Responsive breakpoints
- Component styling

### Server Configuration

Modify `server/index.js` to:
- Add custom endpoints
- Implement additional security measures
- Add file processing logic
- Configure CORS settings

## 🏗️ Building for Production

### Build Frontend

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy

1. Build the frontend assets
2. Deploy the `dist/` folder to your static hosting service
3. Deploy the `server/` folder to your Node.js hosting service
4. Configure environment variables on your hosting platform
5. Update API endpoint URLs if needed

## 🔧 Troubleshooting

### Common Issues

**Document not loading**
- Verify your API keys are correct in `.env`
- Check browser console for errors
- Ensure the document format is supported

**Upload failures**
- Check file size limits (default: server dependent)
- Verify internet connection for URL uploads
- Confirm file permissions

**Table extraction not working**
- Ensure document contains recognizable tables
- Check Processor API key is valid
- Monitor job status for detailed error messages

**Session token errors**
- API keys might be incorrect or expired
- Check viewer API key permissions
- Verify server is running properly

### Development Tips

1. **Check server logs**: The backend server logs all API requests and errors
2. **Browser DevTools**: Use Network tab to inspect API calls
3. **Status Panel**: Monitor the status panel for real-time feedback
4. **Environment**: Ensure `.env` file is in the project root

## 📦 Dependencies

### Frontend
- **React 19.1.0**: UI framework
- **Vite**: Build tool and development server
- **react-icons**: Icon components
- **Nutrient Web SDK**: PDF viewing and annotation

### Backend
- **Express.js**: Web server framework
- **CORS**: Cross-origin resource sharing
- **Multer**: File upload handling
- **node-fetch**: HTTP client for API calls
- **dotenv**: Environment variable management

## 🙏 Acknowledgments

- [Nutrient](https://www.nutrient.io/) for providing the powerful DWS APIs
- React team for the excellent development framework
- Vite team for the fast build tool

## 📞 Support

- [Nutrient Support Center](https://support.nutrient.io/hc/en-us/requests/new)
- [Nutrient Documentation](https://www.nutrient.io/guides/web/)
- [DWS API Documentation](https://www.nutrient.io/api/)

## 📄 License

This example is provided for educational and demonstration purposes. For production use, you'll need appropriate Nutrient licensing.

## 🤝 Contributing

This example is part of the [awesome-nutrient](https://github.com/nutrient-io/awesome-nutrient) repository. Contributions are welcome!

---

**Note**: This application requires valid Nutrient DWS API keys for full functionality. Visit [nutrient.io](https://www.nutrient.io/contact-sales) for licensing information.