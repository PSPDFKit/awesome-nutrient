"use client";
import React, { useState } from 'react';

const PDFUpload = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [noZoomEnabled, setNoZoomEnabled] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (files.length === 0) return;

    const file = files[0];

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    setFileName(file.name);

    // Convert file to URL for NutrientViewer
    const fileUrl = URL.createObjectURL(file);
    onFileSelect(fileUrl, noZoomEnabled);
  };

  const handleUseSamplePDF = () => {
    setFileName('Drawing1.pdf');
    setError('');
    onFileSelect('/Drawing1.pdf', noZoomEnabled);
  };

  return (
    <div className="pdf-upload-container">
      <div className="pdf-upload-content">
        <h1 className="pdf-upload-title">Nutrient Viewer</h1>
        <p className="pdf-upload-subtitle">
          Upload a PDF document to view and annotate
        </p>

        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`pdf-upload-dropzone ${isDragging ? 'dragging' : ''}`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            className="pdf-upload-input"
            id="pdf-upload"
          />

          <label htmlFor="pdf-upload" className="pdf-upload-label">
            <img
              src="/icons/pdf-upload.svg"
              alt="Upload PDF"
              className="pdf-upload-icon"
            />

            {fileName ? (
              <div>
                <p className="pdf-upload-selected-text">
                  Selected: {fileName}
                </p>
                <p className="pdf-upload-hint">
                  Click or drag to change
                </p>
              </div>
            ) : (
              <div>
                <p className="pdf-upload-instruction">
                  Drag and drop your PDF here
                </p>
                <p className="pdf-upload-hint">
                  or click to browse
                </p>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="pdf-upload-error">
            {error}
          </div>
        )}

        <div className="pdf-upload-divider-container">
          <span className="pdf-upload-divider-text">or</span>
          <button
            onClick={handleUseSamplePDF}
            className="pdf-upload-sample-button"
          >
            Use Sample PDF
          </button>
        </div>

        {/* NoZoom Toggle Section */}
        <div className="nozoom-toggle-section">
          <label className="nozoom-toggle-label">
            <input
              type="checkbox"
              checked={noZoomEnabled}
              onChange={(e) => setNoZoomEnabled(e.target.checked)}
              className="nozoom-toggle-checkbox"
            />
            <span className="nozoom-toggle-text">
              Enable NoZoom for Annotations
            </span>
          </label>
          <p className="nozoom-toggle-hint">
            When enabled, annotations won't scale when zooming in/out (applies to Text and Stamp annotations only)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;