import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function ConfigPage() {
  const navigate = useNavigate();
  
  const [priceSMD, setPriceSMD] = useState('0.0000');
  const [pricePTH, setPricePTH] = useState('0.0000');
  const [boardQty, setBoardQty] = useState('1');
  const [error, setError] = useState(null);

  const handleProcess = () => {
    setError(null);

    // Validate inputs
    if (!priceSMD || isNaN(priceSMD)) {
      setError('Price per pin (SMD) must be a valid number');
      return;
    }
    if (!pricePTH || isNaN(pricePTH)) {
      setError('Price per pin (PTH) must be a valid number');
      return;
    }
    if (!boardQty || isNaN(boardQty) || parseInt(boardQty) < 1) {
      setError('Board quantity must be a valid number >= 1');
      return;
    }

    // Save config to sessionStorage
    const config = {
      priceSMD: parseFloat(priceSMD),
      pricePTH: parseFloat(pricePTH),
      boardQty: parseInt(boardQty),
      timestamp: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('processingConfig', JSON.stringify(config));
    } catch (e) {
      setError('Failed to save configuration');
      return;
    }

    // Navigate to process page
    navigate('/process');
  };

  return (
    <div className="container">
      <h1>⚙️ Set Your Pricing & Quantities</h1>

      <div className="info-notice">
        <h3>📌 How Pricing Works</h3>
        <p>Enter your cost per pin for both SMD (Surface Mount Device) and PTH (Pin Through Hole) components. These prices will be applied to calculate assembly costs based on the pin counts in your BOM files.</p>
      </div>

      <div className="config-section">
        {/* Pricing Configuration */}
        <div className="config-block">
          <h2>💰 Pricing Configuration</h2>
          
          <div className="config-field">
            <label>Price per pin (SMD)</label>
            <div className="input-group">
              <input
                type="number"
                value={priceSMD}
                onChange={(e) => setPriceSMD(e.target.value)}
                step="0.0001"
                placeholder="0.0000"
              />
              <button
                className="spin-btn"
                onClick={() => setPriceSMD((prev) => (parseFloat(prev) - 0.0001).toFixed(4))}
              >
                −
              </button>
              <button
                className="spin-btn"
                onClick={() => setPriceSMD((prev) => (parseFloat(prev) + 0.0001).toFixed(4))}
              >
                +
              </button>
            </div>
          </div>

          <div className="config-field">
            <label>Price per pin (PTH)</label>
            <div className="input-group">
              <input
                type="number"
                value={pricePTH}
                onChange={(e) => setPricePTH(e.target.value)}
                step="0.0001"
                placeholder="0.0000"
              />
              <button
                className="spin-btn"
                onClick={() => setPricePTH((prev) => (parseFloat(prev) - 0.0001).toFixed(4))}
              >
                −
              </button>
              <button
                className="spin-btn"
                onClick={() => setPricePTH((prev) => (parseFloat(prev) + 0.0001).toFixed(4))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Board Quantities */}
        <div className="config-block">
          <h2>📊 Set Board Quantities</h2>
          <p className="config-hint">Enter number of boards</p>
          
          <div className="config-field">
            <label>Boards: Sample-RF BOARD COMPONENTS.xlsx</label>
            <div className="input-group">
              <input
                type="number"
                value={boardQty}
                onChange={(e) => setBoardQty(e.target.value)}
                min="1"
                placeholder="1"
              />
              <button
                className="spin-btn"
                onClick={() => setBoardQty((prev) => Math.max(1, parseInt(prev) - 1))}
              >
                −
              </button>
              <button
                className="spin-btn"
                onClick={() => setBoardQty((prev) => parseInt(prev) + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="config-actions">
        <button className="submit-btn" onClick={handleProcess}>
          ▶️ Process
        </button>
      </div>
    </div>
  );
}
