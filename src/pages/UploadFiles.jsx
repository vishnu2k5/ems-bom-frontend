import React, { useState } from "react";
import "./uploadpage.css";
import { Link } from "react-router-dom";

const UploadFiles = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };
  const handleDelete = (indexToDelete) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToDelete)
    );
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload custom BOM files</h2>
        <p className="subtitle">
          Select your BOM files to process
        </p>

        {/* Drop Area */}
        <div className="drop-zone">
          <p className="drop-text">
            Drag and drop files here
          </p>
          <p className="formats">
            Supports CSV, XLSX, JSON, TXT
          </p>

          <input
            type="file"
            id="fileInput"
            multiple
            accept=".csv,.xlsx,.xls,.ods,.json,.txt"
            onChange={handleFileSelect}
          />
          <label htmlFor="fileInput" className="select-btn">
            Select files
          </label>
        </div>

        {/* File List */}
        <div className="file-list">
          {selectedFiles.map((file, index) => (
            <div className="file-item" key={index}>
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* Delete Button */}
              <button
                className="delete-btn"
                onClick={() => handleDelete(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="actions">
          {selectedFiles.length > 0 && (
            <button className="cancel-btn">Cancel</button>
          )}
            {selectedFiles.length > 0 && (
              <Link to="/config">
                <button className="upload-btn">
                  Upload files
                </button>
              </Link>
            )}
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;