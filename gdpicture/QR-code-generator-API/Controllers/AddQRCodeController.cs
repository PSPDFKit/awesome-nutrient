using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using GdPicture14;
using System.IO;
using System.Threading.Tasks;

namespace QRCodeGeneratorAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddQRCodeController : ControllerBase
    {
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateQRCode(
            IFormFile pdfFile,
            [FromQuery] string qrCodeText = "Check if QRCode service is running",
            [FromQuery] int size = 2,
            [FromQuery] int x = 8,
            [FromQuery] int y = 2,
            [FromQuery] int pageno = 0)
        {
            if (pdfFile == null || pdfFile.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            using (var memoryStream = new MemoryStream())
            {
                await pdfFile.CopyToAsync(memoryStream);
                byte[] pdfBytes = memoryStream.ToArray();

                GdPicturePDF gdpicturePDF = new GdPicturePDF();
                GdPictureStatus status = gdpicturePDF.LoadFromStream(memoryStream);

                if (status != GdPictureStatus.OK)
                {
                    return BadRequest("Failed to load PDF document.");
                }

                // Set QR Code properties
                gdpicturePDF.SetOrigin(PdfOrigin.PdfOriginTopLeft);
                gdpicturePDF.SetMeasurementUnit(PdfMeasurementUnit.PdfMeasurementUnitCentimeter);
                gdpicturePDF.SelectPage(pageno);
                // Draw QR Code at specified coordinates using the provided text
                status = gdpicturePDF.DrawBarcodeQrCode(
                    qrCodeText,
                    BarcodeQREncodingMode.BarcodeQREncodingModeUndefined,
                    BarcodeQRErrorCorrectionLevel.BarcodeQRErrorCorrectionLevelM,
                    0,
                    size,   // QR code size
                    x, // x coordinate
                    y, // y coordinate
                    0, 0, 0 // RGB colors
                );

                if (status != GdPictureStatus.OK)
                {
                    return BadRequest("Failed to draw QR code on the document.");
                }

                // Save the updated document to a memory stream
                using (var outputMemoryStream = new MemoryStream())
                {
                    status = gdpicturePDF.SaveToStream(outputMemoryStream);

                    if (status != GdPictureStatus.OK)
                    {
                        return BadRequest("Failed to save the updated document.");
                    }

                    outputMemoryStream.Position = 0;

                    // Return the file with the modified name
                    string outputFileName = Path.GetFileNameWithoutExtension(pdfFile.FileName) + "_updated.pdf";
                    return File(outputMemoryStream.ToArray(), "application/pdf", outputFileName);
                }
            }
        }
    }
}
