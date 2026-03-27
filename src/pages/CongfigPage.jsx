import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./configpage.css";

const ConfigPage = () => {
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────────────── */
  const [boardQty, setBoardQty]             = useState(1);
  const [jobWork, setJobWork]               = useState(false);
  const [pcbFabrication, setPcbFabrication] = useState(false);
  const [componentQuote, setComponentQuote] = useState(false);

  const [bomFiles, setBomFiles]                   = useState([]);
  const [gerberFiles, setGerberFiles]             = useState([]);
  const [enquiryFiles, setEnquiryFiles]           = useState([]);
  const [componentBomFiles, setComponentBomFiles] = useState([]);

  const [priceSMD, setPriceSMD] = useState("");
  const [pricePTH, setPricePTH] = useState("");

  const [traceableComponents, setTraceableComponents]     = useState(false);
  const [alternativeComponents, setAlternativeComponents] = useState(false);
  const [selectedTraceable, setSelectedTraceable]         = useState("Chinese website");
  const traceableOptions = ["Chinese website", "Digikey"];

  const REGULAR_STENCIL_PRICE = 7100;
  const LARGE_STENCIL_PRICE   = 9100;
  const [regularStencil, setRegularStencil] = useState(false);
  const [largeStencil, setLargeStencil]     = useState(false);

  const [error, setError] = useState(null);

  /* ── Helpers ───────────────────────────────────────────────── */
  const addFiles   = (setter) => (e) => setter((p) => [...p, ...Array.from(e.target.files)]);
  const removeFile = (setter, i) => setter((p) => p.filter((_, idx) => idx !== i));

  /* ── Navigate to Review ────────────────────────────────────── */
  const handleReview = () => {
    setError(null);

    if (!jobWork && !pcbFabrication && !componentQuote) {
      setError("Please select at least one quotation mode.");
      return;
    }
    if (jobWork && (!priceSMD || !pricePTH)) {
      setError("Please enter both SMD and PTH prices for Job Work.");
      return;
    }

    // Build serialisable config (no Files here — pass separately via nav state)
    const config = {
      boardQty,
      quotationMode: { jobWork, pcbFabrication, componentQuote },
      jobWorkPricing: jobWork ? { priceSMD, pricePTH } : null,
      componentPreferences: componentQuote
        ? { traceableComponents, selectedTraceable, alternativeComponents }
        : null,
      stencil: {
        regular: regularStencil,
        regularPrice: REGULAR_STENCIL_PRICE,
        large: largeStencil,
        largePrice: LARGE_STENCIL_PRICE,
      },
    };

    // Files go in nav state — React Router keeps them in memory for this session
    navigate("/review", {
      state: {
        config,
        files: {
          bomFiles,
          gerberFiles,
          enquiryFiles,
          componentBomFiles,
        },
      },
    });
  };

  /* ── Reusable FileList ─────────────────────────────────────── */
  const FileList = ({ files, setter }) =>
    files.length > 0 ? (
      <ul className="cp-file-list">
        {files.map((f, i) => (
          <li key={i} className="cp-file-list__item">
            <span className="cp-file-list__name">📄 {f.name}</span>
            <button
              className="cp-file-list__remove"
              type="button"
              onClick={() => removeFile(setter, i)}
            >✕</button>
          </li>
        ))}
      </ul>
    ) : null;

  let step = 3;

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="cp-page">
      <div className="cp-card">

        {/* Header */}
        <div className="cp-header">
          <h1 className="cp-header__title">BOM Configuration</h1>
          <p className="cp-header__sub">Set your assembly parameters and upload requirements.</p>
        </div>

        {/* 1 — Order Quantity */}
        <div className="cp-section">
          <div className="cp-section__head">
            <span className="cp-badge">1</span>
            <h2 className="cp-section__title">Order Quantity</h2>
          </div>
          <label className="cp-label" htmlFor="joborder">Job Order Quantity</label>
          <input
            className="cp-input"
            type="number"
            id="joborder"
            min={1}
            value={boardQty}
            onChange={(e) => setBoardQty(Math.max(1, Number(e.target.value)))}
          />
        </div>

        {/* 2 — Quotation Mode */}
        <div className="cp-section">
          <div className="cp-section__head">
            <span className="cp-badge">2</span>
            <h2 className="cp-section__title">Quotation Mode</h2>
          </div>
          <div className="cp-mode-row">
            {[
              { id: "jobwork",   label: "Job Work",        val: jobWork,        set: setJobWork },
              { id: "pcbfab",    label: "PCB Fabrication", val: pcbFabrication, set: setPcbFabrication },
              { id: "compquote", label: "Component Quote", val: componentQuote, set: setComponentQuote },
            ].map(({ id, label, val, set }) => (
              <label key={id} htmlFor={id} className={`cp-mode-card ${val ? "cp-mode-card--on" : ""}`}>
                <input type="checkbox" id={id} className="cp-sr-only"
                  checked={val} onChange={(e) => set(e.target.checked)} />
                <span className="cp-checkbox" />
                <span className="cp-mode-card__label">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3 — Job Work Details */}
        {jobWork && (
          <div className="cp-section">
            <div className="cp-section__head">
              <span className="cp-badge">{step++}</span>
              <h2 className="cp-section__title">Job Work Details</h2>
            </div>

            <label className="cp-label">Customer BOM</label>
            <div className="cp-upload-zone">
              <label className="cp-upload-zone__inner" htmlFor="customerbom">
                <span className="cp-upload-zone__text">Upload Customer BOM</span>
                <input type="file" id="customerbom" className="cp-sr-only" multiple onChange={addFiles(setBomFiles)} />
                <span className="cp-upload-zone__btn">Choose Files</span>
              </label>
              <FileList files={bomFiles} setter={setBomFiles} />
            </div>

            <div className="cp-row" style={{ marginTop: 16 }}>
              <div className="cp-field">
                <label className="cp-label" htmlFor="smd">SMD Price / Board</label>
                <div className="cp-prefixed">
                  <span className="cp-prefix">₹</span>
                  <input className="cp-input cp-input--pre" type="number" id="smd"
                    placeholder="0.00" value={priceSMD} onChange={(e) => setPriceSMD(e.target.value)} />
                </div>
              </div>
              <div className="cp-field">
                <label className="cp-label" htmlFor="pth">PTH Price / Board</label>
                <div className="cp-prefixed">
                  <span className="cp-prefix">₹</span>
                  <input className="cp-input cp-input--pre" type="number" id="pth"
                    placeholder="0.00" value={pricePTH} onChange={(e) => setPricePTH(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PCB Fabrication */}
        {pcbFabrication && (
          <div className="cp-section">
            <div className="cp-section__head">
              <span className="cp-badge">{step++}</span>
              <h2 className="cp-section__title">PCB Fabrication</h2>
            </div>

            <label className="cp-label">Gerber Files</label>
            <div className="cp-upload-zone">
              <label className="cp-upload-zone__inner" htmlFor="gerberfiles">
                <span className="cp-upload-zone__text">Upload Gerber Files</span>
                <input type="file" id="gerberfiles" className="cp-sr-only" multiple onChange={addFiles(setGerberFiles)} />
                <span className="cp-upload-zone__btn">Choose Files</span>
              </label>
              <FileList files={gerberFiles} setter={setGerberFiles} />
            </div>

            <label className="cp-label" style={{ marginTop: 14, display: "block" }}>Enquiry Files</label>
            <div className="cp-upload-zone">
              <label className="cp-upload-zone__inner" htmlFor="enquiryfiles">
                <span className="cp-upload-zone__text">Upload Enquiry Files</span>
                <input type="file" id="enquiryfiles" className="cp-sr-only" multiple onChange={addFiles(setEnquiryFiles)} />
                <span className="cp-upload-zone__btn">Choose Files</span>
              </label>
              <FileList files={enquiryFiles} setter={setEnquiryFiles} />
            </div>
          </div>
        )}

        {/* Component Quote */}
        {componentQuote && (
          <div className="cp-section">
            <div className="cp-section__head">
              <span className="cp-badge">{step++}</span>
              <h2 className="cp-section__title">Component Preferences</h2>
            </div>

            <div className="cp-mode-row cp-mode-row--wrap">
              <label htmlFor="traceable" className={`cp-mode-card ${traceableComponents ? "cp-mode-card--on" : ""}`}>
                <input type="checkbox" id="traceable" className="cp-sr-only"
                  checked={traceableComponents}
                  onChange={(e) => { setTraceableComponents(e.target.checked); if (e.target.checked) setAlternativeComponents(false); }} />
                <span className="cp-checkbox" />
                <span className="cp-mode-card__label">Traceable Components</span>
              </label>
              {!traceableComponents && (
                <label htmlFor="alternative" className={`cp-mode-card ${alternativeComponents ? "cp-mode-card--on" : ""}`}>
                  <input type="checkbox" id="alternative" className="cp-sr-only"
                    checked={alternativeComponents}
                    onChange={(e) => { setAlternativeComponents(e.target.checked); if (e.target.checked) setTraceableComponents(false); }} />
                  <span className="cp-checkbox" />
                  <span className="cp-mode-card__label">Alternative Components</span>
                </label>
              )}
            </div>

            {traceableComponents && (
              <div className="cp-field" style={{ marginTop: 14 }}>
                <label className="cp-label" htmlFor="traceablesrc">Preferred Source</label>
                <select className="cp-select" id="traceablesrc" value={selectedTraceable}
                  onChange={(e) => setSelectedTraceable(e.target.value)}>
                  {traceableOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <label className="cp-label">Customer BOM</label>
              <div className="cp-upload-zone">
                <label className="cp-upload-zone__inner" htmlFor="compbom">
                  <span className="cp-upload-zone__text">Upload BOM File</span>
                  <input type="file" id="compbom" className="cp-sr-only" multiple onChange={addFiles(setComponentBomFiles)} />
                  <span className="cp-upload-zone__btn">Choose Files</span>
                </label>
                <FileList files={componentBomFiles} setter={setComponentBomFiles} />
              </div>
            </div>
          </div>
        )}

        {/* Stencil */}
        <div className="cp-section">
          <div className="cp-section__head">
            <span className="cp-badge">{step}</span>
            <h2 className="cp-section__title">Stencil Options</h2>
          </div>
          <div className="cp-stencil-row">
            {[
              { id: "regsten", label: "Regular Stencil", price: REGULAR_STENCIL_PRICE, val: regularStencil, set: setRegularStencil },
              { id: "lgsten",  label: "Large Stencil",   price: LARGE_STENCIL_PRICE,   val: largeStencil,   set: setLargeStencil },
            ].map(({ id, label, price, val, set }) => (
              <label key={id} htmlFor={id} className={`cp-stencil-card ${val ? "cp-stencil-card--on" : ""}`}>
                <input type="checkbox" id={id} className="cp-sr-only" checked={val} onChange={(e) => set(e.target.checked)} />
                <span className="cp-checkbox" />
                <div className="cp-stencil-card__info">
                  <span className="cp-stencil-card__name">{label}</span>
                  <span className="cp-stencil-card__price">₹{price.toLocaleString("en-IN")}</span>
                </div>
                {val && <span className="cp-stencil-card__tick">✓</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <div className="cp-feedback cp-feedback--err" role="alert">⚠️ {error}</div>}

        {/* CTA */}
        <button className="cp-submit" type="button" onClick={handleReview}>
          Review Configuration →
        </button>

      </div>
    </div>
  );
};

export default ConfigPage;