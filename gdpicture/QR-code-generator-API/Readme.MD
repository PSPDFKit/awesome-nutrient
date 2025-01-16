# QR Code Generator API

This API allows users to add a QR code to an uploaded PDF document. It uses **ASP.NET Core** and **Nutrient Native** for PDF processing and QR code generation.

## Features

- Accepts a PDF file and adds a QR code to the specified page and position.
- QR code text, size, position, and page number are customizable through query parameters.
- Returns the modified PDF with the QR code embedded.

## Requirements

- [.NET 6.0 SDK or higher](https://dotnet.microsoft.com/download)
- **Nutrient Native** (Version 14 or above)  
  - You will need a valid license key to use **Nutrient Native** functionalities.

## Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/Narashiman-K/QRCodeGeneratorAPI.git
   cd QRCodeGeneratorAPI

- Install Dependencies Ensure you have the GDPicture SDK referenced in your project. Add the SDK to your project by installing it from NuGet or directly adding it as a reference.

- Add Your **Nutrient Native** License Key In AddQRCodeController.cs, replace "Nutrient Native License key goes here" with your actual **Nutrient Native** license key.

2. **Build and Run** 
    ``` bash
    dotnet build
    dotnet run
    API Usage
    Endpoint
    POST /api/AddQRCode/generate
    ```
### Parameters
1. pdfFile (form-data): The PDF file to which the QR code will be added.
2. qrCodeText (query): Text content of the QR code. Defaults to "Check if QRCode service is running".
3. size (query): Size of the QR code. Defaults to 2.
4. x (query): X-coordinate (position) for placing the QR code. Defaults to 8.
5. y (query): Y-coordinate (position) for placing the QR code. Defaults to 2.
6. pageno (query): Page number to place the QR code on. Defaults to 0 (first page).

#### Example Request (using cURL)
3. **using cURL**
    ```
    curl -X POST "http://localhost:5000/api/AddQRCode/generate" \
    -F "pdfFile=@path/to/your/file.pdf" \
    -F "qrCodeText=Your QR Text" \
    -F "size=3" \
    -F "x=5" \
    -F "y=5" \
    -F "pageno=1"
    ```
##### Response
- Returns the modified PDF file with the QR code embedded at the specified position. The file is named <original_filename>_updated.pdf.

##### Error Handling
The API returns HTTP 400 Bad Request for: 
* Missing or empty PDF file upload.
* Failure to load the PDF or apply QR code due to invalid parameters or internal errors.

### License
This project is licensed under the BSD license. See the LICENSE file for more details.

### Contributing
Please ensure you have signed our CLA so that we can accept your contributions.

## Support, Issues and License Questions

PSPDFKit offers support for customers with an active SDK license via https://support.nutrient.io/hc/en-us/requests/new

Are you [evaluating our SDK](https://nutrient.io/try/)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our sales form: https://nutrient.io/sales/

### About
Get all annotations coordinates, create annotations from clipboard data, cut, copy, and paste annotations between pages, and jump and zoom into annotations or just jump to the next annotation without zooming in.

### Author

Narashiman Krishnamurthy