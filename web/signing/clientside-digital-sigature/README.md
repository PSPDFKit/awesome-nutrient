# Nutrient PDF Viewer with Digital Signatures
This project provides a React-based PDF viewer application that allows users to view PDF documents and add digital signatures using PSPDFKit. Built with Vite and React, it features client-side digital signature capabilities for secure document processing.

## 📌 Features

PDF Viewing: Load and display PDF documents with a modern interface.
Digital Signatures: Sign PDFs using secure PKCS7 digital signatures.
File Upload: Open and view different PDF documents using a file picker.
Real-Time Validation: Automatically display digital signature status.
Custom Toolbar: Access a dedicated "Digitally Sign" button for signing documents.
Secure Signing: Implements secure hash-based signing using SHA-256.

## 🚀 Getting Started

Prerequisites
Ensure you have the following installed:
```
Node.js 20.17+ (20.x line) or 22.9+ with npm 11.10.0+
A valid PSPDFKit license key (trial or full version)
```

## 📥 Installation

Clone the Repository
```
git clone https://github.com/PSPDFKit/awesome-nutrient.git
cd web/signing/clientside-digital-sigature
```

Install Dependencies
```
npm install
# or
yarn install
```

## 🔧 Configuration

- Default PDF:
  - The application loads with a default PDF document ("Good.pdf") located in the public folder.
- Environment Variables:
  - Create a .env file in the root directory and add:
```
VITE_lkey=your_pspdfkit_license_key
```

## 📂 Project Structure

```
Nutrient PDF Viewer with Digital Signatures/
│── public/
│   ├── download.pdf                # Default PDF file (optional)
│── src/
│   ├── components/
│   │   ├── nutrient-pdf-viewer.jsx   # PDF viewer with digital signature integration
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Application styling
│   ├── index.css
│   ├── main.jsx
│── .env                        # Environment variables
│── index.html
│── package.json                # Project dependencies
│── README.md                   # This README file
│── vite.config.js
```

## 🚀 Running the Application

Start the development server with:
```
npm run dev
# or
yarn dev
```
This will launch the app in your default browser at:
http://localhost:3000

## 📖 How It Works

- Load PDF:
  - The default "Good.pdf" is loaded on startup. You can use the file picker to load another document.
- Digital Signature Workflow:
  - Document Hashing: The PDF is hashed using SHA-256.
  - PKCS7 Signature Generation: A digital signature is created using the PKCS7 standard.
  - Server-Side Validation: The signature is sent to a /sign endpoint for processing.
  - Real-Time Feedback: The signature validation status is displayed immediately.
  - ![Web SDK digital sign using singing service](https://github.com/user-attachments/assets/b56bfe04-2364-4f85-84a8-f587ce6ff549)

## 🔧 Customization

To customize the digital signing process or toolbar settings, modify the nutrientpdfviewer.jsx component. Adjust the signing callback, toolbar items, or any other behavior to meet your needs.

### License
This project requires a valid PSPDFKit license. Please ensure you have the appropriate licensing before use.

### Contributing
Contributions are welcome! Please ensure you have signed our CLA before submitting any pull requests.

### Support, Issues and License Questions
For support or any questions, please file an issue in the repository or contact the development team.

### About
The Nutrient PDF Viewer with Digital Signatures integrates PSPDFKit for advanced PDF functionalities, including viewing, digital signing, and secure document processing. It is designed to provide a robust and user-friendly interface for managing and signing PDF documents.

### Author
Narashiman Krishnamurthy
