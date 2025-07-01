# Nutrient PDF Viewer Example (Vite + React)

This project demonstrates how to integrate the [Nutrient (PSPDFKit) Web SDK](https://www.nutrient.io/sdk/web/) with advanced event tracking [Mixpanel](https://mixpanel.com/) and a built-in debug panel for real-time analytics.

---

## Features

- **View and Annotate PDFs** using the Nutrient (PSPDFKit) Web SDK
- **Comprehensive Event Tracking** - All PDF interactions tracked via Mixpanel
- **Real-time Debug Panel** for live inspection of SDK events and analytics
- **Fast Development** with Vite and React 18
- **Environment-based Configuration** for API keys and tokens
- **Accessibility Compliant** with keyboard navigation support
- **Responsive Design** for desktop and mobile devices

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- A valid Nutrient (PSPDFKit) Web SDK license key ([Get one here](https://www.nutrient.io/try/))
- A Mixpanel project token ([Create free account](https://mixpanel.com/register/))

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/PSPDFKit/awesome-nutrient.git
cd ...web/miscellaneous/mixpanel-web-analytics
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```properties
VITE_MIXPANEL_TOKEN=your-mixpanel-token
VITE_lkey=your-nutrient-license-key
```

Replace the values with your actual Mixpanel token and Nutrient SDK license key.

Where to find these:
 - Mixpanel Token: Project Settings → Project Details → Project Token
 - Nutrient License: Your PSPDFKit/Nutrient account dashboard

---

## Running the App

### Development Mode

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```sh
npm run build
npm run preview
```

Preview your build at [http://localhost:4173](http://localhost:4173).

---

## Usage

- **Upload a PDF**: Click "Choose PDF Document" to load your own PDF.
- **Interact**: Navigate pages, zoom, annotate, search, fill forms, etc.
- **Debug Panel**: (Development Only)
  - Click the "SDK Events" button (bottom right) to open the debug panel
  - View real-time event statistics and recent activity
  - Test SDK connectivity and clear event logs
  - Monitor all Mixpanel events as they're sent

---

## Tracked Events
  The application automatically tracks these user interactions:
- **Navigation & Viewing**
  - Page navigation and time spent per page
  - Zoom level changes
  - View mode changes (single/double page)
  - Sidebar toggle events

- **Annotations & Content**
  - Annotation creation, editing, and deletion
  - Text selection and highlighting
  - Form field interactions
  - Content editing operations

- **Document Operations**
  - Document loading and session tracking
  - Search queries and results
  - Print and export operations
  - Undo/redo actions

- **Advanced Interactions**
  - Bookmark management
  - Comment creation and updates
  - Digital signature creation
  - Error tracking and performance metrics


## Project Structure

```
src/
├── app.jsx                           # Main React application
├── components/
│   ├── pdf-viewer-component.jsx      # Nutrient SDK integration & event tracking
│   └── debug-panel.jsx               # Live analytics debug panel
├── services/
│   └── mixpanel.js                   # Mixpanel analytics service
├── app.css                           # Application styles
└── main.jsx                          # React entry point
public/
├── document.pdf                      # Default sample PDF
└── index.html                        # HTML template
.env                                  # Environment variables (not in repo)
package.json                          # Dependencies and scripts
vite.config.js                        # Vite configuration

```

---

## Analytics & Debugging

- All major SDK events (page navigation, annotation, search, etc.) are tracked via [`mixpanelService`](src/services/mixpanel.js).
- The [`DebugPanel`](src/components/debug-panel.jsx) shows live event stats and recent events for development and troubleshooting.
- You can trigger test events and clear the event log from the debug panel.

---

## Customization

- **Toolbar**: Modify the `toolbarItems` array in [`pdf-viewer-component.jsx`](src/components/pdf-viewer-component.jsx) to customize available tools.
- **Mixpanel Events**: Extend or adjust event tracking in [`setupNutrientSDKEvents`](src/components/pdf-viewer-component.jsx) and [`mixpanelService`](src/services/mixpanel.js).
- **Styling**: Edit `app.css` or add your own styles for UI customization.

---

## Troubleshooting

- **Nutrient SDK not loading?**  
  Ensure your license key is valid and available in `.env` as `VITE_lkey`.
- **Mixpanel not tracking?**  
  Check your Mixpanel token in `.env` and browser console for debug logs.
- **PDF not displaying?**  
  Confirm the PDF file is valid and CORS is not blocking access.
- **Events not logging in MixPanel?**
  Check if the network to MixPanel is not getting blocked to the api.mixpanel.com
---

## License

This project is for demonstration and evaluation purposes.  
See [Nutrient SDK License](https://www.nutrient.io/legal/Nutrient_SDK_User_Evaluation_Subscription_Agreement) for SDK usage terms.

---

## Support

- [Nutrient (PSPDFKit) Support](https://www.nutrient.io/support/request/)
- [Mixpanel Documentation](https://developer.mixpanel.com/docs/javascript)
- For issues with this example, open an issue in your repository.

---
## Disclaimer

This software is provided as-is, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

The user is solely responsible for determining the appropriateness of using or redistributing the software and assumes any risks associated with the exercise of permissions under the license.

## Author

[Narashiman Krishnamurthy](https://www.linkedin.com/in/narashimank/)