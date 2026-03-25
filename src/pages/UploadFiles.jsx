import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import '../App.css';

export default function UploadFiles() {
  const [files, setFiles] = useState([]);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setError(null);
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => resolve(results.data || []),
        error: (err) => reject(err),
        skipEmptyLines: true,
      });
    });
  };

  const parseXLSX = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseJSON = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(Array.isArray(data) ? data : [data]);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseTXT = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = String(e.target.result).split('\n').map(l => l.trim()).filter(Boolean);
        const rows = lines.map((l, i) => ({ line: i + 1, content: l }));
        resolve(rows);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const navigate = useNavigate();

  const handleUploadFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError(null);
    const responses = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        // parse locally for preview (first 5 rows)
        let parsedData = [];
        const ext = file.name.split('.').pop().toLowerCase();
        try {
          if (ext === 'csv') parsedData = await parseCSV(file);
          else if (ext === 'xlsx' || ext === 'xls') parsedData = await parseXLSX(file);
          else if (ext === 'json') parsedData = await parseJSON(file);
          else if (ext === 'txt') parsedData = await parseTXT(file);
        } catch (err) {
          // parsing errors won't stop upload; store error for preview
          parsedData = { error: String(err) };
        }

        const response = await fetch('http://localhost:8081/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Upload failed for ${file.name}`);
        }

        const data = await response.json();
        responses.push({
          filename: file.name,
          server: data,
          totalRows: Array.isArray(parsedData) ? parsedData.length : undefined,
          first5Rows: Array.isArray(parsedData) ? parsedData.slice(0, 5) : [],
          error: parsedData && parsedData.error ? parsedData.error : undefined,
          path: data.path,
          status: data.status,
          message: data.message,
          files_count: data.files_count,
        });
      }

      setUploadResponse(responses);
      setFiles([]);

      // navigate to review page with parsed preview data
      navigate('/review', { state: { files: responses } });
    } catch (err) {
      setError(err.message || 'Error uploading files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📤 Drop Your BOMs Here</h1>

      <div className="format-info">
        <h2>📋 Supported File Formats</h2>
        <div className="formats-grid">
          <div className="format-card">
            <span className="format-icon">📊</span>
            <h4>Excel Files</h4>
            <p>.xlsx, .xls</p>
            <small>Microsoft Excel spreadsheets - Most common format</small>
          </div>
          <div className="format-card">
            <span className="format-icon">📑</span>
            <h4>CSV Format</h4>
            <p>.csv</p>
            <small>Comma-separated values - Universal format</small>
          </div>
          <div className="format-card">
            <span className="format-icon">🗂️</span>
            <h4>OpenDocument</h4>
            <p>.ods</p>
            <small>OpenOffice & LibreOffice spreadsheets</small>
          </div>
          <div className="format-card">
            <span className="format-icon">📋</span>
            <h4>JSON & Text</h4>
            <p>.json, .txt</p>
            <small>Structured data and plain text formats</small>
          </div>
        </div>

        <div className="upload-tips">
          <h3>💡 Pro Tips for Best Results</h3>
          <ul>
            <li><strong>Component Columns:</strong> Ensure your BOM includes Part Number, Value, Package, and Pin Count</li>
            <li><strong>File Size:</strong> Individual files should be under 50MB for optimal processing</li>
            <li><strong>Multiple Files:</strong> You can upload multiple BOMs at once - they'll all be processed together</li>
            <li><strong>Data Quality:</strong> Consistent formatting helps our system validate components accurately</li>
          </ul>
        </div>
      </div>
      
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="fileInput"
            multiple
            accept=".csv,.xlsx,.xls,.ods,.json,.txt"
            onChange={handleFileSelect}
            disabled={loading}
          />
          <label htmlFor="fileInput" className="file-label">
            {files.length === 0 ? '📁 Choose Files' : `✅ ${files.length} file(s) selected`}
          </label>
        </div>

        {files.length > 0 && (
          <div className="selected-files">
            <h3>Selected Files:</h3>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleUploadFiles}
          disabled={loading || files.length === 0}
          className="submit-btn"
        >
          {loading ? '⏳ Uploading...' : '🚀 Upload to Backend'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {uploadResponse && uploadResponse.length > 0 && (
        <div className="results-section">
          <h2>✅ Upload Results</h2>
          {uploadResponse.map((result, index) => (
            <div key={index} className="file-result">
              <h3>{result.filename}</h3>
              <div className="upload-info">
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Path:</strong> {result.path}</p>
                <p><strong>Message:</strong> {result.message}</p>
                {result.files_count && (
                  <p><strong>Total Files on Server:</strong> {result.files_count}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
