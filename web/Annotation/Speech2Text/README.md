# Text2Speech

This project enables speech-to-text functionality, allowing you to speak and convert your speech into text using browser APIs. The generated text is copied to the clipboard and then used to create text annotations directly on a PDF.

## Prerequisites

- Node.js (version 14 or later)
- npm (version 6 or later)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Narashiman-K/Speech2Text.git
   cd Speech2Text

2. Open a terminal and navigate to the project directory.
3. Install the project dependencies:
    ```bash
    npm install

4.  Copy the Nutrient Web SDK library assets to the public directory by running:
    ```bash
    cp -R ./node_modules/pspdfkit/dist/pspdfkit-lib public/pspdfkit-lib

5. You should now be able to run the project locally by executing:
    ```bash
    npm run dev

6. Click on the "Start Speech to Text" button and ensure you allow microphone access in your web browser. Click the button and start talking. Once you stop, the text annotation will be placed on the PDF.

# Building for Production
To create a production build of the app and serve it, run
    ```bash
    npm run build
    npm run preview

Open your browser and navigate to http://localhost:4173 to see the application in action.

## License
This project is licensed under the BSD license. See the LICENSE file for more details.

## Contributing
Please ensure you have signed our CLA so that we can accept your contributions.

## Support, Issues, and License Questions
Nutrient offers support for customers with an active SDK license via PSPDFKit Support.

### Are you evaluating our SDK? We're happy to help! To ensure quick assistance, please use a work email and have someone from your company fill out our sales form.

# About
This project allows speech-to-text synthesis, creates text annotations, and even supports manual copy-paste (using Ctrl + V).

## Author
Narashiman Krishnamurthy