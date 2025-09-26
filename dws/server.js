import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOUR_IN_SECONDS = 3600;
const upload = multer();

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Helper function to create session token for a document
const createSessionToken = async (documentId, apiKey) => {
  const sessionPayload = {
    allowed_documents: [
      {
        document_id: documentId,
        document_permissions: ["read", "write", "download"],
      },
    ],
    exp: Math.floor(Date.now() / 1000) + HOUR_IN_SECONDS,
  };

  const sessionResponse = await fetch(
    "https://api.nutrient.io/viewer/sessions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(sessionPayload),
    },
  );

  if (!sessionResponse.ok) {
    const errorText = await sessionResponse.text();
    throw new Error(
      `Session creation failed: ${sessionResponse.statusText} - ${errorText}`,
    );
  }

  const sessionResult = await sessionResponse.json();
  return sessionResult.jwt;
};

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Upload document from URL endpoint
app.post("/api/upload-from-url", async (req, res) => {
  try {
    const { url } = req.body;
    const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "NUTRIENT_DWS_VIEWER_API_KEY environment variable is not set",
      });
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    // Fetch document from URL
    const docResponse = await fetch(url);
    if (!docResponse.ok) {
      throw new Error(
        `Failed to fetch document from URL: ${docResponse.statusText}`,
      );
    }

    const docBuffer = await docResponse.buffer();
    const contentType =
      docResponse.headers.get("content-type") || "application/pdf";

    // Upload to DWS Viewer API using binary upload
    const uploadResponse = await fetch(
      "https://api.nutrient.io/viewer/documents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": contentType,
          "Content-Length": docBuffer.length.toString(),
        },
        body: docBuffer,
      },
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `Upload failed: ${uploadResponse.statusText} - ${errorText}`,
      );
    }

    const uploadResult = await uploadResponse.json();

    // Extract document ID from nested response
    const documentId =
      uploadResult.data?.document_id ||
      uploadResult.document_id ||
      uploadResult.id;

    if (!documentId) {
      throw new Error("No document ID found in upload response");
    }

    // Create session token using helper function
    const sessionToken = await createSessionToken(documentId, apiKey);

    res.json({
      success: true,
      documentId: documentId,
      sessionToken: sessionToken,
      title: uploadResult.title || "Document from URL",
    });
  } catch (error) {
    console.error("Error in upload-from-url:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Upload file endpoint
app.post(
  "/api/upload-and-create-session",
  upload.single("file"),
  async (req, res) => {
    try {
      const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: "NUTRIENT_DWS_VIEWER_API_KEY environment variable is not set",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      // Upload document using binary upload
      const uploadResponse = await fetch(
        "https://api.nutrient.io/viewer/documents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": req.file.mimetype,
            "Content-Length": req.file.size.toString(),
          },
          body: req.file.buffer,
        },
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Upload failed: ${uploadResponse.statusText} - ${errorText}`,
        );
      }

      const uploadResult = await uploadResponse.json();

      // Extract document ID from nested response
      const documentId =
        uploadResult.data?.document_id ||
        uploadResult.document_id ||
        uploadResult.id;

      if (!documentId) {
        throw new Error("No document ID found in upload response");
      }

      // Generate session token using helper function
      const sessionToken = await createSessionToken(documentId, apiKey);

      res.json({
        success: true,
        documentId: documentId,
        sessionToken: sessionToken,
        title: uploadResult.title || req.file.originalname,
      });
    } catch (error) {
      console.error("Error in upload-and-create-session:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);

// Generate session token for existing document
app.post("/api/create-session", async (req, res) => {
  try {
    const { documentId } = req.body;
    const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "NUTRIENT_DWS_VIEWER_API_KEY environment variable is not set",
      });
    }

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
      });
    }

    // Generate session token using helper function
    const sessionToken = await createSessionToken(documentId, apiKey);

    res.json({
      success: true,
      sessionToken: sessionToken,
    });
  } catch (error) {
    console.error("Error in create-session:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Convert PDF to Excel endpoint
app.post("/api/convert-to-excel", async (req, res) => {
  try {
    const { url } = req.body;
    const processorApiKey = process.env.NUTRIENT_DWS_PROCESSOR_API_KEY;

    if (!processorApiKey) {
      return res.status(500).json({
        success: false,
        error: "NUTRIENT_DWS_PROCESSOR_API_KEY environment variable is not set",
      });
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "PDF URL is required",
      });
    }

    // Fetch the PDF document
    const pdfResponse = await fetch(url);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.buffer();

    // Create FormData for the conversion request
    const FormData = (await import("form-data")).default;
    const formData = new FormData();

    // Add the PDF file
    formData.append("file", pdfBuffer, {
      filename: "document.pdf",
      contentType: "application/pdf",
    });

    // Add instructions for Excel conversion
    const instructions = {
      parts: [
        {
          file: "file",
        },
      ],
      output: {
        type: "xlsx",
      },
    };

    formData.append("instructions", JSON.stringify(instructions));

    // Make the conversion request
    const conversionResponse = await fetch("https://api.nutrient.io/build", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${processorApiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!conversionResponse.ok) {
      const errorText = await conversionResponse.text();
      throw new Error(
        `PDF to Excel conversion failed: ${conversionResponse.statusText} - ${errorText}`,
      );
    }

    // Get the Excel file as buffer
    const excelBuffer = await conversionResponse.buffer();

    // Send the Excel file as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="extracted_tables.xlsx"',
    );
    res.setHeader("Content-Length", excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error("Error in convert-to-excel:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Document management endpoints for cleanup
app.get("/api/documents", async (_req, res) => {
  try {
    const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "NUTRIENT_DWS_VIEWER_API_KEY environment variable is not set",
      });
    }

    const response = await fetch("https://api.nutrient.io/viewer/documents", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch documents: ${response.statusText} - ${errorText}`,
      );
    }

    const documents = await response.json();

    res.json({
      success: true,
      documents: documents.data || documents,
      total: documents.data?.length || documents.length || 0,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/cleanup-documents", async (_req, res) => {
  try {
    const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "NUTRIENT_DWS_VIEWER_API_KEY environment variable is not set",
      });
    }

    // Get list of documents
    const listResponse = await fetch(
      "https://api.nutrient.io/viewer/documents",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      throw new Error(
        `Failed to fetch documents: ${listResponse.statusText} - ${errorText}`,
      );
    }

    const documentsResult = await listResponse.json();
    const documents = documentsResult.data || documentsResult;

    if (documents.length === 0) {
      return res.json({
        success: true,
        message: "No documents found to delete",
        deleted: [],
        remaining: 0,
      });
    }

    // Delete ALL documents to free up storage space
    const docsToDelete = documents;
    const deleted = [];

    // Delete old documents
    for (const doc of docsToDelete) {
      try {
        const docId = doc.document_id || doc.id;
        const deleteResponse = await fetch(
          `https://api.nutrient.io/viewer/documents/${docId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (deleteResponse.ok) {
          deleted.push(docId);
        }
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }

    res.json({
      success: true,
      message: `Cleanup completed. Deleted ${deleted.length} documents to free up storage space.`,
      deleted: deleted,
      remaining: 0,
      totalDeleted: deleted.length,
    });
  } catch (error) {
    console.error("Error in cleanup-documents:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
