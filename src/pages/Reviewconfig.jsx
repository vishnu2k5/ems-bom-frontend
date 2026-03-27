import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Reviewconfig.css";

/* ── helpers ───────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString("en-IN");

const Row = ({ label, value }) => (
  <div className="rv-row">
    <span className="rv-row__label">{label}</span>
    <span className="rv-row__value">{value}</span>
  </div>
);

const FileRow = ({ files }) =>
  files.length === 0 ? (
    <span className="rv-empty">No files uploaded</span>
  ) : (
    <ul className="rv-files">
      {files.map((f, i) => (
        <li key={i} className="rv-files__item">
          📄 {f.name}
          <span className="rv-files__size">
            ({(f.size / 1024).toFixed(1)} KB)
          </span>
        </li>
      ))}
    </ul>
  );

/* ── Component ─────────────────────────────────────── */
const ReviewConfig = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /* Guard */
  if (!state?.config) {
    return (
      <div className="rv-page">
        <div className="rv-card rv-card--error">
          <p>No configuration found. Please go back and configure first.</p>
          <button
            className="rv-btn-back"
            onClick={() => navigate("/config")}
          >
            ← Go to Config
          </button>
        </div>
      </div>
    );
  }

  const { config, files } = state;

  const {
    boardQty,
    quotationMode,
    jobWorkPricing,
    componentPreferences,
    stencil,
  } = config;

  const {
    bomFiles = [],
    gerberFiles = [],
    enquiryFiles = [],
    componentBomFiles = [],
  } = files;

  const totalFiles =
    bomFiles.length +
    gerberFiles.length +
    enquiryFiles.length +
    componentBomFiles.length;

  /* ── Submit ───────────────────────────────────── */
  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("stats", JSON.stringify(config));

      bomFiles.forEach((f) =>
        formData.append("bomFiles", f)
      );
      gerberFiles.forEach((f) =>
        formData.append("gerberFiles", f)
      );
      enquiryFiles.forEach((f) =>
        formData.append("enquiryFiles", f)
      );
      componentBomFiles.forEach((f) =>
        formData.append("componentBomFiles", f)
      )
      for (let [key, value] of formData.entries()) {
  console.log(key, value);
}

      const res = await fetch("/api/config/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      /* 🔥 CORE LOGIC */
      if (data.status === "failed") {
        setError(data.message || "Processing failed");
        return;
      }

      if (data.status === "missing") {
        navigate("/missing", { state: data });
        return;
      }

      if (data.status === "success") {
        navigate("/result", { state: data });
        return;
      }

      setError("Unknown server response");

    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── UI ───────────────────────────────────────── */
  return (
    <div className="rv-page">
      <div className="rv-card">

        {/* Header */}
        <div className="rv-header">
          <button
            className="rv-back-link"
            onClick={() => navigate(-1)}
          >
            ← Edit Configuration
          </button>

          <h1 className="rv-header__title">
            Review Configuration
          </h1>

          <p className="rv-header__sub">
            Verify everything before sending to the backend.
          </p>
        </div>

        {/* Order Summary */}
        <div className="rv-section">
          <h2 className="rv-section__title">
            <span className="rv-badge">1</span> Order Summary
          </h2>

          <Row
            label="Board Quantity"
            value={`${boardQty} board${boardQty > 1 ? "s" : ""}`}
          />

          <Row
            label="Quotation Mode(s)"
            value={[
              quotationMode.jobWork && "Job Work",
              quotationMode.pcbFabrication && "PCB Fabrication",
              quotationMode.componentQuote && "Component Quote",
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          />
        </div>

        {/* Job Work */}
        {quotationMode.jobWork && (
          <div className="rv-section">
            <h2 className="rv-section__title">
              <span className="rv-badge">2</span> Job Work Details
            </h2>

            <Row
              label="SMD Price / Board"
              value={`₹${fmt(jobWorkPricing?.priceSMD || 0)}`}
            />

            <Row
              label="PTH Price / Board"
              value={`₹${fmt(jobWorkPricing?.pricePTH || 0)}`}
            />

            <Row
              label="Total Job Work (SMD)"
              value={`₹${fmt(
                (Number(jobWorkPricing?.priceSMD) || 0) *
                  boardQty
              )}`}
            />

            <div className="rv-divider" />

            <p className="rv-subsection-label">
              Customer BOM Files
            </p>

            <FileRow files={bomFiles} />
          </div>
        )}

        {/* PCB */}
        {quotationMode.pcbFabrication && (
          <div className="rv-section">
            <h2 className="rv-section__title">
              <span className="rv-badge">3</span> PCB Fabrication
            </h2>

            <p className="rv-subsection-label">Gerber Files</p>
            <FileRow files={gerberFiles} />

            <p
              className="rv-subsection-label"
              style={{ marginTop: 12 }}
            >
              Enquiry Files
            </p>

            <FileRow files={enquiryFiles} />
          </div>
        )}

        {/* Component */}
        {quotationMode.componentQuote && (
          <div className="rv-section">
            <h2 className="rv-section__title">
              <span className="rv-badge">4</span> Component Preferences
            </h2>

            <Row
              label="Sourcing Type"
              value={
                componentPreferences?.traceableComponents
                  ? `Traceable — ${componentPreferences.selectedTraceable}`
                  : componentPreferences?.alternativeComponents
                  ? "Alternative Components"
                  : "Standard"
              }
            />

            <div className="rv-divider" />

            <p className="rv-subsection-label">BOM Files</p>
            <FileRow files={componentBomFiles} />
          </div>
        )}

        {/* Stencil */}
        <div className="rv-section">
          <h2 className="rv-section__title">
            <span className="rv-badge">★</span> Stencil
          </h2>

          {!stencil?.regular && !stencil?.large ? (
            <span className="rv-empty">
              No stencil selected
            </span>
          ) : (
            <>
              {stencil?.regular && (
                <Row
                  label="Regular Stencil"
                  value={`₹${fmt(stencil.regularPrice)}`}
                />
              )}
              {stencil?.large && (
                <Row
                  label="Large Stencil"
                  value={`₹${fmt(stencil.largePrice)}`}
                />
              )}
            </>
          )}
        </div>

        {/* File Summary */}
        <div className="rv-files-summary">
          📎 {totalFiles} file{totalFiles !== 1 ? "s" : ""} attached
        </div>

        {/* Error */}
        {error && (
          <div className="rv-feedback rv-feedback--err">
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="rv-actions">
          <button
            className="rv-btn-edit"
            onClick={() => navigate(-1)}
          >
            ← Edit
          </button>

          <button
            className="rv-btn-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Confirm & Submit →"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReviewConfig;