import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = 'http://localhost:8081';
const GET_MISSING_URL = `${API_BASE}/api/missing`;
const SET_MISSING_URL = `${API_BASE}/api/missing/set`;
const SKIP_MISSING_URL = `${API_BASE}/api/missing/skip`;

export default function MissingPage() {
  const navigate = useNavigate();
  const [missingList, setMissingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  
  // helper to create default form entry
  const makeDefaultEntry = (item) => ({
    mfpn: item.mfpn || '',
    ref_designator: item.ref_designator || item.ref || '',
    value: item.value || '',
    package: item.package || '',
    pin_count: item.pin_count || '',
    mounting_type: item.mounting_type || 'Surface Mount',
    manufacturer: item.manufacturer || '',
    description: item.description || '',
    voltage_rating: item.voltage_rating || '',
    wattage_rating: item.wattage_rating || '',
    current_rating: item.current_rating || '',
    dimensions: item.dimensions || '',
  });

  useEffect(() => {
    // Try to load from sessionStorage first (set by ProcessPage), otherwise call backend
    const fromSession = sessionStorage.getItem('missingComponents');
    if (fromSession) {
      try {
        const parsed = JSON.parse(fromSession);
        setMissingList(parsed);
        // Initialize form data
        const initial = {};
        parsed.forEach((item, idx) => {
          initial[idx] = makeDefaultEntry(item);
        });
        setFormData(initial);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse missingComponents from session', e);
      }
    }

    // Fetch from backend
    (async () => {
      try {
        const resp = await fetch(GET_MISSING_URL);
        if (!resp.ok) throw new Error('Failed to fetch missing components');
        const data = await resp.json();
        if (data.status === 'success' && data.missing) {
          setMissingList(data.missing);
          const initial = {};
          data.missing.forEach((item, idx) => {
            initial[idx] = makeDefaultEntry(item);
          });
          setFormData(initial);
        } else {
          setError('No missing components');
        }
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Check if any field is filled
  const isAnyFieldFilled = () => {
    return Object.values(formData).some(item => {
      const {
        value = '',
        package: pkg = '',
        pin_count = '',
        ref_designator = '',
        mounting_type = '',
        manufacturer = '',
        description = '',
        voltage_rating = '',
        wattage_rating = '',
        current_rating = '',
        dimensions = '',
      } = item || {};
      return (
        value.trim() !== '' ||
        pkg.trim() !== '' ||
        pin_count.toString().trim() !== '' ||
        ref_designator.trim() !== '' ||
        mounting_type.trim() !== '' ||
        manufacturer.trim() !== '' ||
        description.trim() !== '' ||
        voltage_rating.trim() !== '' ||
        wattage_rating.trim() !== '' ||
        current_rating.trim() !== '' ||
        dimensions.trim() !== ''
      );
    });
  };

  const handleInputChange = (index, field, value) => {
    setFormData(prev => {
      const entry = prev[index] || {};
      const updated = { ...entry, [field]: value };
      if (field === 'ref_designator') {
        updated.ref = value;
      }
      if (field === 'ref') {
        updated.ref_designator = value;
      }
      return { ...prev, [index]: updated };
    });
  };

  const handleSubmit = async () => {
    setProcessing(true);
    setError(null);
    try {
      // Collect all items to submit from current list
      const itemsToSubmit = [];
      for (let idx = 0; idx < missingList.length; idx++) {
        const form = formData[idx] || {};
        const {
          value = '',
          package: pkg = '',
          pin_count = '',
          ref_designator = '',
          mounting_type = '',
          manufacturer = '',
          description = '',
          voltage_rating = '',
          wattage_rating = '',
          current_rating = '',
          dimensions = '',
        } = form;
        
        const mfpn = form.mfpn || missingList[idx]?.mfpn || '';
        const hasAnyData = 
          value.trim() !== '' ||
          pkg.trim() !== '' ||
          pin_count.toString().trim() !== '' ||
          ref_designator.trim() !== '' ||
          mounting_type.trim() !== '' ||
          manufacturer.trim() !== '' ||
          description.trim() !== '' ||
          voltage_rating.trim() !== '' ||
          wattage_rating.trim() !== '' ||
          current_rating.trim() !== '' ||
          dimensions.trim() !== '';
        
        if (mfpn || hasAnyData) {
          const finalRefDesignator = ref_designator || form.ref || missingList[idx]?.ref_designator || missingList[idx]?.ref || '';
          itemsToSubmit.push({
            mfpn,
            ref_designator: finalRefDesignator,
            value: value || '',
            package: pkg || '',
            pin_count: pin_count ? Number(pin_count) : 0,
            mounting_type: mounting_type || 'Surface Mount',
            manufacturer: manufacturer || '',
            description: description || '',
            voltage_rating: voltage_rating || '',
            wattage_rating: wattage_rating || '',
            current_rating: current_rating || '',
            dimensions: dimensions || '',
          });
        }
      }

      // Submit all collected items as a batch
      const batchPayload = { items: itemsToSubmit };
      console.log('Submitting batch payload:', batchPayload);
      
      const resp = await fetch(`${API_BASE}/api/missing/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(err || 'Failed to set missing components');
      }

      const respData = await resp.json();
      console.log('Batch response:', respData);
      
      if (respData.status === 'missing' && respData.missing) {
        sessionStorage.setItem('missingComponents', JSON.stringify(respData.missing));
        setMissingList(respData.missing);
        const initial = {};
        respData.missing.forEach((item, i) => {
          initial[i] = makeDefaultEntry(item);
        });
        setFormData(initial);
      } else if (respData.status === 'success') {
        // Save quotation results before navigating
        if (respData.results) {
          sessionStorage.setItem('processResult', JSON.stringify(respData));
        }
        navigate('/result', { replace: true });
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setProcessing(false);
    }
  };

  const handleSkip = async () => {
    setProcessing(true);
    setError(null);
    try {
      // Collect all MFPNs
      const mfpns = missingList.map((item, idx) => 
        formData[idx]?.mfpn || item.mfpn || ''
      );
      console.log('Skipping with MFPNs:', JSON.stringify(mfpns));

      // Send all MFPNs at once
      const resp = await fetch(SKIP_MISSING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mfpns: mfpns,
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(err || 'Failed to skip missing components');
      }

      const respData = await resp.json();
      // Clear all and navigate to stage 2
      if (respData.status === 'success') {
        sessionStorage.removeItem('missingComponents');
        // Store the complete results from skip/process_loop
        sessionStorage.setItem('processResult', JSON.stringify(respData));
        navigate('/result', { replace: true });
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1>⏳ Checking for Missing Parts...</h1>
        <div className="info-section"><p>Loading missing components...</p></div>
      </div>
    );
  }

  if (!missingList || missingList.length === 0) {
    return (
      <div className="container">
        <h1>✅ All Components Found!</h1>
        <div className="info-section">
          <p>All components found. Proceeding to results...</p>
        </div>
        <button className="submit-btn" onClick={() => navigate('/result')}>Go to Results</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🔎 Help Us Complete Your BOM</h1>
      <div className="info-section">
        <p><strong>{missingList.length}</strong> component(s) not found. Fill details for any to continue, or skip all.</p>
      </div>

      {error && <div className="error"><p>{error}</p></div>}

      <div style={{ marginBottom: 20 }}>
        {missingList.map((item, idx) => (
          <div key={idx} className="missing-card">
            <div className="missing-card-header">
              <div>
                <h3 className="missing-title">{item.mfpn || item.name || `Component ${idx + 1}`}</h3>
                <div className="missing-reason"><strong>Reason not found:</strong> {item.reason || 'Not specified'}</div>
              </div>
              <div className="missing-index">{idx + 1}/{missingList.length}</div>
            </div>

            <div className="missing-fields">
              <div className="field">
                <label className="field-label">MFPN / Part Number</label>
                <input
                  className="input-field"
                  type="text"
                  value={formData[idx]?.mfpn || ''}
                  onChange={(e) => handleInputChange(idx, 'mfpn', e.target.value)}
                  placeholder="e.g., 123-456-789"
                  disabled
                />
              </div>

              <div className="field">
                <label className="field-label">Value</label>
                <input
                  className="input-field"
                  type="text"
                  value={formData[idx]?.value || ''}
                  onChange={(e) => handleInputChange(idx, 'value', e.target.value)}
                  placeholder="e.g., 10k, 100nF"
                />
              </div>

              <div className="field">
                <label className="field-label">Package</label>
                <input
                  className="input-field"
                  type="text"
                  value={formData[idx]?.package || ''}
                  onChange={(e) => handleInputChange(idx, 'package', e.target.value)}
                  placeholder="e.g., 0805, SOT23"
                />
              </div>

              <div className="field">
                <label className="field-label">Pin Count</label>
                <input
                  className="input-field"
                  type="number"
                  value={formData[idx]?.pin_count || ''}
                  onChange={(e) => handleInputChange(idx, 'pin_count', e.target.value)}
                  placeholder="e.g., 8"
                />
              </div>

              <div className="field">
                <label className="field-label">Ref Designator</label>
                <input
                  className="input-field"
                  type="text"
                  value={formData[idx]?.ref_designator || ''}
                  onChange={(e) => handleInputChange(idx, 'ref_designator', e.target.value)}
                  placeholder="e.g., R1, C2"
                />
              </div>

              <div className="field">
                <label className="field-label">Mounting Type</label>
                <input
                  className="input-field"
                  type="text"
                  value={formData[idx]?.mounting_type || ''}
                  onChange={(e) => handleInputChange(idx, 'mounting_type', e.target.value)}
                  placeholder="e.g., Surface Mount"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="actions-row">
        <button
          className="submit-btn primary-btn"
          onClick={handleSubmit}
          disabled={processing || !isAnyFieldFilled()}
        >
          {isAnyFieldFilled() ? '📤 Submit' : '(Fill any field to submit)'}
        </button>
        <button
          className="submit-btn skip-btn"
          onClick={handleSkip}
          disabled={processing}
        >
          ⏭️ Skip All
        </button>
      </div>
    </div>
  );
}
