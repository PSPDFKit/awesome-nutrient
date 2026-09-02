## Nutrient Multi-Tab PDF Viewer
A modern, multi-tab PDF viewer application built with React and Nutrient (PSPDFKit) Web SDK. This application provides a browser-based PDF viewing experience similar to desktop PDF readers with support for multiple documents in tabs.

## 🌟 Features
Multi-Tab Interface - Open and manage multiple PDF documents simultaneously
Auto-Save - Automatically saves document changes to browser localStorage
Full Annotation Support - Complete annotation toolkit provided by Nutrient SDK
Persistent Storage - Documents and annotations persist across browser sessions
Clean UI - Modern, minimalist interface inspired by Apryse showcase
Responsive Design - Works seamlessly on desktop and tablet devices

## 📋 Prerequisites
- Node.js 20.17+ (20.x line) or 22.9+ with npm 11.10.0+
- Nutrient/PSPDFKit license key (optional for evaluation)
- Web browser (latest Chrome, Firefox, Edge, etc.)
- Internet access for CDN resources

## 🚀 Quick Start

1. Clone the repository
```
git clone nutrient-multi-tab-viewer
cd nutrient-multi-tab-viewer
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
```
Create a .env file in the root directory: 
VITE_lkey=YOUR_NUTRIENT_LICENSE_KEY
```
Note: The application works without a license key in evaluation mode with watermarks.

4. Run the development server
```
npm run dev
```
The application will be available at http://localhost:5174

## 📁 Project Structure
```
nutrient-multi-tab-viewer/
├── public/
├── src/
│   ├── components/
│   │   ├── pdf-viewer-component.jsx  # Core PDF viewer wrapper
│   │   └── tab-bar.jsx              # Tab navigation component
│   ├── app.jsx                      # Main application component
│   ├── app.css                      # Application styles
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles
├── index.html                       # HTML template
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Usage
Opening Documents

Click the "+" button in the tab bar
Select a PDF file from your computer
The document will open in a new tab

## Managing Tabs

Switch Tabs: Click on any tab to switch between documents
Close Tab: Click the "×" button on a tab to close it
Save Changes: When closing a tab, you'll be prompted to save changes

## Demo:
https://github.com/user-attachments/assets/cf4fafae-3a69-432f-a480-536c2ab21b0a

### Data Persistence
All documents and annotations are automatically saved to browser localStorage
Documents persist across browser sessions
Each document maintains its own save state

## 🛠️ Configuration
### Customizing the Viewer
- Edit src/components/pdf-viewer-component.jsx to customize Nutrient viewer options:
```
javascriptCopyinstance = await NutrientViewer.load({
  container: containerRef.current,
  document: loadUrl,
  licenseKey: import.meta.env.VITE_lkey,
  // Add custom configuration here
  toolbarItems: [...],
  initialViewState: {...},
  theme: "dark" // or "light"
});
```

### Styling
Modify src/app.css to customize the application appearance:

### Tab colors and sizes
- Background colors
- Font styles
- Responsive breakpoints

## 🏗️ Building for Production
```
npm run build
```

This creates an optimized production build in the dist folder.
Preview Production Build
```
npm run preview
```

## 🔧 Troubleshooting
#### Document not loading
- Ensure the PDF file is not corrupted
- Check browser console for errors
- Verify Nutrient SDK is loaded correctly

#### License key issues
- Verify your license key is correctly set in .env
- localStorage quota exceeded
- Clear old documents from localStorage
- Implement a document limit or cleanup strategy

## 📦 Technologies Used

- React - UI framework
- Vite - Build tool and dev server
- Nutrient Web SDK
- CSS3 - Styling and animations

## 🙏 Acknowledgments

- Nutrient engineering team for the powerful Web SDK
- React team for the excellent framework

## 📞 Support
- [For issues and questions](https://support.nutrient.io/hc/en-us/requests/new)
- [Check Nutrient documentation](https://www.nutrient.io/guides/web/)

Note: This application requires a valid Nutrient license for production use. 
Visit nutrient.io and [contact sales team](https://www.nutrient.io/contact-sales?=sdk) for licensing information.

## Author
[Narashiman](https://www.linkedin.com/in/narashimank/)
