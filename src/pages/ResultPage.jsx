import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = 'http://localhost:8081';
const CLEAR_URL = `${API_BASE}/api/clear`;

export default function ResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const r = sessionStorage.getItem('processResult');
      if (r) setResult(JSON.parse(r));
    } catch (e) {
      console.error('Failed to load result from sessionStorage', e);
    }
  }, []);

  const handleProcessNew = async () => {
    setError('');
    setClearing(true);
    try {
      const resp = await fetch(CLEAR_URL, { method: 'DELETE' });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Failed to clear server files');
      }

      // also clear client-side session storage that holds uploaded previews/result
      sessionStorage.removeItem('uploadedFilesPreview');
      sessionStorage.removeItem('processResult');
      sessionStorage.removeItem('missingComponents');

      navigate('/upload');
    } catch (e) {
      setError(String(e));
    } finally {
      setClearing(false);
    }
  };

  if (!result) {
    return (
      <div className="container">
        <h1>📊 Let's Get You Started</h1>
        <div className="info-section">
          <p>No quotation yet. <a href="/upload">Start uploading your BOMs</a> to generate a quote.</p>
          <p style={{ marginTop: '12px', fontSize: '0.95rem' }}>Once you upload files, set your pricing, and complete the processing steps, your quotation will appear here.</p>
        </div>

        <div className="workflow-section">
          <h3>📍 Your Journey</h3>
          <div className="workflow-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div>
                <h4>Upload BOMs</h4>
                <p>Start by uploading your BOM files in CSV, Excel, or other supported formats</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div>
                <h4>Review Files</h4>
                <p>Check and verify your uploaded files are correct</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div>
                <h4>Set Pricing</h4>
                <p>Configure pricing per pin and board quantities</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div>
                <h4>Process & Get Quote</h4>
                <p>Let us validate components and generate your quotation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render a concise quote-like summary if available
  const quote = result.quote || result.summary || null;

  return (
    <div className="container">
      <h1>📊 Your Quotation is Ready!</h1>

      {quote ? (
        <div className="quote-box">
          <h3>Quote Summary</h3>
          <div dangerouslySetInnerHTML={{ __html: quote }} />
        </div>
      ) : (
        <div className="process-section">
          <h2>Summary</h2>
          <p><strong>Status:</strong> <span style={{ color: result.status === 'success' ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>{result.status}</span></p>
          
          {/* Display results if available */}
          {result.results && Array.isArray(result.results) && (
            <div style={{ marginTop: '20px' }}>
              <h3>Processing Results</h3>
              {result.results.map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  backgroundColor: '#f9f9f9', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '5px'
                }}>
                  <h4 style={{ marginTop: 0, color: '#333' }}>📄 {item.file}</h4>
                  {item.output && (
                    <div style={{ 
                      backgroundColor: '#fff', 
                      padding: '12px', 
                      borderRadius: '4px',
                      borderLeft: '4px solid #3498db',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      color: '#555'
                    }}>
                      {typeof item.output === 'string' ? (
                        <p>{item.output}</p>
                      ) : (
                        <pre style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                          {JSON.stringify(item.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {result.total_quote && <p><strong>Total Quote:</strong> ${result.total_quote}</p>}
          {result.message && <p><strong>Message:</strong> {result.message}</p>}
          {result.processed_files && (
            <p><strong>Processed files:</strong> {result.processed_files.join(', ')}</p>
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button className="submit-btn" onClick={handleProcessNew} disabled={clearing}>
          {clearing ? 'Clearing...' : 'Process New Files'}
        </button>
        {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
