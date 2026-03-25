import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../App.css';

// Update these if your backend uses a different host/port
const API_BASE = 'http://localhost:8081';
const GET_FILES_URL = `${API_BASE}/api/files`;
const DELETE_ALL_URL = `${API_BASE}/api/clear`; // DELETE to this URL should clear all files on server

export default function ReviewFiles() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const navFiles = state?.files || [];

  const [serverFiles, setServerFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch files from server
  const fetchFilesFromServer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(GET_FILES_URL);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to fetch files');
      }
      const data = await res.json();
      // Backend may return in different formats:
      // 1. { status: 'success', files: ['file1.xlsx', 'file2.xlsx'] }
      // 2. { status: 'success', files_count: 2, data: { 'a.xlsx': ['col1','col2'], ... } }
      // 3. Array of file metadata directly
      
      if (data && data.files && Array.isArray(data.files)) {
        // Format 1: files array with just filenames
        const mapped = data.files.map(filename => ({ filename, headers: [] }));
        setServerFiles(mapped);
      } else if (data && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        // Format 2: data object mapping filename->headers
        const mapped = Object.entries(data.data).map(([filename, headers]) => ({ filename, headers }));
        setServerFiles(mapped);
      } else if (Array.isArray(data)) {
        // Format 3: already an array of file metadata
        setServerFiles(data.map(d => ({ filename: d.filename || d.name || d.file, headers: d.headers || d.columns || [] })));
      } else {
        setServerFiles([]);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilesFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete a single file
  const handleDeleteFile = async (filename) => {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/files/${filename}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Delete file failed');
      }
      // Remove from frontend state immediately
      setServerFiles(prevFiles => prevFiles.filter(f => f.filename !== filename));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL files on the server? This cannot be undone.')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(DELETE_ALL_URL, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Clear all failed');
      }
      // After clearing on server, redirect user to upload page
      navigate('/upload');
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Save preview data to sessionStorage so next step can use it.
    try {
      // Prefer serverFiles, but include navFiles previews if present
      const preview = (navFiles.length > 0) ? navFiles : serverFiles;
      sessionStorage.setItem('uploadedFilesPreview', JSON.stringify(preview));
    } catch (e) {
      console.warn('Could not save preview to sessionStorage', e);
    }
    // Placeholder navigation — you'll tell me the actual process next.
    navigate('/process');
  };

  // Helper to find preview data returned after upload (if any)
  const findPreview = (filename) => {
    const fromNav = navFiles.find(f => f.filename === filename);
    if (fromNav) return fromNav;
    // sometimes serverFiles may include preview metadata
    const fromServer = serverFiles.find(f => f.filename === filename);
    return fromServer || null;
  };

  return (
    <div className="container">
      <h1>📋 Your Uploaded Files</h1>

      <div className="info-notice">
        <h3>👀 Review Your BOMs</h3>
        <p>Below are your uploaded BOM files. Review the file names and headers to ensure they're correct. You can add more files, refresh to see server files, or proceed to configure pricing and quantities.</p>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button className="submit-btn" onClick={fetchFilesFromServer} disabled={loading}>
          🔄 Refresh Files
        </button>
        <button className="submit-btn" onClick={() => navigate('/upload')} disabled={loading}>
          ➕ Add More Files
        </button>
        <button className="submit-btn" onClick={handleClearAll} disabled={loading}>
          🧹 Clear All Files
        </button>
        <button className="submit-btn" onClick={() => { try { sessionStorage.setItem('uploadedFilesPreview', JSON.stringify(serverFiles)); } catch {} navigate('/config'); }} disabled={loading}>
          ⚙️ Proceed to Config
        </button>
      </div>

      {loading && <div className="info-section"><p>Loading...</p></div>}
      {error && <div className="error-message"><p>{error}</p></div>}

      {serverFiles.length === 0 ? (
        <div className="info-section">
          <p>No files found on server. Go to <a href="/upload">Upload</a>.</p>
        </div>
      ) : (
        <div>
          {serverFiles.map((sf, idx) => {
            const preview = findPreview(sf.filename) || {};
            // server may provide headers as `sf.headers` (array of strings)
            const serverHeaders = sf.headers || sf.columns || [];
            const previewRows = preview.first5Rows || [];
            return (
              <div key={idx} className="file-result">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{sf.filename}</h3>
                  <button 
                    onClick={() => handleDeleteFile(sf.filename)} 
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '0 8px',
                      lineHeight: '1'
                    }}
                    title="Delete file"
                  >
                    ×
                  </button>
                </div>

                {preview.error ? (
                  <p className="error">❌ {preview.error}</p>
                ) : (
                  <div>
                    <p className="info"><strong>Headers:</strong> {serverHeaders.length > 0 ? serverHeaders.join(', ') : '—'}</p>

                    {previewRows.length > 0 ? (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              {Object.keys(previewRows[0]).map((key) => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.map((row, ridx) => (
                              <tr key={ridx}>
                                {Object.values(row).map((val, cidx) => (
                                  <td key={cidx}>{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="info">Server headers shown above. No further preview available.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* <div style={{ marginTop: 20 }}>
            <button className="submit-btn" onClick={handleNext} disabled={loading}>
              ▶️ Next: Start Processing
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}
