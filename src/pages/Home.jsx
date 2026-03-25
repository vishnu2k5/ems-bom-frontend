import { Link } from 'react-router-dom';
import logo from '../assets/HLT_Final (2).svg';

export default function Home() {
  return (
    <div className="container">
      <div className="home-hero">
        <img src={logo} alt="HLT RONICS Logo" className="home-logo" />
        <h1>Welcome to Your BOM Assembly Assistant</h1>
        <p className="lead">Upload BOM files, validate components, and generate automated assembly quotations.</p>

        <div className="cta-row">
          <Link to="/upload" className="cta-button">Upload BOMs</Link>
          <Link to="/review" className="cta-ghost">Review Uploaded Files</Link>
        </div>
      </div>

      <section className="features-slider">
        <div className="slider-content">
          <div className="slider-item">
            <span className="slider-icon">⚡</span>
            <p>Automated BOM processing with intelligent component validation</p>
          </div>
          <div className="slider-item">
            <span className="slider-icon">📊</span>
            <p>Real-time quotation generation and cost analysis</p>
          </div>
          <div className="slider-item">
            <span className="slider-icon">🔄</span>
            <p>Smart database learning from past component data</p>
          </div>
          <div className="slider-item">
            <span className="slider-icon">✅</span>
            <p>Seamless workflow from upload to final assembly quotation</p>
          </div>
        </div>
      </section>

      <section className="process-flow">
        <h2>🎯 How It Works</h2>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-icon">📤</div>
            <h3>Upload</h3>
            <p>Import your BOM files in Excel, CSV, or other supported formats</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">👀</div>
            <h3>Review</h3>
            <p>Verify your files and prepare for processing</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">⚙️</div>
            <h3>Configure</h3>
            <p>Set pricing per pin and board quantities</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">✨</div>
            <h3>Process</h3>
            <p>Validate components and generate your quotation</p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>✨ Key Features</h2>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Multi-Format Support</h4>
              <p>Works with Excel, CSV, JSON, and more</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Intelligent Validation</h4>
              <p>Automatically verifies components against our database</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Accurate Costing</h4>
              <p>Real-time pricing calculations based on pin counts</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Quick Processing</h4>
              <p>Get your assembly quotations in minutes, not days</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Learning System</h4>
              <p>Our system learns from your data for better accuracy</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Easy Export</h4>
              <p>Download your quotations in standard formats</p>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="process-overview">
        <h2>Process Overview</h2>
        <ol className="steps-list">
          <li>
            <strong>Step 1 — Upload BOM files</strong>
            <p>Upload Excel or CSV BOM files. Files are saved to the input folder and tracked for this session.</p>
          </li>
          <li>
            <strong>Step 2 — Enter pricing & quantities</strong>
            <p>Provide price per pin for SMD and PTH and board quantities for each BOM. Values are saved for cost calculations.</p>
          </li>
          <li>
            <strong>Step 3 — Start processing</strong>
            <p>Click Process BOM to begin automated processing. Progress is shown while each BOM is processed.</p>
          </li>
          <li>
            <strong>Step 4 — Component validation</strong>
            <p>Each component is checked against the master database. Known parts continue automatically; unknown parts are flagged.</p>
          </li>
          <li>
            <strong>Step 5 — Handle missing components</strong>
            <p>If missing components are found, the app pauses and asks for manual entry or skip. Entered data is saved to the master sheet for future runs.</p>
          </li>
          <li>
            <strong>Step 6 — Final BOM & quotation</strong>
            <p>Pin counts, assembly cost and board quantities are applied; final BOM and quotation files are generated.</p>
          </li>
          <li>
            <strong>Step 7 — Results</strong>
            <p>Quote per board and total quotation value are displayed for download and review.</p>
          </li>
          <li>
            <strong>Step 8 — Reset</strong>
            <p>Clear inputs and start a new process when ready.</p>
          </li>
        </ol>
      </section> */}
    </div>
  );
}
