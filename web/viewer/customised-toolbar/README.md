# Nutrient PDF Viewer & Annotation App

A modern, feature-rich PDF viewer and annotation application built with Next.js 15 and powered by the Nutrient Viewer SDK. This application provides a comprehensive toolkit for viewing, annotating, and comparing PDF documents directly in the browser.

## Features

### PDF Viewing & Annotation
- **Drag-and-drop PDF upload** with file validation
- **Comprehensive annotation toolkit** including:
  - Text annotations and highlights
  - Sticky notes for comments
  - Freehand drawing with ink tool
  - Shape tools (lines, rectangles, ellipses, polygons, cloudy polygons)
  - Measurement tools with customizable units
  - Selection tool for managing annotations

### Advanced Capabilities
- **Document Comparison Mode**: Compare two PDF drawings overlapped with visual highlighting and customizable blend modes
- **12 Blend Modes**: Normal, Multiply, Screen, Overlay, Darken, Lighten, Color Dodge, Color Burn, Hard Light, Soft Light, Difference, and Exclusion
- **NoZoom Annotations**: Keep text and stamp annotations at fixed size regardless of zoom level
- **Zoom Controls**: Intuitive zoom in/out functionality for detailed viewing
- **Theme Support**: Automatic light/dark mode based on system preferences
- **Sample PDF Access**: Quick-start with included sample drawing file

### User Experience
- Clean, scrollable vertical toolbar with all tools accessible
- Responsive design that works on various screen sizes
- Real-time visual feedback on active tools
- Modal-based configuration for comparison settings
- Error handling with user-friendly messages

## Tech Stack

- **Framework**: [Next.js 15.3.5](https://nextjs.org) with App Router
- **UI Library**: [React 19.0.0](https://react.dev)
- **Build Tool**: Turbopack (Next.js's Rust-based bundler)
- **PDF Engine**: [Nutrient Viewer SDK 1.7.0](https://nutrient.io)
- **Styling**: CSS with CSS custom properties for theming

## Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- A Nutrient Viewer license key (optional, for removing watermark)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sample-nutrient-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Nutrient Viewer license key (optional):

```env
NEXT_PUBLIC_NUTRIENT_LICENSE_KEY=your_license_key_here
```

> **Note**: The application will work without a license key but will display a watermark. Get a free trial license at [nutrient.io](https://nutrient.io).

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Uploading a PDF

1. **Drag and drop** a PDF file onto the upload zone, or **click to browse** and select a file
2. Alternatively, click **"Use Sample PDF"** to quickly test with the included drawing file
3. Toggle **"Enable NoZoom"** if you want text annotations to stay fixed size when zooming

### Adding Annotations

1. Select a tool from the vertical toolbar on the left
2. Click or drag on the PDF canvas to create annotations
3. Use the **Select** tool to move, resize, or delete existing annotations
4. Active tools are highlighted with a colored background

### Comparing Documents

1. Click the **Compare** icon in the toolbar
2. Upload a second PDF document in the comparison modal
3. Configure comparison settings:
   - **Opacity**: Adjust transparency of the overlay (0-100%)
   - **Color**: Choose the highlight color
   - **Blend Mode**: Select from 12 different blend modes
4. Click **"Start Comparison"** to view both documents overlaid

### Zoom Controls

- Click **Zoom In** (+) to increase magnification
- Click **Zoom Out** (-) to decrease magnification
- NoZoom annotations maintain their size during zoom operations

### Keyboard Shortcuts

The Nutrient Viewer SDK provides built-in keyboard shortcuts:
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Delete/Backspace`: Delete selected annotation
- `Escape`: Deselect current tool

## Project Structure

```
sample-nutrient-app/
├── app/
│   ├── layout.js              # Root layout, loads Nutrient SDK
│   ├── page.js                # Main entry component
│   ├── globals.css            # Global styles and theme variables
│   ├── page.module.css        # Page-specific styles
│   └── components/
│       ├── PDFUpload.js       # File upload interface
│       └── PDFViewer.js       # PDF viewer and annotation logic
├── public/
│   ├── Drawing1.pdf           # Sample PDF for testing
│   └── icons/                 # SVG icons for toolbar
├── .env.example               # Environment variable template
├── package.json               # Dependencies and scripts
├── next.config.mjs            # Next.js configuration
└── jsconfig.json              # Path alias configuration
```

## Available Scripts

### Development

```bash
npm run dev
```

Starts the development server with hot-reload at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `.next` folder.

### Start Production Server

```bash
npm start
```

Runs the production server (requires running `npm run build` first).

### Lint Code

```bash
npm run lint
```

Runs Next.js's built-in ESLint configuration to check code quality.

## Customization

### Adding New Annotation Tools

Edit [app/components/PDFViewer.js](app/components/PDFViewer.js) and add tools to the `tools` array:

```javascript
const tools = [
  // ... existing tools
  {
    id: 'custom-tool',
    mode: PSPDFKit.InteractionMode.YOUR_MODE,
    icon: '/icons/your-icon.svg',
    label: 'Your Tool'
  }
];
```

### Changing Theme Colors

Modify CSS custom properties in [app/globals.css](app/globals.css):

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary-color: #0070f3;
  /* ... more variables */
}
```

### Customizing Blend Modes

Edit the `blendModes` array in [app/components/PDFViewer.js](app/components/PDFViewer.js#L31):

```javascript
const blendModes = [
  'normal', 'multiply', 'screen', 'overlay',
  // ... add or remove modes
];
```

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import the repository in Vercel
3. Add your `NEXT_PUBLIC_NUTRIENT_LICENSE_KEY` environment variable
4. Deploy

### Deploy to Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:

- **Netlify**: Use the Next.js build plugin
- **AWS Amplify**: Connect your Git repository
- **Docker**: Create a Dockerfile with `next build` and `next start`
- **Self-hosted**: Run `npm run build && npm start` on your server

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for detailed platform-specific instructions.

## Browser Support

This application requires a modern browser with WebAssembly support:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Opera 76+

## Troubleshooting

### PDF Not Loading

- **Check browser console** for errors
- Ensure the PDF file is valid and not corrupted
- Verify the Nutrient SDK loaded successfully (check Network tab)
- Try with the included sample PDF first

### License Key Issues

- Verify the key is correctly set in `.env` as `NEXT_PUBLIC_NUTRIENT_LICENSE_KEY`
- Restart the development server after adding environment variables
- Check that the key hasn't expired or exceeded usage limits

### Comparison Mode Not Working

- Ensure both PDFs are valid and loaded successfully
- Try different blend modes if the differences aren't visible
- Adjust opacity to make overlay effects more apparent
- Check browser console for WebGL errors

### Build Errors

- Clear the `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure you're using Node.js 18.17 or later: `node --version`

## Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - comprehensive Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - interactive Next.js tutorial
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

### Nutrient Resources

- [Nutrient Viewer Documentation](https://nutrient.io/guides/web/)
- [API Reference](https://nutrient.io/api/web/)
- [Annotation Types](https://nutrient.io/guides/web/annotations/)
- [Configuration Options](https://nutrient.io/guides/web/configuration/)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is provided as a sample/demo application. Please review the [Nutrient licensing terms](https://nutrient.io/pricing/) for the Nutrient Viewer SDK usage.

## Acknowledgments

- Built with [Next.js](https://nextjs.org) by Vercel
- PDF rendering powered by [Nutrient Viewer](https://nutrient.io)
- Icons and UI design inspired by modern document editors

## Support

For issues and questions:

- **Application Issues**: Open an issue in this repository
- **Nutrient SDK Issues**: Contact [Nutrient Support](https://nutrient.io/support/)
- **Next.js Issues**: See [Next.js Documentation](https://nextjs.org/docs)

---

Built with ❤️ using Next.js and Nutrient Viewer
